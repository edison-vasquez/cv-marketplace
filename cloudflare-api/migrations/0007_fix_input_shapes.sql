-- Corregir input_shape para todos los modelos según su archivo ONNX real

-- face-detection-yunet.onnx - El modelo real usa 640x640
UPDATE models SET input_shape = '{"width": 640, "height": 640, "channels": 3}'
WHERE onnx_model_url LIKE '%face-detection-yunet.onnx%';

-- tiny-yolov2-coco.onnx - YOLO típicamente usa 416x416
UPDATE models SET input_shape = '{"width": 416, "height": 416, "channels": 3}'
WHERE onnx_model_url LIKE '%tiny-yolov2-coco.onnx%';

-- ssd-mobilenet-retail.onnx - SSD MobileNet usa 300x300
UPDATE models SET input_shape = '{"width": 300, "height": 300, "channels": 3}'
WHERE onnx_model_url LIKE '%ssd-mobilenet-retail.onnx%';

-- mobilenetv2-imagenet.onnx - MobileNet usa 224x224
UPDATE models SET input_shape = '{"width": 224, "height": 224, "channels": 3}'
WHERE onnx_model_url LIKE '%mobilenetv2-imagenet.onnx%';

-- efficientnet-lite.onnx - EfficientNet Lite usa 224x224
UPDATE models SET input_shape = '{"width": 224, "height": 224, "channels": 3}'
WHERE onnx_model_url LIKE '%efficientnet-lite.onnx%';

-- shufflenet.onnx - ShuffleNet usa 224x224
UPDATE models SET input_shape = '{"width": 224, "height": 224, "channels": 3}'
WHERE onnx_model_url LIKE '%shufflenet.onnx%';

-- resnet50-imagenet.onnx - ResNet usa 224x224
UPDATE models SET input_shape = '{"width": 224, "height": 224, "channels": 3}'
WHERE onnx_model_url LIKE '%resnet50-imagenet.onnx%';
