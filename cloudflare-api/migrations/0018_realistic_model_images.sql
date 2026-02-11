-- Migración 0018: Actualización de imágenes a estilo realista y profesional
-- Enfoque: Sustituir imágenes genéricas por visuales de alta calidad "adoc" a la solución técnica.

-- 1. Signature Verification AI
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1554774853-719586f82d77?w=800&q=80' 
WHERE slug = 'signature-verify-pro';

-- 2. LPR Freight Optimizer
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80' 
WHERE slug = 'anpr-trucks-v8';

-- 3. Construction Rebar Counter
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800&q=80' 
WHERE slug = 'rebar-counter-pro';

-- 4. Wind Turbine Inspector
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1466611653911-954ff21b6724?w=800&q=80' 
WHERE slug = 'wind-turbine-damage';

-- 5. X-Ray Weld Analyzer
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' 
WHERE slug = 'xray-weld-defects';

-- 6. Retail Queue Management
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80' 
WHERE slug = 'queue-analyzer-v8';

-- 7. Pneumonia Diagnosis AI
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80' 
WHERE slug = 'pneumonia-detect-xray';

-- 12. Pharma Fill Level Checker
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=800&q=80' 
WHERE slug = 'liquid-level-pharma';

-- 13. Bridge Integrity AI
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80' 
WHERE slug = 'bridge-crack-seg';

-- 14. Livestock Inventory AI
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80' 
WHERE slug = 'cattle-counter-v4';

-- 20. Steel Surface Quality Monitor
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1504917595217-d4dc5f643038?w=800&q=80' 
WHERE slug = 'surface-anomaly-metal';

-- Modelos de la migración 0016
-- Mining Tire Inspection
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800&q=80' 
WHERE slug = 'mining-tire-cracks';

-- Powerline Insulator Check
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80' 
WHERE slug = 'powerline-insulators';

-- PCB Quality Control
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' 
WHERE slug = 'pcb-inspection-v2';

-- Analog Gauge Reader
UPDATE models 
SET image = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80' 
WHERE slug = 'gauge-reader';
