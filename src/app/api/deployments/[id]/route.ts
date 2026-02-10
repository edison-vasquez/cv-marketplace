import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/deployments/[id] - Obtener un deployment por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const deployment = await prisma.deployment.findFirst({
      where: { id, userId: session.user.id },
      include: {
        model: true,
      },
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...deployment,
      metrics: deployment.metrics ? JSON.parse(deployment.metrics) : null,
      config: deployment.config ? JSON.parse(deployment.config) : null,
      model: {
        ...deployment.model,
        tags: JSON.parse(deployment.model.tags),
      },
    })
  } catch (error) {
    console.error('Error fetching deployment:', error)
    return NextResponse.json(
      { error: 'Error fetching deployment' },
      { status: 500 }
    )
  }
}

// PUT /api/deployments/[id] - Actualizar un deployment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar que el deployment pertenece al usuario
    const existing = await prisma.deployment.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, status, type, config, metrics } = body

    const deployment = await prisma.deployment.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(type && { type }),
        ...(config !== undefined && { config: JSON.stringify(config) }),
        ...(metrics !== undefined && { metrics: JSON.stringify(metrics) }),
        ...(status === 'active' && { lastActiveAt: new Date() }),
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
      metrics: deployment.metrics ? JSON.parse(deployment.metrics) : null,
      config: deployment.config ? JSON.parse(deployment.config) : null,
    })
  } catch (error) {
    console.error('Error updating deployment:', error)
    return NextResponse.json(
      { error: 'Error updating deployment' },
      { status: 500 }
    )
  }
}

// DELETE /api/deployments/[id] - Eliminar un deployment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar que el deployment pertenece al usuario
    const existing = await prisma.deployment.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    await prisma.deployment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deployment:', error)
    return NextResponse.json(
      { error: 'Error deleting deployment' },
      { status: 500 }
    )
  }
}
