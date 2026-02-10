-- Agregar labels para cada modelo según su tipo y modelo ONNX asignado

-- Face Detection (YuNet) - Solo detecta caras
UPDATE models SET labels = '["face"]'
WHERE onnx_model_url LIKE '%face-detection-yunet.onnx%';

-- TinyYOLOv2 COCO - 80 clases COCO
UPDATE models SET labels = '["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]'
WHERE onnx_model_url LIKE '%tiny-yolov2-coco.onnx%';

-- SSD MobileNet Retail - Clases de retail (usando COCO como base)
UPDATE models SET labels = '["background", "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]'
WHERE onnx_model_url LIKE '%ssd-mobilenet-retail.onnx%';

-- Modelos de clasificación ImageNet (1000 clases) - usando top 100 más comunes
UPDATE models SET labels = '["tench", "goldfish", "great white shark", "tiger shark", "hammerhead shark", "electric ray", "stingray", "rooster", "hen", "ostrich", "brambling", "goldfinch", "house finch", "junco", "indigo bunting", "robin", "bulbul", "jay", "magpie", "chickadee", "water ouzel", "kite", "bald eagle", "vulture", "great grey owl", "fire salamander", "smooth newt", "newt", "spotted salamander", "axolotl", "bullfrog", "tree frog", "tailed frog", "loggerhead turtle", "leatherback turtle", "mud turtle", "terrapin", "box turtle", "banded gecko", "common iguana", "American chameleon", "whiptail", "agama", "frilled lizard", "alligator lizard", "Gila monster", "green lizard", "African chameleon", "Komodo dragon", "African crocodile", "American alligator", "triceratops", "thunder snake", "ringneck snake", "hognose snake", "green snake", "king snake", "garter snake", "water snake", "vine snake", "night snake", "boa constrictor", "rock python", "Indian cobra", "green mamba", "sea snake", "horned viper", "diamondback", "sidewinder", "trilobite", "harvestman", "scorpion", "black and gold garden spider", "barn spider", "garden spider", "black widow", "tarantula", "wolf spider", "tick", "centipede", "black grouse", "ptarmigan", "ruffed grouse", "prairie chicken", "peacock", "quail", "partridge", "African grey", "macaw", "sulphur-crested cockatoo", "lorikeet", "coucal", "bee eater", "hornbill", "hummingbird", "jacamar", "toucan", "drake", "red-breasted merganser", "goose"]'
WHERE onnx_model_url LIKE '%mobilenetv2-imagenet.onnx%'
   OR onnx_model_url LIKE '%efficientnet-lite.onnx%'
   OR onnx_model_url LIKE '%resnet50-imagenet.onnx%'
   OR onnx_model_url LIKE '%shufflenet.onnx%'
   OR onnx_model_url LIKE '%squeezenet.onnx%';

-- Agregar preprocessing configs para cada tipo de modelo
-- Detection models no necesitan normalización especial
UPDATE models SET preprocessing = '{"mean": [0, 0, 0], "std": [1, 1, 1], "normalize": true, "channelOrder": "RGB"}'
WHERE technical = 'Detection';

-- Classification models usan ImageNet normalization
UPDATE models SET preprocessing = '{"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225], "normalize": true, "channelOrder": "RGB"}'
WHERE technical = 'Classification';

-- Segmentation models
UPDATE models SET preprocessing = '{"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225], "normalize": true, "channelOrder": "RGB"}'
WHERE technical = 'Segmentation';

-- Agregar postprocessing configs
UPDATE models SET postprocessing = '{"confidenceThreshold": 0.3, "iouThreshold": 0.45, "maxDetections": 100}'
WHERE technical = 'Detection';

UPDATE models SET postprocessing = '{"confidenceThreshold": 0.1, "iouThreshold": 0.5, "maxDetections": 5}'
WHERE technical = 'Classification';

UPDATE models SET postprocessing = '{"confidenceThreshold": 0.5, "iouThreshold": 0.5, "maxDetections": 10}'
WHERE technical = 'Segmentation';
