-- Nuevos modelos industriales para VisionHub
-- Enfoque: Seguridad, Calidad, Logística, Procesos Pesados

INSERT INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, tfjs_model_url, model_size_bytes, input_shape, labels, is_public, is_premium
) VALUES 
-- 1. Seguridad: PPE
(
    'model-ppe-yolov8',
    'YOLOv8 PPE Detector',
    'ppe-detector-industrial',
    'Detector de equipo de protección personal (PPE). Detecta cascos, chalecos y gafas de seguridad en tiempo real. Optimizado para sitios de construcción y plantas mineras.',
    'VisionHub Deep Learning',
    'Security',
    'Detection',
    0.85, 0.88, 15,
    'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=400',
    '["PPE", "safety", "industrial", "mining", "construction"]',
    '1.0.0', 'onnx', 'ppe-yolov8n.onnx', NULL, 12500000,
    '{"width": 640, "height": 640, "channels": 3}',
    '["helmet", "vest", "goggles", "gloves", "boots"]', 1, 0
),
-- 2. Calidad: Defectos en metales
(
    'model-metal-defects',
    'Industrial Metal Defect Detector',
    'metal-defect-detector',
    'Detección de defectos superficiales en metales (grietas, corrosión, porosidad). Alta precisión para líneas de producción automotriz y metalúrgica.',
    'VisionHub Industrial',
    'Industrial',
    'Detection',
    0.91, 0.89, 45,
    'https://images.unsplash.com/photo-1504917595217-d4dc5f668396?w=400',
    '["quality", "metal", "defects", "inspection", "manufacturing"]',
    '2.1.0', 'onnx', 'metal-defects-s.onnx', NULL, 48000000,
    '{"width": 416, "height": 416, "channels": 3}',
    '["crack", "pitting", "scratch", "dent"]', 1, 1
),
-- 3. Logística: Conteo de Pallets
(
    'model-pallet-counter',
    'Warehouse Pallet Counter',
    'pallet-counter-logistics',
    'Sistema inteligente de conteo de pallets para gestión de inventarios en depósitos logísticos. Compatible con cámaras fijas y drones.',
    'VisionHub Operations',
    'Logística',
    'Detection',
    0.82, 0.80, 25,
    'https://images.unsplash.com/photo-1586528116311-ad86d794d75d?w=400',
    '["logistics", "warehouse", "inventory", "pallet", "counting"]',
    '1.2.0', 'onnx', 'pallet-counter.onnx', NULL, 32000000,
    '{"width": 640, "height": 640, "channels": 3}',
    '["pallet", "forklift", "worker"]', 1, 1
),
-- 4. Seguridad: Detección de Fuego
(
    'model-fire-smoke',
    'Fire & Smoke Early Detection',
    'fire-smoke-detector',
    'Detección temprana de incendios y columnas de humo en entornos industriales abiertos y almacenes. Reduce tiempos de respuesta críticos.',
    'Security AI',
    'Security',
    'Detection',
    0.78, 0.82, 12,
    'https://images.unsplash.com/photo-1524311545041-9da8f50c7634?w=400',
    '["fire", "smoke", "security", "emergency", "industrial"]',
    '3.0.0', 'onnx', 'fire-smoke.onnx', NULL, 15000000,
    '{"width": 320, "height": 320, "channels": 3}',
    '["fire", "smoke"]', 1, 1
),
-- 5. TF.js: General Browser Detector (COCO-SSD)
(
    'model-coco-ssd-tfjs',
    'COCO-SSD Browser Performance',
    'coco-ssd-tfjs',
    'Modelo de detección de objetos de propósito general basado en TensorFlow.js. Optimizado para correr 100% local en cualquier navegador sin descargas pesadas.',
    'Google TF.js Team',
    'Multi-purpose',
    'Detection',
    0.60, 0.65, 50,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    '["TFJS", "browser", "real-time", "general", "detection"]',
    '2.1.0', 'tfjs', NULL, 'coco-ssd', 25000000,
    '{"width": 224, "height": 224, "channels": 3}',
    '["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]', 1, 0
);
