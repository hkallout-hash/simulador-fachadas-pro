'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Lead {
  id: string
  nome: string
  whatsapp: string
  cidade: string
  cep: string
  segmento: string
  prazo: string
  created_at: string
}

interface Simulation {
  id: string
  token: string
  protocol: string
  lead_id: string
  derived_width_m: number
  derived_height_m: number
  derived_area_m2: number
  confidence: string
  acm_m2: number
  perimeter_m: number
  letters_linear_m: number
  led_m: number
  spots_qty: number
  price_economico: number
  price_intermediario: number
  price_premium: number
  summary_text: string
  result_urls: string[]
  letreiro_config: {
    texto: string
  }
  created_at: string
}

type SimulationWithLead = Simulation & { lead: Lead }

export default function AdminPage() {
  const [simulations, setSimulations] = useState<SimulationWithLead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSim, setSelectedSim] = useState<SimulationWithLead | null>(null)

  useEffect(() => {
    loadSimulations()
  }, [])

  const loadSimulations = async () => {
    try {
      const { data: simData, error: simError } = await supabase
        .from('simulations')
        .select(`
          *,
          lead:leads(*)
        `)
        .order('created_at', { ascending: false })

      if (simError) throw simError

      const formatted = (simData as any[]).map((sim) => ({
        ...sim,
        lead: sim.lead
      }))

      setSimulations(formatted)
    } catch (error) {
      console.error('Load simulations error:', error)
      alert('Erro ao carregar simulações')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copiado para a área de transferência!')
  }

  const exportToCSV = () => {
    const headers = [
      'Protocolo',
      'Data',
      'Nome',
      'WhatsApp',
      'Cidade',
      'Segmento',
      'Prazo',
      'Largura (m)',
      'Altura (m)',
      'Área (m²)',
      'ACM (m²)',
      'Letreiro',
      'Preço Econômico',
      'Preço Intermediário',
      'Preço Premium'
    ]

    const rows = simulations.map((sim) => [
      sim.protocol,
      new Date(sim.created_at).toLocaleDateString('pt-BR'),
      sim.lead.nome,
      sim.lead.whatsapp,
      sim.lead.cidade,
      sim.lead.segmento,
      sim.lead.prazo,
      sim.derived_width_m,
      sim.derived_height_m,
      sim.derived_area_m2,
      sim.acm_m2,
      sim.letreiro_config.texto,
      sim.price_economico,
      sim.price_intermediario,
      sim.price_premium
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `simulacoes-${Date.now()}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <p className="text-xl text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🔧 Admin - Simulações
            </h1>
            <p className="text-gray-600">
              Total de simulações: {simulations.length}
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all font-semibold"
          >
            📊 Exportar CSV
          </button>
        </div>

        {/* Lista de Simulações */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área (m²)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Médio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {simulations.map((sim) => (
                  <tr
                    key={sim.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSim(sim)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">
                        {sim.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sim.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sim.lead.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sim.lead.whatsapp}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sim.lead.cidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sim.derived_area_m2}m²
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      R$ {sim.price_intermediario.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSim(sim)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhes */}
        {selectedSim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedSim.protocol}
                    </h2>
                    <p className="text-gray-600">
                      {new Date(selectedSim.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSim(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Imagens */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {selectedSim.result_urls.map((url, index) => (
                    <div key={index}>
                      <img
                        src={url}
                        alt={`V${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    </div>
                  ))}
                </div>

                {/* Dados do Cliente */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">
                    👤 Dados do Cliente
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <span className="ml-2 font-medium">{selectedSim.lead.nome}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">WhatsApp:</span>
                      <span className="ml-2 font-medium">{selectedSim.lead.whatsapp}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cidade:</span>
                      <span className="ml-2 font-medium">{selectedSim.lead.cidade}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">CEP:</span>
                      <span className="ml-2 font-medium">{selectedSim.lead.cep}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Segmento:</span>
                      <span className="ml-2 font-medium">{selectedSim.lead.segmento}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Prazo:</span>
                      <span className="ml-2 font-medium">{selectedSim.lead.prazo}</span>
                    </div>
                  </div>
                </div>

                {/* Medidas e Quantitativos */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">
                    📐 Medidas e Quantitativos
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Largura:</span>
                      <span className="ml-2 font-medium">{selectedSim.derived_width_m}m</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Altura:</span>
                      <span className="ml-2 font-medium">{selectedSim.derived_height_m}m</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Área:</span>
                      <span className="ml-2 font-medium">{selectedSim.derived_area_m2}m²</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ACM:</span>
                      <span className="ml-2 font-medium">{selectedSim.acm_m2}m²</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Perímetro:</span>
                      <span className="ml-2 font-medium">{selectedSim.perimeter_m}m</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Letreiro Linear:</span>
                      <span className="ml-2 font-medium">{selectedSim.letters_linear_m}m</span>
                    </div>
                    <div>
                      <span className="text-gray-600">LED:</span>
                      <span className="ml-2 font-medium">{selectedSim.led_m}m</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Spots:</span>
                      <span className="ml-2 font-medium">{selectedSim.spots_qty} un</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confiança:</span>
                      <span className={`ml-2 font-medium ${
                        selectedSim.confidence === 'ALTO' ? 'text-green-600' :
                        selectedSim.confidence === 'MÉDIO' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedSim.confidence}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preços */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Econômico
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {selectedSim.price_economico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Intermediário
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">
                      R$ {selectedSim.price_intermediario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      Premium
                    </h4>
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {selectedSim.price_premium.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">
                    📋 Resumo Completo
                  </h3>
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {selectedSim.summary_text}
                  </pre>
                </div>

                {/* Ações */}
                <div className="flex gap-4">
                  <button
                    onClick={() => copyToClipboard(selectedSim.summary_text)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    📋 Copiar Resumo
                  </button>
                  <button
                    onClick={() => window.open(`/resultado/${selectedSim.token}`, '_blank')}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    🔗 Ver Página Pública
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
