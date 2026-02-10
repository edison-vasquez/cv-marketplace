import { Hono } from 'hono';
import type { Env } from '../index';
import { validateJWT } from '../middleware/auth';

export const apiKeysRoutes = new Hono<{ Bindings: Env }>();

// Generar API key única
function generateApiKey(tier: string): string {
  const prefix = tier === 'free' ? 'vhub_free' : tier === 'basic' ? 'vhub_basic' : 'vhub_pro';
  const randomPart = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  return `${prefix}_${randomPart.slice(0, 48)}`;
}

// Hash API key para almacenamiento
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// GET /api/api-keys - Listar API keys del usuario
apiKeysRoutes.get('/', validateJWT, async (c) => {
  const user = c.get('user') as { id: string };

  const { results } = await c.env.DB.prepare(`
    SELECT id, name, tier, request_count, request_limit, last_used_at, created_at, is_active
    FROM api_keys
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all();

  return c.json({
    apiKeys: results?.map((key: Record<string, unknown>) => ({
      id: key.id,
      name: key.name,
      tier: key.tier,
      requestCount: key.request_count,
      requestLimit: key.request_limit,
      lastUsedAt: key.last_used_at,
      createdAt: key.created_at,
      isActive: key.is_active === 1,
    })) || [],
  });
});

// POST /api/api-keys - Crear nueva API key
apiKeysRoutes.post('/', validateJWT, async (c) => {
  const user = c.get('user') as { id: string };
  const body = await c.req.json<{ name: string; tier?: string }>();

  if (!body.name?.trim()) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const tier = body.tier || 'free';
  const limits: Record<string, number> = {
    free: 1000,
    basic: 10000,
    pro: 100000,
  };

  // Generar key
  const rawKey = generateApiKey(tier);
  const hashedKey = await hashApiKey(rawKey);
  const id = crypto.randomUUID();

  // Insertar en DB
  await c.env.DB.prepare(`
    INSERT INTO api_keys (id, key, name, tier, user_id, request_limit, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(id, hashedKey, body.name.trim(), tier, user.id, limits[tier] || 1000).run();

  return c.json({
    apiKey: {
      id,
      name: body.name.trim(),
      tier,
      key: rawKey, // Solo se muestra una vez
      requestLimit: limits[tier] || 1000,
    },
    message: 'API key created. Save this key securely - it will not be shown again.',
  }, 201);
});

// DELETE /api/api-keys/:id - Revocar API key
apiKeysRoutes.delete('/:id', validateJWT, async (c) => {
  const user = c.get('user') as { id: string };
  const keyId = c.req.param('id');

  // Verificar que la key pertenece al usuario
  const key = await c.env.DB.prepare(
    'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
  ).bind(keyId, user.id).first();

  if (!key) {
    return c.json({ error: 'API key not found' }, 404);
  }

  // Marcar como inactiva (soft delete)
  await c.env.DB.prepare(
    'UPDATE api_keys SET is_active = 0 WHERE id = ?'
  ).bind(keyId).run();

  return c.json({ success: true, message: 'API key revoked' });
});
