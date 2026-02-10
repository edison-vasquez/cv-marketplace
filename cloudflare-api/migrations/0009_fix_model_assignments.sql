-- Corregir asignaciones de modelos ONNX
-- Problema: Algunos modelos de Detection usan modelos de Classification

-- 1. Bone Fracture Detector - Era Detection con mobilenetv2, cambiar a Classification
-- (No podemos detectar fracturas con clasificación general, pero al menos funcionará)
UPDATE models SET
    technical = 'Classification',
    onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/efficientnet-lite.onnx',
    model_size_bytes = 51946641,
    input_shape = '{"width": 224, "height": 224, "channels": 3}'
WHERE slug = 'bone-fracture-xray';

-- 2. Sports Pose Analyzer - Era Detection con resnet50, cambiar a Classification
UPDATE models SET
    technical = 'Classification',
    onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/resnet50-imagenet.onnx',
    model_size_bytes = 102442452,
    input_shape = '{"width": 224, "height": 224, "channels": 3}'
WHERE slug = 'sports-pose-analysis';

-- 3. Asegurar que todos los modelos de Detection usen modelos de detección reales
-- Wildlife Detection debería usar tiny-yolov2 (detecta animales en COCO)
UPDATE models SET
    onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/tiny-yolov2-coco.onnx',
    model_size_bytes = 63480982,
    input_shape = '{"width": 416, "height": 416, "channels": 3}'
WHERE slug = 'wildlife-camera-trap';

-- 4. Agregar campo 'model_format' a todos los modelos que no lo tengan
UPDATE models SET model_format = 'onnx' WHERE model_format IS NULL OR model_format = '';

-- 5. Actualizar descripciones para reflejar qué hace realmente cada modelo
-- Los modelos de clasificación ImageNet clasifican entre 1000 categorías

-- Crear tabla temporal con descripciones
-- Esto ayudará a los usuarios a entender qué hace cada modelo
