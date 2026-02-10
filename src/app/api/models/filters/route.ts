import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://visionhub-api.edison-985.workers.dev'

// GET /api/models/filters - Proxy to Cloudflare Workers API
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/models/filters`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      categories: data.categories || [],
      technicals: data.technicals || [],
    })
  } catch (error) {
    console.error('Error fetching filters:', error)
    return NextResponse.json(
      { error: 'Error fetching filters' },
      { status: 500 }
    )
  }
}
