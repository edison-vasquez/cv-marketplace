import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://visionhub-api.edison-985.workers.dev'

// GET /api/models/[id] - Proxy to Cloudflare Workers API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await fetch(`${API_URL}/api/models/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        )
      }
      throw new Error(`API responded with status ${response.status}`)
    }

    const model = await response.json()

    // Transform field names and parse JSON fields
    return NextResponse.json({
      ...model,
      tags: typeof model.tags === 'string' ? JSON.parse(model.tags) : model.tags,
      labels: typeof model.labels === 'string' ? JSON.parse(model.labels) : model.labels,
      inputShape: typeof model.input_shape === 'string' ? JSON.parse(model.input_shape) : model.input_shape,
      modelFormat: model.model_format,
      onnxModelUrl: model.onnx_model_url,
      modelSizeBytes: model.model_size_bytes,
      isPremium: model.is_premium === 1,
      inferenceMs: model.inference_ms,
    })
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { error: 'Error fetching model' },
      { status: 500 }
    )
  }
}
