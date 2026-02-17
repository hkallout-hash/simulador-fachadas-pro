# Deploy para Vercel

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Projeto Supabase configurado (veja `SUPABASE_SETUP.md`)
3. Repositório Git (GitHub, GitLab ou Bitbucket)

## Passo a Passo

### 1. Push para GitHub

```bash
# Se ainda não tem repositório remoto
git remote add origin https://github.com/seu-usuario/simulador-fachadas.git
git branch -M main
git push -u origin main
```

### 2. Importar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New"** → **"Project"**
3. Selecione seu repositório do GitHub
4. Clique em **"Import"**

### 3. Configurar Variáveis de Ambiente

Na tela de configuração do projeto, clique em **"Environment Variables"** e adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
RENDER_API_URL=
```

**Importante:** Use os valores reais do seu projeto Supabase.

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Quando finalizar, você receberá a URL do projeto: `https://seu-projeto.vercel.app`

### 5. Configurar Domínio Customizado (Opcional)

1. No dashboard da Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruções

## Verificar Deploy

Após o deploy, teste:

1. **Homepage**: `https://seu-projeto.vercel.app`
2. **Simulador**: `https://seu-projeto.vercel.app/simular`
3. **Admin**: `https://seu-projeto.vercel.app/admin`

## Problemas Comuns

### Erro: Missing Supabase environment variables

**Solução:** Verifique se você adicionou as variáveis de ambiente corretamente no dashboard da Vercel.

### Erro: Failed to upload image

**Solução:**
- Verifique se o bucket `simulacoes` existe no Supabase
- Verifique se o bucket está configurado como PUBLIC
- Verifique as Storage Policies

### Erro: CORS blocked

**Solução:** No Supabase, adicione seu domínio Vercel em:
- Project Settings → API → Allowed Origins
- Adicione `https://seu-projeto.vercel.app`

## Deploy Automático

A Vercel faz deploy automático a cada push:

```bash
# Fazer alterações
git add .
git commit -m "Sua mensagem"
git push origin main

# Deploy automático será iniciado
```

## Variáveis de Ambiente em Produção

Para atualizar variáveis de ambiente:

1. Vá em **Settings** → **Environment Variables**
2. Edite ou adicione variáveis
3. **Importante:** Clique em **"Redeploy"** para aplicar

## Logs e Monitoramento

Acesse os logs em tempo real:

1. Dashboard da Vercel → Seu Projeto
2. Clique em **"Deployments"**
3. Selecione um deploy
4. Clique em **"Runtime Logs"**

## Comandos Úteis

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy direto do terminal
vercel

# Deploy em produção
vercel --prod

# Ver logs
vercel logs seu-projeto

# Ver informações do projeto
vercel inspect seu-projeto
```

## Configurações Avançadas

### Build Settings (já configurado automaticamente)

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Node.js Version

A Vercel usa Node.js 18.x por padrão. Para especificar:

```json
// package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Performance

### Otimizações Automáticas da Vercel

- ✅ CDN global
- ✅ Cache inteligente
- ✅ Compressão automática
- ✅ Image optimization
- ✅ Edge Functions

### Métricas

Acesse métricas em **Analytics** no dashboard:
- Page views
- Load time
- Core Web Vitals
- Conversions

## Rollback

Se algo der errado, você pode voltar para versão anterior:

1. Dashboard → **Deployments**
2. Encontre o deploy anterior
3. Clique em **"..."** → **"Promote to Production"**

## Custos

**Free Tier (Hobby):**
- Bandwidth: 100 GB/mês
- Build executions: 6000 minutos/mês
- Serverless function executions: 100 GB-Hrs/mês

Para este projeto, o Free Tier é suficiente para:
- ~10.000 simulações/mês
- Tráfego médio

## Next Steps

Após deploy bem-sucedido:

1. ✅ Teste todas as funcionalidades
2. ✅ Configure Google Analytics (opcional)
3. ✅ Configure Sentry para error tracking (opcional)
4. ✅ Configure custom domain
5. ✅ Compartilhe o link com clientes

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Suporte: https://vercel.com/support
- Status: https://www.vercel-status.com

---

🚀 **Seu Simulador de Fachadas Pro está no ar!**
