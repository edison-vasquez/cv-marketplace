-- Migración 0016: Expansión final para alcanzar el banco de 40 modelos
-- Enfoque: Minería, Energía, Infraestructura, Retail Avanzado y Logística.

-- 1. Minería: Detección de grietas en neumáticos de camiones mineros (Haul Trucks)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'mining-tire-cracks', 'Mining Tire Inspection',
    'Detección de fatiga y grietas en neumáticos gigantes de camiones mineros. Crucial para prevenir fallas catastróficas y paradas no planificadas.',
    'GeoMining AI', 'Mining', 'Detection', 0.76, 0.81,
    'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800&q=80',
    'api', 'mining-truck-tire-defects', 2, 1, 1,
    '["crack", "cut", "embedded-rock", "normal"]'
);

-- 2. Energía: Inspección de aisladores en líneas de alta tensión
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'powerline-insulators', 'Powerline Insulator Check',
    'Identifica aisladores dañados o contaminados en torres de alta tensión mediante drones.',
    'GridInspect', 'Energy', 'Detection', 0.84, 0.87,
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
    'api', 'insulator-defect-detection', 6, 1, 1,
    '["damaged", "missing", "polluted", "normal"]'
);

-- 3. Infraestructura: Detección de baches y grietas en pavimentos
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'road-pothole-v8', 'Pothole & Crack Detection',
    'Sistema de monitoreo de estado de carreteras. Detecta baches, grietas longitudinales y transversales en tiempo real.',
    'SmartCity', 'Infrastructure', 'Detection', 0.42, 0.85, 18,
    'https://images.unsplash.com/photo-1515162816999-a0ca957b6d62?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov8n-pothole.onnx', 0, 1,
    '["pothole", "crack", "patch"]',
    '{"width": 640, "height": 640, "channels": 3}', '8.0.0'
);

-- 4. Seguridad: Detección de derrames de líquidos industriales
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'industrial-spills', 'Industrial Spill Detector',
    'Detección proactiva de derrames de aceite, químicos o agua en suelos de fábricas para prevención de accidentes.',
    'HSEC Vision', 'Security', 'Segmentation', 0.68, 0.72,
    'https://images.unsplash.com/photo-1611270629569-8b657ac73df4?w=800&q=80',
    'api', 'liquid-spill-segmentation', 3, 1, 1,
    '["spill", "leak", "floor"]'
);

-- 5. Retail: Reconocimiento de Planogramas (Agotados en Percha)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'out-of-stock-hero', 'Out-of-Stock Optimizer',
    'Analiza estanterías para identificar productos agotados o mal ubicados, optimizando la reposición en retail.',
    'RetailAI', 'Retail', 'Detection', 0.89, 0.91,
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&q=80',
    'api', 'retail-shelf-stock-out', 1, 1, 1,
    '["product", "empty-space", "label"]'
);

-- 6. Logística: Dimensionamiento Automático de Cajas
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'box-dimensioner', 'Box Dimensioner (L/W/H)',
    'Estima las dimensiones de paquetes en cintas transportadoras mediante segmentación y análisis de perspectiva.',
    'LogiTech', 'Logistics', 'Segmentation', 0.38, 0.79, 25,
    'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/box-seg-v1.onnx', 1, 1,
    '["box-top", "box-side"]',
    '{"width": 640, "height": 640, "channels": 3}', '1.0.0'
);

-- 7. Manufactura: Inspección de Placas de Circuito (PCBA)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'pcb-inspection-v2', 'PCB Quality Control',
    'Identifica componentes faltantes, soldaduras frías o puentes de soldadura en placas de circuito impreso.',
    'ElectronicsVision', 'Manufacturing', 'Detection', 0.92, 0.95,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    'api', 'pcb-defect-detection-yolo', 4, 1, 1,
    '["missing-component", "short-circuit", "bad-solder", "ok"]'
);

-- 8. Agricultura: Conteo de Frutas en Árbol (Estimación de Cosecha)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'fruit-counter-agro', 'Agro Crop Estimator',
    'Conteo automático de frutas (manzanas, cítricos) para estimación de rendimiento de cosecha mediante cámaras móviles.',
    'AgriData', 'Agriculture', 'Detection', 0.48, 0.88, 12,
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov8s-fruit.onnx', 0, 1,
    '["fruit", "flower", "leaf"]',
    '{"width": 640, "height": 640, "channels": 3}', '8.0.0'
);

-- 9. Seguridad: Detección de Armas (Weapon Detection)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'weapon-detection-pro', 'Weapon Detection System',
    'Identificación de armas de fuego y blancas en sistemas de videovigilancia pública y privada. Alta prioridad de alerta.',
    'SafeCity', 'Security', 'Detection', 0.72, 0.89,
    'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?w=800&q=80',
    'api', 'weapon-detection-yolov8', 2, 1, 1,
    '["gun", "knife", "person"]'
);

-- 10. Operacional: Lectura de Manómetros Analógicos
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'gauge-reader', 'Analog Gauge Reader',
    'Digitaliza lecturas de manómetros antiguos sin necesidad de reemplazarlos. Detecta la aguja y estima el valor de presión.',
    'RetrofitAI', 'Industrial', 'Keypoint', 0.82, 0.85, 30,
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/gauge-reader.onnx', 1, 1,
    '["center", "needle-tip", "scale-min", "scale-max"]',
    '{"width": 256, "height": 256, "channels": 3}', '1.5.0'
);

-- 11. Medio Ambiente: Clasificación de Residuos (Waste Management)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'waste-classifier-eco', 'Smart Waste Sorter',
    'Clasifica automáticamente residuos en cintas de reciclaje: plástico, cartón, metal y vidrio.',
    'EcoVision', 'Sustainability', 'Classification', 0.91, 0.94,
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
    'api', 'waste-classification-v3', 1, 0, 1,
    '["plastic", "paper", "metal", "glass", "organic"]'
);

-- 12. Logística: Detección de Montacargas en Movimiento
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'forklift-tracker-v11', 'Forklift Safety Tracker',
    'Rastreo de montacargas para optimización de rutas y prevención de colisiones en centros de distribución.',
    'LogiTech', 'Logistics', 'Detection', 0.55, 0.92, 5,
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov11n-forklift.onnx', 1, 1,
    '["forklift", "operator", "pedestrian"]',
    '{"width": 640, "height": 640, "channels": 3}', '11.0.0'
);

-- 13. Pesca: Monitoreo de Procesamiento de Salmón
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'fish-quality-check', 'SeaFood Quality Sorter',
    'Analiza la frescura y defectos en filetes de pescado durante el procesamiento industrial.',
    'AquaVision', 'Food Industry', 'Segmentation', 0.75, 0.80,
    'https://images.unsplash.com/photo-1534951009808-dfd006130e4d?w=800&q=80',
    'api', 'fish-defect-detection', 2, 1, 1,
    '["flesh", "bruise", "bone", "skin"]'
);

-- 14. Ferrocarriles: Inspección de Sujetadores de Riel (Rail Clips)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'railway-fastener-check', 'Railway Safety Inspector',
    'Detección automática de sujetadores de riel faltantes o rotos mediante cámaras instaladas bajo el tren.',
    'TransitAI', 'Infrastructure', 'Detection', 0.88, 0.91,
    'https://images.unsplash.com/photo-1474487548417-781f27ac8124?w=800&q=80',
    'api', 'railway-fastener-defect', 5, 1, 1,
    '["missing", "broken", "loose", "normal"]'
);

-- 15. Forestal: Identificación de Especies de Madera (Wood ID)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'wood-specie-id', 'Lumber Specie Analyzer',
    'Identifica especies de madera mediante el análisis de la veta y color en aserraderos automatizados.',
    'ForestTech', 'Forestry', 'Classification', 0.94, 0.96,
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    'api', 'wood-grain-classification', 1, 1, 1,
    '["pine", "oak", "teak", "maple", "cedar"]'
);
