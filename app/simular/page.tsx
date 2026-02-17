'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import { getSupabaseClient } from '@/lib/supabase'
import {
  calculateWithReference,
  calculateManual,
  getValidationPhotosRequired,
  calculateQuantitativos
} from '@/lib/measurements'
import { renderCanvasFallback } from '@/lib/render'

interface BBox {
  x: number
  y: number
  width: number
  height: number
}

interface ReferenceBox {
  x: number
  y: number
  width: number
  height: number
}

export default function SimularPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Passo 1: Upload
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  // Passo 2: Bbox
  const [bbox, setBbox] = useState<BBox>({ x: 20, y: 30, width: 60, height: 40 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  // Passo 3: Medição
  const [measurementMethod, setMeasurementMethod] = useState<'reference' | 'manual'>('reference')
  const [referenceBox, setReferenceBox] = useState<ReferenceBox | null>(null)
  const [referenceRealWidth, setReferenceRealWidth] = useState<string>('')
  const [manualWidth, setManualWidth] = useState<string>('')
  const [manualHeight, setManualHeight] = useState<string>('')
  const [measurements, setMeasurements] = useState<any>(null)

  // Passo 4: Validação
  const [validationPhotos, setValidationPhotos] = useState<File[]>([])
  const [validationVideo, setValidationVideo] = useState<File | null>(null)
  const [validationUrls, setValidationUrls] = useState<string[]>([])
  const [validationVideoUrl, setValidationVideoUrl] = useState<string | null>(null)

  // Passo 5: Design
  const [acmColor, setAcmColor] = useState('branco')
  const [acmFinish, setAcmFinish] = useState('liso')
  const [letreiroText, setLetreiroText] = useState('')
  const [letreiroColor, setLetreiroColor] = useState('preto')
  const [letreiroMaterial, setLetreiroMaterial] = useState('acrilico')
  const [letreiroThickness, setLetreiroThickness] = useState('3d')
  const [lightingType, setLightingType] = useState<'backlight' | 'frontal' | 'neon' | 'nenhuma'>('backlight')
  const [lightingColor, setLightingColor] = useState('branco')
  const [lightingIntensity, setLightingIntensity] = useState('media')
  const [nightMode, setNightMode] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Passo 6: Render
  const [resultUrls, setResultUrls] = useState<string[]>([])

  // Passo 7: Lead
  const [leadNome, setLeadNome] = useState('')
  const [leadWhatsapp, setLeadWhatsapp] = useState('')
  const [leadCidade, setLeadCidade] = useState('')
  const [leadCep, setLeadCep] = useState('')
  const [leadSegmento, setLeadSegmento] = useState('')
  const [leadPrazo, setLeadPrazo] = useState('')

  // Token final
  const [simulationToken, setSimulationToken] = useState<string | null>(null)

  const updateProgress = () => {
    const stepProgress = (step / 8) * 100
    setProgress(stepProgress)
  }

  // PASSO 1: Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // Comprimir imagem
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      }
      const compressedFile = await imageCompression(file, options)
      
      // Preview local
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setOriginalImage(result)
        
        // Obter dimensões
        const img = new Image()
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height })
        }
        img.src = result
      }
      reader.readAsDataURL(compressedFile)
      
      setOriginalImageFile(compressedFile)
    } catch (error) {
      console.error('Image compression error:', error)
      alert('Erro ao processar imagem')
    } finally {
      setLoading(false)
    }
  }

  const uploadToSupabase = async (file: File, folder: string): Promise<string> => {
    const supabase = getSupabaseClient()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    const filePath = `${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('simulacoes')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error('Upload failed: ' + uploadError.message)
    }

    const { data } = supabase.storage
      .from('simulacoes')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const nextStep1 = async () => {
    if (!originalImageFile) {
      alert('Por favor, selecione uma imagem')
      return
    }

    setLoading(true)
    try {
      const url = await uploadToSupabase(originalImageFile, 'originals')
      setImageUrl(url)
      setStep(2)
      updateProgress()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setLoading(false)
    }
  }

  // PASSO 2: Marcar área
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setIsDragging(true)
    setDragStart({ x, y })
    setBbox({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return

    const rect = e.currentTarget.getBoundingClientRect()
    const currentX = ((e.clientX - rect.left) / rect.width) * 100
    const currentY = ((e.clientY - rect.top) / rect.height) * 100

    const width = Math.abs(currentX - dragStart.x)
    const height = Math.abs(currentY - dragStart.y)
    const x = Math.min(currentX, dragStart.x)
    const y = Math.min(currentY, dragStart.y)

    setBbox({ x, y, width, height })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const nextStep2 = () => {
    if (bbox.width < 5 || bbox.height < 5) {
      alert('Por favor, marque uma área válida')
      return
    }
    setStep(3)
    updateProgress()
  }

  // PASSO 3: Medição
  const handleReferenceBoxDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    if (!referenceBox) {
      setReferenceBox({ x, y, width: 10, height: 15 })
    }
  }

  const calculateMeasurements = () => {
    if (!imageDimensions) return

    if (measurementMethod === 'reference') {
      if (!referenceBox || !referenceRealWidth) {
        alert('Por favor, marque o objeto de referência e informe a largura real')
        return
      }

      const result = calculateWithReference(
        bbox,
        referenceBox,
        parseFloat(referenceRealWidth),
        imageDimensions.width,
        imageDimensions.height
      )

      setMeasurements(result)
    } else {
      if (!manualWidth || !manualHeight) {
        alert('Por favor, informe largura e altura')
        return
      }

      const result = calculateManual(
        parseFloat(manualWidth),
        parseFloat(manualHeight)
      )

      setMeasurements(result)
    }
  }

  const nextStep3 = () => {
    if (!measurements) {
      alert('Por favor, calcule as medidas primeiro')
      return
    }
    setStep(4)
    updateProgress()
  }

  // PASSO 4: Validação
  const handleValidationPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setValidationPhotos(files)
  }

  const handleValidationVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setValidationVideo(file)
  }

  const nextStep4 = async () => {
    const requiredPhotos = getValidationPhotosRequired(measurements.confidence)
    
    if (validationPhotos.length < requiredPhotos) {
      alert(`Por favor, envie pelo menos ${requiredPhotos} foto(s) de validação`)
      return
    }

    setLoading(true)
    try {
      const urls: string[] = []
      for (const photo of validationPhotos) {
        const url = await uploadToSupabase(photo, 'validation')
        urls.push(url)
      }
      setValidationUrls(urls)

      if (validationVideo) {
        const videoUrl = await uploadToSupabase(validationVideo, 'validation')
        setValidationVideoUrl(videoUrl)
      }

      setStep(5)
      updateProgress()
    } catch (error) {
      console.error('Validation upload error:', error)
      alert('Erro ao fazer upload das fotos de validação')
    } finally {
      setLoading(false)
    }
  }

  // PASSO 5: Design
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const nextStep5 = () => {
    if (!letreiroText) {
      alert('Por favor, informe o texto do letreiro')
      return
    }
    setStep(6)
    updateProgress()
  }

  // PASSO 6: Render
  const performRender = async () => {
    if (!originalImage) return

    setLoading(true)
    try {
      const config = {
        acm: {
          cor: acmColor,
          acabamento: acmFinish
        },
        letreiro: {
          texto: letreiroText,
          cor: letreiroColor,
          material: letreiroMaterial,
          espessura: letreiroThickness
        },
        iluminacao: {
          tipo: lightingType,
          cor: lightingColor,
          intensidade: lightingIntensity,
          modo_noturno: nightMode
        },
        logo: logoUrl || undefined
      }

      // Tentar API externa primeiro
      const apiResponse = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImageUrl: originalImage,
          bbox,
          config
        })
      })

      const apiData = await apiResponse.json()

      let urls: string[] = []

      if (apiData.fallback_required) {
        // Usar renderização local
        const variations: ('v1' | 'v2' | 'v3')[] = ['v1', 'v2', 'v3']
        
        for (const variation of variations) {
          const blob = await renderCanvasFallback(originalImage, bbox, config, variation)
          const file = new File([blob], `render-${variation}.jpg`, { type: 'image/jpeg' })
          const url = await uploadToSupabase(file, 'rendered')
          urls.push(url)
        }
      } else {
        urls = apiData.result_urls
      }

      setResultUrls(urls)

      // Salvar draft
      const uploadedLogoUrl = logoFile ? await uploadToSupabase(logoFile, 'logos') : null

      const draftResponse = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_image_url: imageUrl,
          result_urls: urls,
          bbox,
          reference_box: referenceBox,
          reference_real_width_m: referenceRealWidth ? parseFloat(referenceRealWidth) : null,
          derived_width_m: measurements.derived_width_m,
          derived_height_m: measurements.derived_height_m,
          derived_area_m2: measurements.derived_area_m2,
          confidence: measurements.confidence,
          validation_urls: validationUrls,
          validation_video_url: validationVideoUrl,
          acm_config: config.acm,
          letreiro_config: config.letreiro,
          iluminacao_config: config.iluminacao,
          logo_url: uploadedLogoUrl
        })
      })

      const draftData = await draftResponse.json()
      
      if (draftData.success) {
        setSimulationToken(draftData.token)
        setStep(7)
        updateProgress()
      } else {
        throw new Error('Failed to save draft')
      }
    } catch (error) {
      console.error('Render error:', error)
      alert('Erro ao gerar simulação')
    } finally {
      setLoading(false)
    }
  }

  // PASSO 7: Lead
  const nextStep7 = () => {
    if (!leadNome || !leadWhatsapp || !leadCidade) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }
    finalizeSimulation()
  }

  // PASSO 8: Finalizar
  const finalizeSimulation = async () => {
    if (!simulationToken) return

    setLoading(true)
    try {
      const response = await fetch('/api/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: simulationToken,
          lead_data: {
            nome: leadNome,
            whatsapp: leadWhatsapp,
            cidade: leadCidade,
            cep: leadCep,
            segmento: leadSegmento,
            prazo: leadPrazo
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/resultado/${simulationToken}`)
      } else {
        throw new Error('Failed to finalize')
      }
    } catch (error) {
      console.error('Finalize error:', error)
      alert('Erro ao finalizar simulação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏢 Simulador de Fachadas Pro
          </h1>
          <p className="text-gray-600">
            Simule sua fachada em 8 passos simples
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Passo {step} de 8
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round((step / 8) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* PASSO 1: Upload */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📸 Passo 1: Upload da Imagem
              </h2>
              <p className="text-gray-600 mb-6">
                Envie uma foto da fachada atual (JPG, PNG ou HEIC)
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-block"
                >
                  {originalImage ? (
                    <div>
                      <img
                        src={originalImage}
                        alt="Preview"
                        className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                      />
                      <p className="mt-4 text-sm text-gray-500">
                        Clique para trocar a imagem
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-6xl mb-4">📤</div>
                      <p className="text-lg font-medium text-gray-700">
                        Clique para selecionar uma imagem
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, PNG ou HEIC até 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {originalImage && (
                <button
                  onClick={nextStep1}
                  disabled={loading}
                  className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Próximo →'}
                </button>
              )}
            </div>
          )}

          {/* PASSO 2: Marcar área */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🎯 Passo 2: Marcar Área da Fachada
              </h2>
              <p className="text-gray-600 mb-6">
                Arraste o mouse sobre a imagem para marcar a área onde será aplicado o ACM e letreiro
              </p>

              <div
                className="relative inline-block cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={originalImage || ''}
                  alt="Original"
                  className="max-w-full rounded-lg"
                  style={{ maxHeight: '500px' }}
                />
                {bbox.width > 0 && bbox.height > 0 && (
                  <div
                    className="absolute border-4 border-blue-500 bg-blue-500 bg-opacity-20"
                    style={{
                      left: `${bbox.x}%`,
                      top: `${bbox.y}%`,
                      width: `${bbox.width}%`,
                      height: `${bbox.height}%`
                    }}
                  >
                    <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                      Área selecionada
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={nextStep2}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3: Medição */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📏 Passo 3: Medição Remota
              </h2>
              <p className="text-gray-600 mb-6">
                Escolha o método de medição para calcular as dimensões reais
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setMeasurementMethod('reference')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    measurementMethod === 'reference'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🚪</div>
                  <div className="font-semibold">Objeto de Referência</div>
                  <div className="text-sm text-gray-600">
                    Marque uma porta ou janela
                  </div>
                </button>

                <button
                  onClick={() => setMeasurementMethod('manual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    measurementMethod === 'manual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">✏️</div>
                  <div className="font-semibold">Medida Manual</div>
                  <div className="text-sm text-gray-600">
                    Digite largura e altura
                  </div>
                </button>
              </div>

              {measurementMethod === 'reference' && (
                <div>
                  <div
                    className="relative inline-block cursor-pointer mb-4"
                    onClick={handleReferenceBoxDrag}
                  >
                    <img
                      src={originalImage || ''}
                      alt="Reference"
                      className="max-w-full rounded-lg"
                      style={{ maxHeight: '400px' }}
                    />
                    {bbox.width > 0 && (
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10"
                        style={{
                          left: `${bbox.x}%`,
                          top: `${bbox.y}%`,
                          width: `${bbox.width}%`,
                          height: `${bbox.height}%`
                        }}
                      />
                    )}
                    {referenceBox && (
                      <div
                        className="absolute border-2 border-green-500 bg-green-500 bg-opacity-30"
                        style={{
                          left: `${referenceBox.x}%`,
                          top: `${referenceBox.y}%`,
                          width: `${referenceBox.width}%`,
                          height: `${referenceBox.height}%`
                        }}
                      >
                        <div className="absolute -top-8 left-0 bg-green-500 text-white px-2 py-1 rounded text-sm">
                          Referência
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Largura real do objeto de referência (metros)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={referenceRealWidth}
                        onChange={(e) => setReferenceRealWidth(e.target.value)}
                        placeholder="Ex: 0.90 (porta padrão)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Porta padrão = 0.90m | Janela = 1.20m
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {measurementMethod === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Largura da fachada (metros)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualWidth}
                      onChange={(e) => setManualWidth(e.target.value)}
                      placeholder="Ex: 8.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Altura da fachada (metros)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualHeight}
                      onChange={(e) => setManualHeight(e.target.value)}
                      placeholder="Ex: 3.50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={calculateMeasurements}
                className="w-full mt-6 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all"
              >
                Calcular Medidas
              </button>

              {measurements && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✅ Medidas Calculadas
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Largura:</span>
                      <span className="ml-2 font-semibold">
                        {measurements.derived_width_m}m
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Altura:</span>
                      <span className="ml-2 font-semibold">
                        {measurements.derived_height_m}m
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Área:</span>
                      <span className="ml-2 font-semibold">
                        {measurements.derived_area_m2}m²
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confiança:</span>
                      <span
                        className={`ml-2 font-semibold ${
                          measurements.confidence === 'ALTO'
                            ? 'text-green-600'
                            : measurements.confidence === 'MÉDIO'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {measurements.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={nextStep3}
                  disabled={!measurements}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* PASSO 4: Validação */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📷 Passo 4: Fotos de Validação
              </h2>
              <p className="text-gray-600 mb-6">
                Envie fotos adicionais da fachada para validação técnica
                {measurements && (
                  <span className="block mt-2 font-semibold text-blue-600">
                    Necessário: {getValidationPhotosRequired(measurements.confidence)} foto(s)
                  </span>
                )}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotos de Validação *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleValidationPhotos}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {validationPhotos.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ {validationPhotos.length} foto(s) selecionada(s)
                    </p>
                  )}
                </div>

                {measurements?.confidence === 'BAIXO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vídeo da Fachada (Opcional)
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleValidationVideo}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    {validationVideo && (
                      <p className="text-sm text-green-600 mt-2">
                        ✅ Vídeo selecionado
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  💡 Dicas para fotos de validação:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tire fotos de diferentes ângulos</li>
                  <li>• Inclua elementos de referência (portas, janelas)</li>
                  <li>• Evite fotos com muita sombra ou reflexo</li>
                  <li>• Capture a fachada completa e detalhes</li>
                </ul>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={nextStep4}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Próximo →'}
                </button>
              </div>
            </div>
          )}

          {/* PASSO 5: Design */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🎨 Passo 5: Configuração do Design
              </h2>

              <div className="space-y-6">
                {/* ACM */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Painel ACM</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor
                      </label>
                      <select
                        value={acmColor}
                        onChange={(e) => setAcmColor(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="branco">Branco</option>
                        <option value="preto">Preto</option>
                        <option value="cinza">Cinza</option>
                        <option value="azul">Azul</option>
                        <option value="vermelho">Vermelho</option>
                        <option value="verde">Verde</option>
                        <option value="amarelo">Amarelo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Acabamento
                      </label>
                      <select
                        value={acmFinish}
                        onChange={(e) => setAcmFinish(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="liso">Liso</option>
                        <option value="escovado">Escovado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Letreiro */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Letreiro</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto *
                      </label>
                      <input
                        type="text"
                        value={letreiroText}
                        onChange={(e) => setLetreiroText(e.target.value)}
                        placeholder="Ex: MINHA EMPRESA"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor
                        </label>
                        <select
                          value={letreiroColor}
                          onChange={(e) => setLetreiroColor(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="branco">Branco</option>
                          <option value="preto">Preto</option>
                          <option value="dourado">Dourado</option>
                          <option value="prata">Prata</option>
                          <option value="azul">Azul</option>
                          <option value="vermelho">Vermelho</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material
                        </label>
                        <select
                          value={letreiroMaterial}
                          onChange={(e) => setLetreiroMaterial(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="acrilico">Acrílico</option>
                          <option value="aco">Aço Inox</option>
                          <option value="pvc">PVC</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Espessura
                        </label>
                        <select
                          value={letreiroThickness}
                          onChange={(e) => setLetreiroThickness(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="plana">Plana</option>
                          <option value="3d">3D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Iluminação */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Iluminação</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo
                        </label>
                        <select
                          value={lightingType}
                          onChange={(e) => setLightingType(e.target.value as any)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="backlight">Backlight (LED atrás)</option>
                          <option value="frontal">Frontal (Spots)</option>
                          <option value="neon">Neon nas Letras</option>
                          <option value="nenhuma">Sem Iluminação</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor da Luz
                        </label>
                        <select
                          value={lightingColor}
                          onChange={(e) => setLightingColor(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          disabled={lightingType === 'nenhuma'}
                        >
                          <option value="branco">Branco</option>
                          <option value="amarelo">Amarelo Quente</option>
                          <option value="azul">Azul</option>
                          <option value="verde">Verde</option>
                          <option value="vermelho">Vermelho</option>
                          <option value="rosa">Rosa</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intensidade
                        </label>
                        <select
                          value={lightingIntensity}
                          onChange={(e) => setLightingIntensity(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          disabled={lightingType === 'nenhuma'}
                        >
                          <option value="baixa">Baixa</option>
                          <option value="media">Média</option>
                          <option value="alta">Alta</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={nightMode}
                            onChange={(e) => setNightMode(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded"
                            disabled={lightingType === 'nenhuma'}
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Simular Modo Noturno
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">
                    Logo (Opcional)
                  </h3>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  
                  {logoUrl && (
                    <div className="mt-4">
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={nextStep5}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* PASSO 6: Render */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🎬 Passo 6: Gerar Simulações
              </h2>
              <p className="text-gray-600 mb-6">
                Vamos gerar 3 variações da sua fachada
              </p>

              {resultUrls.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <button
                    onClick={performRender}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 text-lg"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⚙️</span>
                        Gerando simulações...
                      </>
                    ) : (
                      'Gerar Simulações'
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {resultUrls.map((url, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Variação ${index + 1}`}
                          className="w-full h-auto"
                        />
                        <div className="p-2 bg-gray-100 text-center text-sm font-medium">
                          Variação {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(5)}
                      className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => {
                        setStep(7)
                        updateProgress()
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                    >
                      Próximo →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASSO 7: Lead */}
          {step === 7 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                👤 Passo 7: Seus Dados
              </h2>
              <p className="text-gray-600 mb-6">
                Para receber o orçamento detalhado, preencha seus dados
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={leadNome}
                    onChange={(e) => setLeadNome(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={leadWhatsapp}
                    onChange={(e) => setLeadWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={leadCidade}
                      onChange={(e) => setLeadCidade(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={leadCep}
                      onChange={(e) => setLeadCep(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segmento do Negócio
                  </label>
                  <select
                    value={leadSegmento}
                    onChange={(e) => setLeadSegmento(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione...</option>
                    <option value="comercio">Comércio</option>
                    <option value="servicos">Serviços</option>
                    <option value="industria">Indústria</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prazo Desejado
                  </label>
                  <select
                    value={leadPrazo}
                    onChange={(e) => setLeadPrazo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione...</option>
                    <option value="urgente">Urgente (até 15 dias)</option>
                    <option value="normal">Normal (30 dias)</option>
                    <option value="flexivel">Flexível (60+ dias)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={nextStep7}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Finalizando...' : 'Finalizar →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
