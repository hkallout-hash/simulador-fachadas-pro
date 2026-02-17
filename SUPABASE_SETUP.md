# Instruções de Setup do Supabase

## 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta ou faça login
4. Clique em "New Project"
5. Preencha:
   - Nome: `simulador-fachadas`
   - Database Password: (guarde em local seguro)
   - Region: escolha a mais próxima
   - Pricing Plan: Free

## 2. Configurar Storage

1. No painel lateral, clique em **Storage**
2. Clique em **Create a new bucket**
3. Nome: `simulacoes`
4. **Marque como PUBLIC** ✅
5. Clique em **Create bucket**

### Estrutura de Pastas (criar manualmente ou automaticamente via código):

```
simulacoes/
├── originals/       # Imagens originais dos clientes
├── rendered/        # Simulações geradas
├── validation/      # Fotos de validação
└── logos/           # Logos enviados pelos clientes
```

## 3. Executar Migrations

1. No painel lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Cole todo o conteúdo do arquivo `supabase/migrations/0001_initial_schema.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Verifique se apareceu "Success. No rows returned"

## 4. Copiar Credenciais

1. No painel lateral, clique em **Project Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
RENDER_API_URL=
```

## 6. Verificar Configuração

Execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Deve retornar:
-- leads
-- simulations
-- pricing_config
-- protocol_counter

-- Verificar configuração padrão inserida
SELECT * FROM pricing_config;
SELECT * FROM protocol_counter;
```

## 7. Políticas de Segurança (RLS)

Por padrão, as tabelas estão sem políticas. Para produção, adicione:

```sql
-- Permitir leitura pública de simulações (para compartilhamento)
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de simulações"
ON simulations FOR SELECT
USING (true);

-- Permitir inserção pública de leads e simulações
CREATE POLICY "Permitir inserção pública"
ON simulations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir inserção de leads"
ON leads FOR INSERT
WITH CHECK (true);

-- Admin tem acesso total (adicione autenticação depois)
CREATE POLICY "Admin acesso total"
ON simulations FOR ALL
USING (auth.role() = 'authenticated');
```

## 8. Storage Policies

```sql
-- Permitir upload público no bucket simulacoes
CREATE POLICY "Permitir upload público"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'simulacoes');

-- Permitir leitura pública
CREATE POLICY "Permitir leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'simulacoes');
```

## 9. Testar Conexão

No seu projeto Next.js, rode:

```bash
npm run dev
```

Acesse `http://localhost:3000/simular` e tente fazer upload de uma imagem.

Se funcionar, sua configuração está correta! ✅

## Problemas Comuns

### Erro: "Failed to upload"
- Verifique se o bucket `simulacoes` está PUBLIC
- Verifique as Storage Policies

### Erro: "Failed to save simulation"
- Verifique se as migrations foram executadas
- Verifique as credenciais no `.env.local`

### Erro: "CORS blocked"
- Adicione sua URL em Project Settings → API → Allowed Origins
- Durante desenvolvimento, adicione `http://localhost:3000`

## URLs Úteis

- Dashboard: `https://app.supabase.com/project/seu-projeto`
- SQL Editor: `https://app.supabase.com/project/seu-projeto/sql`
- Storage: `https://app.supabase.com/project/seu-projeto/storage/buckets`
- API Docs: `https://app.supabase.com/project/seu-projeto/api`

---

✅ Após seguir todos os passos, o sistema estará pronto para uso!
