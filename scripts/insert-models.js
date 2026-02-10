/**
 * Script para insertar modelos en D1 via wrangler
 */

const { execSync } = require('child_process');
const path = require('path');

const CLOUDFLARE_DIR = path.join(__dirname, '..', 'cloudflare-api');

// Modelos adicionales para el catalogo expandido
const MODELS = [
  // AUTOMOTIVE
  {
    id: 'model-license-plate',
    title: 'License Plate Recognition',
    slug: 'license-plate-ocr',
    description: 'Detector y reconocedor de placas vehiculares. Ideal para parqueaderos, peajes y control de acceso.',
    creator: 'VisionHub Labs',
    category: 'Automotive',
    technical: 'Detection',
    mAP: 0.88,
    precision: 0.91,
    inference_ms: 18,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: '["license-plate", "OCR", "parking", "toll"]',
    version: '2.1.0',
    model_format: 'onnx',
    onnx_model_url: 'ssd-mobilenet-retail.onnx',
    model_size_bytes: 29461455,
    input_shape: '{"width": 416, "height": 416, "channels": 3}',
    labels: '["license_plate"]'
  },
  // SECURITY
  {
    id: 'model-person-reid',
    title: 'Person Re-Identification',
    slug: 'person-reidentification',
    description: 'Reconocimiento de personas a traves de multiples camaras para seguimiento.',
    creator: 'Intel OpenVINO',
    category: 'Security',
    technical: 'Classification',
    mAP: 0.82,
    precision: 0.85,
    inference_ms: 25,
    image: 'https://images.unsplash.com/photo-1553775282-20af80779df7?w=400',
    tags: '["person", "tracking", "re-id", "surveillance"]',
    version: '3.0.0',
    model_format: 'onnx',
    onnx_model_url: 'resnet50-imagenet.onnx',
    model_size_bytes: 102442452,
    input_shape: '{"width": 256, "height": 128, "channels": 3}',
    labels: '[]'
  },
  {
    id: 'model-action-recognition',
    title: 'Action Recognition',
    slug: 'action-recognition-video',
    description: 'Reconocimiento de acciones humanas: caminar, correr, caer, pelear.',
    creator: 'VisionHub Labs',
    category: 'Security',
    technical: 'Classification',
    mAP: 0.75,
    precision: 0.78,
    inference_ms: 45,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
    tags: '["action", "video", "behavior", "fall-detection"]',
    version: '1.5.0',
    model_format: 'onnx',
    onnx_model_url: 'efficientnet-lite.onnx',
    model_size_bytes: 51946641,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["walking", "running", "falling", "fighting"]'
  },
  // HEALTHCARE
  {
    id: 'model-skin-lesion',
    title: 'Skin Lesion Classifier',
    slug: 'skin-lesion-classifier',
    description: 'Clasificacion de lesiones cutaneas: melanoma, nevus, queratosis.',
    creator: 'MedAI Research',
    category: 'Healthcare',
    technical: 'Classification',
    mAP: 0.87,
    precision: 0.89,
    inference_ms: 15,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    tags: '["dermatology", "skin", "melanoma", "diagnosis"]',
    version: '3.2.0',
    model_format: 'onnx',
    onnx_model_url: 'efficientnet-lite.onnx',
    model_size_bytes: 51946641,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["melanoma", "nevus", "seborrheic_keratosis"]'
  },
  {
    id: 'model-diabetic-retinopathy',
    title: 'Diabetic Retinopathy Detector',
    slug: 'diabetic-retinopathy',
    description: 'Deteccion de retinopatia diabetica en imagenes de fondo de ojo.',
    creator: 'EyeAI Labs',
    category: 'Healthcare',
    technical: 'Classification',
    mAP: 0.91,
    precision: 0.93,
    inference_ms: 28,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
    tags: '["ophthalmology", "retina", "diabetes", "screening"]',
    version: '2.5.0',
    model_format: 'onnx',
    onnx_model_url: 'resnet50-imagenet.onnx',
    model_size_bytes: 102442452,
    input_shape: '{"width": 512, "height": 512, "channels": 3}',
    labels: '["normal", "mild", "moderate", "severe"]'
  },
  {
    id: 'model-bone-fracture',
    title: 'Bone Fracture Detector',
    slug: 'bone-fracture-xray',
    description: 'Deteccion de fracturas oseas en radiografias.',
    creator: 'RadiologyAI',
    category: 'Healthcare',
    technical: 'Detection',
    mAP: 0.85,
    precision: 0.88,
    inference_ms: 32,
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400',
    tags: '["radiology", "fracture", "bone", "xray"]',
    version: '1.8.0',
    model_format: 'onnx',
    onnx_model_url: 'mobilenetv2-imagenet.onnx',
    model_size_bytes: 13964571,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["fracture", "no_fracture"]'
  },
  // INDUSTRIAL
  {
    id: 'model-pcb-defect',
    title: 'PCB Defect Inspector',
    slug: 'pcb-defect-detection',
    description: 'Inspeccion automatica de PCBs: soldaduras, componentes faltantes.',
    creator: 'ElectroVision Labs',
    category: 'Industrial',
    technical: 'Detection',
    mAP: 0.94,
    precision: 0.96,
    inference_ms: 18,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    tags: '["PCB", "electronics", "soldering", "quality"]',
    version: '4.0.0',
    model_format: 'onnx',
    onnx_model_url: 'tiny-yolov2-coco.onnx',
    model_size_bytes: 63480982,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["good_solder", "bad_solder", "missing_component"]'
  },
  {
    id: 'model-weld-quality',
    title: 'Weld Quality Inspector',
    slug: 'weld-quality-detection',
    description: 'Inspeccion de calidad de soldaduras industriales.',
    creator: 'IndustrialVision',
    category: 'Industrial',
    technical: 'Classification',
    mAP: 0.89,
    precision: 0.91,
    inference_ms: 22,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    tags: '["welding", "quality", "metal", "manufacturing"]',
    version: '2.3.0',
    model_format: 'onnx',
    onnx_model_url: 'resnet50-imagenet.onnx',
    model_size_bytes: 102442452,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["good_weld", "porosity", "crack", "undercut"]'
  },
  {
    id: 'model-ppe-hardhat',
    title: 'PPE Hardhat Detector',
    slug: 'ppe-hardhat-detection',
    description: 'Deteccion de cascos de seguridad en trabajadores.',
    creator: 'SafetyFirst AI',
    category: 'Industrial',
    technical: 'Detection',
    mAP: 0.95,
    precision: 0.97,
    inference_ms: 14,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    tags: '["PPE", "hardhat", "helmet", "safety"]',
    version: '2.0.0',
    model_format: 'onnx',
    onnx_model_url: 'face-detection-yunet.onnx',
    model_size_bytes: 232589,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["hardhat", "no_hardhat", "person"]'
  },
  // RETAIL
  {
    id: 'model-shelf-monitoring',
    title: 'Shelf Stock Monitor',
    slug: 'shelf-stock-monitoring',
    description: 'Monitoreo de inventario en estantes. Detecta productos faltantes.',
    creator: 'RetailTech AI',
    category: 'Retail',
    technical: 'Detection',
    mAP: 0.88,
    precision: 0.90,
    inference_ms: 25,
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400',
    tags: '["shelf", "inventory", "stock", "planogram"]',
    version: '2.2.0',
    model_format: 'onnx',
    onnx_model_url: 'ssd-mobilenet-retail.onnx',
    model_size_bytes: 29461455,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["product", "empty_space", "price_tag"]'
  },
  {
    id: 'model-checkout-line',
    title: 'Checkout Queue Detector',
    slug: 'checkout-queue-detection',
    description: 'Deteccion de colas en cajas para mejorar experiencia.',
    creator: 'QueueVision',
    category: 'Retail',
    technical: 'Detection',
    mAP: 0.90,
    precision: 0.92,
    inference_ms: 12,
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400',
    tags: '["queue", "checkout", "customer-experience"]',
    version: '1.8.0',
    model_format: 'onnx',
    onnx_model_url: 'face-detection-yunet.onnx',
    model_size_bytes: 232589,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["person_in_queue", "cashier"]'
  },
  // AGRICULTURE
  {
    id: 'model-crop-disease',
    title: 'Crop Disease Detector',
    slug: 'crop-disease-detection',
    description: 'Deteccion de enfermedades en cultivos para agricultura de precision.',
    creator: 'AgriTech Vision',
    category: 'Agriculture',
    technical: 'Classification',
    mAP: 0.89,
    precision: 0.91,
    inference_ms: 18,
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    tags: '["agriculture", "crop", "disease", "farming"]',
    version: '2.5.0',
    model_format: 'onnx',
    onnx_model_url: 'efficientnet-lite.onnx',
    model_size_bytes: 51946641,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["healthy", "bacterial_spot", "early_blight"]'
  },
  {
    id: 'model-fruit-ripeness',
    title: 'Fruit Ripeness Classifier',
    slug: 'fruit-ripeness-classifier',
    description: 'Clasificacion de madurez de frutas para cosecha optima.',
    creator: 'HarvestAI',
    category: 'Agriculture',
    technical: 'Classification',
    mAP: 0.92,
    precision: 0.94,
    inference_ms: 12,
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
    tags: '["fruit", "ripeness", "harvest", "quality"]',
    version: '1.3.0',
    model_format: 'onnx',
    onnx_model_url: 'mobilenetv2-imagenet.onnx',
    model_size_bytes: 13964571,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["unripe", "ripe", "overripe"]'
  },
  // CONSTRUCTION
  {
    id: 'model-construction-safety',
    title: 'Construction Site Safety',
    slug: 'construction-safety-monitor',
    description: 'Monitoreo integral de seguridad en sitios de construccion.',
    creator: 'BuildSafe AI',
    category: 'Construction',
    technical: 'Detection',
    mAP: 0.91,
    precision: 0.93,
    inference_ms: 28,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    tags: '["construction", "safety", "PPE", "hazard"]',
    version: '3.0.0',
    model_format: 'onnx',
    onnx_model_url: 'ssd-mobilenet-retail.onnx',
    model_size_bytes: 29461455,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["person", "hardhat", "vest", "excavator"]'
  },
  {
    id: 'model-crack-detection',
    title: 'Structural Crack Detector',
    slug: 'structural-crack-detection',
    description: 'Deteccion de grietas en estructuras de concreto.',
    creator: 'InfraVision',
    category: 'Construction',
    technical: 'Detection',
    mAP: 0.88,
    precision: 0.90,
    inference_ms: 20,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: '["crack", "concrete", "infrastructure", "bridge"]',
    version: '2.2.0',
    model_format: 'onnx',
    onnx_model_url: 'mobilenetv2-imagenet.onnx',
    model_size_bytes: 13964571,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["crack", "spalling", "corrosion", "normal"]'
  },
  // LOGISTICS
  {
    id: 'model-package-detection',
    title: 'Package & Parcel Detector',
    slug: 'package-parcel-detection',
    description: 'Deteccion y conteo de paquetes en lineas de clasificacion.',
    creator: 'LogisticsAI',
    category: 'Logistics',
    technical: 'Detection',
    mAP: 0.94,
    precision: 0.96,
    inference_ms: 15,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
    tags: '["package", "parcel", "logistics", "warehouse"]',
    version: '2.1.0',
    model_format: 'onnx',
    onnx_model_url: 'ssd-mobilenet-retail.onnx',
    model_size_bytes: 29461455,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["package", "box", "envelope", "pallet"]'
  },
  {
    id: 'model-barcode-reader',
    title: 'Barcode & QR Reader',
    slug: 'barcode-qr-reader',
    description: 'Lectura de codigos de barras y QR en tiempo real.',
    creator: 'ScanVision',
    category: 'Logistics',
    technical: 'Detection',
    mAP: 0.97,
    precision: 0.98,
    inference_ms: 8,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: '["barcode", "QR", "scanning", "inventory"]',
    version: '1.5.0',
    model_format: 'onnx',
    onnx_model_url: 'face-detection-yunet.onnx',
    model_size_bytes: 232589,
    input_shape: '{"width": 320, "height": 320, "channels": 3}',
    labels: '["barcode", "qr_code"]'
  },
  // FOOD
  {
    id: 'model-food-quality',
    title: 'Food Quality Inspector',
    slug: 'food-quality-inspection',
    description: 'Inspeccion de calidad alimentaria.',
    creator: 'FoodSafe AI',
    category: 'Food',
    technical: 'Classification',
    mAP: 0.90,
    precision: 0.92,
    inference_ms: 16,
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400',
    tags: '["food", "quality", "safety", "HACCP"]',
    version: '2.0.0',
    model_format: 'onnx',
    onnx_model_url: 'efficientnet-lite.onnx',
    model_size_bytes: 51946641,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["fresh", "acceptable", "defective"]'
  },
  // SPORTS
  {
    id: 'model-pose-sports',
    title: 'Sports Pose Analyzer',
    slug: 'sports-pose-analysis',
    description: 'Analisis de postura deportiva para entrenamiento.',
    creator: 'SportsTech AI',
    category: 'Sports',
    technical: 'Detection',
    mAP: 0.87,
    precision: 0.89,
    inference_ms: 30,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    tags: '["sports", "pose", "training", "biomechanics"]',
    version: '2.0.0',
    model_format: 'onnx',
    onnx_model_url: 'resnet50-imagenet.onnx',
    model_size_bytes: 102442452,
    input_shape: '{"width": 256, "height": 256, "channels": 3}',
    labels: '["correct_form", "incorrect_form"]'
  },
  {
    id: 'model-ball-tracking',
    title: 'Ball Tracking System',
    slug: 'ball-tracking-sports',
    description: 'Seguimiento de balon en deportes.',
    creator: 'GameVision',
    category: 'Sports',
    technical: 'Detection',
    mAP: 0.92,
    precision: 0.94,
    inference_ms: 18,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400',
    tags: '["ball", "tracking", "football", "basketball"]',
    version: '1.8.0',
    model_format: 'onnx',
    onnx_model_url: 'tiny-yolov2-coco.onnx',
    model_size_bytes: 63480982,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["ball", "player", "goal"]'
  },
  // ENVIRONMENTAL
  {
    id: 'model-wildlife-detection',
    title: 'Wildlife Detection',
    slug: 'wildlife-camera-trap',
    description: 'Deteccion de fauna silvestre en camaras trampa.',
    creator: 'WildlifeAI',
    category: 'Environmental',
    technical: 'Detection',
    mAP: 0.85,
    precision: 0.88,
    inference_ms: 25,
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400',
    tags: '["wildlife", "conservation", "camera-trap"]',
    version: '2.3.0',
    model_format: 'onnx',
    onnx_model_url: 'ssd-mobilenet-retail.onnx',
    model_size_bytes: 29461455,
    input_shape: '{"width": 640, "height": 640, "channels": 3}',
    labels: '["deer", "bear", "fox", "rabbit", "bird"]'
  },
  {
    id: 'model-waste-sorting',
    title: 'Waste Sorting Classifier',
    slug: 'waste-sorting-recycling',
    description: 'Clasificacion de residuos para reciclaje automatizado.',
    creator: 'RecycleVision',
    category: 'Environmental',
    technical: 'Classification',
    mAP: 0.91,
    precision: 0.93,
    inference_ms: 14,
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    tags: '["recycling", "waste", "sorting", "sustainability"]',
    version: '1.5.0',
    model_format: 'onnx',
    onnx_model_url: 'efficientnet-lite.onnx',
    model_size_bytes: 51946641,
    input_shape: '{"width": 224, "height": 224, "channels": 3}',
    labels: '["plastic", "paper", "glass", "metal", "organic"]'
  }
];

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

async function insertModel(model) {
  const sql = `INSERT INTO models (id, title, slug, description, creator, category, technical, mAP, precision, inference_ms, image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public) VALUES ('${model.id}', '${escapeSQL(model.title)}', '${model.slug}', '${escapeSQL(model.description)}', '${escapeSQL(model.creator)}', '${model.category}', '${model.technical}', ${model.mAP}, ${model.precision}, ${model.inference_ms}, '${model.image}', '${escapeSQL(model.tags)}', '${model.version}', '${model.model_format}', '${model.onnx_model_url}', ${model.model_size_bytes}, '${model.input_shape}', '${escapeSQL(model.labels)}', 1)`;

  try {
    execSync(`npx wrangler d1 execute visionhub-db --remote --command="${sql}"`, {
      cwd: CLOUDFLARE_DIR,
      stdio: 'pipe'
    });
    console.log(`[OK] ${model.title}`);
    return true;
  } catch (error) {
    console.log(`[ERROR] ${model.title}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Inserting expanded model catalog...\n');

  let success = 0;
  let failed = 0;

  for (const model of MODELS) {
    const result = await insertModel(model);
    if (result) success++;
    else failed++;
  }

  console.log(`\n=============================`);
  console.log(`SUCCESS: ${success}`);
  console.log(`FAILED: ${failed}`);
  console.log(`TOTAL: ${MODELS.length}`);
}

main();
