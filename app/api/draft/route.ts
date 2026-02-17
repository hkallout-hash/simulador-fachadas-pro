import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    
    const {
      original_image_url,
      result_urls,
      bbox,
      reference_box,
      reference_real_width_m,
      derived_width_m,
      derived_height_m,
      derived_area_m2,
      confidence,
      validation_urls,
      validation_video_url,
      acm_config,
      letreiro_config,
      iluminacao_config,
      logo_url
    } = body

    // Gerar token único
    const token = uuidv4()

    // Salvar simulação inicial (sem lead ainda)
    const { data, error } = await supabase
      .from('simulations')
      .insert({
        token,
        original_image_url,
        result_urls,
        bbox,
        reference_box,
        reference_real_width_m,
        derived_width_m,
        derived_height_m,
        derived_area_m2,
        confidence,
        validation_urls,
        validation_video_url,
        acm_config,
        letreiro_config,
        iluminacao_config,
        logo_url,
        // Valores temporários (serão atualizados no finalize)
        acm_m2: 0,
        perimeter_m: 0,
        letters_linear_m: 0,
        led_m: 0,
        spots_qty: 0,
        price_economico: 0,
        price_intermediario: 0,
        price_premium: 0,
        summary_text: ''
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save simulation')
    }

    return NextResponse.json({
      success: true,
      token,
      simulation: data
    })
  } catch (error) {
    console.error('Draft API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
