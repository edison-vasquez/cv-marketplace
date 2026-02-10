-- Actualizar URLs de modelos para usar URLs completas del Worker
-- Los modelos están ahora en R2 y se sirven desde /models/:filename

UPDATE models SET onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/face-detection-yunet.onnx' WHERE onnx_model_url = 'face-detection-yunet.onnx';
UPDATE models SET onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/mobilenetv2-imagenet.onnx' WHERE onnx_model_url = 'mobilenetv2-imagenet.onnx';
UPDATE models SET onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/efficientnet-lite.onnx' WHERE onnx_model_url = 'efficientnet-lite.onnx';
UPDATE models SET onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/ssd-mobilenet-retail.onnx' WHERE onnx_model_url = 'ssd-mobilenet-retail.onnx';
UPDATE models SET onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/resnet50-imagenet.onnx' WHERE onnx_model_url = 'resnet50-imagenet.onnx';
UPDATE models SET onnx_model_url = 'https://visionhub-api.edison-985.workers.dev/models/tiny-yolov2-coco.onnx' WHERE onnx_model_url = 'tiny-yolov2-coco.onnx';
