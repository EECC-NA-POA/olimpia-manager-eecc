# Guia de Execução - Push Notifications Setup

Este guia apresenta **passo a passo** para executar a configuração completa do sistema de push notifications.

## 📋 Pré-requisitos Checklist

Antes de começar, certifique-se de ter:

- [ ] Projeto Firebase criado
- [ ] Android App configurado no Firebase Console (se usar Android)
- [ ] iOS App configurado no Firebase Console (se usar iOS)  
- [ ] Service Account JSON baixado do Firebase
- [ ] Acesso ao SQL Editor do Supabase
- [ ] URL do projeto Supabase
- [ ] Service Role Key do Supabase

---

## 🚀 Passo 1: Executar Migration SQL

### 1.1 Acessar SQL Editor

1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 1.2 Executar Migration

Copie **TODO** o conteúdo do arquivo:
```
c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase\migrations\00_EXECUTAR_PUSH_NOTIFICATIONS.sql
```

Cole no SQL Editor e clique em **Run**.

### 1.3 Verificar Sucesso

Você deve ver a mensagem final:
```
PUSH NOTIFICATIONS - INSTALAÇÃO CONCLUÍDA!
```

Execute a verificação:
```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('push_tokens', 'notifications', 'firebase_config');

-- Deve retornar 3 linhas
```

---

## 🔑 Passo 2: Configurar Credenciais do Firebase

### 2.1 Gerar Token Inicial

Abra o PowerShell como **Administrador** e execute:

```powershell
cd c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase

.\generate-firebase-token.ps1
```

Quando solicitado, forneça o caminho completo do Service Account JSON:
```
Caminho: C:\caminho\para\seu\firebase-service-account.json
```

### 2.2 Executar SQL Gerado

O script vai gerar SQL automaticamente. **Copie todo o SQL** (já está na área de transferência) e execute no SQL Editor do Supabase.

Exemplo do que será executado:
```sql
-- 1. Configurar dados do Firebase
UPDATE public.firebase_config SET
    project_id = 'seu-projeto-id',
    client_email = 'firebase-adminsdk-xxx@....iam.gserviceaccount.com',
    private_key = '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
WHERE id = 1;

-- 2. Atualizar o Access Token
SELECT update_firebase_token('ya29.c.c0ASRK0G...', 3600);

-- 3. Verificar configuração
SELECT
    project_id,
    client_email,
    ...
FROM public.firebase_config;
```

### 2.3 Verificar Token Configurado

Execute no SQL Editor:
```sql
SELECT 
    project_id,
    CASE WHEN access_token IS NOT NULL THEN 'Configurado ✓' ELSE 'NAO CONFIGURADO ✗' END as token_status,
    token_expires_at,
    CASE
        WHEN token_expires_at > now() THEN 'VALIDO ✓'
        ELSE 'EXPIRADO ✗'
    END as token_validity,
    EXTRACT(EPOCH FROM (token_expires_at - now())) / 60 as minutos_restantes
FROM public.firebase_config;
```

**Resultado esperado:**
- `token_status`: Configurado ✓
- `token_validity`: VALIDO ✓
- `minutos_restantes`: ~60

---

## ⏰ Passo 3: Configurar Renovação Automática

### Opção A: Setup Automático (Recomendado)

Execute no PowerShell como **Administrador**:

```powershell
cd c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase

.\setup-task-scheduler.ps1 `
    -ServiceAccountJsonPath "C:\caminho\para\firebase-service-account.json" `
    -SupabaseUrl "https://seu-projeto.supabase.co" `
    -SupabaseServiceRoleKey "sua-service-role-key-aqui"
```

> [!TIP]
> Substitua os valores pelos caminhos e credenciais reais!

O script vai:
1. Validar os parâmetros
2. Criar a tarefa agendada
3. Perguntar se deseja executar teste imediato
4. Mostrar logs da execução

### Opção B: Setup Manual

Siga o guia completo em:
```
c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase\SETUP_TOKEN_RENEWAL.md
```

### 3.1 Verificar Tarefa Criada

```powershell
Get-ScheduledTask -TaskName "Firebase Token Auto-Renewal"
```

### 3.2 Executar Teste Manual

```powershell
Start-ScheduledTask -TaskName "Firebase Token Auto-Renewal"

# Aguardar alguns segundos
Start-Sleep -Seconds 5

# Ver resultado
Get-ScheduledTaskInfo -TaskName "Firebase Token Auto-Renewal"
```

### 3.3 Verificar Log

```powershell
Get-Content c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase\firebase-token-renewal.log -Tail 20
```

---

## ✅ Passo 4: Teste End-to-End

### 4.1 Criar Usuário de Teste

No SQL Editor:
```sql
-- Listar usuários existentes
SELECT id, email FROM auth.users LIMIT 5;

-- Escolha um usuário para teste (copie o UUID)
```

### 4.2 Simular Registro de Token

```sql
-- Substitua USER_UUID pelo UUID real
INSERT INTO public.push_tokens (user_id, fcm_token, platform, device_info)
VALUES (
    'USER_UUID_AQUI',
    'FAKE_TOKEN_FOR_TESTING_DO_NOT_USE_IN_PRODUCTION',
    'android',
    '{"model": "Test Device", "os_version": "Android 14"}'::jsonb
);
```

### 4.3 Criar Notificação de Teste

```sql
-- Isso vai disparar o envio automático via trigger
SELECT create_notification(
    'USER_UUID_AQUI',
    'general_announcement',
    'Teste de Push Notification',
    'Se você está vendo isso, o sistema está funcionando!',
    NULL,
    '{"test": true}'::jsonb
);
```

### 4.4 Verificar Envio

```sql
-- Ver notificações criadas
SELECT id, type, title, push_sent, push_sent_at, created_at
FROM public.notifications
WHERE user_id = 'USER_UUID_AQUI'
ORDER BY created_at DESC
LIMIT 5;

-- Ver logs do pg_net
SELECT 
    id,
    status_code,
    created,
    content::text as response
FROM net._http_response
ORDER BY created DESC
LIMIT 5;
```

**Resultado esperado:**
- `push_sent`: true
- `push_sent_at`: preenchido com timestamp
- `status_code` no pg_net: 200 (se tudo ok) ou 40X/50X (se token fake não funcionou - normal!)

---

## 📱 Passo 5: Teste no Dispositivo Real

### 5.1 Compilar e Instalar App

```powershell
# No diretório do projeto
npm run cap:build
npm run cap:sync

# Android
npm run cap:open:android

# iOS
npm run cap:open:ios
```

### 5.2 Fazer Login no App

1. Abra o app no dispositivo físico
2. Faça login com usuário válido
3. **Aceite** a permissão de notificações quando solicitado

### 5.3 Verificar Token Registrado

No console do app, você deve ver:
```
Push registration success, token: ABC123...
FCM token saved successfully
```

No Supabase SQL Editor:
```sql
SELECT 
    user_id, 
    platform, 
    LEFT(fcm_token, 30) || '...' as token_preview,
    is_active, 
    created_at 
FROM public.push_tokens 
WHERE user_id = 'UUID_DO_USUARIO_LOGADO'
ORDER BY created_at DESC;
```

### 5.4 Enviar Notificação Real

```sql
-- Substitua USER_UUID pelo UUID do usuário logado no app
SELECT create_notification(
    'USER_UUID_DO_APP',
    'game_reminder',
    '⚽ Jogo em 30 minutos!',
    'Prepare-se para o jogo contra Time X',
    NULL, -- ou UUID de um evento real
    '{"type": "game_reminder", "priority": "high"}'::jsonb
);
```

### 5.5 Verificar Recebimento

**Se o app estiver em FOREGROUND:**
- Deve aparecer um toast in-app com título e mensagem

**Se o app estiver em BACKGROUND ou FECHADO:**
- Deve aparecer notificação do sistema
- Ao tocar, o app deve abrir

---

## 🔍 Passo 6: Monitoramento

### 6.1 Verificar Validade do Token Periodicamente

```sql
SELECT 
    project_id,
    token_expires_at,
    EXTRACT(EPOCH FROM (token_expires_at - now())) / 60 as minutos_ate_expirar,
    CASE
        WHEN token_expires_at > now() + interval '10 minutes' THEN '✓ OK'
        WHEN token_expires_at > now() THEN '⚠ EXPIRANDO EM BREVE'
        ELSE '✗ EXPIRADO'
    END as status
FROM public.firebase_config;
```

### 6.2 Monitorar Logs da Tarefa Agendada

```powershell
# Ver últimas 50 linhas do log
Get-Content c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase\firebase-token-renewal.log -Tail 50 -Wait
```

### 6.3 Verificar Histórico de Notificações

```sql
-- Estatísticas gerais
SELECT 
    DATE(created_at) as data,
    type,
    COUNT(*) as total,
    SUM(CASE WHEN push_sent THEN 1 ELSE 0 END) as enviadas,
    SUM(CASE WHEN read THEN 1 ELSE 0 END) as lidas
FROM public.notifications
WHERE created_at > now() - interval '7 days'
GROUP BY DATE(created_at), type
ORDER BY data DESC, type;
```

---

## 🛠️ Troubleshooting

### Problema: Token expira e não renova

**Diagnóstico:**
```powershell
Get-ScheduledTaskInfo -TaskName "Firebase Token Auto-Renewal"
```

**Soluções:**
1. Verificar se a tarefa está habilitada:
   ```powershell
   Get-ScheduledTask -TaskName "Firebase Token Auto-Renewal" | Select State
   ```
2. Executar manualmente:
   ```powershell
   Start-ScheduledTask -TaskName "Firebase Token Auto-Renewal"
   ```
3. Verificar logs de erro no arquivo `.log`

### Problema: Push não enviado (push_sent = false)

**Diagnóstico:**
```sql
-- Ver notificações pendentes
SELECT id, user_id, title, created_at
FROM public.notifications
WHERE push_sent = false
ORDER BY created_at;
```

**Soluções:**
1. Verificar se o token está válido (Passo 6.1)
2. Verificar se pg_net está funcionando:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```
3. Processar manualmente:
   ```sql
   SELECT process_notification_push('NOTIFICATION_UUID');
   ```

### Problema: App não recebe notificação

**Checklist:**
- [ ] Dispositivo físico (emuladores não recebem push real)
- [ ] Permissão de notificação concedida
- [ ] Token FCM registrado no banco (ver Passo 5.3)
- [ ] App configurado no Firebase Console
- [ ] `google-services.json` (Android) ou `GoogleService-Info.plist` (iOS) no projeto

---

## 📊 Queries Úteis

### Limpar tokens de teste

```sql
DELETE FROM public.push_tokens 
WHERE fcm_token LIKE 'FAKE_TOKEN%' OR fcm_token LIKE '%TEST%';
```

### Ver todos os usuários com push habilitado

```sql
SELECT DISTINCT
    u.email,
    pt.platform,
    pt.is_active,
    pt.created_at
FROM auth.users u
INNER JOIN public.push_tokens pt ON pt.user_id = u.id
WHERE pt.is_active = true
ORDER BY pt.created_at DESC;
```

### Enviar broadcast de teste

```sql
SELECT * FROM send_push_broadcast(
    '📢 Aviso Geral',
    'Esta é uma mensagem de teste para todos os usuários',
    '{"test": true}'::jsonb
);
```

### Desativar todos os tokens de um usuário

```sql
UPDATE public.push_tokens
SET is_active = false
WHERE user_id = 'USER_UUID';
```

---

## ✨ Próximos Passos

Após concluir todos os passos acima:

1. ✅ Integrar notificações nos fluxos de negócio do app
2. ✅ Criar triggers de notificação para eventos específicos:
   - Nova inscrição confirmada
   - Lembrete de jogo (30min antes)
   - Resultado publicado
3. ✅ Implementar lógica de badge count no app
4. ✅ Adicionar deep linking para navegação específica
5. ✅ Configurar notificações programadas (scheduled)

---

## 📚 Documentação de Referência

- [Implementation Plan](file:///C:/Users/jrpmc/.gemini/antigravity/brain/ff28a257-272d-4836-a567-04082d895840/implementation_plan.md)
- [Token Renewal Setup](file:///c:/Users/jrpmc/Documents/_SkyVidya/repos/olimpia-manager-na/supabase/SETUP_TOKEN_RENEWAL.md)
- [pg_net Documentation](file:///c:/Users/jrpmc/Documents/_SkyVidya/repos/olimpia-manager-na/supabase/PUSH_NOTIFICATIONS_PGNET.md)
- [Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
