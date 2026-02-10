// Utilidades de postprocesamiento para inferencia

import { Prediction, BoundingBox, PostprocessingConfig } from './types';

/**
 * Calcula Intersection over Union (IoU) entre dos bounding boxes
 */
export function calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;

  return intersection / union;
}

/**
 * Aplica Non-Maximum Suppression para eliminar detecciones duplicadas
 */
export function applyNMS(
  predictions: Prediction[],
  iouThreshold: number
): Prediction[] {
  if (predictions.length === 0) return [];

  // Ordenar por confianza descendente
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const kept: Prediction[] = [];

  while (sorted.length > 0) {
    const current = sorted.shift()!;
    kept.push(current);

    // Remover predicciones con alto overlap
    for (let i = sorted.length - 1; i >= 0; i--) {
      const currentBbox = current.bbox;
      const sortedBbox = sorted[i].bbox;
      if (currentBbox && sortedBbox) {
        const iou = calculateIoU(currentBbox, sortedBbox);
        if (iou > iouThreshold && current.class === sorted[i].class) {
          sorted.splice(i, 1);
        }
      }
    }
  }

  return kept;
}

/**
 * Filtra predicciones por umbral de confianza
 */
export function filterByConfidence(
  predictions: Prediction[],
  threshold: number
): Prediction[] {
  return predictions.filter(p => p.confidence >= threshold);
}

/**
 * Procesa la salida raw de YOLO v8 (formato: [batch, 84, 8400])
 * donde 84 = 4 (bbox) + 80 (clases COCO)
 */
export function parseYOLOv8Output(
  output: Float32Array,
  labels: string[],
  inputWidth: number,
  inputHeight: number,
  originalWidth: number,
  originalHeight: number,
  config: PostprocessingConfig
): Prediction[] {
  const predictions: Prediction[] = [];
  const numClasses = labels.length;
  const numDetections = 8400; // YOLOv8 default

  // Escala para convertir de input a original
  const scaleX = originalWidth / inputWidth;
  const scaleY = originalHeight / inputHeight;

  for (let i = 0; i < numDetections; i++) {
    // Extraer bbox (xc, yc, w, h)
    const xc = output[0 * numDetections + i];
    const yc = output[1 * numDetections + i];
    const w = output[2 * numDetections + i];
    const h = output[3 * numDetections + i];

    // Encontrar clase con mayor confianza
    let maxConf = 0;
    let maxClassId = 0;
    for (let c = 0; c < numClasses; c++) {
      const conf = output[(4 + c) * numDetections + i];
      if (conf > maxConf) {
        maxConf = conf;
        maxClassId = c;
      }
    }

    // Filtrar por confianza
    if (maxConf >= config.confidenceThreshold) {
      // Convertir de center a corner format y escalar
      const x = (xc - w / 2) * scaleX;
      const y = (yc - h / 2) * scaleY;

      predictions.push({
        class: labels[maxClassId] || `class_${maxClassId}`,
        classId: maxClassId,
        confidence: maxConf,
        bbox: {
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: w * scaleX,
          height: h * scaleY,
        },
      });
    }
  }

  // Aplicar NMS
  const nmsFiltered = applyNMS(predictions, config.iouThreshold);

  // Limitar número de detecciones
  return nmsFiltered.slice(0, config.maxDetections);
}

/**
 * Procesa la salida de un modelo de clasificación
 */
export function parseClassificationOutput(
  output: Float32Array,
  labels: string[],
  topK: number = 5
): Prediction[] {
  const predictions: { classId: number; confidence: number }[] = [];

  // Aplicar softmax si es necesario (valores no están en 0-1)
  const maxVal = Math.max(...output);
  const expSum = output.reduce((sum, val) => sum + Math.exp(val - maxVal), 0);

  for (let i = 0; i < output.length; i++) {
    const confidence = Math.exp(output[i] - maxVal) / expSum;
    predictions.push({ classId: i, confidence });
  }

  // Ordenar por confianza y tomar top K
  predictions.sort((a, b) => b.confidence - a.confidence);

  return predictions.slice(0, topK).map(p => ({
    class: labels[p.classId] || `class_${p.classId}`,
    classId: p.classId,
    confidence: p.confidence,
  }));
}

/**
 * Convierte coordenadas normalizadas a píxeles
 */
export function denormalizeBBox(
  bbox: BoundingBox,
  imageWidth: number,
  imageHeight: number
): BoundingBox {
  return {
    x: bbox.x * imageWidth,
    y: bbox.y * imageHeight,
    width: bbox.width * imageWidth,
    height: bbox.height * imageHeight,
  };
}

/**
 * Parser para YuNet face detection
 * YuNet output tiene múltiples tensores, usamos el de detecciones
 * El formato depende de la versión, intentamos múltiples formatos
 */
export function parseYuNetOutput(
  output: Float32Array,
  inputWidth: number,
  inputHeight: number,
  originalWidth: number,
  originalHeight: number,
  config: PostprocessingConfig
): Prediction[] {
  const predictions: Prediction[] = [];

  const scaleX = originalWidth / inputWidth;
  const scaleY = originalHeight / inputHeight;

  // YuNet puede tener diferentes formatos de salida
  // Formato 1: [N, 15] - x1,y1,x2,y2 + landmarks + score
  // Formato 2: [N, 5] - x,y,w,h,score (más común en versiones recientes)

  const totalElements = output.length;

  // Intentar formato [N, 5] primero (más común)
  if (totalElements % 5 === 0) {
    const numDetections = totalElements / 5;

    for (let i = 0; i < numDetections; i++) {
      const offset = i * 5;
      const x = output[offset];
      const y = output[offset + 1];
      const w = output[offset + 2];
      const h = output[offset + 3];
      const score = output[offset + 4];

      // Filtrar valores inválidos (muy comunes en padding)
      if (score >= config.confidenceThreshold && w > 0 && h > 0 && score <= 1) {
        predictions.push({
          class: 'face',
          classId: 0,
          confidence: score,
          bbox: {
            x: Math.max(0, x * scaleX),
            y: Math.max(0, y * scaleY),
            width: w * scaleX,
            height: h * scaleY,
          },
        });
      }
    }
  }
  // Intentar formato [N, 15]
  else if (totalElements % 15 === 0) {
    const numDetections = totalElements / 15;

    for (let i = 0; i < numDetections; i++) {
      const offset = i * 15;
      const x1 = output[offset];
      const y1 = output[offset + 1];
      const x2 = output[offset + 2];
      const y2 = output[offset + 3];
      const score = output[offset + 14];

      if (score >= config.confidenceThreshold && score <= 1) {
        predictions.push({
          class: 'face',
          classId: 0,
          confidence: score,
          bbox: {
            x: Math.max(0, x1 * scaleX),
            y: Math.max(0, y1 * scaleY),
            width: (x2 - x1) * scaleX,
            height: (y2 - y1) * scaleY,
          },
        });
      }
    }
  }
  // Formato alternativo: buscar patrones en el output
  else {
    console.log(`YuNet output format desconocido: ${totalElements} elementos`);
    // Intentar interpretar como detecciones en bruto
    // Algunos modelos YuNet tienen formato [1, N, 15] aplanado
    const possibleDetections = Math.floor(totalElements / 15);
    for (let i = 0; i < possibleDetections && i < 100; i++) {
      const offset = i * 15;
      if (offset + 14 >= totalElements) break;

      const x1 = output[offset];
      const y1 = output[offset + 1];
      const x2 = output[offset + 2];
      const y2 = output[offset + 3];
      const score = output[offset + 14];

      if (score >= config.confidenceThreshold && score <= 1 && x2 > x1 && y2 > y1) {
        predictions.push({
          class: 'face',
          classId: 0,
          confidence: score,
          bbox: {
            x: Math.max(0, x1 * scaleX),
            y: Math.max(0, y1 * scaleY),
            width: (x2 - x1) * scaleX,
            height: (y2 - y1) * scaleY,
          },
        });
      }
    }
  }

  return applyNMS(predictions, config.iouThreshold).slice(0, config.maxDetections);
}

/**
 * Parser para Tiny YOLOv2 (COCO)
 * Output format: [1, 125, 13, 13] - NCHW format
 * 125 = 5 anchors * (5 box params + 20 classes) para VOC
 * O 125 = 5 anchors * 25 para otros datasets
 * El modelo del ONNX Model Zoo usa 20 clases (Pascal VOC)
 */
export function parseTinyYOLOv2Output(
  output: Float32Array,
  labels: string[],
  inputWidth: number,
  inputHeight: number,
  originalWidth: number,
  originalHeight: number,
  config: PostprocessingConfig
): Prediction[] {
  const predictions: Prediction[] = [];

  // Tiny YOLOv2 anchors (del modelo ONNX Model Zoo)
  const anchors = [
    [1.08, 1.19],
    [3.42, 4.41],
    [6.63, 11.38],
    [9.42, 5.11],
    [16.62, 10.52]
  ];

  // El modelo tiny-yolov2 del ONNX Model Zoo usa 20 clases (Pascal VOC)
  const numClasses = 20;
  const numAnchors = 5;
  const gridSize = 13;
  const boxParams = 5; // x, y, w, h, objectness

  const scaleX = originalWidth / inputWidth;
  const scaleY = originalHeight / inputHeight;

  // Labels de Pascal VOC (20 clases)
  const vocLabels = [
    'aeroplane', 'bicycle', 'bird', 'boat', 'bottle',
    'bus', 'car', 'cat', 'chair', 'cow',
    'diningtable', 'dog', 'horse', 'motorbike', 'person',
    'pottedplant', 'sheep', 'sofa', 'train', 'tvmonitor'
  ];

  // Output shape: [1, 125, 13, 13] -> necesitamos reorganizar
  // 125 = 5 anchors * 25 (5 box + 20 classes)
  const channelsPerAnchor = boxParams + numClasses; // 25

  for (let cy = 0; cy < gridSize; cy++) {
    for (let cx = 0; cx < gridSize; cx++) {
      for (let a = 0; a < numAnchors; a++) {
        // Índice en formato NCHW: output[channel][y][x]
        // channel = a * 25 + param
        const getVal = (param: number) => {
          const channel = a * channelsPerAnchor + param;
          return output[channel * gridSize * gridSize + cy * gridSize + cx];
        };

        // Get box parameters
        const tx = getVal(0);
        const ty = getVal(1);
        const tw = getVal(2);
        const th = getVal(3);
        const objectness = sigmoid(getVal(4));

        if (objectness < 0.1) continue; // Pre-filtro rápido

        // Find best class con softmax
        let maxClassProb = 0;
        let maxClassId = 0;
        let classSum = 0;

        // Calcular softmax para clases
        const classScores: number[] = [];
        for (let c = 0; c < numClasses; c++) {
          const score = Math.exp(getVal(boxParams + c));
          classScores.push(score);
          classSum += score;
        }

        for (let c = 0; c < numClasses; c++) {
          const prob = classScores[c] / classSum;
          if (prob > maxClassProb) {
            maxClassProb = prob;
            maxClassId = c;
          }
        }

        const confidence = objectness * maxClassProb;
        if (confidence < config.confidenceThreshold) continue;

        // Calculate box coordinates
        const bx = (sigmoid(tx) + cx) * (inputWidth / gridSize);
        const by = (sigmoid(ty) + cy) * (inputHeight / gridSize);
        const bw = Math.exp(tw) * anchors[a][0] * (inputWidth / gridSize);
        const bh = Math.exp(th) * anchors[a][1] * (inputHeight / gridSize);

        predictions.push({
          class: vocLabels[maxClassId] || `class_${maxClassId}`,
          classId: maxClassId,
          confidence,
          bbox: {
            x: Math.max(0, (bx - bw / 2) * scaleX),
            y: Math.max(0, (by - bh / 2) * scaleY),
            width: bw * scaleX,
            height: bh * scaleY,
          },
        });
      }
    }
  }

  return applyNMS(predictions, config.iouThreshold).slice(0, config.maxDetections);
}

/**
 * Parser para SSD MobileNet
 * Output format: boxes [1, N, 4], scores [1, N, num_classes]
 */
export function parseSSDOutput(
  boxes: Float32Array,
  scores: Float32Array,
  labels: string[],
  inputWidth: number,
  inputHeight: number,
  originalWidth: number,
  originalHeight: number,
  config: PostprocessingConfig
): Prediction[] {
  const predictions: Prediction[] = [];
  const numDetections = boxes.length / 4;
  const numClasses = scores.length / numDetections;

  const scaleX = originalWidth / inputWidth;
  const scaleY = originalHeight / inputHeight;

  for (let i = 0; i < numDetections; i++) {
    // Find best class (skip background class 0)
    let maxScore = 0;
    let maxClassId = 0;
    for (let c = 1; c < numClasses; c++) {
      const score = scores[i * numClasses + c];
      if (score > maxScore) {
        maxScore = score;
        maxClassId = c;
      }
    }

    if (maxScore >= config.confidenceThreshold) {
      // SSD boxes are in format [ymin, xmin, ymax, xmax] normalized
      const ymin = boxes[i * 4];
      const xmin = boxes[i * 4 + 1];
      const ymax = boxes[i * 4 + 2];
      const xmax = boxes[i * 4 + 3];

      predictions.push({
        class: labels[maxClassId] || `class_${maxClassId}`,
        classId: maxClassId,
        confidence: maxScore,
        bbox: {
          x: Math.max(0, xmin * originalWidth),
          y: Math.max(0, ymin * originalHeight),
          width: (xmax - xmin) * originalWidth,
          height: (ymax - ymin) * originalHeight,
        },
      });
    }
  }

  return applyNMS(predictions, config.iouThreshold).slice(0, config.maxDetections);
}

// Sigmoid helper
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// COCO class labels (80 classes)
export const COCO_LABELS = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
  'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
  'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

// ImageNet class labels (1000 classes - simplified top categories)
export const IMAGENET_LABELS_SHORT: Record<number, string> = {
  0: 'tench', 1: 'goldfish', 2: 'great white shark', 3: 'tiger shark',
  // ... usando solo las más comunes
  151: 'chihuahua', 207: 'golden retriever', 208: 'labrador retriever',
  281: 'tabby cat', 282: 'tiger cat', 283: 'persian cat',
  386: 'african elephant', 387: 'indian elephant',
  409: 'analog clock', 417: 'balloon', 418: 'ballpoint pen',
  463: 'bucket', 466: 'bullet train', 468: 'butterfly',
  481: 'castle', 508: 'computer keyboard', 530: 'digital clock',
  549: 'envelope', 567: 'folding chair', 608: 'grocery store',
  621: 'hamburger', 645: 'hot dog', 671: 'ice cream',
  702: 'laptop', 703: 'lawn mower', 717: 'lighthouse',
  755: 'monitor', 761: 'mountain bike', 762: 'moving van',
  779: 'orange', 780: 'oscilloscope', 805: 'pizza',
  817: 'racing car', 829: 'refrigerator', 831: 'remote control',
  851: 'safety pin', 869: 'screw', 878: 'shopping cart',
  896: 'sports car', 920: 'table lamp', 949: 'strawberry',
  950: 'orange', 954: 'banana', 963: 'pizza', 965: 'ice cream'
};
