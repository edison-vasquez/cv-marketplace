import { Hono } from 'hono';
import type { Env } from '../index';

export const modelsRoutes = new Hono<{ Bindings: Env }>();

// Helper para parsear JSON de forma segura
function safeParseJSON(str: string | null | undefined, defaultValue: unknown = []): unknown {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

// GET /api/models - Listar modelos con filtros
modelsRoutes.get('/', async (c) => {
  try {
    const { page = '1', limit = '12', search, category, technical } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM models WHERE is_public = 1';
    const params: unknown[] = [];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR creator LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (technical && technical !== 'all') {
      query += ' AND technical = ?';
      params.push(technical);
    }

    // Contar total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // Obtener modelos
    query += ' ORDER BY mAP DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    // Parsear campos JSON con manejo de errores
    const models = results?.map((model: Record<string, unknown>) => ({
      ...model,
      tags: safeParseJSON(model.tags as string, []),
    })) || [];

    return c.json({
      models,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return c.json({
      error: 'Error fetching models',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// GET /api/models/filters - Obtener categorías y tipos
modelsRoutes.get('/filters', async (c) => {
  try {
    const categories = await c.env.DB.prepare(
      'SELECT DISTINCT category FROM models WHERE is_public = 1 ORDER BY category'
    ).all();

    const technicals = await c.env.DB.prepare(
      'SELECT DISTINCT technical FROM models WHERE is_public = 1 ORDER BY technical'
    ).all();

    return c.json({
      categories: categories.results?.map((r: Record<string, unknown>) => r.category) || [],
      technicals: technicals.results?.map((r: Record<string, unknown>) => r.technical) || [],
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return c.json({ error: 'Error fetching filters' }, 500);
  }
});

// GET /api/models/:slug - Obtener modelo por slug
modelsRoutes.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    const model = await c.env.DB.prepare(
      'SELECT * FROM models WHERE slug = ? OR id = ?'
    ).bind(slug, slug).first();

    if (!model) {
      return c.json({ error: 'Model not found' }, 404);
    }

    return c.json({
      ...model,
      tags: safeParseJSON(model.tags as string, []),
    });
  } catch (error) {
    console.error('Error fetching model:', error);
    return c.json({ error: 'Error fetching model' }, 500);
  }
});

// GET /api/models/:id/download-url - Generar URL firmada para descargar modelo
modelsRoutes.get('/:id/download-url', async (c) => {
  const id = c.req.param('id');

  const model = await c.env.DB.prepare(
    'SELECT onnx_model_url FROM models WHERE id = ?'
  ).bind(id).first<{ onnx_model_url: string }>();

  if (!model?.onnx_model_url) {
    return c.json({ error: 'Model file not available' }, 404);
  }

  // Si el modelo está en R2, generar URL firmada
  if (model.onnx_model_url.startsWith('r2://')) {
    const key = model.onnx_model_url.replace('r2://', '');
    const object = await c.env.MODELS_BUCKET.get(key);

    if (!object) {
      return c.json({ error: 'Model file not found in storage' }, 404);
    }

    // Generar URL temporal (1 hora)
    // Nota: Para URLs firmadas reales, necesitas usar presigned URLs
    return c.json({
      url: `https://models.visionhub.com/${key}`,
      expiresIn: 3600,
    });
  }

  // Si es URL externa, retornarla directamente
  return c.json({ url: model.onnx_model_url });
});
