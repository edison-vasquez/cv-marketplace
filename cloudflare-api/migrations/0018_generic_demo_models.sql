-- Migration 0018: Add generic/customizable demo models
-- These models use labels '["__custom__"]' to signal the UI should show the CustomLabelConfigurator

-- 1. Universal Object Detector (ONNX local - uses COCO-SSD base)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'universal-detector', 'Detector Universal',
    'Apunta la cámara a cualquier cosa y define qué quieres detectar. Nuestro modelo base reconoce 80 clases de objetos comunes y puedes personalizarlo con tus propias etiquetas para simular un detector especializado.',
    'VisionHub', 'General', 'Detection', 0.37, 0.80, 15,
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    'tfjs', NULL, 0, 1,
    '["__custom__"]',
    '{"width": 640, "height": 640, "channels": 3}', '1.0.0'
);

-- 2. Custom Classifier (API-based, uses Roboflow open-vocabulary)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'custom-classifier', 'Clasificador Personalizado',
    'Define tus propias categorías de clasificación. Ideal para demostrar cómo un modelo de clasificación puede adaptarse a cualquier industria: control de calidad, selección de productos, o identificación de materiales.',
    'VisionHub', 'General', 'Classification', 0.85, 0.90,
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'api', 'yolov8-world', 1, 0, 1,
    '["__custom__"]'
);
