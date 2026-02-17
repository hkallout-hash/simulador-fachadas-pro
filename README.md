# 🏢 Simulador de Fachadas Pro

Aplicativo SaaS Full-Stack para simulação de fachadas comerciais com ACM, letreiro, iluminação e orçamento automático.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Auth + Database + Storage)
- **Canvas API** (Renderização)

## 📋 Funcionalidades

### Para Clientes

1. **Upload de Imagem** - Envie fotos da fachada atual (JPG/PNG/HEIC)
2. **Seleção de Área** - Marque interativamente a área da fachada
3. **Medição Remota**
   - Método de Referência: marque porta/janela e informe tamanho real
   - Método Manual: digite largura e altura diretamente
4. **Fotos de Validação** - 1 a 3 fotos extras dependendo da confiança da medição
5. **Configuração de Design**
   - Cor e acabamento do ACM
   - Texto, cor, material e espessura do letreiro
   - Tipo de iluminação (backlight, frontal, neon)
   - Upload de logo opcional
   - Modo noturno para visualização
6. **Geração de Simulações** - 3 variações automáticas em alta qualidade
7. **Captura de Lead** - Dados do cliente para orçamento
8. **Resultado Final**
   - Visualização antes/depois
   - 3 variações lado a lado
   - Resumo técnico completo
   - Orçamento em 3 faixas (Econômico, Intermediário, Premium)
   - Protocolo único
   - Compartilhamento via WhatsApp

### Para Administradores

- Dashboard com todas as simulações
- Visualização detalhada de cada projeto
- Dados do cliente e medidas
- Quantitativos e preços
- Exportação para CSV
- Cópia rápida de resumos

## 📐 Cálculos Automáticos

### Medição Remota

```typescript
pixels_per_meter = referencia_pixels / largura_real_metros
largura_m = bbox_pixels / pixels_per_meter
altura_m = bbox_pixels / pixels_per_meter
area_m2 = largura_m * altura_m
```

### Quantitativos

- **ACM**: largura × altura (m²)
- **Perímetro**: 2 × (largura + altura)
- **Letreiro Linear**: caracteres × altura_letra × 0.6
- **LED**: depende do tipo de iluminação
  - Backlight: perímetro total
  - Frontal: spots a cada 1.2m
  - Neon: metragem linear do letreiro

### Precificação

```typescript
custo_base = 
  (acm_m2 × preço_acm) +
  (acm_m2 × estrutura) +
  (linear × preço_letra) +
  (led × preço_led) +
  instalacao +
  logistica

preco_final = custo_base × markup
```

**Regras Automáticas:**
- Confiança BAIXA: -5% markup
- Altura > 4m: +10%
- Altura > 6m (instalação difícil): +12%
- Fora do estado: +8%

## 🗄️ Estrutura do Banco de Dados

### Tabela: leads
```sql
- id (UUID)
- nome (TEXT)
- whatsapp (TEXT)
- cidade (TEXT)
- cep (TEXT)
- segmento (TEXT)
- prazo (TEXT)
- created_at (TIMESTAMP)
```

### Tabela: simulations
```sql
- id (UUID)
- token (TEXT UNIQUE)
- lead_id (UUID FK)
- protocol (TEXT)
- original_image_url (TEXT)
- result_urls (TEXT[])
- bbox (JSONB)
- reference_box (JSONB)
- reference_real_width_m (DECIMAL)
- derived_width_m (DECIMAL)
- derived_height_m (DECIMAL)
- derived_area_m2 (DECIMAL)
- confidence (TEXT)
- validation_urls (TEXT[])
- validation_video_url (TEXT)
- acm_config (JSONB)
- letreiro_config (JSONB)
- iluminacao_config (JSONB)
- logo_url (TEXT)
- acm_m2 (DECIMAL)
- perimeter_m (DECIMAL)
- letters_linear_m (DECIMAL)
- led_m (DECIMAL)
- spots_qty (INTEGER)
- price_economico (DECIMAL)
- price_intermediario (DECIMAL)
- price_premium (DECIMAL)
- summary_text (TEXT)
- created_at (TIMESTAMP)
```

### Tabela: pricing_config
```sql
- id (UUID)
- acm_m2 (DECIMAL)
- estrutura_m2 (DECIMAL)
- letra_linear_m (DECIMAL)
- led_m (DECIMAL)
- spot_unit (DECIMAL)
- instalacao_base (DECIMAL)
- frete_km (DECIMAL)
- markup_economico (DECIMAL)
- markup_intermediario (DECIMAL)
- markup_premium (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: protocol_counter
```sql
- id (UUID)
- counter (INTEGER)
- updated_at (TIMESTAMP)
```

## 🛠️ Configuração

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd webapp
```

### 2. Instale Dependências

```bash
npm install
```

### 3. Configure Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Crie bucket de storage chamado `simulacoes` (público)
3. Execute a migration SQL em `supabase/migrations/0001_initial_schema.sql`
4. Copie as credenciais para `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
RENDER_API_URL=
```

### 4. Rode o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
webapp/
├── app/
│   ├── simular/
│   │   └── page.tsx           # Wizard de 8 passos
│   ├── resultado/[token]/
│   │   └── page.tsx           # Página de resultado
│   ├── admin/
│   │   └── page.tsx           # Dashboard admin
│   ├── api/
│   │   ├── render/
│   │   │   └── route.ts       # API de renderização
│   │   ├── draft/
│   │   │   └── route.ts       # Salvar simulação inicial
│   │   └── finalize/
│   │       └── route.ts       # Finalizar com lead e preços
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   ├── measurements.ts        # Cálculos de medidas
│   ├── pricing.ts             # Precificação
│   └── render.ts              # Renderização Canvas
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
└── package.json
```

## 🎨 Fluxo do Usuário

1. Landing page → Botão "Começar Simulação"
2. **Passo 1**: Upload da imagem
3. **Passo 2**: Marcar área com mouse
4. **Passo 3**: Escolher método de medição e calcular
5. **Passo 4**: Upload de fotos de validação
6. **Passo 5**: Configurar design (ACM, letreiro, iluminação, logo)
7. **Passo 6**: Gerar 3 simulações
8. **Passo 7**: Preencher dados pessoais
9. **Passo 8**: Ver resultado final com protocolo
10. Compartilhar via WhatsApp ou imprimir

## 🔒 Segurança

- Bucket Supabase Storage configurado como público
- Row Level Security (RLS) habilitado nas tabelas
- Validação de tipos no TypeScript
- Sanitização de inputs

## 📊 Valores Padrão de Precificação

```typescript
{
  acm_m2: R$ 180,00
  estrutura_m2: R$ 120,00
  letra_linear_m: R$ 250,00
  led_m: R$ 80,00
  spot_unit: R$ 45,00
  instalacao_base: R$ 800,00
  frete_km: R$ 2,50
  markup_economico: 1.40 (40%)
  markup_intermediario: 1.70 (70%)
  markup_premium: 2.20 (120%)
}
```

## 🚀 Deploy para Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard da Vercel
```

## 🎯 Features Futuras

- [ ] Integração com API de renderização externa
- [ ] Suporte a mais tipos de materiais (vidro, madeira)
- [ ] Exportação de projeto para DWG/PDF
- [ ] Sistema de autenticação para clientes
- [ ] Histórico de simulações
- [ ] Integração com CRM
- [ ] Assinatura digital de contratos
- [ ] Pagamento online

## 📝 Licença

Propriedade privada. Todos os direitos reservados.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato via WhatsApp.

---

**Desenvolvido com ❤️ usando Next.js 14 + TypeScript + Supabase**
