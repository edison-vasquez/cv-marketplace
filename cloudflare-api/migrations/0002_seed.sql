-- Seed data for VisionHub

-- Admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, name, password_hash, is_admin, premium_tier)
VALUES (
    'admin-user-001',
    'admin@visionhub.com',
    'Admin',
    '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', -- sha256(admin123 + salt)
    1,
    'pro'
);

-- Demo user (password: demo123)
INSERT OR IGNORE INTO users (id, email, name, password_hash, is_admin, premium_tier)
VALUES (
    'demo-user-001',
    'demo@visionhub.com',
    'Demo User',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', -- sha256(demo123 + salt)
    0,
    'free'
);

-- Sample Models
INSERT OR IGNORE INTO models (
    id, title, slug, description, creator, category, technical, mAP, precision, inference_ms,
    image, tags, version, model_format, onnx_model_url, model_size_bytes, input_shape, labels, is_public
) VALUES
(
    'model-yolov8-hardhat',
    'YOLOv8 Safety Helmet Detector',
    'yolov8-hardhat',
    'Detecta cascos de seguridad en trabajadores de construcción con alta precisión.',
    'VisionHub Team',
    'Industrial',
    'Detection',
    0.945,
    0.92,
    28,
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    '["safety", "construction", "helmet", "PPE", "yolov8"]',
    '1.0.0',
    'onnx',
    'https://huggingface.co/example/yolov8n-hardhat/resolve/main/model.onnx',
    25600000,
    '{"width": 640, "height": 640, "channels": 3}',
    '["helmet", "no-helmet", "person"]',
    1
),
(
    'model-pcb-inspector',
    'PCB Solder Defect Inspector',
    'pcb-solder-inspector',
    'Inspección automática de defectos de soldadura en placas PCB.',
    'ElectroVision Labs',
    'Industrial',
    'Detection',
    0.912,
    0.89,
    35,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    '["PCB", "electronics", "quality", "manufacturing"]',
    '2.1.0',
    'onnx',
    'https://huggingface.co/example/pcb-detector/resolve/main/model.onnx',
    32100000,
    '{"width": 640, "height": 640, "channels": 3}',
    '["good_solder", "bad_solder", "missing", "bridge"]',
    1
),
(
    'model-xray-pneumonia',
    'Chest X-Ray Pneumonia Classifier',
    'xray-pneumonia-classifier',
    'Clasificación de neumonía en radiografías de tórax usando deep learning.',
    'MedAI Research',
    'Healthcare',
    'Classification',
    0.967,
    0.95,
    18,
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    '["medical", "xray", "pneumonia", "healthcare", "AI"]',
    '3.0.0',
    'onnx',
    'https://huggingface.co/example/xray-classifier/resolve/main/model.onnx',
    18500000,
    '{"width": 224, "height": 224, "channels": 3}',
    '["normal", "pneumonia"]',
    1
),
(
    'model-face-mask',
    'Face Mask Detection',
    'face-mask-detection',
    'Detecta si las personas usan mascarilla correctamente.',
    'SafetyFirst AI',
    'Security',
    'Detection',
    0.934,
    0.91,
    22,
    'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400',
    '["mask", "face", "COVID", "safety", "detection"]',
    '1.5.0',
    'onnx',
    'https://huggingface.co/example/face-mask/resolve/main/model.onnx',
    21000000,
    '{"width": 640, "height": 640, "channels": 3}',
    '["with_mask", "without_mask", "mask_worn_incorrectly"]',
    1
),
(
    'model-traffic-signs',
    'Traffic Sign Recognition',
    'traffic-sign-recognition',
    'Reconocimiento de señales de tráfico para sistemas ADAS.',
    'AutoDrive Labs',
    'Automotive',
    'Classification',
    0.978,
    0.96,
    15,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    '["traffic", "signs", "ADAS", "automotive", "self-driving"]',
    '2.0.0',
    'onnx',
    'https://huggingface.co/example/traffic-signs/resolve/main/model.onnx',
    15200000,
    '{"width": 224, "height": 224, "channels": 3}',
    '["stop", "yield", "speed_limit", "no_entry", "pedestrian"]',
    1
),
(
    'model-crop-disease',
    'Crop Disease Detector',
    'crop-disease-detector',
    'Identifica enfermedades en cultivos a partir de imágenes de hojas.',
    'AgriTech Vision',
    'Agriculture',
    'Classification',
    0.923,
    0.90,
    20,
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    '["agriculture", "crops", "disease", "farming", "AI"]',
    '1.2.0',
    'onnx',
    'https://huggingface.co/example/crop-disease/resolve/main/model.onnx',
    28500000,
    '{"width": 224, "height": 224, "channels": 3}',
    '["healthy", "bacterial_spot", "early_blight", "late_blight"]',
    1
);

-- Sample API Key for demo user
INSERT OR IGNORE INTO api_keys (id, key, name, tier, user_id, request_limit)
VALUES (
    'apikey-demo-001',
    'demo_key_hash_placeholder',
    'Demo API Key',
    'free',
    'demo-user-001',
    1000
);
