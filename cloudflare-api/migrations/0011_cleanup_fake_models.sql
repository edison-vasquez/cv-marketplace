-- Eliminar modelos del catálogo cuyo nombre NO corresponde a lo que realmente hace el modelo ONNX
-- Mantener solo modelos que tienen sentido con el archivo ONNX asignado

-- ELIMINAR modelos que prometen funcionalidad que TinyYOLOv2 (Pascal VOC) NO puede hacer:
-- TinyYOLOv2 solo detecta: aeroplane, bicycle, bird, boat, bottle, bus, car, cat, chair, cow,
-- diningtable, dog, horse, motorbike, person, pottedplant, sheep, sofa, train, tvmonitor

-- Estos modelos prometen cosas que VOC no puede detectar:
DELETE FROM models WHERE slug = 'license-plate-ocr';        -- VOC no tiene placas
DELETE FROM models WHERE slug = 'barcode-qr-reader';        -- VOC no tiene códigos
DELETE FROM models WHERE slug = 'pcb-defect-detection';     -- VOC no tiene PCBs
DELETE FROM models WHERE slug = 'structural-crack-detection'; -- VOC no tiene grietas
DELETE FROM models WHERE slug = 'package-parcel-detection'; -- VOC no tiene paquetes (solo suitcase)
DELETE FROM models WHERE slug = 'ball-tracking-sports';     -- VOC no tiene pelotas deportivas

-- Estos modelos de clasificación prometen cosas específicas pero usan ImageNet genérico:
DELETE FROM models WHERE slug = 'skin-lesion-classifier';   -- ImageNet no tiene lesiones de piel
DELETE FROM models WHERE slug = 'diabetic-retinopathy';     -- ImageNet no tiene retinas
DELETE FROM models WHERE slug = 'bone-fracture-xray';       -- ImageNet no tiene rayos X
DELETE FROM models WHERE slug = 'crop-disease-detection';   -- ImageNet no tiene enfermedades de cultivos
DELETE FROM models WHERE slug = 'weld-quality-detection';   -- ImageNet no tiene soldaduras
DELETE FROM models WHERE slug = 'person-reidentification';  -- ShuffleNet no hace re-identificación
DELETE FROM models WHERE slug = 'action-recognition-video'; -- ShuffleNet no reconoce acciones
DELETE FROM models WHERE slug = 'sports-pose-analysis';     -- ResNet no analiza poses

-- MANTENER modelos que SÍ tienen sentido:
-- 1. YuNet Face Detector - Detecta caras (correcto)
-- 2. TinyYOLOv2 Edge - Detecta objetos VOC (genérico, correcto)
-- 3. YOLOv5 Traffic - Detecta car, bus, motorbike, person (correcto para VOC)
-- 4. PPE Hardhat - Detecta person (parcialmente útil)
-- 5. Construction Safety - Detecta person (parcialmente útil)
-- 6. Wildlife Camera - Detecta bird, cat, dog, horse, cow, sheep (correcto para VOC)
-- 7. SSD Retail - Detecta objetos COCO (correcto)
-- 8. Shelf Monitor - Detecta objetos (parcialmente útil)
-- 9. Checkout Queue - Detecta person (correcto)
-- 10. MobileNetV2 - Clasificación ImageNet (correcto, genérico)
-- 11. EfficientNet Medical - Renombrar a genérico
-- 12. ResNet50 Industrial - Clasificación ImageNet (correcto, genérico)
-- 13. Fruit Ripeness - ImageNet tiene frutas (parcialmente correcto)
-- 14. Food Quality - ImageNet tiene comida (parcialmente correcto)
-- 15. Waste Sorting - ImageNet tiene objetos comunes (parcialmente correcto)

-- Renombrar modelos para que reflejen mejor lo que hacen
UPDATE models SET
    title = 'EfficientNet Classifier',
    description = 'Clasificador de imágenes de alta precisión basado en EfficientNet. Reconoce 1000 categorías de ImageNet incluyendo animales, objetos, vehículos y más.'
WHERE slug = 'efficientnet-medical';

UPDATE models SET
    title = 'Traffic & Vehicle Detector',
    description = 'Detecta vehículos (coches, buses, motos, bicicletas) y personas en escenas de tráfico usando TinyYOLOv2.'
WHERE slug = 'yolov5-traffic-detection';

UPDATE models SET
    title = 'Person Detector (Safety)',
    description = 'Detecta personas en entornos de trabajo. Útil para monitoreo de seguridad y conteo de personas.'
WHERE slug = 'ppe-hardhat-detection';

UPDATE models SET
    title = 'Construction Site Monitor',
    description = 'Detecta personas y vehículos en sitios de construcción para monitoreo de seguridad.'
WHERE slug = 'construction-safety-monitor';

UPDATE models SET
    title = 'Animal & Wildlife Detector',
    description = 'Detecta animales comunes: pájaros, gatos, perros, caballos, vacas, ovejas y más usando TinyYOLOv2.'
WHERE slug = 'wildlife-camera-trap';

UPDATE models SET
    description = 'Clasificador de frutas usando ImageNet. Puede identificar manzanas, naranjas, plátanos y otras frutas comunes.'
WHERE slug = 'fruit-ripeness-classifier';

UPDATE models SET
    description = 'Clasificador de alimentos usando ImageNet. Reconoce pizzas, hamburguesas, ensaladas y más.'
WHERE slug = 'food-quality-inspection';

UPDATE models SET
    description = 'Clasificador para reciclaje. Identifica botellas, latas y objetos comunes que pueden ser reciclados.'
WHERE slug = 'waste-sorting-recycling';
