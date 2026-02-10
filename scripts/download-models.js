/**
 * Script para descargar modelos ONNX de diferentes industrias
 * Fuentes: Ultralytics, ONNX Model Zoo, Hugging Face, OpenCV Zoo
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MODELS_DIR = path.join(__dirname, 'models');

// Modelos ONNX públicos y gratuitos para diferentes industrias
const MODELS_TO_DOWNLOAD = [
  // ============ DETECCIÓN GENERAL (Multi-industria) ============
  {
    id: 'yolov8n-coco',
    name: 'YOLOv8n COCO Detection',
    industry: 'General',
    category: 'Multi-purpose',
    technical: 'Detection',
    url: 'https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n.onnx',
    labels: ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"],
    inputShape: { width: 640, height: 640, channels: 3 },
    description: 'Modelo de detección de objetos entrenado en COCO (80 clases). Ideal para detección general multi-propósito.',
    mAP: 0.373,
    inferenceMs: 25
  },

  // ============ SEGURIDAD / INDUSTRIAL ============
  {
    id: 'face-detection-yunet',
    name: 'YuNet Face Detector',
    industry: 'Security',
    category: 'Security',
    technical: 'Detection',
    url: 'https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx',
    labels: ["face"],
    inputShape: { width: 320, height: 320, channels: 3 },
    description: 'Detector de rostros ultraligero y rápido. Ideal para control de acceso, seguridad y retail.',
    mAP: 0.89,
    inferenceMs: 8
  },

  // ============ CLASIFICACIÓN DE IMÁGENES ============
  {
    id: 'mobilenetv2-imagenet',
    name: 'MobileNetV2 ImageNet',
    industry: 'General',
    category: 'Multi-purpose',
    technical: 'Classification',
    url: 'https://github.com/onnx/models/raw/main/validated/vision/classification/mobilenet/model/mobilenetv2-12.onnx',
    labels: [], // ImageNet 1000 clases - se cargan aparte
    inputShape: { width: 224, height: 224, channels: 3 },
    description: 'Clasificador eficiente entrenado en ImageNet (1000 clases). Excelente para dispositivos móviles y edge.',
    mAP: 0.718,
    inferenceMs: 12
  },

  // ============ RETAIL / COMERCIO ============
  {
    id: 'yolov8n-retail',
    name: 'Retail Product Detector',
    industry: 'Retail',
    category: 'Retail',
    technical: 'Detection',
    // Usamos YOLOv8n base, customizable para retail
    url: 'https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n.onnx',
    labels: ["person", "bottle", "cup", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "pizza", "donut", "cake", "chair", "couch", "tv", "laptop", "cell phone", "book"],
    inputShape: { width: 640, height: 640, channels: 3 },
    description: 'Detector optimizado para entornos retail: productos, personas, mobiliario.',
    mAP: 0.373,
    inferenceMs: 25
  },

  // ============ AUTOMOTRIZ / TRÁFICO ============
  {
    id: 'yolov8n-traffic',
    name: 'Traffic & Vehicle Detector',
    industry: 'Automotive',
    category: 'Automotive',
    technical: 'Detection',
    url: 'https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n.onnx',
    labels: ["person", "bicycle", "car", "motorcycle", "bus", "train", "truck", "traffic light", "stop sign"],
    inputShape: { width: 640, height: 640, channels: 3 },
    description: 'Detección de vehículos, peatones y señales de tráfico para sistemas ADAS.',
    mAP: 0.373,
    inferenceMs: 25
  },

  // ============ SEGMENTACIÓN ============
  {
    id: 'yolov8n-seg',
    name: 'YOLOv8n Segmentation',
    industry: 'General',
    category: 'Multi-purpose',
    technical: 'Segmentation',
    url: 'https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n-seg.onnx',
    labels: ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow"],
    inputShape: { width: 640, height: 640, channels: 3 },
    description: 'Segmentación de instancias con máscaras pixel-perfect para cada objeto detectado.',
    mAP: 0.307,
    inferenceMs: 35
  },

  // ============ POSE ESTIMATION ============
  {
    id: 'yolov8n-pose',
    name: 'YOLOv8n Pose Estimation',
    industry: 'Healthcare',
    category: 'Healthcare',
    technical: 'Detection',
    url: 'https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n-pose.onnx',
    labels: ["person"],
    inputShape: { width: 640, height: 640, channels: 3 },
    description: 'Estimación de pose humana con 17 keypoints. Ideal para fisioterapia, deportes y ergonomía.',
    mAP: 0.501,
    inferenceMs: 28
  }
];

// Función para descargar archivo
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;

    console.log(`📥 Descargando: ${path.basename(destPath)}`);
    console.log(`   URL: ${url}`);

    const request = protocol.get(url, {
      headers: { 'User-Agent': 'VisionHub-ModelDownloader/1.0' }
    }, (response) => {
      // Manejar redirecciones
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`   ➡️ Redirigiendo a: ${response.headers.location}`);
        downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
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
        console.log(`\n   ✅ Completado: ${(downloadedSize/1024/1024).toFixed(2)} MB`);
        resolve({ size: downloadedSize });
      });
    });

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });

    request.setTimeout(60000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Función principal
async function main() {
  console.log('🚀 VisionHub Model Downloader\n');
  console.log('=' .repeat(50));

  // Crear directorio si no existe
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  const results = [];

  for (const model of MODELS_TO_DOWNLOAD) {
    const filename = `${model.id}.onnx`;
    const destPath = path.join(MODELS_DIR, filename);

    console.log(`\n📦 ${model.name}`);
    console.log(`   Industria: ${model.industry}`);
    console.log(`   Tipo: ${model.technical}`);

    // Verificar si ya existe
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      console.log(`   ⏭️ Ya existe (${(stats.size/1024/1024).toFixed(2)} MB)`);
      results.push({ ...model, filename, size: stats.size, status: 'cached' });
      continue;
    }

    try {
      const { size } = await downloadFile(model.url, destPath);
      results.push({ ...model, filename, size, status: 'downloaded' });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({ ...model, filename, size: 0, status: 'failed', error: error.message });
    }
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
    sizeBytes: r.size,
    status: r.status
  }));

  fs.writeFileSync(
    path.join(MODELS_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));

  const downloaded = results.filter(r => r.status === 'downloaded').length;
  const cached = results.filter(r => r.status === 'cached').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const totalSize = results.reduce((sum, r) => sum + (r.size || 0), 0);

  console.log(`✅ Descargados: ${downloaded}`);
  console.log(`📦 En caché: ${cached}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`💾 Tamaño total: ${(totalSize/1024/1024).toFixed(2)} MB`);
  console.log(`\n📁 Modelos guardados en: ${MODELS_DIR}`);

  if (failed > 0) {
    console.log('\n⚠️ Modelos fallidos:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
}

main().catch(console.error);
