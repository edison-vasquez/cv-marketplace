import { NextRequest, NextResponse } from 'next/server'

const CF_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://visionhub-api.edison-985.workers.dev'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.image || !body.modelId) {
      return NextResponse.json(
        { error: 'Image and modelId are required' },
        { status: 400 }
      )
    }

    // Forward to Cloudflare Worker demo endpoint
    const response = await fetch(`${CF_API_URL}/api/inference/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: body.image,
        modelId: body.modelId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Inference proxy error:', error)
    return NextResponse.json(
      { error: 'Servicio de inferencia no disponible' },
      { status: 502 }
    )
  }
}
