import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Obtener un modelo por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const model = await prisma.model.findUnique({
      where: { id },
    });

    if (!model) {
      return NextResponse.json({ error: 'Modelo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: 'Error al obtener modelo' }, { status: 500 });
  }
}

// PUT: Actualizar un modelo
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Verificar que el modelo existe
    const existing = await prisma.model.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Modelo no encontrado' }, { status: 404 });
    }

    // Verificar slug único si cambió
    if (data.slug !== existing.slug) {
      const slugExists = await prisma.model.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return NextResponse.json({ error: 'Ya existe un modelo con ese slug' }, { status: 400 });
      }
    }

    // Actualizar
    const model = await prisma.model.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        technical: data.technical,
        mAP: data.mAP,
        precision: data.precision,
        inferenceMs: data.inferenceMs,
        tags: data.tags,
        modelFormat: data.modelFormat,
        onnxModelUrl: data.onnxModelUrl,
        labels: data.labels,
        inputShape: data.inputShape,
        isPremium: data.isPremium,
        isPublic: data.isPublic,
        apiAccessTier: data.apiAccessTier,
      },
    });

    return NextResponse.json({ model });
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json({ error: 'Error al actualizar modelo' }, { status: 500 });
  }
}

// DELETE: Eliminar un modelo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.model.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Modelo no encontrado' }, { status: 404 });
    }

    // Eliminar deployments relacionados primero
    await prisma.deployment.deleteMany({ where: { modelId: id } });

    // Eliminar modelo
    await prisma.model.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json({ error: 'Error al eliminar modelo' }, { status: 500 });
  }
}
