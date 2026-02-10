import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { image, modelId } = await req.json()

    // Validar inputs
    if (!image || !modelId) {
      return NextResponse.json(
        { error: 'Image and modelId are required' },
        { status: 400 }
      )
    }

    // Obtener API key (del usuario logueado o del env)
    let apiKey = process.env.ROBOFLOW_API_KEY

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { roboflowApiKey: true },
      })
      if (user?.roboflowApiKey) {
        apiKey = user.roboflowApiKey
      }
    }

    // Si no hay API key, retornar datos simulados para demo
    if (!apiKey) {
      return NextResponse.json({
        predictions: generateMockPredictions(modelId),
        time: Math.random() * 0.1 + 0.05,
        image: { width: 640, height: 480 },
        _demo: true,
      })
    }

    // Llamar a Roboflow API
    const roboflowUrl = `https://detect.roboflow.com/${modelId}/1?api_key=${apiKey}`

    const response = await fetch(roboflowUrl, {
      method: 'POST',
      body: image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Roboflow API error:', errorText)

      // Si falla, retornar datos simulados
      return NextResponse.json({
        predictions: generateMockPredictions(modelId),
        time: Math.random() * 0.1 + 0.05,
        image: { width: 640, height: 480 },
        _demo: true,
        _error: 'API unavailable, showing demo results',
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Inference error:', error)

    // En caso de error, retornar datos simulados
    return NextResponse.json({
      predictions: generateMockPredictions('unknown'),
      time: 0.05,
      image: { width: 640, height: 480 },
      _demo: true,
      _error: 'Connection error, showing demo results',
    })
  }
}

function generateMockPredictions(modelId: string) {
  const mockClasses: Record<string, string[]> = {
    'hardhat-v3': ['hardhat', 'no-hardhat', 'person'],
    'safety-helmet-detection': ['helmet', 'no-helmet', 'person'],
    'high-vis-vest': ['vest', 'no-vest', 'person'],
    default: ['object_1', 'object_2', 'object_3'],
  }

  const classes = mockClasses[modelId] || mockClasses.default
  const numPredictions = Math.floor(Math.random() * 3) + 1

  return Array.from({ length: numPredictions }, (_, i) => ({
    class: classes[i % classes.length],
    confidence: Math.random() * 0.3 + 0.7,
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100,
    width: Math.random() * 100 + 50,
    height: Math.random() * 100 + 50,
    detection_id: `mock_${Date.now()}_${i}`,
  }))
}
