# 🚀 EXECUTAR MIGRATION - Guia Rápido

## ⚡ Passo a Passo

### 1. Abrir Supabase SQL Editor

1. Acesse: **https://sb.nova-acropole.org.br**
2. Faça login (se necessário)
3. No menu lateral esquerdo, clique em **"SQL Editor"**
4. Clique em **"New query"** (botão no canto superior direito)

### 2. Copiar SQL

Abra o arquivo:
```
supabase/migrations/20260206_add_payment_proof_to_enrollments.sql
```

**CTRL+A** (selecionar tudo) → **CTRL+C** (copiar)

### 3. Colar e Executar

1. No SQL Editor do Supabase, cole o SQL (**CTRL+V**)
2. Clique em **"Run"** (ou pressione **CTRL+ENTER**)

### 4. Verificar Sucesso

Você deve ver esta mensagem no final:

```
==================================================
PAYMENT PROOF SUPPORT - INSTALAÇÃO CONCLUÍDA!
==================================================

Colunas adicionadas:
  - inscricoes_modalidades.payment_proof_url
  - inscricoes_modalidades.payment_proof_uploaded_at

Storage Bucket criado:
  - payment-proofs (privado, max 5MB)
  - Formatos: JPG, PNG, PDF

View atualizada:
  - vw_inscricoes_atletas (agora inclui payment_proof_url)

RLS Policies configuradas:
  ✓ Usuários podem upload próprios comprovantes
  ✓ Usuários podem ver próprios comprovantes
  ✓ Admins podem ver todos os comprovantes
  ✓ Usuários podem deletar próprios comprovantes
```

---

## ✅ O Que o SQL Faz

1. **Adiciona 2 colunas** em `inscricoes_modalidades`:
   - `payment_proof_url` (URL do comprovante)
   - `payment_proof_uploaded_at` (data/hora upload)

2. **Cria bucket Storage** `payment-proofs`:
   - Privado (só donos e admins)
   - Limite: 5MB
   - Formatos: JPG, PNG, PDF

3. **Atualiza view** `vw_inscricoes_atletas`:
   - Inclui as novas colunas

4. **Configura 4 RLS policies** no Storage:
   - Users upload próprios comprovantes
   - Users veem próprios comprovantes
   - Admins veem todos
   - Users deletam próprios comprovantes

---

## 🔍 Verificar Instalação

Execute esta query no SQL Editor para confirmar:

```sql
-- Verificar colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inscricoes_modalidades' 
AND column_name LIKE 'payment%';

-- Verificar bucket
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'payment-proofs';
```

**Resultado esperado:**
- 2 colunas: `payment_proof_url` (text), `payment_proof_uploaded_at` (timestamp)
- 1 bucket: `payment-proofs` (public=false, limit=5242880)

---

## 🎯 Próximos Passos

Após executar a migration com sucesso:

1. ✅ Migration executada
2. ✅ Dependencies instaladas (`npm install`)
3. ✅ Capacitor sincronizado (`npm run cap:sync`)
4. ✅ Build completo

**AGORA VOCÊ PODE**:
- Abrir Android Studio: `npm run cap:open:android`
- Ou Xcode (iOS): `npm run cap:open:ios`
- **Testar em dispositivo físico!** 📱

---

## ⚠️ Troubleshooting

**Erro: "relation does not exist"**
- A tabela `inscricoes_modalidades` não existe
- Verifique se está no projeto correto

**Erro: "storage.buckets already exists"**
- Normal se bucket já existe
- A migration usa `ON CONFLICT DO UPDATE`

**Erro: "policy already exists"**
- Normal se políticas já existem  
- A migration faz `DROP POLICY IF EXISTS` antes

---

## 📚 Arquivos Relacionados

- **Migration SQL**: [20260206_add_payment_proof_to_enrollments.sql](file:///c:/Users/jrpmc/Documents/_SkyVidya/repos/olimpia-manager-na/supabase/migrations/20260206_add_payment_proof_to_enrollments.sql)
- **Walkthrough Completo**: [walkthrough.md](file:///C:/Users/jrpmc/.gemini/antigravity/brain/ff28a257-272d-4836-a567-04082d895840/walkthrough.md)
- **Task Checklist**: [task.md](file:///C:/Users/jrpmc/.gemini/antigravity/brain/ff28a257-272d-4836-a567-04082d895840/task.md)
