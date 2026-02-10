import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/workflows - Obtener workflows del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        nodes: true,
        isPublic: true,
        shareId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Parsear nodes JSON
    const parsedWorkflows = workflows.map(wf => ({
      ...wf,
      nodes: JSON.parse(wf.nodes),
    }))

    return NextResponse.json({ workflows: parsedWorkflows })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Error fetching workflows' },
      { status: 500 }
    )
  }
}

// POST /api/workflows - Crear un nuevo workflow
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
    const { name, description, nodes, isPublic } = body

    if (!name || !nodes) {
      return NextResponse.json(
        { error: 'Name and nodes are required' },
        { status: 400 }
      )
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description: description || null,
        nodes: JSON.stringify(nodes),
        isPublic: isPublic || false,
        userId: session.user.id,
        shareId: isPublic ? generateShareId() : null,
      },
    })

    return NextResponse.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Error creating workflow' },
      { status: 500 }
    )
  }
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}
