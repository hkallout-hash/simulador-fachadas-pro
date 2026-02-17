import { getSupabaseClient } from './supabase'

export interface PricingConfig {
  acm_m2: number
  estrutura_m2: number
  letra_linear_m: number
  led_m: number
  spot_unit: number
  instalacao_base: number
  frete_km: number
  markup_economico: number
  markup_intermediario: number
  markup_premium: number
}

export interface PricingResult {
  price_economico: number
  price_intermediario: number
  price_premium: number
  breakdown: {
    cost_acm: number
    cost_structure: number
    cost_letters: number
    cost_lighting: number
    cost_install: number
    cost_logistics: number
    base_cost: number
  }
}

/**
 * Busca configuração de preços
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('pricing_config')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    // Retorna valores padrão se não houver configuração
    return {
      acm_m2: 180,
      estrutura_m2: 120,
      letra_linear_m: 250,
      led_m: 80,
      spot_unit: 45,
      instalacao_base: 800,
      frete_km: 2.5,
      markup_economico: 1.4,
      markup_intermediario: 1.7,
      markup_premium: 2.2
    }
  }

  return data as PricingConfig
}

/**
 * Calcula preço com base nos quantitativos
 */
export async function calculatePricing(
  acm_m2: number,
  perimeter_m: number,
  letters_linear_m: number,
  led_m: number,
  spots_qty: number,
  heightM: number,
  confidence: string,
  cidade: string
): Promise<PricingResult> {
  const config = await getPricingConfig()

  // Custos base
  const cost_acm = acm_m2 * config.acm_m2
  const cost_structure = acm_m2 * config.estrutura_m2
  const cost_letters = letters_linear_m * config.letra_linear_m
  const cost_lighting = (led_m * config.led_m) + (spots_qty * config.spot_unit)
  const cost_install = config.instalacao_base
  
  // Logística (estimativa baseada na cidade)
  const estimatedKm = estimateDistance(cidade)
  const cost_logistics = estimatedKm * config.frete_km

  const base_cost = 
    cost_acm + 
    cost_structure + 
    cost_letters + 
    cost_lighting + 
    cost_install + 
    cost_logistics

  // Aplicar regras automáticas
  let markup_adj_econ = config.markup_economico
  let markup_adj_inter = config.markup_intermediario
  let markup_adj_prem = config.markup_premium

  // Confidence baixo: -5% markup
  if (confidence === 'BAIXO') {
    markup_adj_econ *= 0.95
    markup_adj_inter *= 0.95
    markup_adj_prem *= 0.95
  }

  // Altura > 4m: +10%
  if (heightM > 4) {
    markup_adj_econ *= 1.10
    markup_adj_inter *= 1.10
    markup_adj_prem *= 1.10
  }

  // Instalação difícil (altura > 6m): +12%
  if (heightM > 6) {
    markup_adj_econ *= 1.12
    markup_adj_inter *= 1.12
    markup_adj_prem *= 1.12
  }

  // Fora do estado: +8%
  if (isOutOfState(cidade)) {
    markup_adj_econ *= 1.08
    markup_adj_inter *= 1.08
    markup_adj_prem *= 1.08
  }

  return {
    price_economico: Number((base_cost * markup_adj_econ).toFixed(2)),
    price_intermediario: Number((base_cost * markup_adj_inter).toFixed(2)),
    price_premium: Number((base_cost * markup_adj_prem).toFixed(2)),
    breakdown: {
      cost_acm: Number(cost_acm.toFixed(2)),
      cost_structure: Number(cost_structure.toFixed(2)),
      cost_letters: Number(cost_letters.toFixed(2)),
      cost_lighting: Number(cost_lighting.toFixed(2)),
      cost_install: Number(cost_install.toFixed(2)),
      cost_logistics: Number(cost_logistics.toFixed(2)),
      base_cost: Number(base_cost.toFixed(2))
    }
  }
}

/**
 * Estima distância baseado na cidade
 */
function estimateDistance(cidade: string): number {
  // Simplificação: retorna distância estimada em km
  const cidadeLower = cidade.toLowerCase()
  
  // Cidades próximas
  if (cidadeLower.includes('são paulo') || cidadeLower.includes('sp')) {
    return 50
  }
  if (cidadeLower.includes('rio')) {
    return 450
  }
  if (cidadeLower.includes('belo horizonte') || cidadeLower.includes('minas')) {
    return 600
  }
  
  // Default para outras cidades
  return 300
}

/**
 * Verifica se está fora do estado
 */
function isOutOfState(cidade: string): boolean {
  const cidadeLower = cidade.toLowerCase()
  // Assume que o estado base é São Paulo
  return !cidadeLower.includes('sp') && !cidadeLower.includes('são paulo')
}

/**
 * Gera resumo automático da simulação
 */
export function generateSummary(
  widthM: number,
  heightM: number,
  areaM2: number,
  acmM2: number,
  perimeterM: number,
  lettersLinearM: number,
  ledM: number,
  spotsQty: number,
  iluminacaoTipo: string,
  priceEcon: number,
  priceInter: number,
  pricePrem: number,
  letreiroTexto: string,
  acmCor: string,
  confidence: string
): string {
  return `📐 MEDIDAS DA FACHADA
• Largura: ${widthM}m
• Altura: ${heightM}m
• Área total: ${areaM2}m²
• Confiança da medição: ${confidence}

🎨 ÁREA ACM
• Painel ACM ${acmCor}: ${acmM2}m²
• Perímetro: ${perimeterM}m

✍️ LETREIRO
• Texto: "${letreiroTexto}"
• Metragem linear: ${lettersLinearM}m

💡 ILUMINAÇÃO
• Tipo: ${iluminacaoTipo}
${ledM > 0 ? `• LED: ${ledM}m` : ''}
${spotsQty > 0 ? `• Spots: ${spotsQty} unidades` : ''}

🔧 INSTALAÇÃO
• Estrutura metálica
• Fixações e acabamentos
• Mão de obra especializada

💰 ESTIMATIVA DE INVESTIMENTO
• Econômico: R$ ${priceEcon.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Intermediário: R$ ${priceInter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Premium: R$ ${pricePrem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

⚠️ Valores sujeitos a vistoria técnica presencial`
}

/**
 * Gera próximo número de protocolo
 */
export async function generateProtocol(): Promise<string> {
  const supabase = getSupabaseClient()
  // Buscar ou criar counter
  let { data, error } = await supabase
    .from('protocol_counter')
    .select('*')
    .limit(1)
    .single()

  if (error || !data) {
    // Criar primeiro counter
    const { data: newData, error: insertError } = await supabase
      .from('protocol_counter')
      .insert({ counter: 1 })
      .select()
      .single()

    if (insertError || !newData) {
      // Fallback: usar timestamp
      return `FAC${Date.now().toString().slice(-6)}`
    }

    data = newData
  }

  const newCounter = data.counter + 1

  // Atualizar counter
  await supabase
    .from('protocol_counter')
    .update({ counter: newCounter, updated_at: new Date().toISOString() })
    .eq('id', data.id)

  // Formato: FAC000001
  return `FAC${String(newCounter).padStart(6, '0')}`
}
