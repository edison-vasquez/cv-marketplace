-- Asignar modelos ONNX reales a cada modelo del catálogo según su tipo
-- Modelos disponibles en R2:
-- - face-detection-yunet.onnx (228KB) - Detección de rostros
-- - mobilenetv2-imagenet.onnx (14MB) - Clasificación general
-- - efficientnet-lite.onnx (50MB) - Clasificación eficiente
-- - resnet50-imagenet.onnx (98MB) - Clasificación alta precisión
-- - ssd-mobilenet-retail.onnx (29MB) - Detección retail
-- - tiny-yolov2-coco.onnx (61MB) - Detección YOLO COCO
-- - squeezenet.onnx (4.8MB) - Clasificación ultra ligera
-- - shufflenet.onnx (8.8MB) - Clasificación ligera
-- - alexnet.onnx (233MB) - Clasificación clásica

-- Modelos de Detección - usar tiny-yolov2-coco o ssd-mobilenet
UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/tiny-yolov2-coco.onnx',
  model_size_bytes = 63480982
WHERE technical = 'Detection' AND category IN ('Automotive', 'Industrial', 'Logistics', 'Construction');

UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/ssd-mobilenet-retail.onnx',
  model_size_bytes = 29461455
WHERE technical = 'Detection' AND category IN ('Retail', 'Food', 'Agriculture');

UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/face-detection-yunet.onnx',
  model_size_bytes = 232589
WHERE technical = 'Detection' AND category = 'Security';

-- Modelos de Clasificación - usar mobilenetv2, efficientnet, squeezenet
UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/efficientnet-lite.onnx',
  model_size_bytes = 51946641
WHERE technical = 'Classification' AND category IN ('Healthcare', 'Environmental');

UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/mobilenetv2-imagenet.onnx',
  model_size_bytes = 13964571
WHERE technical = 'Classification' AND category IN ('General', 'Sports', 'Food');

UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/shufflenet.onnx',
  model_size_bytes = 9002000
WHERE technical = 'Classification' AND category = 'Security';

UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/squeezenet.onnx',
  model_size_bytes = 4840000
WHERE technical = 'Classification' AND category = 'Retail';

-- Modelos de Segmentación - usar resnet50 (más pesado para segmentación)
UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/resnet50-imagenet.onnx',
  model_size_bytes = 102442452
WHERE technical = 'Segmentation';

-- Modelo de General/Multi-purpose con Detection
UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/tiny-yolov2-coco.onnx',
  model_size_bytes = 63480982
WHERE technical = 'Detection' AND category = 'General';

-- Cualquier modelo que quede sin asignar, usar mobilenetv2
UPDATE models SET
  onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/mobilenetv2-imagenet.onnx',
  model_size_bytes = 13964571
WHERE onnx_model_url IS NULL OR onnx_model_url = '';
