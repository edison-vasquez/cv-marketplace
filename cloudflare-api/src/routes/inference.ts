import { Hono } from 'hono';
import type { Env } from '../index';
import { validateApiKey } from '../middleware/auth';

export const inferenceRoutes = new Hono<{ Bindings: Env }>();

// POST /api/inference - Inferencia premium (requiere API key)
inferenceRoutes.post('/', validateApiKey, async (c) => {
  const apiKey = c.get('apiKey') as { id: string; tier: string; userId: string };
  const body = await c.req.json<{ image: string; modelId: string }>();

  if (!body.image || !body.modelId) {
    return c.json({ error: 'image and modelId are required' }, 400);
  }

  // Verificar que el modelo existe
  const model = await c.env.DB.prepare(
    'SELECT * FROM models WHERE id = ? OR slug = ?'
  ).bind(body.modelId, body.modelId).first();

  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }

  // Por ahora, retornar mock predictions
  // En producción, esto se conectaría a un servicio de inferencia GPU
  const predictions = generateMockPredictions(model.technical as string);

  // Incrementar contador de uso
  await c.env.DB.prepare(
    'UPDATE api_keys SET request_count = request_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(apiKey.id).run();

  return c.json({
    predictions,
    model: {
      id: model.id,
      title: model.title,
      technical: model.technical,
    },
    inferenceTimeMs: Math.random() * 50 + 20, // Simular tiempo
    apiKeyTier: apiKey.tier,
  });
});

// Generar predicciones mock basadas en el tipo de modelo
function generateMockPredictions(technical: string) {
  const classes: Record<string, string[]> = {
    Detection: ['helmet', 'person', 'vehicle', 'object'],
    Segmentation: ['background', 'foreground', 'region_1', 'region_2'],
    Classification: ['class_a', 'class_b', 'class_c'],
  };

  const modelClasses = classes[technical] || classes.Detection;
  const numPredictions = Math.floor(Math.random() * 3) + 1;

  return Array.from({ length: numPredictions }, (_, i) => ({
    class: modelClasses[i % modelClasses.length],
    confidence: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
    bbox: technical === 'Detection' ? {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 50,
      width: Math.random() * 150 + 50,
      height: Math.random() * 150 + 50,
    } : undefined,
  }));
}
