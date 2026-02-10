-- Corregir labels para TinyYOLOv2 que usa Pascal VOC (20 clases), NO COCO (80 clases)
-- Pascal VOC classes: aeroplane, bicycle, bird, boat, bottle, bus, car, cat, chair, cow,
-- diningtable, dog, horse, motorbike, person, pottedplant, sheep, sofa, train, tvmonitor

UPDATE models SET labels = '["aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow", "diningtable", "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"]'
WHERE onnx_model_url LIKE '%tiny-yolov2-coco.onnx%';

-- YuNet solo detecta caras
UPDATE models SET labels = '["face"]'
WHERE onnx_model_url LIKE '%face-detection-yunet.onnx%';

-- SSD MobileNet - mantener COCO labels (81 clases con background)
UPDATE models SET labels = '["background", "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]'
WHERE onnx_model_url LIKE '%ssd-mobilenet-retail.onnx%';

-- Bajar threshold de confianza para modelos de detección (0.3 es más razonable)
UPDATE models SET postprocessing = '{"confidenceThreshold": 0.25, "iouThreshold": 0.45, "maxDetections": 50}'
WHERE technical = 'Detection';
