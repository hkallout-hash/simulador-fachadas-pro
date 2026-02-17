# 🚀 Guia Rápido de Uso

## Para Desenvolvedores

### Setup Local (3 minutos)

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd webapp

# 2. Instale dependências
npm install

# 3. Configure Supabase
# Siga o arquivo SUPABASE_SETUP.md para configurar

# 4. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 5. Rode o projeto
npm run dev

# 6. Acesse
# http://localhost:3000
```

### Estrutura de Arquivos Principais

```
webapp/
├── app/
│   ├── simular/page.tsx          # ⭐ Wizard principal (8 passos)
│   ├── resultado/[token]/page.tsx # ⭐ Página de resultado
│   ├── admin/page.tsx             # ⭐ Dashboard admin
│   └── api/                       # APIs REST
├── lib/
│   ├── supabase.ts               # 🔧 Cliente Supabase
│   ├── measurements.ts           # 🔧 Cálculos de medidas
│   ├── pricing.ts                # 🔧 Precificação
│   └── render.ts                 # 🔧 Renderização Canvas
└── supabase/
    └── migrations/               # 📦 Schema do banco
```

### Customização

#### Alterar Valores de Precificação

1. Acesse Supabase SQL Editor
2. Execute:

```sql
UPDATE pricing_config
SET 
  acm_m2 = 200.00,           -- Novo preço por m² de ACM
  estrutura_m2 = 150.00,     -- Novo preço por m² de estrutura
  letra_linear_m = 300.00,   -- Novo preço por metro linear de letra
  led_m = 100.00,            -- Novo preço por metro de LED
  markup_economico = 1.5,    -- Novo markup econômico (50%)
  markup_intermediario = 1.8, -- Novo markup intermediário (80%)
  markup_premium = 2.5       -- Novo markup premium (150%)
WHERE id = (SELECT id FROM pricing_config ORDER BY created_at DESC LIMIT 1);
```

#### Alterar Cores Disponíveis

Edite `app/simular/page.tsx`:

```typescript
// ACM cores
<select>
  <option value="branco">Branco</option>
  <option value="preto">Preto</option>
  <option value="sua-nova-cor">Sua Nova Cor</option>
</select>

// Também adicione em lib/render.ts:
const colors = {
  // ... cores existentes
  'sua-nova-cor': { v1: '#HEX1', v2: '#HEX2', v3: '#HEX3' }
}
```

#### Alterar WhatsApp de Contato

Em `app/resultado/[token]/page.tsx`:

```typescript
const phone = '5511999999999' // Seu número com DDI + DDD
```

---

## Para Usuários Finais (Clientes)

### Como Usar o Simulador

#### Passo 1: Upload da Imagem
1. Acesse o simulador
2. Clique para selecionar uma foto da fachada
3. Aguarde o processamento automático

**Dica:** Use fotos:
- ✅ De frente para a fachada
- ✅ Com boa iluminação
- ✅ Sem obstáculos na frente

#### Passo 2: Marcar Área
1. Clique e arraste o mouse sobre a fachada
2. Marque a área onde deseja o ACM e letreiro
3. Clique em "Próximo"

#### Passo 3: Medição
Escolha um método:

**Opção A: Referência (Recomendado)**
1. Clique em "Objeto de Referência"
2. Clique em uma porta ou janela
3. Digite a largura real (ex: 0.90 para porta padrão)
4. Clique em "Calcular Medidas"

**Opção B: Manual**
1. Clique em "Medida Manual"
2. Digite largura e altura em metros
3. Clique em "Calcular Medidas"

#### Passo 4: Fotos de Validação
1. Tire 1-3 fotos extras da fachada
2. Fotos de diferentes ângulos
3. Inclua elementos de referência
4. Se medição foi BAIXA, grave um vídeo rápido

#### Passo 5: Design
Configure sua fachada ideal:

**ACM:**
- Cor: Branco, Preto, Cinza, Azul, etc.
- Acabamento: Liso ou Escovado

**Letreiro:**
- Digite o texto (nome da empresa)
- Escolha cor e material
- 3D ou plana

**Iluminação:**
- Backlight (LED atrás do painel)
- Frontal (Spots)
- Neon (LED nas letras)
- Marque "Modo Noturno" para ver simulação à noite

**Logo (opcional):**
- Envie o logo da empresa

#### Passo 6: Ver Simulações
1. Clique em "Gerar Simulações"
2. Aguarde ~30 segundos
3. Veja 3 variações diferentes
4. Escolha sua favorita

#### Passo 7: Seus Dados
Preencha:
- Nome completo
- WhatsApp
- Cidade e CEP
- Segmento do negócio
- Prazo desejado

#### Passo 8: Resultado
✅ Veja:
- Comparação antes/depois
- 3 variações lado a lado
- Resumo técnico completo
- 3 faixas de preço

🎯 Ações:
- Compartilhar no WhatsApp
- Imprimir ou salvar PDF
- Guardar protocolo único

---

## Para Administradores

### Acessar Dashboard

1. Acesse: `https://seu-site.com/admin`
2. Veja todas as simulações

### Gerenciar Leads

**Visualizar Detalhes:**
1. Clique em qualquer linha da tabela
2. Veja:
   - Fotos e simulações
   - Dados do cliente
   - Medidas e quantitativos
   - Preços calculados

**Ações Rápidas:**
- 📋 Copiar resumo completo
- 🔗 Abrir página pública
- 📊 Exportar tudo para CSV

### Exportar Dados

1. Clique em "Exportar CSV"
2. Arquivo será baixado com:
   - Protocolos
   - Dados dos clientes
   - Medidas e quantitativos
   - Preços em 3 faixas

### Filtros e Busca

**Em desenvolvimento:**
- Filtrar por data
- Filtrar por cidade
- Buscar por protocolo
- Filtrar por faixa de preço

---

## Perguntas Frequentes (FAQ)

### Como funciona a medição remota?

O sistema usa proporção baseada em objeto de referência:
```
pixels_por_metro = pixels_referencia / largura_real
largura_fachada = pixels_fachada / pixels_por_metro
```

### Por que tenho que enviar fotos de validação?

Fotos extras ajudam o técnico a:
- Validar as medidas calculadas
- Identificar obstáculos
- Planejar instalação
- Fazer orçamento mais preciso

### Quanto custa?

O simulador é **100% gratuito**.

Você recebe 3 faixas de preço:
- 💚 Econômico: Materiais padrão
- 💙 Intermediário: Qualidade superior
- 💜 Premium: Top de linha

### As imagens são realistas?

As simulações são **aproximadas**. O resultado real depende de:
- Iluminação do local
- Tipo de instalação
- Acabamento escolhido
- Vistoria técnica presencial

### Posso alterar depois?

Sim! Cada simulação tem um **protocolo único**.

Para fazer alterações:
1. Entre em contato via WhatsApp
2. Informe o protocolo
3. Solicite ajustes

### Quanto tempo para receber orçamento?

- ⚡ Pré-orçamento automático: **Imediato**
- 📝 Orçamento detalhado: **24-48h** após análise técnica

### Como funciona a instalação?

Após aprovação do orçamento:
1. ✅ Vistoria técnica presencial
2. ✅ Projeto executivo
3. ✅ Produção dos materiais
4. ✅ Instalação profissional
5. ✅ Testes e acabamentos

Prazo médio: **15-30 dias**

---

## Suporte

💬 **WhatsApp:** (11) 99999-9999  
📧 **Email:** contato@example.com  
🌐 **Site:** https://seu-site.com

---

**Desenvolvido com ❤️ para transformar fachadas**
