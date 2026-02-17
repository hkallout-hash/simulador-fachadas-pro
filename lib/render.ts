export interface ACMConfig {
  cor: string
  acabamento: string
}

export interface LetreiroConfig {
  texto: string
  cor: string
  material: string
  espessura: string
}

export interface IluminacaoConfig {
  tipo: 'backlight' | 'frontal' | 'neon' | 'nenhuma'
  cor: string
  intensidade: string
  modo_noturno: boolean
}

export interface RenderConfig {
  acm: ACMConfig
  letreiro: LetreiroConfig
  iluminacao: IluminacaoConfig
  logo?: string
}

/**
 * Renderiza simulação usando Canvas API (fallback)
 */
export async function renderCanvasFallback(
  originalImageUrl: string,
  bbox: { x: number; y: number; width: number; height: number },
  config: RenderConfig,
  variation: 'v1' | 'v2' | 'v3'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        // Desenhar imagem original
        ctx.drawImage(img, 0, 0)

        // Converter bbox de porcentagem para pixels
        const bboxPixels = {
          x: (bbox.x / 100) * img.width,
          y: (bbox.y / 100) * img.height,
          width: (bbox.width / 100) * img.width,
          height: (bbox.height / 100) * img.height
        }

        // Escurecer fundo se modo noturno
        if (config.iluminacao.modo_noturno) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // Aplicar painel ACM
        const acmColor = getACMColor(config.acm.cor, variation)
        ctx.fillStyle = acmColor
        ctx.fillRect(
          bboxPixels.x,
          bboxPixels.y,
          bboxPixels.width,
          bboxPixels.height
        )

        // Aplicar acabamento (simulação de textura)
        if (config.acm.acabamento === 'escovado') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
          ctx.lineWidth = 1
          for (let i = 0; i < bboxPixels.height; i += 3) {
            ctx.beginPath()
            ctx.moveTo(bboxPixels.x, bboxPixels.y + i)
            ctx.lineTo(bboxPixels.x + bboxPixels.width, bboxPixels.y + i)
            ctx.stroke()
          }
        }

        // Desenhar letreiro
        const fontSize = bboxPixels.height * 0.2
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const textX = bboxPixels.x + bboxPixels.width / 2
        const textY = bboxPixels.y + bboxPixels.height / 2

        // Sombra do texto para profundidade
        if (config.letreiro.espessura !== 'plana') {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 10
          ctx.shadowOffsetX = 5
          ctx.shadowOffsetY = 5
        }

        // Cor do letreiro
        ctx.fillStyle = getLetreiroColor(config.letreiro.cor, variation)
        ctx.fillText(config.letreiro.texto, textX, textY)

        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Aplicar iluminação
        if (config.iluminacao.tipo !== 'nenhuma') {
          applyIllumination(
            ctx,
            bboxPixels,
            config.iluminacao,
            config.letreiro.texto,
            textX,
            textY,
            fontSize,
            variation
          )
        }

        // Desenhar logo se fornecido
        if (config.logo) {
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'
          logoImg.onload = () => {
            const logoSize = Math.min(bboxPixels.width, bboxPixels.height) * 0.15
            const logoX = bboxPixels.x + bboxPixels.width - logoSize - 20
            const logoY = bboxPixels.y + 20
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to create blob'))
              }
            }, 'image/jpeg', 0.92)
          }
          logoImg.onerror = () => {
            // Continuar sem logo se falhar
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to create blob'))
              }
            }, 'image/jpeg', 0.92)
          }
          logoImg.src = config.logo
        } else {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          }, 'image/jpeg', 0.92)
        }
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = originalImageUrl
  })
}

function getACMColor(cor: string, variation: 'v1' | 'v2' | 'v3'): string {
  const colors: { [key: string]: { v1: string; v2: string; v3: string } } = {
    branco: { v1: '#f8f9fa', v2: '#ffffff', v3: '#e9ecef' },
    preto: { v1: '#212529', v2: '#000000', v3: '#343a40' },
    cinza: { v1: '#6c757d', v2: '#adb5bd', v3: '#495057' },
    azul: { v1: '#0d6efd', v2: '#0056b3', v3: '#3d8bfd' },
    vermelho: { v1: '#dc3545', v2: '#c82333', v3: '#e4606d' },
    verde: { v1: '#198754', v2: '#146c43', v3: '#41a36e' },
    amarelo: { v1: '#ffc107', v2: '#ffca2c', v3: '#f0ad4e' }
  }
  
  return colors[cor]?.[variation] || colors.branco[variation]
}

function getLetreiroColor(cor: string, variation: 'v1' | 'v2' | 'v3'): string {
  const colors: { [key: string]: { v1: string; v2: string; v3: string } } = {
    branco: { v1: '#ffffff', v2: '#f8f9fa', v3: '#e9ecef' },
    preto: { v1: '#000000', v2: '#212529', v3: '#343a40' },
    dourado: { v1: '#ffd700', v2: '#ffdf00', v3: '#f4c430' },
    prata: { v1: '#c0c0c0', v2: '#d3d3d3', v3: '#a8a8a8' },
    azul: { v1: '#4dabf7', v2: '#339af0', v3: '#74c0fc' },
    vermelho: { v1: '#ff6b6b', v2: '#fa5252', v3: '#ff8787' }
  }
  
  return colors[cor]?.[variation] || colors.branco[variation]
}

function applyIllumination(
  ctx: CanvasRenderingContext2D,
  bbox: { x: number; y: number; width: number; height: number },
  iluminacao: IluminacaoConfig,
  texto: string,
  textX: number,
  textY: number,
  fontSize: number,
  variation: 'v1' | 'v2' | 'v3'
) {
  const intensityMultiplier = iluminacao.intensidade === 'alta' ? 1.2 : 
                             iluminacao.intensidade === 'media' ? 1.0 : 0.7

  if (iluminacao.tipo === 'backlight') {
    // Backlight - glow ao redor do painel
    const glowColor = getIlluminationColor(iluminacao.cor)
    const glowSize = 30 * intensityMultiplier
    
    ctx.shadowColor = glowColor
    ctx.shadowBlur = glowSize
    ctx.strokeStyle = glowColor
    ctx.lineWidth = 2
    ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  } else if (iluminacao.tipo === 'frontal') {
    // Spots frontais - círculos de luz
    const spotRadius = 40 * intensityMultiplier
    const spotsCount = Math.ceil(bbox.width / 120)
    const spacing = bbox.width / (spotsCount + 1)
    
    for (let i = 1; i <= spotsCount; i++) {
      const spotX = bbox.x + spacing * i
      const spotY = bbox.y - 30
      
      const gradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotRadius)
      gradient.addColorStop(0, `${getIlluminationColor(iluminacao.cor)}80`)
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.fillRect(
        spotX - spotRadius,
        spotY,
        spotRadius * 2,
        bbox.height + 30
      )
    }
  } else if (iluminacao.tipo === 'neon') {
    // Neon - glow nas letras
    ctx.shadowColor = getIlluminationColor(iluminacao.cor)
    ctx.shadowBlur = 20 * intensityMultiplier
    ctx.strokeStyle = getIlluminationColor(iluminacao.cor)
    ctx.lineWidth = 3
    ctx.strokeText(texto, textX, textY)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }
}

function getIlluminationColor(cor: string): string {
  const colors: { [key: string]: string } = {
    branco: '#ffffff',
    amarelo: '#ffeb3b',
    azul: '#2196f3',
    verde: '#4caf50',
    vermelho: '#f44336',
    rosa: '#e91e63'
  }
  
  return colors[cor] || colors.branco
}
