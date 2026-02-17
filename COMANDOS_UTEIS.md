# 🛠️ Comandos Úteis

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Lint
npm run lint
```

## Git

```bash
# Ver status
git status

# Adicionar alterações
git add .

# Commit
git commit -m "Sua mensagem"

# Push para repositório
git push origin main

# Ver histórico
git log --oneline

# Criar branch
git checkout -b feature/nova-feature

# Voltar para main
git checkout main
```

## Supabase

```bash
# Ver logs em tempo real
# Acesse: Dashboard → Logs

# Backup do banco
# Dashboard → Database → Backups → Download

# Ver uso do Storage
# Dashboard → Storage → Usage
```

## Vercel

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Deploy em produção
vercel --prod

# Ver logs
vercel logs

# Listar projetos
vercel list

# Listar variáveis de ambiente
vercel env ls

# Adicionar variável
vercel env add NOME_VARIAVEL
```

## Debugging

```bash
# Ver logs do Next.js
# No terminal onde rodou npm run dev

# Limpar cache
rm -rf .next
npm run build

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Ver versão do Node
node --version

# Ver versão do npm
npm --version
```

## Database (Supabase SQL)

```sql
-- Ver todas simulações
SELECT * FROM simulations ORDER BY created_at DESC LIMIT 10;

-- Ver todos leads
SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;

-- Contar simulações por dia
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total
FROM simulations
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- Ver simulações com leads
SELECT 
  s.protocol,
  s.created_at,
  l.nome,
  l.cidade,
  s.price_intermediario
FROM simulations s
JOIN leads l ON s.lead_id = l.id
ORDER BY s.created_at DESC;

-- Média de preços
SELECT 
  AVG(price_economico) as media_economico,
  AVG(price_intermediario) as media_intermediario,
  AVG(price_premium) as media_premium
FROM simulations;

-- Atualizar preços
UPDATE pricing_config
SET 
  acm_m2 = 200.00,
  markup_economico = 1.5
WHERE id = (SELECT id FROM pricing_config LIMIT 1);

-- Deletar simulações antigas (>90 dias)
DELETE FROM simulations 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Ver uso de storage
SELECT 
  bucket_id,
  COUNT(*) as files,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as size_mb
FROM storage.objects
GROUP BY bucket_id;
```

## Testes Manuais

```bash
# 1. Testar upload de imagem
curl -X POST http://localhost:3000/api/draft \
  -H "Content-Type: application/json" \
  -d '{"original_image_url":"test.jpg"}'

# 2. Verificar build
npm run build
ls -lh .next

# 3. Testar em diferentes dispositivos
# Chrome DevTools → Responsive Mode
# Ou acesse de celular real na mesma rede
```

## Monitoramento

```bash
# Ver uso de memória
ps aux | grep node

# Ver processos Node
ps aux | grep "next-server"

# Matar processo na porta 3000
lsof -ti:3000 | xargs kill

# Ver tamanho do build
du -sh .next

# Ver dependências desatualizadas
npm outdated
```

## Backup

```bash
# Backup do código
tar -czf backup-$(date +%Y%m%d).tar.gz webapp/

# Backup do .env
cp .env.local .env.backup

# Backup do banco (via Supabase)
# Dashboard → Database → Backups
```

## Atualizações

```bash
# Atualizar Next.js
npm install next@latest react@latest react-dom@latest

# Atualizar todas dependências (cuidado!)
npm update

# Atualizar uma dependência específica
npm install @supabase/supabase-js@latest

# Ver dependências instaladas
npm list --depth=0
```

## Troubleshooting

```bash
# Erro: "Module not found"
rm -rf node_modules .next
npm install
npm run build

# Erro: "Port 3000 already in use"
lsof -ti:3000 | xargs kill
npm run dev

# Erro: "Failed to compile"
# Verifique sintaxe TypeScript
npm run lint

# Erro: Supabase connection
# Verifique .env.local
cat .env.local

# Erro: Build timeout na Vercel
# Aumente timeout ou otimize bundle
# vercel.json: { "builds": [{ "maxDuration": 60 }] }
```

## Performance

```bash
# Analisar bundle size
npm run build
# Veja "Route (app)" na saída

# Lighthouse (Chrome DevTools)
# F12 → Lighthouse → Generate Report

# Verificar dependencies peso
npx depcheck

# Analisar bundle (adicione ao package.json)
# "analyze": "ANALYZE=true npm run build"
```

## Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automáticas
npm audit fix

# Ver outdated packages
npm outdated

# Verificar .env não está no git
git status --ignored
```

## Produção

```bash
# Antes de deploy
npm run build
npm start
# Teste localmente

# Deploy Vercel
git push origin main
# Deploy automático

# Rollback (Vercel Dashboard)
# Deployments → Deploy anterior → Promote to Production

# Ver logs de produção
vercel logs --follow
```

## SQL Úteis para Admin

```sql
-- Dashboard: Total de simulações
SELECT COUNT(*) as total FROM simulations;

-- Dashboard: Simulações hoje
SELECT COUNT(*) 
FROM simulations 
WHERE DATE(created_at) = CURRENT_DATE;

-- Dashboard: Simulações por cidade
SELECT 
  l.cidade,
  COUNT(*) as total
FROM simulations s
JOIN leads l ON s.lead_id = l.id
GROUP BY l.cidade
ORDER BY total DESC;

-- Dashboard: Ticket médio
SELECT 
  AVG(price_intermediario) as ticket_medio
FROM simulations;

-- Dashboard: Leads por segmento
SELECT 
  segmento,
  COUNT(*) as total
FROM leads
GROUP BY segmento
ORDER BY total DESC;
```

---

💡 **Dica:** Salve este arquivo como referência rápida!
