'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

interface Simulation {
  token: string
  protocol: string
  original_image_url: string
  result_urls: string[]
  derived_width_m: number
  derived_height_m: number
  derived_area_m2: number
  confidence: string
  letreiro_config: {
    texto: string
  }
  price_economico: number
  price_intermediario: number
  price_premium: number
  summary_text: string
  lead_id: string
}

interface Lead {
  nome: string
  whatsapp: string
  cidade: string
}

export default function ResultadoPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariation, setSelectedVariation] = useState(0)

  useEffect(() => {
    loadSimulation()
  }, [params.token])

  const loadSimulation = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: simData, error: simError } = await supabase
        .from('simulations')
        .select('*')
        .eq('token', params.token)
        .single()

      if (simError || !simData) {
        throw new Error('Simulação não encontrada')
      }

      setSimulation(simData as any)

      if (simData.lead_id) {
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', simData.lead_id)
          .single()

        if (!leadError && leadData) {
          setLead(leadData as any)
        }
      }
    } catch (error) {
      console.error('Load simulation error:', error)
      alert('Erro ao carregar simulação')
    } finally {
      setLoading(false)
    }
  }

  const generateWhatsAppMessage = () => {
    if (!simulation || !lead) return ''

    const message = `Olá! Vi minha simulação de fachada no Simulador de Fachadas Pro.

📋 Protocolo: ${simulation.protocol}
🏢 Nome: ${lead.nome}
📍 Cidade: ${lead.cidade}

📐 Medidas:
• Largura: ${simulation.derived_width_m}m
• Altura: ${simulation.derived_height_m}m
• Área: ${simulation.derived_area_m2}m²

🎨 Configuração:
• Letreiro: "${simulation.letreiro_config.texto}"

💰 Faixa de interesse: [ESPECIFIQUE AQUI]

🔗 Link da simulação: ${window.location.href}

Gostaria de receber um orçamento detalhado!`

    return encodeURIComponent(message)
  }

  const handleWhatsAppClick = () => {
    const message = generateWhatsAppMessage()
    const phone = '5511999999999' // Substituir pelo número real
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <p className="text-xl text-gray-600">Carregando simulação...</p>
        </div>
      </div>
    )
  }

  if (!simulation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600 mb-4">Simulação não encontrada</p>
          <button
            onClick={() => router.push('/simular')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Criar Nova Simulação
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✅ Simulação Concluída!
          </h1>
          <p className="text-gray-600">
            Protocolo: <span className="font-bold text-blue-600">{simulation.protocol}</span>
          </p>
        </div>

        {/* Antes e Depois */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📸 Antes e Depois
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-center">
                ANTES
              </h3>
              <img
                src={simulation.original_image_url}
                alt="Antes"
                className="w-full rounded-lg shadow-md"
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-center">
                DEPOIS - Variação {selectedVariation + 1}
              </h3>
              <img
                src={simulation.result_urls[selectedVariation]}
                alt="Depois"
                className="w-full rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Variações */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              Selecione a Variação:
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {simulation.result_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariation(index)}
                  className={`border-4 rounded-lg overflow-hidden transition-all ${
                    selectedVariation === index
                      ? 'border-blue-500 shadow-lg'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={url} alt={`V${index + 1}`} className="w-full" />
                  <div className="p-2 bg-gray-100 text-center text-sm font-medium">
                    Variação {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo Técnico */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📋 Resumo Técnico e Orçamento
          </h2>

          <div className="whitespace-pre-line font-mono text-sm bg-gray-50 p-6 rounded-lg">
            {simulation.summary_text}
          </div>
        </div>

        {/* Faixas de Preço */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              💚 Econômico
            </h3>
            <p className="text-3xl font-bold text-green-600 mb-4">
              R$ {simulation.price_economico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Materiais padrão</li>
              <li>• Instalação básica</li>
              <li>• Garantia 1 ano</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              💙 Intermediário
            </h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              R$ {simulation.price_intermediario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Materiais de qualidade</li>
              <li>• Instalação profissional</li>
              <li>• Garantia 2 anos</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              💜 Premium
            </h3>
            <p className="text-3xl font-bold text-purple-600 mb-4">
              R$ {simulation.price_premium.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Materiais premium</li>
              <li>• Instalação premium</li>
              <li>• Garantia 3 anos</li>
            </ul>
          </div>
        </div>

        {/* CTA WhatsApp */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Gostou da simulação?
          </h3>
          <p className="text-white mb-6">
            Entre em contato via WhatsApp para receber um orçamento detalhado e personalizado!
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="bg-white text-green-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all text-lg inline-flex items-center gap-2"
          >
            <span className="text-2xl">📱</span>
            Falar no WhatsApp
          </button>
        </div>

        {/* Actions */}
        <div className="mt-6 text-center space-x-4">
          <button
            onClick={() => router.push('/simular')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all"
          >
            Nova Simulação
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all"
          >
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
