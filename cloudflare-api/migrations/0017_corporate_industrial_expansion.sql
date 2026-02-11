-- Migración 0017: Mega-catálogo Corporativo e Industrial
-- Enfoque: Modelos de alto valor para sectores estratégicos (Banca, Logística Avanzada, Manufactura Pesada, HSEC)

-- 1. Banca/Finanzas: Verificación de Firma Manuscrita
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'signature-verify-pro', 'Signature Verification AI',
    'Compara firmas en documentos bancarios con firmas de referencia para detectar falsificaciones. Utiliza arquitecturas siamesas de alta precisión.',
    'FinTech Vision', 'Finance', 'Classification', 0.96, 0.98,
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
    'api', 'signature-matching-v2', 1, 1, 1,
    '["authentic", "forged"]'
);

-- 2. Logística: Reconocimiento de Matrículas (LPR/ANPR)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'anpr-trucks-v8', 'LPR Freight Optimizer',
    'Reconocimiento automático de matrículas para camiones y vehículos de carga. Ideal para control de acceso automatizado en puertos y almacenes.',
    'LogiTech', 'Logistics', 'Detection', 0.91, 0.95, 15,
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/anpr-yolov8n.onnx', 1, 1,
    '["license-plate", "truck", "van"]',
    '{"width": 640, "height": 640, "channels": 3}', '8.1.0'
);

-- 3. Construcción: Conteo de Barras de Refuerzo (Rebar)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'rebar-counter-pro', 'Construction Rebar Counter',
    'Conteo automático de barras de acero (rebar) en camiones o acopios. Digitaliza inventarios de materiales de construcción en segundos.',
    'BuildVis', 'Construction', 'Detection', 0.82, 0.85,
    'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800&q=80',
    'api', 'rebar-detection-counting', 4, 1, 1,
    '["rebar-end", "bundle"]'
);

-- 4. Energía: Detección de Daños en Palas de Turbinas Eólicas
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'wind-turbine-damage', 'Wind Turbine Inspector',
    'Analiza imágenes de drones para detectar grietas, erosión y daños por rayos en palas de turbinas eólicas.',
    'GreenEnergy AI', 'Energy', 'Segmentation', 0.74, 0.78,
    'https://images.unsplash.com/photo-1466611653911-954ff21b6724?w=800&q=80',
    'api', 'turbine-blade-defect-seg', 2, 1, 1,
    '["crack", "erosion", "lightning-strike", "normal"]'
);

-- 5. Manufactura: Detección de Fisuras en Soldaduras por Rayos X
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'xray-weld-defects', 'X-Ray Weld Analyzer',
    'Detección de defectos internos en soldaduras industriales mediante análisis de radiografías digitales (fisuras, escoria, falta de fusión).',
    'HeavyMetal AI', 'Manufacturing', 'Detection', 0.88, 0.91,
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'api', 'industrial-radiography-defects', 1, 1, 1,
    '["crack", "inclusion", "porosity", "ok"]'
);

-- 6. Retail: Análisis de Tiempo de Espera en Cajas
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'queue-analyzer-v8', 'Retail Queue Management',
    'Mide la longitud de las colas y estima el tiempo de espera en tiempo real para optimizar la apertura de cajas en supermercados.',
    'RetailFlow', 'Retail', 'Detection', 0.35, 0.82, 20,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov8n-queues.onnx', 0, 1,
    '["person", "queue-line", "checkout-occupied"]',
    '{"width": 640, "height": 640, "channels": 3}', '8.0.2'
);

-- 7. Salud: Asistente de Diagnóstico de Neumonía (Rayos X)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'pneumonia-detect-xray', 'Pneumonia Diagnosis AI',
    'Clasificación automática de radiografías de tórax para detección temprana de signos de neumonía. Herramienta de apoyo al triaje médico.',
    'MedVision', 'Healthcare', 'Classification', 0.94, 0.95,
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80',
    'api', 'pneumonia-detection-xray-v3', 2, 1, 1,
    '["normal", "pneumonia-bacterial", "pneumonia-viral"]'
);

-- 8. Seguridad: Detección de Caídas de Trabajadores
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'fall-detection-industrial', 'Occupational Fall Detector',
    'Detecta caídas de personas en zonas industriales o de construcción, generando alertas instantáneas al centro de control HSEC.',
    'SafeGuard AI', 'Security', 'Keypoint', 0.85, 0.88, 12,
    'https://images.unsplash.com/photo-1590103513994-0a3be416298e?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov8n-pose-fall.onnx', 1, 1,
    '["standing", "walking", "sitting", "fallen"]',
    '{"width": 640, "height": 640, "channels": 3}', '8.0.0'
);

-- 9. Minería: Detección de Roturas en Cintas Transportadoras
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'conveyor-belt-tear', 'Conveyor Integrity Monitor',
    'Monitoreo continuo de bandas transportadoras para detectar cortes longitudinales o desgarros antes de que se conviertan en fallas mayores.',
    'GeoVision', 'Mining', 'Segmentation', 0.61, 0.65,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    'api', 'conveyor-belt-rip-detection', 3, 1, 1,
    '["crack", "tear", "normal"]'
);

-- 10. Corporativo: Análisis de Ocupación de Salas de Reuniones
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'room-occupancy-ai', 'Smart Office Space Manager',
    'Conteo anónimo de personas en salas de reuniones para optimizar el uso de espacios y la gestión de climatización.',
    'WorkplaceAI', 'Corporate', 'Detection', 0.38, 0.92, 10,
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/office-occupancy.onnx', 0, 1,
    '["person", "desk-occupied", "desk-empty"]',
    '{"width": 416, "height": 416, "channels": 3}', '1.2.0'
);

-- 11. Automotriz: Detección de Somnolencia del Conductor
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'driver-drowsiness-v2', 'Driver Safety Monitor',
    'Analiza la apertura de ojos y la frecuencia de parpadeo para detectar fatiga o somnolencia en conductores de flotas.',
    'AutoSafe', 'Automotive', 'Classification', 0.91, 0.93,
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    'api', 'drowsiness-detection-system', 1, 1, 1,
    '["alert", "drowsy", "eyes-closed"]'
);

-- 12. Manufactura: Inspección de Niveles en Viales Farmacéuticos
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'liquid-level-pharma', 'Pharma Fill Level Checker',
    'Verifica que el nivel de llenado de líquidos en viales y botellas sea el correcto durante el proceso de producción.',
    'PharmaVision', 'Manufacturing', 'Detection', 0.95, 0.97,
    'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=800&q=80',
    'api', 'vial-liquid-level-inspection', 2, 1, 1,
    '["fill-ok", "underfilled", "overfilled"]'
);

-- 13. Infraestructura: Segmentación de Grietas en Puentes
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'bridge-crack-seg', 'Bridge Integrity AI',
    'Segmentación precisa de grietas en estructuras de concreto para evaluación de salud estructural en puentes y túneles.',
    'CivicInspect', 'Infrastructure', 'Segmentation', 0.72, 0.75,
    'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80',
    'api', 'concrete-crack-segmentation', 5, 1, 1,
    '["crack", "spalling", "normal"]'
);

-- 14. Agricultura: Conteo de Ganado por Satélite/Drone
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'cattle-counter-v4', 'Livestock Inventory AI',
    'Identificación y conteo automático de ganado en campos abiertos mediante imágenes aéreas para control de inventario ganadero.',
    'AgriData', 'Agriculture', 'Detection', 0.78, 0.81,
    'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80',
    'api', 'cattle-detection-aerial', 2, 1, 1,
    '["cow", "sheep", "horse"]'
);

-- 15. Seguridad: Detección de Intrusión en Perímetro con IA
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'perimeter-security-v11', 'Advanced Perimeter Guard',
    'Monitorización avanzada de vallas y perímetros. Filtra falsas alarmas provocadas por animales o vegetación, enfocándose solo en intrusiones humanas.',
    'SafeCity', 'Security', 'Detection', 0.45, 0.94, 7,
    'https://images.unsplash.com/photo-1557597774-9d2739f85a76?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/yolov11n-perimeter.onnx', 1, 1,
    '["human-intruder", "vehicle", "animal"]',
    '{"width": 640, "height": 640, "channels": 3}', '11.0.1'
);

-- 16. Retail: Mapa de Calor de Flujo de Clientes
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'retail-heatmapper', 'Store Heatmap Generator',
    'Genera mapas de calor basados en el tiempo de permanencia de clientes frente a promociones o secciones específicas.',
    'RetailFlow', 'Retail', 'Detection', 0.81, 0.84,
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&q=80',
    'api', 'customer-flow-analysis', 1, 1, 1,
    '["customer", "interaction-hotzone"]'
);

-- 17. Logística: Reconocimiento de Códigos de Contenedores (ISO 6346)
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'container-ocr-pro', 'ISO Container Code Reader',
    'Lectura automática de códigos de contenedores marítimos para integración directa con sistemas ERP y gestión portuaria.',
    'LogiTech', 'Logistics', 'Detection', 0.89, 0.92,
    'https://images.unsplash.com/photo-1586528116311-ad861a6674c1?w=800&q=80',
    'api', 'shipping-container-id-ocr', 4, 1, 1,
    '["container-id", "owner-code", "size-type"]'
);

-- 18. Alimentos: Clasificación de Madurez de Frutos Tropicales
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, inference_ms, image, model_format, onnx_model_url, is_premium, is_public, labels, input_shape, version)
VALUES (
    hex(randomblob(16)), 'fruit-ripeness-detector', 'Export Quality Ripeness AI',
    'Clasifica el grado de madurez de frutos (plátano, aguacate, mango) para asegurar que cumplan los estándares de exportación.',
    'AgriVision', 'Food Industry', 'Classification', 0.88, 0.91, 15,
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80',
    'onnx', 'https://pub-your-r2.dev/fruit-ripeness-v1.onnx', 0, 1,
    '["green", "turning", "ripe", "overripe"]',
    '{"width": 224, "height": 224, "channels": 3}', '1.0.0'
);

-- 19. Corporativo: Detección de "Cola" (Tailgating) en Torniquetes
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'tailgating-detector', 'Access Control Tailgate AI',
    'Detecta cuando dos personas ingresan por un torniquete usando una sola credencial, reforzando la seguridad corporativa.',
    'SafeGuard AI', 'Corporate', 'Detection', 0.75, 0.81,
    'https://images.unsplash.com/photo-1557597774-9d2739f85a76?w=800&q=80',
    'api', 'security-tailgating-event', 2, 1, 1,
    '["valid-entry", "tailgate-alert"]'
);

-- 20. Manufactura: Detección de Anomalías en Superficies Metálicas
INSERT INTO models (id, slug, title, description, creator, category, technical, mAP, precision, image, model_format, roboflow_id, roboflow_version, is_premium, is_public, labels)
VALUES (
    hex(randomblob(16)), 'surface-anomaly-metal', 'Steel Surface Quality Monitor',
    'Detección en tiempo real de anomalías microscópicas en láminas de acero durante el laminado en caliente o frío.',
    'IndustrialScan', 'Manufacturing', 'Segmentation', 0.84, 0.86,
    'https://images.unsplash.com/photo-1504917595217-d4dc5f643038?w=800&q=80',
    'api', 'steel-surface-defect-seg', 1, 1, 1,
    '["pit", "stain", "scratch", "inclusion"]'
);
