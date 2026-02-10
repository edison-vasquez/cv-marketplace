import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/workflows/[id] - Obtener un workflow por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Buscar por ID o shareId
    const workflow = await prisma.workflow.findFirst({
      where: {
        OR: [
          { id },
          { shareId: id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Verificar acceso: owner o público
    const isOwner = session?.user?.id === workflow.userId
    const isShared = workflow.shareId === id && workflow.isPublic

    if (!isOwner && !isShared) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      isOwner,
    })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Error fetching workflow' },
      { status: 500 }
    )
  }
}

// PUT /api/workflows/[id] - Actualizar un workflow
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

    // Verificar que el workflow pertenece al usuario
    const existing = await prisma.workflow.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Workflow not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, nodes, isPublic } = body

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(nodes && { nodes: JSON.stringify(nodes) }),
        ...(isPublic !== undefined && {
          isPublic,
          shareId: isPublic && !existing.shareId ? generateShareId() : existing.shareId,
        }),
      },
    })

    return NextResponse.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
    })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Error updating workflow' },
      { status: 500 }
    )
  }
}

// DELETE /api/workflows/[id] - Eliminar un workflow
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

    // Verificar que el workflow pertenece al usuario
    const existing = await prisma.workflow.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Workflow not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.workflow.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { error: 'Error deleting workflow' },
      { status: 500 }
    )
  }
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}
