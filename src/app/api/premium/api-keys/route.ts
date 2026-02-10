import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';

// Generar API key segura
function generateApiKey(tier: string): string {
  const prefix = tier === 'free' ? 'vhub_free' : tier === 'basic' ? 'vhub_basic' : 'vhub_pro';
  const random = randomBytes(24).toString('hex');
  return `${prefix}_${random}`;
}

// Hash de la API key para almacenamiento seguro
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Límites por tier
function getTierLimit(tier: string): number {
  switch (tier) {
    case 'free':
      return 1000;
    case 'basic':
      return 10000;
    case 'pro':
      return 100000;
    case 'enterprise':
      return 1000000;
    default:
      return 1000;
  }
}

// GET: Listar API keys del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        tier: true,
        requestCount: true,
        requestLimit: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        // NO retornar el hash de la key
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Error al obtener API keys' },
      { status: 500 }
    );
  }
}

// POST: Crear nueva API key
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { name, tier = 'free' } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Validar tier permitido según nivel del usuario
    const allowedTiers = ['free', 'basic', 'pro', 'enterprise'];
    if (!allowedTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Tier no válido' },
        { status: 400 }
      );
    }

    // Verificar límite de API keys por usuario (máximo 5)
    const existingKeysCount = await prisma.apiKey.count({
      where: { userId: user.id, isActive: true },
    });

    if (existingKeysCount >= 5) {
      return NextResponse.json(
        { error: 'Límite de API keys alcanzado (máximo 5)' },
        { status: 400 }
      );
    }

    // Generar la key
    const rawKey = generateApiKey(tier);
    const hashedKey = hashApiKey(rawKey);

    // Crear en base de datos
    const apiKey = await prisma.apiKey.create({
      data: {
        key: hashedKey,
        name,
        tier,
        userId: user.id,
        requestLimit: getTierLimit(tier),
      },
    });

    // Retornar la key sin hashear SOLO una vez
    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey, // ⚠️ Esta es la ÚNICA vez que se muestra la key
        tier: apiKey.tier,
        requestLimit: apiKey.requestLimit,
        createdAt: apiKey.createdAt,
      },
      message: 'Guarda esta API key en un lugar seguro. No se mostrará de nuevo.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Error al crear API key' },
      { status: 500 }
    );
  }
}

// DELETE: Revocar API key
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'ID de API key requerido' },
        { status: 400 }
      );
    }

    // Verificar que la key pertenece al usuario
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no encontrada' },
        { status: 404 }
      );
    }

    // Desactivar la key (soft delete)
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'API key revocada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Error al revocar API key' },
      { status: 500 }
    );
  }
}
