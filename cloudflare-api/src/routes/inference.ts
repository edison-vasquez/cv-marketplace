import { Hono } from 'hono';
import type { Env } from '../index';
import { validateApiKey, validateJWT, requireAdmin } from '../middleware/auth';
import { RoboflowKeyPool } from '../lib/key-pool';

export const inferenceRoutes = new Hono<{ Bindings: Env }>();

// ─── POST /demo ─── Public demo inference using internal key pool ───
inferenceRoutes.post('/demo', async (c) => {
  const body = await c.req.json<{ image: string; modelId: string }>();

  if (!body.image || !body.modelId) {
    return c.json({ error: 'image and modelId are required' }, 400);
  }

  // Per-IP rate limit (50 demos/day)
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const ipKey = `demo:ip:${ip}`;
  const ipCount = parseInt(await c.env.SESSIONS.get(ipKey) || '0');

  if (ipCount >= 50) {
    return c.json({
      error: 'Límite de demos diarios alcanzado. Prueba la inferencia en navegador (gratis e ilimitada).',
      dailyLimit: 50,
      used: ipCount,
    }, 429);
  }

  // Look up model in D1
  const model = await c.env.DB.prepare(
    'SELECT id, slug, title, technical, roboflow_id, roboflow_version, roboflow_model_type FROM models WHERE id = ? OR slug = ?'
  ).bind(body.modelId, body.modelId).first<{
    id: string;
    slug: string;
    title: string;
    technical: string;
    roboflow_id: string | null;
    roboflow_version: number | null;
    roboflow_model_type: string | null;
  }>();

  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }

  if (!model.roboflow_id) {
    return c.json({
      error: 'Este modelo solo soporta inferencia en navegador. Selecciona "En Navegador" en el modo de ejecución.',
      browserOnly: true,
    }, 400);
  }

  // Execute inference via key pool
  const pool = new RoboflowKeyPool({ db: c.env.DB, kv: c.env.SESSIONS });

  try {
    const result = await pool.executeWithRetry(
      model.roboflow_id,
      model.roboflow_version || 1,
      model.roboflow_model_type,
      body.image
    );

    // Increment IP counter
    await c.env.SESSIONS.put(ipKey, String(ipCount + 1), { expirationTtl: 86400 });

    return c.json({
      predictions: result.predictions,
      time: result.time,
      image: result.image,
      model: { id: model.id, title: model.title, technical: model.technical },
    });
  } catch (err: any) {
    console.error('Demo inference error:', err.message);
    return c.json({
      error: 'Servicio de inferencia temporalmente no disponible. Usa la inferencia en navegador.',
      details: err.message,
    }, 503);
  }
});

// ─── POST / ─── Premium inference (requires user's VisionHub API key) ───
inferenceRoutes.post('/', validateApiKey, async (c) => {
  const apiKey = c.get('apiKey') as { id: string; tier: string; userId: string };
  const body = await c.req.json<{ image: string; modelId: string }>();

  if (!body.image || !body.modelId) {
    return c.json({ error: 'image and modelId are required' }, 400);
  }

  const model = await c.env.DB.prepare(
    'SELECT id, slug, title, technical, roboflow_id, roboflow_version, roboflow_model_type FROM models WHERE id = ? OR slug = ?'
  ).bind(body.modelId, body.modelId).first<{
    id: string;
    slug: string;
    title: string;
    technical: string;
    roboflow_id: string | null;
    roboflow_version: number | null;
    roboflow_model_type: string | null;
  }>();

  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }

  if (!model.roboflow_id) {
    return c.json({ error: 'This model does not support API inference' }, 400);
  }

  // Use key pool for premium users too
  const pool = new RoboflowKeyPool({ db: c.env.DB, kv: c.env.SESSIONS });

  try {
    const result = await pool.executeWithRetry(
      model.roboflow_id,
      model.roboflow_version || 1,
      model.roboflow_model_type,
      body.image
    );

    // Increment user's API key usage
    await c.env.DB.prepare(
      'UPDATE api_keys SET request_count = request_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(apiKey.id).run();

    return c.json({
      predictions: result.predictions,
      time: result.time,
      image: result.image,
      model: { id: model.id, title: model.title, technical: model.technical },
      apiKeyTier: apiKey.tier,
    });
  } catch (err: any) {
    return c.json({ error: 'Inference failed', details: err.message }, 503);
  }
});

// ─── Admin: Key Pool Management ───

// GET /pool/keys - List all pool keys
inferenceRoutes.get('/pool/keys', validateJWT, requireAdmin, async (c) => {
  const pool = new RoboflowKeyPool({ db: c.env.DB, kv: c.env.SESSIONS });
  const stats = await pool.getStats();
  return c.json(stats);
});

// POST /pool/keys - Add a Roboflow key to the pool
inferenceRoutes.post('/pool/keys', validateJWT, requireAdmin, async (c) => {
  const body = await c.req.json<{
    apiKey: string;
    label: string;
    roboflowAccount?: string;
    dailyLimit?: number;
    monthlyLimit?: number;
    priority?: number;
  }>();

  if (!body.apiKey || !body.label) {
    return c.json({ error: 'apiKey and label are required' }, 400);
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO roboflow_keys (id, api_key, label, roboflow_account, daily_limit, monthly_limit, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.apiKey,
    body.label,
    body.roboflowAccount || null,
    body.dailyLimit || 100,
    body.monthlyLimit || 1000,
    body.priority || 0
  ).run();

  return c.json({ id, label: body.label, message: 'Key added to pool' }, 201);
});

// DELETE /pool/keys/:id - Remove a key from the pool
inferenceRoutes.delete('/pool/keys/:id', validateJWT, requireAdmin, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM roboflow_keys WHERE id = ?').bind(id).run();
  return c.json({ message: 'Key removed' });
});

// PATCH /pool/keys/:id - Toggle active/inactive, update limits
inferenceRoutes.patch('/pool/keys/:id', validateJWT, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    isActive?: boolean;
    dailyLimit?: number;
    monthlyLimit?: number;
    priority?: number;
  }>();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(body.isActive ? 1 : 0);
  }
  if (body.dailyLimit !== undefined) {
    updates.push('daily_limit = ?');
    values.push(body.dailyLimit);
  }
  if (body.monthlyLimit !== undefined) {
    updates.push('monthly_limit = ?');
    values.push(body.monthlyLimit);
  }
  if (body.priority !== undefined) {
    updates.push('priority = ?');
    values.push(body.priority);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE roboflow_keys SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ message: 'Key updated' });
});

// GET /pool/stats - Pool usage statistics
inferenceRoutes.get('/pool/stats', validateJWT, requireAdmin, async (c) => {
  const pool = new RoboflowKeyPool({ db: c.env.DB, kv: c.env.SESSIONS });
  const stats = await pool.getStats();
  return c.json(stats);
});
