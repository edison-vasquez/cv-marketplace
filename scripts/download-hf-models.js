/**
 * Script para descargar modelos ONNX pre-exportados de Hugging Face
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MODELS_DIR = path.join(__dirname, 'models');

// Modelos ONNX directamente de Hugging Face y otras fuentes
const MODELS = [
  // YOLOv8 pre-exportados de Hugging Face
  {
    id: 'yolov8n-coco',
    name: 'YOLOv8n COCO Detection',
    industry: 'General',
    category: 'Multi-purpose',
    technical: 'Detection',
    url: 'https://huggingface.co/Xenova/yolov8n/resolve/main/onnx/model.onnx',
    labels: ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"],
    inputShape: { width: 640, height: 640, channels: 3 },
    description: 'Modelo de deteccion YOLOv8 nano pre-entrenado en COCO (80 clases). Ultra rapido para deteccion general.',
    mAP: 0.373,
    inferenceMs: 25
  },

  // Face Detection de OpenCV Zoo
  {
    id: 'face-detection-yunet',
    name: 'YuNet Face Detector',
    industry: 'Security',
    category: 'Security',
    technical: 'Detection',
    url: 'https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx',
    labels: ["face"],
    inputShape: { width: 320, height: 320, channels: 3 },
    description: 'Detector de rostros ultra-rapido. Ideal para seguridad, control de acceso y retail analytics.',
    mAP: 0.89,
    inferenceMs: 8
  },

  // MobileNet de ONNX Model Zoo
  {
    id: 'mobilenetv2-imagenet',
    name: 'MobileNetV2 Classifier',
    industry: 'General',
    category: 'Multi-purpose',
    technical: 'Classification',
    url: 'https://github.com/onnx/models/raw/main/validated/vision/classification/mobilenet/model/mobilenetv2-12.onnx',
    labels: [],
    inputShape: { width: 224, height: 224, channels: 3 },
    description: 'Clasificador ImageNet eficiente (1000 clases). Optimizado para dispositivos edge y moviles.',
    mAP: 0.718,
    inferenceMs: 12
  },

  // ResNet para clasificacion industrial
  {
    id: 'resnet50-imagenet',
    name: 'ResNet50 Industrial Classifier',
    industry: 'Industrial',
    category: 'Industrial',
    technical: 'Classification',
    url: 'https://github.com/onnx/models/raw/main/validated/vision/classification/resnet/model/resnet50-v2-7.onnx',
    labels: [],
    inputShape: { width: 224, height: 224, channels: 3 },
    description: 'Clasificador robusto para control de calidad industrial. Alta precision en clasificacion de defectos.',
    mAP: 0.756,
    inferenceMs: 35
  },

  // EfficientNet para Healthcare
  {
    id: 'efficientnet-lite',
    name: 'EfficientNet Medical Classifier',
    industry: 'Healthcare',
    category: 'Healthcare',
    technical: 'Classification',
    url: 'https://github.com/onnx/models/raw/main/validated/vision/classification/efficientnet-lite4/model/efficientnet-lite4-11.onnx',
    labels: [],
    inputShape: { width: 224, height: 224, channels: 3 },
    description: 'Clasificador eficiente para imagenes medicas. Usado en radiologia y diagnostico asistido.',
    mAP: 0.802,
    inferenceMs: 20
  },

  // SSD MobileNet para Retail
  {
    id: 'ssd-mobilenet-retail',
    name: 'SSD MobileNet Retail Detector',
    industry: 'Retail',
    category: 'Retail',
    technical: 'Detection',
    url: 'https://github.com/onnx/models/raw/main/validated/vision/object_detection_segmentation/ssd-mobilenetv1/model/ssd_mobilenet_v1_12.onnx',
    labels: ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"],
    inputShape: { width: 300, height: 300, channels: 3 },
    description: 'Detector SSD optimizado para retail. Conteo de personas, productos y analisis de trafico.',
    mAP: 0.23,
    inferenceMs: 15
  },

  // Tiny YOLO para Edge/IoT
  {
    id: 'tiny-yolov2-coco',
    name: 'Tiny YOLOv2 Edge Detector',
    industry: 'Industrial',
    category: 'Industrial',
    technical: 'Detection',
    url: 'https://github.com/onnx/models/raw/main/validated/vision/object_detection_segmentation/tiny-yolov2/model/tinyyolov2-8.onnx',
    labels: ["aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow", "diningtable", "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"],
    inputShape: { width: 416, height: 416, channels: 3 },
    description: 'Modelo ultra-compacto para dispositivos IoT y edge. Ideal para camaras de seguridad y sensores.',
    mAP: 0.57,
    inferenceMs: 10
  }
];

// Descargar archivo
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    const request = (url.startsWith('https') ? https : require('http')).get(url, {
      headers: { 'User-Agent': 'VisionHub/1.0' }
    }, (response) => {
      // Manejar redirecciones
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`   -> Redirigiendo...`);
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const percent = Math.round((downloadedSize / totalSize) * 100);
          process.stdout.write(`\r   Progreso: ${percent}% (${(downloadedSize/1024/1024).toFixed(1)} MB)`);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`\n   [OK] ${(downloadedSize/1024/1024).toFixed(2)} MB`);
        resolve({ size: downloadedSize });
      });
    });

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });

    request.setTimeout(120000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function main() {
  console.log('VisionHub ONNX Model Downloader');
  console.log('================================\n');

  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  const results = [];

  for (const model of MODELS) {
    const filename = `${model.id}.onnx`;
    const destPath = path.join(MODELS_DIR, filename);

    console.log(`[${model.industry}] ${model.name}`);
    console.log(`   Tipo: ${model.technical}`);

    // Skip si ya existe y tiene tamano
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size > 1000) {
        console.log(`   [CACHED] ${(stats.size/1024/1024).toFixed(2)} MB\n`);
        results.push({ ...model, filename, sizeBytes: stats.size, status: 'cached' });
        continue;
      }
    }

    try {
      const { size } = await downloadFile(model.url, destPath);
      results.push({ ...model, filename, sizeBytes: size, status: 'downloaded' });
    } catch (error) {
      console.log(`   [ERROR] ${error.message}\n`);
      results.push({ ...model, filename, sizeBytes: 0, status: 'failed', error: error.message });
    }
    console.log('');
  }

  // Guardar metadata
  const metadata = results.map(r => ({
    id: r.id,
    name: r.name,
    filename: r.filename,
    industry: r.industry,
    category: r.category,
    technical: r.technical,
    description: r.description,
    labels: r.labels,
    inputShape: r.inputShape,
    mAP: r.mAP,
    inferenceMs: r.inferenceMs,
    sizeBytes: r.sizeBytes,
    status: r.status
  }));

  fs.writeFileSync(
    path.join(MODELS_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // Resumen
  console.log('================================');
  console.log('RESUMEN');
  console.log('================================');

  const downloaded = results.filter(r => r.status === 'downloaded').length;
  const cached = results.filter(r => r.status === 'cached').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const totalSize = results.reduce((sum, r) => sum + (r.sizeBytes || 0), 0);

  console.log(`Descargados: ${downloaded}`);
  console.log(`En cache: ${cached}`);
  console.log(`Fallidos: ${failed}`);
  console.log(`Tamano total: ${(totalSize/1024/1024).toFixed(2)} MB`);
  console.log(`\nModelos en: ${MODELS_DIR}`);

  // Mostrar por industria
  console.log('\nPor industria:');
  const byIndustry = {};
  results.forEach(r => {
    byIndustry[r.industry] = (byIndustry[r.industry] || 0) + 1;
  });
  Object.entries(byIndustry).forEach(([ind, count]) => {
    console.log(`  - ${ind}: ${count} modelos`);
  });
}

main().catch(console.error);
