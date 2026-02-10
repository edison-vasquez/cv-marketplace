import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

// Hash de la API key para comparación
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Validar API key y obtener usuario
async function validateApiKey(apiKey: string) {
  const hashedKey = hashApiKey(apiKey);

  const key = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          premiumTier: true,
        },
      },
    },
  });

  if (!key) {
    return { valid: false, error: 'API key inválida' };
  }

  if (!key.isActive) {
    return { valid: false, error: 'API key revocada' };
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    return { valid: false, error: 'API key expirada' };
  }

  return { valid: true, key };
}

// Verificar rate limit
async function checkRateLimit(keyId: string, limit: number, count: number) {
  if (count >= limit) {
    return {
      allowed: false,
      error: 'Límite de requests alcanzado',
      limit,
      used: count,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    limit,
    used: count,
    remaining: limit - count,
  };
}

// POST: Ejecutar inferencia premium
export async function POST(req: NextRequest) {
  try {
    // Obtener API key del header
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API key requerida',
          message: 'Incluye tu API key en el header X-API-Key o Authorization: Bearer <key>',
        },
        { status: 401 }
      );
    }

    // Validar API key
    const validation = await validateApiKey(apiKey);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 401 }
      );
    }

    const { key } = validation;

    // Verificar rate limit
    const rateLimit = await checkRateLimit(key!.id, key!.requestLimit, key!.requestCount);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.error,
          limit: rateLimit.limit,
          used: rateLimit.used,
          remaining: rateLimit.remaining,
          resetAt: 'Inicio del próximo mes',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    // Parsear request body
    const body = await req.json();
    const { image, modelId, options = {} } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen requerida (base64)' },
        { status: 400 }
      );
    }

    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId requerido' },
        { status: 400 }
      );
    }

    // Obtener modelo
    const model = await prisma.model.findFirst({
      where: {
        OR: [
          { id: modelId },
          { slug: modelId },
        ],
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el modelo requiere tier premium
    if (model.isPremium && key!.tier === 'free') {
      return NextResponse.json(
        {
          error: 'Modelo premium',
          message: 'Este modelo requiere una API key de tier básico o superior',
          requiredTier: 'basic',
          currentTier: key!.tier,
        },
        { status: 403 }
      );
    }

    // Simular inferencia server-side
    // En producción, aquí ejecutarías el modelo con ONNX Runtime en servidor
    const startTime = Date.now();

    // Parsear labels del modelo
    let labels: string[] = [];
    try {
      labels = model.labels ? JSON.parse(model.labels) : [];
    } catch {
      labels = ['object'];
    }

    // Generar predicciones de ejemplo (en producción esto sería inferencia real)
    const predictions = generateDemoPredictions(labels, options);

    const inferenceTime = Date.now() - startTime + Math.random() * 50; // Simular tiempo

    // Incrementar contador de requests
    await prisma.apiKey.update({
      where: { id: key!.id },
      data: {
        requestCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        predictions,
        model: {
          id: model.id,
          title: model.title,
          technical: model.technical,
        },
        time: Math.round(inferenceTime),
        image: {
          width: 640,
          height: 640,
        },
        usage: {
          requestsUsed: key!.requestCount + 1,
          requestsLimit: key!.requestLimit,
          requestsRemaining: key!.requestLimit - key!.requestCount - 1,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': String(key!.requestLimit),
          'X-RateLimit-Remaining': String(key!.requestLimit - key!.requestCount - 1),
        },
      }
    );
  } catch (error) {
    console.error('Premium inference error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Generar predicciones de demostración
function generateDemoPredictions(labels: string[], options: any) {
  const confidence = options.confidence || 0.5;
  const maxDetections = options.maxDetections || 10;

  // Simular entre 1 y 5 detecciones
  const numDetections = Math.floor(Math.random() * Math.min(5, labels.length)) + 1;

  const predictions = [];
  for (let i = 0; i < numDetections && i < maxDetections; i++) {
    const labelIndex = Math.floor(Math.random() * labels.length);
    const pred = {
      class: labels[labelIndex] || 'object',
      confidence: confidence + Math.random() * (1 - confidence),
      x: Math.random() * 500 + 70,
      y: Math.random() * 400 + 40,
      width: Math.random() * 150 + 50,
      height: Math.random() * 150 + 50,
    };

    // Solo incluir si supera el umbral
    if (pred.confidence >= confidence) {
      predictions.push(pred);
    }
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}

// GET: Información del endpoint
export async function GET() {
  return NextResponse.json({
    name: 'VisionHub Premium Inference API',
    version: '1.0.0',
    endpoints: {
      POST: {
        description: 'Ejecutar inferencia en un modelo',
        headers: {
          'X-API-Key': 'Tu API key (requerido)',
          'Content-Type': 'application/json',
        },
        body: {
          image: 'string (base64)',
          modelId: 'string (ID o slug del modelo)',
          options: {
            confidence: 'number (0-1, default: 0.5)',
            maxDetections: 'number (default: 10)',
          },
        },
        response: {
          success: 'boolean',
          predictions: 'array',
          time: 'number (ms)',
          usage: 'object',
        },
      },
    },
    documentation: 'https://docs.visionhub.com/api',
  });
}
