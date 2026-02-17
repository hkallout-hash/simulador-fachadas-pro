import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateQuantitativos } from '@/lib/measurements'
import { calculatePricing, generateSummary, generateProtocol } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      token,
      lead_data
    } = body

    // Buscar simulação
    const { data: simulation, error: simError } = await supabase
      .from('simulations')
      .select('*')
      .eq('token', token)
      .single()

    if (simError || !simulation) {
      throw new Error('Simulation not found')
    }

    // Criar lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        nome: lead_data.nome,
        whatsapp: lead_data.whatsapp,
        cidade: lead_data.cidade,
        cep: lead_data.cep,
        segmento: lead_data.segmento,
        prazo: lead_data.prazo
      })
      .select()
      .single()

    if (leadError || !lead) {
      throw new Error('Failed to create lead')
    }

    // Gerar protocolo
    const protocol = await generateProtocol()

    // Calcular quantitativos
    const quantitativos = calculateQuantitativos(
      simulation.derived_width_m,
      simulation.derived_height_m,
      simulation.letreiro_config.texto,
      simulation.iluminacao_config.tipo
    )

    // Calcular preços
    const pricing = await calculatePricing(
      quantitativos.acm_m2,
      quantitativos.perimeter_m,
      quantitativos.letters_linear_m,
      quantitativos.led_m,
      quantitativos.spots_qty,
      simulation.derived_height_m,
      simulation.confidence,
      lead_data.cidade
    )

    // Gerar resumo
    const summary = generateSummary(
      simulation.derived_width_m,
      simulation.derived_height_m,
      simulation.derived_area_m2,
      quantitativos.acm_m2,
      quantitativos.perimeter_m,
      quantitativos.letters_linear_m,
      quantitativos.led_m,
      quantitativos.spots_qty,
      simulation.iluminacao_config.tipo,
      pricing.price_economico,
      pricing.price_intermediario,
      pricing.price_premium,
      simulation.letreiro_config.texto,
      simulation.acm_config.cor,
      simulation.confidence
    )

    // Atualizar simulação com dados completos
    const { data: updatedSimulation, error: updateError } = await supabase
      .from('simulations')
      .update({
        lead_id: lead.id,
        protocol,
        acm_m2: quantitativos.acm_m2,
        perimeter_m: quantitativos.perimeter_m,
        letters_linear_m: quantitativos.letters_linear_m,
        led_m: quantitativos.led_m,
        spots_qty: quantitativos.spots_qty,
        price_economico: pricing.price_economico,
        price_intermediario: pricing.price_intermediario,
        price_premium: pricing.price_premium,
        summary_text: summary
      })
      .eq('token', token)
      .select()
      .single()

    if (updateError || !updatedSimulation) {
      throw new Error('Failed to update simulation')
    }

    return NextResponse.json({
      success: true,
      protocol,
      simulation: updatedSimulation,
      lead,
      pricing: pricing.breakdown
    })
  } catch (error) {
    console.error('Finalize API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
