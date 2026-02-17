-- Tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cidade TEXT NOT NULL,
  cep TEXT NOT NULL,
  segmento TEXT NOT NULL,
  prazo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de simulações
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES leads(id),
  protocol TEXT,
  original_image_url TEXT NOT NULL,
  result_urls TEXT[] DEFAULT '{}',
  bbox JSONB NOT NULL,
  reference_box JSONB,
  reference_real_width_m DECIMAL(10,2),
  derived_width_m DECIMAL(10,2) NOT NULL,
  derived_height_m DECIMAL(10,2) NOT NULL,
  derived_area_m2 DECIMAL(10,2) NOT NULL,
  confidence TEXT NOT NULL,
  validation_urls TEXT[] DEFAULT '{}',
  validation_video_url TEXT,
  acm_config JSONB NOT NULL,
  letreiro_config JSONB NOT NULL,
  iluminacao_config JSONB NOT NULL,
  logo_url TEXT,
  acm_m2 DECIMAL(10,2) NOT NULL,
  perimeter_m DECIMAL(10,2) NOT NULL,
  letters_linear_m DECIMAL(10,2) NOT NULL,
  led_m DECIMAL(10,2) NOT NULL,
  spots_qty INTEGER NOT NULL,
  price_economico DECIMAL(10,2) NOT NULL,
  price_intermediario DECIMAL(10,2) NOT NULL,
  price_premium DECIMAL(10,2) NOT NULL,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configuração de preços
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acm_m2 DECIMAL(10,2) NOT NULL DEFAULT 180.00,
  estrutura_m2 DECIMAL(10,2) NOT NULL DEFAULT 120.00,
  letra_linear_m DECIMAL(10,2) NOT NULL DEFAULT 250.00,
  led_m DECIMAL(10,2) NOT NULL DEFAULT 80.00,
  spot_unit DECIMAL(10,2) NOT NULL DEFAULT 45.00,
  instalacao_base DECIMAL(10,2) NOT NULL DEFAULT 800.00,
  frete_km DECIMAL(10,2) NOT NULL DEFAULT 2.50,
  markup_economico DECIMAL(10,2) NOT NULL DEFAULT 1.40,
  markup_intermediario DECIMAL(10,2) NOT NULL DEFAULT 1.70,
  markup_premium DECIMAL(10,2) NOT NULL DEFAULT 2.20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contador de protocolo
CREATE TABLE IF NOT EXISTS protocol_counter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counter INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão de preços
INSERT INTO pricing_config (
  acm_m2,
  estrutura_m2,
  letra_linear_m,
  led_m,
  spot_unit,
  instalacao_base,
  frete_km,
  markup_economico,
  markup_intermediario,
  markup_premium
) VALUES (
  180.00,
  120.00,
  250.00,
  80.00,
  45.00,
  800.00,
  2.50,
  1.40,
  1.70,
  2.20
);

-- Inserir contador inicial
INSERT INTO protocol_counter (counter) VALUES (0);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_simulations_token ON simulations(token);
CREATE INDEX IF NOT EXISTS idx_simulations_lead_id ON simulations(lead_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON simulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
