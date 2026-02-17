import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { originalImageUrl, bbox, config } = body

    // Verificar se RENDER_API_URL está configurado
    const renderApiUrl = process.env.RENDER_API_URL

    if (!renderApiUrl) {
      // Retornar indicação para usar fallback
      return NextResponse.json({
        success: false,
        fallback_required: true,
        message: 'Render API not configured, use client-side fallback'
      })
    }

    // Chamar API externa de renderização
    const response = await fetch(renderApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalImageUrl,
        bbox,
        config
      })
    })

    if (!response.ok) {
      throw new Error('External render API failed')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      result_urls: data.result_urls
    })
  } catch (error) {
    console.error('Render API error:', error)
    return NextResponse.json(
      {
        success: false,
        fallback_required: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
