import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            🏢 Simulador de Fachadas Pro
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Transforme sua fachada em minutos com tecnologia avançada
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-12">
            Envie fotos, simule ACM + letreiro + iluminação, capture medidas remotamente 
            e receba pré-orçamento automático em 3 faixas de investimento
          </p>
          
          <Link
            href="/simular"
            className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl px-12 py-5 rounded-full hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-2xl"
          >
            🚀 Começar Simulação Grátis
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Upload Fácil
            </h3>
            <p className="text-gray-600">
              Envie fotos da fachada atual. Suporte para JPG, PNG e HEIC com compressão automática
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all">
            <div className="text-6xl mb-4">📏</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Medição Remota
            </h3>
            <p className="text-gray-600">
              Calcule dimensões reais usando referências de objetos ou medida manual
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Design Personalizado
            </h3>
            <p className="text-gray-600">
              Escolha cores de ACM, letreiro, iluminação e veja 3 variações em alta qualidade
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Orçamento Automático
            </h3>
            <p className="text-gray-600">
              Receba estimativas em 3 faixas: Econômico, Intermediário e Premium
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Quantitativos Precisos
            </h3>
            <p className="text-gray-600">
              Cálculo automático de ACM, perímetro, letreiro linear, LED e spots
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-all">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Contato Direto
            </h3>
            <p className="text-gray-600">
              Envie simulação por WhatsApp com protocolo e link compartilhável
            </p>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Como Funciona?
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  📤 Upload da Imagem
                </h4>
                <p className="text-gray-600">
                  Envie uma foto da fachada atual em JPG, PNG ou HEIC
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  🎯 Marcar Área da Fachada
                </h4>
                <p className="text-gray-600">
                  Arraste o mouse para selecionar onde será aplicado o ACM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  📏 Medição Remota
                </h4>
                <p className="text-gray-600">
                  Marque um objeto de referência (porta/janela) ou digite medidas manualmente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  📷 Fotos de Validação
                </h4>
                <p className="text-gray-600">
                  Envie fotos extras (1 a 3 dependendo da confiança da medição)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                5
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  🎨 Configuração do Design
                </h4>
                <p className="text-gray-600">
                  Escolha cor do ACM, texto do letreiro, tipo de iluminação e modo noturno
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                6
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  🎬 Geração de Simulações
                </h4>
                <p className="text-gray-600">
                  Sistema gera 3 variações automáticas com diferentes tonalidades
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                7
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  👤 Seus Dados
                </h4>
                <p className="text-gray-600">
                  Preencha nome, WhatsApp, cidade e informações do projeto
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                8
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  ✅ Resultado Final
                </h4>
                <p className="text-gray-600">
                  Veja antes/depois, resumo técnico e 3 faixas de preço com protocolo único
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <Link
            href="/simular"
            className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-2xl px-16 py-6 rounded-full hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-2xl"
          >
            🎯 Simular Minha Fachada Agora
          </Link>
          <p className="text-gray-500 mt-4">
            100% gratuito • Sem compromisso • Resultado em minutos
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">
            🏢 Simulador de Fachadas Pro - 2024
          </p>
          <p className="text-gray-400 mt-2">
            Powered by Next.js 14 + TypeScript + Supabase
          </p>
          <div className="mt-4 space-x-4">
            <Link href="/admin" className="text-blue-400 hover:text-blue-300">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
