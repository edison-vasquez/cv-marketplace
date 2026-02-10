import { Context, Next } from 'hono';
import * as jose from 'jose';
import type { Env } from '../index';

// Middleware para validar API Key
export async function validateApiKey(c: Context<{ Bindings: Env }>, next: Next) {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ error: 'API key is required' }, 401);
  }

  // Hash de la key para buscar en DB
  const hashedKey = await hashKey(apiKey);

  const key = await c.env.DB.prepare(`
    SELECT id, tier, user_id, request_count, request_limit, is_active
    FROM api_keys
    WHERE key = ?
  `).bind(hashedKey).first<{
    id: string;
    tier: string;
    user_id: string;
    request_count: number;
    request_limit: number;
    is_active: number;
  }>();

  if (!key) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  if (key.is_active !== 1) {
    return c.json({ error: 'API key has been revoked' }, 401);
  }

  // Rate limiting
  if (key.request_count >= key.request_limit) {
    return c.json({
      error: 'Rate limit exceeded',
      limit: key.request_limit,
      used: key.request_count,
      tier: key.tier,
    }, 429);
  }

  // Guardar info de la key en el contexto
  c.set('apiKey', {
    id: key.id,
    tier: key.tier,
    userId: key.user_id,
    requestCount: key.request_count,
    requestLimit: key.request_limit,
  });

  await next();
}

// Middleware para validar JWT (usuarios autenticados)
export async function validateJWT(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // Guardar info del usuario en el contexto
    c.set('user', {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      isAdmin: payload.isAdmin,
      premiumTier: payload.premiumTier,
    });

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

// Middleware para verificar admin
export async function requireAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user') as { isAdmin: boolean } | undefined;

  if (!user?.isAdmin) {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
}

// Helper para hash de API key
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
