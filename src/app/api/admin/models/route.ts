import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET: Listar todos los modelos (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const models = await prisma.model.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Error al obtener modelos' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo modelo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const metadataStr = formData.get('metadata') as string;
    const modelFile = formData.get('model') as File | null;
    const labelsFile = formData.get('labels') as File | null;
    const imageFile = formData.get('image') as File | null;

    if (!metadataStr) {
      return NextResponse.json(
        { error: 'Metadata es requerida' },
        { status: 400 }
      );
    }

    const metadata = JSON.parse(metadataStr);

    // Validaciones básicas
    if (!metadata.title || !metadata.slug) {
      return NextResponse.json(
        { error: 'Título y slug son requeridos' },
        { status: 400 }
      );
    }

    // Verificar slug único
    const existingModel = await prisma.model.findUnique({
      where: { slug: metadata.slug },
    });

    if (existingModel) {
      return NextResponse.json(
        { error: 'Ya existe un modelo con ese slug' },
        { status: 400 }
      );
    }

    // Directorio para archivos públicos
    const publicDir = join(process.cwd(), 'public', 'models', metadata.slug);

    // Crear directorio si no existe
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }

    let onnxModelUrl: string | null = null;
    let modelSizeBytes: number | null = null;
    let labels: string[] = [];

    // Guardar archivo ONNX
    if (modelFile) {
      const buffer = Buffer.from(await modelFile.arrayBuffer());
      const fileName = `model.onnx`;
      const filePath = join(publicDir, fileName);

      await writeFile(filePath, buffer);

      onnxModelUrl = `/models/${metadata.slug}/${fileName}`;
      modelSizeBytes = buffer.length;
    }

    // Leer labels del archivo JSON
    if (labelsFile) {
      const labelsText = await labelsFile.text();
      try {
        labels = JSON.parse(labelsText);
        if (!Array.isArray(labels)) {
          labels = Object.values(labels);
        }
      } catch {
        console.warn('Error parsing labels file');
      }
    }

    // Guardar imagen de preview
    let imageUrl = '/placeholder-model.jpg';
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `preview.${ext}`;
      const filePath = join(publicDir, fileName);

      await writeFile(filePath, buffer);
      imageUrl = `/models/${metadata.slug}/${fileName}`;
    }

    // Crear modelo en base de datos
    const model = await prisma.model.create({
      data: {
        title: metadata.title,
        slug: metadata.slug,
        description: metadata.description || null,
        creator: session.user.name || 'Admin',
        category: metadata.category || 'other',
        technical: metadata.technical || 'Detection',
        mAP: metadata.mAP || 0.85,
        precision: metadata.precision || null,
        inferenceMs: metadata.inferenceMs || null,
        image: imageUrl,
        tags: JSON.stringify(metadata.tags || []),
        version: '1.0.0',
        isPublic: metadata.isPublic ?? false,

        // Campos de inferencia local
        modelFormat: modelFile ? 'onnx' : null,
        onnxModelUrl,
        modelSizeBytes,
        inputShape: metadata.inputShape
          ? JSON.stringify(metadata.inputShape)
          : JSON.stringify({ width: 640, height: 640, channels: 3 }),
        labels: JSON.stringify(labels),
        preprocessing: JSON.stringify({
          mean: [0, 0, 0],
          std: [1, 1, 1],
          normalize: true,
          channelOrder: 'RGB',
        }),
        postprocessing: JSON.stringify({
          confidenceThreshold: 0.5,
          iouThreshold: 0.45,
          maxDetections: 100,
        }),

        // Premium
        isPremium: metadata.isPremium ?? false,
        apiAccessTier: metadata.isPremium ? 'basic' : 'free',
      },
    });

    return NextResponse.json({
      success: true,
      model: {
        id: model.id,
        slug: model.slug,
        title: model.title,
      },
    });
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Error al crear el modelo' },
      { status: 500 }
    );
  }
}
