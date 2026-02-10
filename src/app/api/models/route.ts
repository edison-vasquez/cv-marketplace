import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://visionhub-api.edison-985.workers.dev'

// GET /api/models - Proxy to Cloudflare Workers API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()

    const apiUrl = `${API_URL}/api/models${queryString ? `?${queryString}` : ''}`

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()

    // Transform the response to match expected format
    const models = data.models?.map((model: Record<string, unknown>) => ({
      ...model,
      // Parse tags if they're a string
      tags: typeof model.tags === 'string' ? JSON.parse(model.tags as string) : model.tags,
      // Map field names from snake_case to camelCase
      modelFormat: model.model_format,
      onnxModelUrl: model.onnx_model_url,
      modelSizeBytes: model.model_size_bytes,
      isPremium: model.is_premium === 1,
      inferenceMs: model.inference_ms,
    })) || []

    return NextResponse.json({
      models,
      pagination: data.pagination,
    })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Error fetching models' },
      { status: 500 }
    )
  }
}
