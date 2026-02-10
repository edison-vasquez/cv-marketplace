/**
 * Script para actualizar modelos con URLs de modelos ONNX reales públicos
 */

const { execSync } = require('child_process');
const path = require('path');

const CLOUDFLARE_DIR = path.join(__dirname, '..', 'cloudflare-api');

// Modelos ONNX públicos reales disponibles
const REAL_MODELS = [
  // YOLOv8n - Modelo de detección real de Ultralytics
  {
    id: 'yolov8n-coco',
    title: 'YOLOv8n COCO Detection',
    slug: 'yolov8n-coco-detection',
    description: 'Modelo de detección de objetos YOLOv8 nano entrenado en COCO (80 clases). Ultra rápido y ligero, ideal para dispositivos edge.',
    creator: 'Ultralytics',
    category: 'General',
    technical: 'Detection',
    mAP: 0.373,
    precision: 0.45,
    inference_ms: 25,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    tags: '["yolo", "detection", "coco", "real-time"]',
    version: '8.0.0',
    model_format: 'onnx',
    // URL real del modelo YOLOv8n en Hugging Face
    onnx_model_url: 'https://huggingface.co/nickmuchi/yolov8n-onnx/resolve/main/yolov8n.onnx',
    model_size_bytes: 12898565,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]',
    preprocessing: '{"mean": [0, 0, 0], "std": [255, 255, 255], "normalize": true, "channelOrder": "RGB"}',
    postprocessing: '{"confidenceThreshold": 0.25, "iouThreshold": 0.45, "maxDetections": 100}'
  },
  // MobileNetV2 - Clasificación
  {
    id: 'mobilenetv2-imagenet',
    title: 'MobileNetV2 ImageNet Classifier',
    slug: 'mobilenetv2-imagenet',
    description: 'Clasificador de imágenes eficiente entrenado en ImageNet (1000 clases). Optimizado para dispositivos móviles.',
    creator: 'Google',
    category: 'General',
    technical: 'Classification',
    mAP: 0.718,
    precision: 0.72,
    inference_ms: 12,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400',
    tags: '["classification", "imagenet", "mobile", "efficient"]',
    version: '1.0.0',
    model_format: 'onnx',
    // MobileNetV2 de ONNX Model Zoo
    onnx_model_url: 'https://github.com/onnx/models/raw/main/validated/vision/classification/mobilenet/model/mobilenetv2-12.onnx',
    model_size_bytes: 14245558,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '[]',
    preprocessing: '{"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225], "normalize": true, "channelOrder": "RGB"}',
    postprocessing: '{"confidenceThreshold": 0.1, "iouThreshold": 0.5, "maxDetections": 5}'
  },
  // ResNet50 - Clasificación
  {
    id: 'resnet50-imagenet',
    title: 'ResNet50 ImageNet Classifier',
    slug: 'resnet50-imagenet',
    description: 'Red neuronal residual de 50 capas para clasificación de imágenes con alta precisión.',
    creator: 'Microsoft Research',
    category: 'General',
    technical: 'Classification',
    mAP: 0.749,
    precision: 0.76,
    inference_ms: 35,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400',
    tags: '["classification", "imagenet", "resnet", "deep-learning"]',
    version: '1.0.0',
    model_format: 'onnx',
    onnx_model_url: 'https://github.com/onnx/models/raw/main/validated/vision/classification/resnet/model/resnet50-v2-7.onnx',
    model_size_bytes: 102465496,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '[]',
    preprocessing: '{"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225], "normalize": true, "channelOrder": "RGB"}',
    postprocessing: '{"confidenceThreshold": 0.1, "iouThreshold": 0.5, "maxDetections": 5}'
  },
  // SqueezeNet - Modelo muy pequeño para demos
  {
    id: 'squeezenet-imagenet',
    title: 'SqueezeNet Classifier',
    slug: 'squeezenet-classifier',
    description: 'Clasificador ultra compacto (5MB). Ideal para demos y dispositivos con recursos limitados.',
    creator: 'DeepScale',
    category: 'General',
    technical: 'Classification',
    mAP: 0.575,
    precision: 0.58,
    inference_ms: 8,
    image: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=400',
    tags: '["classification", "tiny", "edge", "fast"]',
    version: '1.1.0',
    model_format: 'onnx',
    onnx_model_url: 'https://github.com/onnx/models/raw/main/validated/vision/classification/squeezenet/model/squeezenet1.1-7.onnx',
    model_size_bytes: 5000000,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '[]',
    preprocessing: '{"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225], "normalize": true, "channelOrder": "RGB"}',
    postprocessing: '{"confidenceThreshold": 0.1, "iouThreshold": 0.5, "maxDetections": 5}'
  }
];

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function updateModels() {
  console.log('🔄 Actualizando modelos con URLs reales...\n');

  // Primero eliminar modelos existentes que vamos a reemplazar
  const idsToDelete = REAL_MODELS.map(m => `'${m.id}'`).join(',');

  try {
    console.log('🗑️  Eliminando modelos anteriores...');
    execSync(
      `npx wrangler d1 execute visionhub-db --remote --command "DELETE FROM models WHERE id IN (${idsToDelete})"`,
      { cwd: CLOUDFLARE_DIR, stdio: 'inherit' }
    );
  } catch (e) {
    console.log('   (No había modelos que eliminar)');
  }

  // Insertar modelos nuevos
  for (const model of REAL_MODELS) {
    console.log(`\n📦 Insertando: ${model.title}`);

    const sql = `INSERT INTO models (
      id, title, slug, description, creator, category, technical,
      mAP, precision, inference_ms, image, tags, version,
      model_format, onnx_model_url, model_size_bytes, input_shape,
      labels, preprocessing, postprocessing, is_public, is_premium
    ) VALUES (
      ${escapeSQL(model.id)},
      ${escapeSQL(model.title)},
      ${escapeSQL(model.slug)},
      ${escapeSQL(model.description)},
      ${escapeSQL(model.creator)},
      ${escapeSQL(model.category)},
      ${escapeSQL(model.technical)},
      ${model.mAP},
      ${model.precision},
      ${model.inference_ms},
      ${escapeSQL(model.image)},
      ${escapeSQL(model.tags)},
      ${escapeSQL(model.version)},
      ${escapeSQL(model.model_format)},
      ${escapeSQL(model.onnx_model_url)},
      ${model.model_size_bytes},
      ${escapeSQL(model.input_shape)},
      ${escapeSQL(model.labels)},
      ${escapeSQL(model.preprocessing)},
      ${escapeSQL(model.postprocessing)},
      1,
      0
    )`;

    try {
      execSync(
        `npx wrangler d1 execute visionhub-db --remote --command "${sql.replace(/"/g, '\\"')}"`,
        { cwd: CLOUDFLARE_DIR, stdio: 'inherit' }
      );
      console.log(`   ✅ ${model.title} insertado`);
    } catch (error) {
      console.error(`   ❌ Error insertando ${model.title}:`, error.message);
    }
  }

  console.log('\n✅ Actualización completada!');
  console.log(`   Total modelos actualizados: ${REAL_MODELS.length}`);
}

updateModels().catch(console.error);
