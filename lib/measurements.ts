export interface BBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ReferenceBox {
  x: number
  y: number
  width: number
  height: number
}

export interface MeasurementResult {
  derived_width_m: number
  derived_height_m: number
  derived_area_m2: number
  pixels_per_meter: number
  confidence: 'ALTO' | 'MÉDIO' | 'BAIXO'
}

/**
 * Calcula medidas com base em referência de objeto conhecido
 */
export function calculateWithReference(
  bbox: BBox,
  referenceBox: ReferenceBox,
  referenceRealWidthM: number,
  imageWidth: number,
  imageHeight: number
): MeasurementResult {
  // Converter porcentagens para pixels
  const bboxPixels = {
    width: (bbox.width / 100) * imageWidth,
    height: (bbox.height / 100) * imageHeight
  }

  const refPixels = {
    width: (referenceBox.width / 100) * imageWidth,
    height: (referenceBox.height / 100) * imageHeight
  }

  // Calcular pixels por metro baseado na referência
  const pixelsPerMeter = refPixels.width / referenceRealWidthM

  // Calcular dimensões reais da fachada
  const derivedWidthM = bboxPixels.width / pixelsPerMeter
  const derivedHeightM = bboxPixels.height / pixelsPerMeter
  const derivedAreaM2 = derivedWidthM * derivedHeightM

  // Determinar confiança baseado na qualidade da referência
  let confidence: 'ALTO' | 'MÉDIO' | 'BAIXO' = 'ALTO'
  
  // Se a referência for muito pequena ou muito diferente do bbox
  const refToBboxRatio = refPixels.width / bboxPixels.width
  if (refToBboxRatio < 0.1 || refToBboxRatio > 0.5) {
    confidence = 'MÉDIO'
  }
  
  // Se a área calculada for muito grande ou pequena (validação de sanidade)
  if (derivedAreaM2 < 1 || derivedAreaM2 > 200) {
    confidence = 'BAIXO'
  }

  return {
    derived_width_m: Number(derivedWidthM.toFixed(2)),
    derived_height_m: Number(derivedHeightM.toFixed(2)),
    derived_area_m2: Number(derivedAreaM2.toFixed(2)),
    pixels_per_meter: Number(pixelsPerMeter.toFixed(2)),
    confidence
  }
}

/**
 * Calcula medidas com entrada manual
 */
export function calculateManual(
  manualWidthM: number,
  manualHeightM: number
): MeasurementResult {
  const derivedAreaM2 = manualWidthM * manualHeightM

  return {
    derived_width_m: Number(manualWidthM.toFixed(2)),
    derived_height_m: Number(manualHeightM.toFixed(2)),
    derived_area_m2: Number(derivedAreaM2.toFixed(2)),
    pixels_per_meter: 0, // Não aplicável para medição manual
    confidence: 'BAIXO' // Medição manual sempre tem confiança baixa
  }
}

/**
 * Calcula quantitativos para orçamento
 */
export interface Quantitativos {
  acm_m2: number
  perimeter_m: number
  letters_linear_m: number
  led_m: number
  spots_qty: number
}

export function calculateQuantitativos(
  widthM: number,
  heightM: number,
  letreiroTexto: string,
  iluminacaoTipo: string
): Quantitativos {
  // Área ACM
  const acm_m2 = Number((widthM * heightM).toFixed(2))

  // Perímetro
  const perimeter_m = Number((2 * (widthM + heightM)).toFixed(2))

  // Letreiro linear
  const alturaLetraM = heightM * 0.2 // Letras ocupam 20% da altura
  const numCaracteres = letreiroTexto.length
  const letters_linear_m = Number((numCaracteres * alturaLetraM * 0.6).toFixed(2))

  // LED
  let led_m = 0
  let spots_qty = 0

  if (iluminacaoTipo === 'backlight') {
    led_m = perimeter_m
  } else if (iluminacaoTipo === 'frontal') {
    const spotsPerMeter = 1.2
    spots_qty = Math.ceil(widthM / spotsPerMeter)
  } else if (iluminacaoTipo === 'neon') {
    led_m = letters_linear_m
  }

  return {
    acm_m2,
    perimeter_m,
    letters_linear_m,
    led_m: Number(led_m.toFixed(2)),
    spots_qty
  }
}

/**
 * Retorna número de fotos de validação necessárias
 */
export function getValidationPhotosRequired(confidence: string): number {
  switch (confidence) {
    case 'ALTO':
      return 1
    case 'MÉDIO':
      return 2
    case 'BAIXO':
      return 3
    default:
      return 3
  }
}
