
# Configuração para Supabase Auto-hospedado

## Problema: Erro de Confirmação por Email

Para resolver o erro "Error sending confirmation email" em instâncias auto-hospedadas do Supabase, siga estas etapas:

## 1. Executar SQL da Trigger

Execute o SQL no arquivo `supabase/migrations/20241220_fix_user_registration_trigger.sql` no SQL Editor do Supabase.

## 2. Configurar Variáveis de Ambiente

Adicione estas variáveis ao seu `docker-compose.yml` ou arquivo `.env`:

```yaml
# No serviço gotrue do docker-compose.yml
environment:
  - GOTRUE_MAILER_AUTOCONFIRM=true
  - GOTRUE_DISABLE_SIGNUP=false
  - GOTRUE_MAILER_TEMPLATES_CONFIRMATION="<html><body>Conta confirmada automaticamente.</body></html>"
```

Ou no arquivo `.env`:

```bash
GOTRUE_MAILER_AUTOCONFIRM=true
GOTRUE_DISABLE_SIGNUP=false
GOTRUE_MAILER_TEMPLATES_CONFIRMATION="<html><body>Conta confirmada automaticamente.</body></html>"
```

## 3. Reiniciar Supabase

```bash
docker-compose down
docker-compose up -d
```

## 4. Alternativa: Configurar SMTP (Opcional)

Se preferir manter emails de confirmação, configure um provedor SMTP:

```yaml
environment:
  - GOTRUE_SMTP_HOST=smtp.gmail.com
  - GOTRUE_SMTP_PORT=587
  - GOTRUE_SMTP_USER=seu-email@gmail.com
  - GOTRUE_SMTP_PASS=sua-senha-de-app
  - GOTRUE_MAILER_AUTOCONFIRM=false
```

## 5. Testar

Após reiniciar, teste o cadastro de usuário. O sistema deve:
- Criar usuário em `auth.users`
- Criar registro em `public.usuarios` via trigger
- Permitir login imediato sem confirmação por email

## Verificação

Execute no SQL Editor para verificar se funcionou:

```sql
-- Verificar usuários criados
SELECT id, email, email_confirmed_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Verificar registros na tabela pública
SELECT id, email, nome_completo, confirmado FROM public.usuarios ORDER BY data_criacao DESC LIMIT 5;
```
