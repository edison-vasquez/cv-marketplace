import { Hono } from 'hono';
import * as jose from 'jose';
import type { Env } from '../index';

export const authRoutes = new Hono<{ Bindings: Env }>();

// POST /api/auth/login - Login con email/password (simplificado)
authRoutes.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();

  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  // Buscar usuario
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, password_hash, is_admin, premium_tier FROM users WHERE email = ?'
  ).bind(body.email.toLowerCase()).first<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
    is_admin: number;
    premium_tier: string;
  }>();

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Verificar password (en producción, usar bcrypt o similar)
  const passwordHash = await hashPassword(body.password);
  if (user.password_hash !== passwordHash) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Generar JWT
  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin === 1,
    premiumTier: user.premium_tier,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin === 1,
      premiumTier: user.premium_tier,
    },
  });
});

// POST /api/auth/register - Registro de usuario
authRoutes.post('/register', async (c) => {
  const body = await c.req.json<{ email: string; password: string; name: string }>();

  if (!body.email || !body.password || !body.name) {
    return c.json({ error: 'Email, password, and name are required' }, 400);
  }

  // Verificar si ya existe
  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(body.email.toLowerCase()).first();

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  // Crear usuario
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(body.password);

  await c.env.DB.prepare(`
    INSERT INTO users (id, email, name, password_hash, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(id, body.email.toLowerCase(), body.name, passwordHash).run();

  // Generar JWT
  const secret = new TextEncoder().encode(c.env.JWT_SECRET);
  const token = await new jose.SignJWT({
    sub: id,
    email: body.email.toLowerCase(),
    name: body.name,
    isAdmin: false,
    premiumTier: 'free',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return c.json({
    token,
    user: {
      id,
      email: body.email.toLowerCase(),
      name: body.name,
      isAdmin: false,
      premiumTier: 'free',
    },
  }, 201);
});

// GET /api/auth/me - Obtener usuario actual
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    return c.json({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        isAdmin: payload.isAdmin,
        premiumTier: payload.premiumTier,
      },
    });
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Helper para hash de password (simplificado - usar bcrypt en producción)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'visionhub_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
