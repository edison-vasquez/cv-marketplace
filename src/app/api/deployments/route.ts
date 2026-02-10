import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/deployments - Obtener deployments del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const deployments = await prisma.deployment.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        model: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            category: true,
            mAP: true,
          },
        },
      },
    })

    // Parsear metrics y config JSON
    const parsedDeployments = deployments.map(dep => ({
      ...dep,
      metrics: dep.metrics ? JSON.parse(dep.metrics) : null,
      config: dep.config ? JSON.parse(dep.config) : null,
    }))

    return NextResponse.json({ deployments: parsedDeployments })
  } catch (error) {
    console.error('Error fetching deployments:', error)
    return NextResponse.json(
      { error: 'Error fetching deployments' },
      { status: 500 }
    )
  }
}

// POST /api/deployments - Crear un nuevo deployment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, modelId, type, config } = body

    if (!name || !modelId) {
      return NextResponse.json(
        { error: 'Name and modelId are required' },
        { status: 400 }
      )
    }

    // Verificar que el modelo existe
    const model = await prisma.model.findUnique({
      where: { id: modelId },
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    const deployment = await prisma.deployment.create({
      data: {
        name,
        modelId,
        userId: session.user.id,
        type: type || 'docker',
        config: config ? JSON.stringify(config) : null,
        metrics: JSON.stringify({
          detections: 0,
          fps: 0,
          uptime: 0,
        }),
      },
      include: {
        model: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...deployment,
      metrics: JSON.parse(deployment.metrics || '{}'),
      config: deployment.config ? JSON.parse(deployment.config) : null,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating deployment:', error)
    return NextResponse.json(
      { error: 'Error creating deployment' },
      { status: 500 }
    )
  }
}
