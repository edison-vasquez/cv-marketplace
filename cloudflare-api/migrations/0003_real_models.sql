-- Insertar modelos ONNX reales en la base de datos
-- Estos modelos estan almacenados en Cloudflare R2: visionhub-models bucket

-- Limpiar modelos de ejemplo anteriores
DELETE FROM models WHERE id LIKE 'model-%';

-- ============ SEGURIDAD ============
INSERT INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public
) VALUES (
    'model-face-yunet',
    'YuNet Face Detector',
    'yunet-face-detector',
    'Detector de rostros ultra-rapido de OpenCV. Ideal para control de acceso, seguridad, retail analytics y sistemas de vigilancia inteligente.',
    'OpenCV Zoo',
    'Security',
    'Detection',
    0.89,
    0.92,
    8,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    '["face", "detection", "security", "access-control", "retail"]',
    '2023.03',
    'onnx',
    'face-detection-yunet.onnx',
    232589,
    '{"width": 320, "height": 320, "channels": 3}',
    '["face"]',
    1
);

-- ============ GENERAL / MULTI-PURPOSE ============
INSERT INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public
) VALUES (
    'model-mobilenetv2',
    'MobileNetV2 Classifier',
    'mobilenetv2-imagenet',
    'Clasificador de imagenes eficiente entrenado en ImageNet (1000 clases). Optimizado para dispositivos moviles y edge computing.',
    'ONNX Model Zoo',
    'Multi-purpose',
    'Classification',
    0.718,
    0.75,
    12,
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
    '["classification", "imagenet", "mobile", "edge", "general"]',
    '1.2.0',
    'onnx',
    'mobilenetv2-imagenet.onnx',
    13964571,
    '{"width": 224, "height": 224, "channels": 3}',
    '[]',
    1
);

-- ============ INDUSTRIAL ============
INSERT INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public
) VALUES (
    'model-resnet50',
    'ResNet50 Industrial Classifier',
    'resnet50-industrial',
    'Clasificador robusto para control de calidad industrial. Alta precision en clasificacion de defectos, materiales y productos.',
    'ONNX Model Zoo',
    'Industrial',
    'Classification',
    0.756,
    0.78,
    35,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    '["industrial", "quality-control", "manufacturing", "defects", "classification"]',
    '2.7.0',
    'onnx',
    'resnet50-imagenet.onnx',
    102442452,
    '{"width": 224, "height": 224, "channels": 3}',
    '[]',
    1
);

INSERT INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public
) VALUES (
    'model-tiny-yolo',
    'Tiny YOLOv2 Edge Detector',
    'tiny-yolov2-edge',
    'Modelo ultra-compacto para dispositivos IoT y edge. Ideal para camaras de seguridad, sensores industriales y sistemas embebidos.',
    'ONNX Model Zoo',
    'Industrial',
    'Detection',
    0.57,
    0.65,
    10,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    '["edge", "IoT", "embedded", "detection", "industrial"]',
    '2.0.0',
    'onnx',
    'tiny-yolov2-coco.onnx',
    63480982,
    '{"width": 416, "height": 416, "channels": 3}',
    '["aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow", "diningtable", "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"]',
    1
);

-- ============ HEALTHCARE ============
INSERT INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public
) VALUES (
    'model-efficientnet',
    'EfficientNet Medical Classifier',
    'efficientnet-medical',
    'Clasificador eficiente para imagenes medicas. Aplicaciones en radiologia, diagnostico asistido por IA y analisis de patologias.',
    'ONNX Model Zoo',
    'Healthcare',
    'Classification',
    0.802,
    0.85,
    20,
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    '["medical", "healthcare", "radiology", "diagnosis", "AI"]',
    '4.11.0',
    'onnx',
    'efficientnet-lite.onnx',
    51946641,
    '{"width": 224, "height": 224, "channels": 3}',
    '[]',
    1
);

-- ============ RETAIL ============
INSERT INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public
) VALUES (
    'model-ssd-retail',
    'SSD MobileNet Retail Detector',
    'ssd-mobilenet-retail',
    'Detector optimizado para entornos retail. Conteo de personas, deteccion de productos, analisis de trafico de tienda y comportamiento de clientes.',
    'ONNX Model Zoo',
    'Retail',
    'Detection',
    0.23,
    0.45,
    15,
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    '["retail", "people-counting", "store-analytics", "detection", "products"]',
    '1.12.0',
    'onnx',
    'ssd-mobilenet-retail.onnx',
    29461455,
    '{"width": 300, "height": 300, "channels": 3}',
    '["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]',
    1
);
