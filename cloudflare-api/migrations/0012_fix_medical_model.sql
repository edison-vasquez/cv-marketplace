UPDATE models 
SET 
    title = 'EfficientNet Classifier',
    description = 'Potente clasificador de imágenes basado en la arquitectura EfficientNet. Reconoce 1000 categorías de ImageNet incluyendo animales, objetos, vehículos y más. Optimizado para ejecución en el navegador.',
    category = 'General',
    tags = '["classification", "imagenet", "efficientnet", "general", "AI"]'
WHERE slug = 'efficientnet-medical';

-- If we want it to stay in Healthcare but show medical labels, we would need a different model.
-- For now, let's at least make the UI more consistent.
