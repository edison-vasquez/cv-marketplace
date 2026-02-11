import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { modelsRoutes } from './routes/models';
import { inferenceRoutes } from './routes/inference';
import { apiKeysRoutes } from './routes/api-keys';
import { authRoutes } from './routes/auth';
import { RoboflowKeyPool } from './lib/key-pool';

// Tipos para Cloudflare bindings
export interface Env {
  DB: D1Database;
  MODELS_BUCKET: R2Bucket;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware global
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['X-Request-Id', 'Content-Length'],
  maxAge: 86400,
  credentials: false,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'VisionHub API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
  });
});

// Rutas
app.route('/api/models', modelsRoutes);
app.route('/api/inference', inferenceRoutes);
app.route('/api/api-keys', apiKeysRoutes);
app.route('/api/auth', authRoutes);

// Servir modelos ONNX desde R2
app.get('/models/:filename', async (c) => {
  const filename = c.req.param('filename');

  // Validar que sea un archivo ONNX
  if (!filename.endsWith('.onnx')) {
    return c.json({ error: 'Invalid file type' }, 400);
  }

  try {
    const object = await c.env.MODELS_BUCKET.get(filename);

    if (!object) {
      return c.json({ error: 'Model not found' }, 404);
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Length', object.size.toString());
    headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Error fetching model:', error);
    return c.json({ error: 'Failed to fetch model' }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
  }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const pool = new RoboflowKeyPool({ db: env.DB, kv: env.SESSIONS });

    // Daily reset at midnight UTC
    if (event.cron === '0 0 * * *') {
      await pool.resetDailyCounters();
      console.log('Daily key pool counters reset');
    }

    // Monthly reset on the 1st at midnight UTC
    if (event.cron === '0 0 1 * *') {
      await pool.resetMonthlyCounters();
      console.log('Monthly key pool counters reset');
    }
  },
};
