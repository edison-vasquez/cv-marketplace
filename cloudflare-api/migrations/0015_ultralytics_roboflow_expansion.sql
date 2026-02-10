-- Migración 0015: Expansión de Modelos Industriales (Ultralytics + Roboflow)

-- 1. YOLOv11 Nano (General Industrial) - Ultralytics (Local)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'yolov11-nano', 'YOLOv11 Nano Industrial',
    'La última generación de YOLO optimizada para baja latencia en dispositivos industriales. Ideal para tracking de objetos en tiempo real.',
    'Ultralytics', 'Industrial', 'Detection', 0.395, 0.88, 5,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov11n.onnx', 1, 1,
    '["persona", "maquinaria", "herramienta", "vehiculo"]',
    '{"width": 640, "height": 640, "channels": 3}', '11.0.0'
);

-- 2. Solar Panel Crack Detection - Roboflow (API)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'solar-panel-cracks', 'Solar Panel Inspection',
    'Detección automática de micro-grietas y hot-spots en paneles solares de gran escala mediante termografía.',
    'EnergyAI', 'Energy', 'Detection', 0.82, 0.85,
    'https://images.unsplash.com/photo-1509391366360-fe5bb6521e25?w=800&q=80',
    'api', 'solar-panel-defect-detection', 4, 1, 1,
    '["crack", "hot-spot", "dust", "normal"]'
);

-- 3. Construction Site Safety (Hard Hats/Vests) - Ultralytics (Local)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'construction-safety-v8', 'Seguridad en Construcción v8',
    'Sistema de verificación de EPP (Casco, Chaleco, Guantes) en tiempo real para zonas de alto riesgo.',
    'SafeGuard', 'Seguridad', 'Detection', 0.45, 0.91, 12,
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov8n-ppe.onnx', 0, 1,
    '["casco", "sin-casco", "chaleco", "sin-chaleco"]',
    '{"width": 640, "height": 640, "channels": 3}', '8.0.0'
);

-- 4. Pharmaceutical Pill Inspection - Roboflow (API)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'pill-inspection', 'Inspección Farmacéutica',
    'Control de calidad en líneas de producción de medicamentos. Detecta píldoras rotas, colores incorrectos o blísteres incompletos.',
    'PharmaVision', 'Healthcare', 'Classification', 0.94, 0.96,
    'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=800&q=80',
    'api', 'pill-quality-control', 2, 1, 1,
    '["bueno", "dañado", "color-erroneo", "incompleto"]'
);

-- 5. Autonomous Forklift Navigation - Ultralytics (Local)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'forklift-nav', 'Navegación de Montacargas',
    'Segmentación de estanterías y pasillos para vehículos autónomos en almacenes inteligentes.',
    'LogiTech', 'Logistics', 'Segmentation', 0.35, 0.82, 18,
    'https://images.unsplash.com/photo-1586528116311-ad861a6674c1?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov8n-seg.onnx', 1, 1,
    '["estanteria", "pasillo", "obstaculo", "suelo"]',
    '{"width": 640, "height": 640, "channels": 3}', '8.0.0'
);

-- 6. Oil & Gas Pipeline Leak Detection - Roboflow (API)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'pipeline-leaks', 'Detección de Fugas Oil & Gas',
    'Análisis de vídeo infrarrojo para detectar fugas de gas no visibles al ojo humano en infraestructuras críticas.',
    'GeoVision', 'Infrastructure', 'Detection', 0.78, 0.81,
    'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=800&q=80',
    'api', 'methane-leak-detection', 1, 1, 1,
    '["leak", "vapor", "ventilation"]'
);

-- 7. Textile Defect Detection - Ultralytics (Local)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'textile-defects', 'Control Textil Automático',
    'Detección de hilos sueltos, manchas y errores de tejido en líneas de producción de alta velocidad.',
    'FashionTech', 'Manufacturing', 'Detection', 0.41, 0.89, 15,
    'https://images.unsplash.com/photo-1558227108-83a15dd96a47?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/textile-v1.onnx', 0, 1,
    '["mancha", "hilo", "agujero", "trama"]',
    '{"width": 640, "height": 640, "channels": 3}', '1.0.0'
);

-- 8. Food Processing Quality Control - Roboflow (API)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'food-sorting', 'Clasificación de Alimentos',
    'Detección de frutas en mal estado o cuerpos extraños en cintas transportadoras de procesado alimentario.',
    'AgriVision', 'Agriculture', 'Detection', 0.88, 0.92,
    'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80',
    'api', 'produce-quality-grading', 3, 0, 1,
    '["premium", "estandar", "descarte", "extranjero"]'
);

-- 9. Automotive Weld Inspection - Ultralytics (Local)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'weld-check', 'Inspección de Soldadura',
    'Análisis de calidad de soldaduras por arco mediante visión artificial para la industria automotriz.',
    'AutoRobotics', 'Manufacturing', 'Detection', 0.52, 0.94, 20,
    'https://images.unsplash.com/photo-1504917595217-d4dc5f643038?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/weld-v2.onnx', 1, 1,
    '["soldadura-ok", "poro", "fisura", "falta-fusion"]',
    '{"width": 640, "height": 640, "channels": 3}', '2.1.0'
);

-- 10. Retail Shelf Stock Analysis - Roboflow (API)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'shelf-analysis', 'Análisis de Lineal Retail',
    'Detección de productos fuera de stock (OSA) y cumplimiento de planogramas en estanterías de supermercados.',
    'RetailAI', 'Retail', 'Detection', 0.72, 0.75,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    'api', 'supermarket-shelf-monitoring', 5, 1, 1,
    '["producto", "hueco", "desordenado"]'
);
