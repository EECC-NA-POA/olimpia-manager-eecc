# Push Notifications via PostgreSQL (sem Edge Functions)

Esta solução usa funções PostgreSQL + `pg_net` para enviar push notifications diretamente do banco de dados, sem necessidade de Edge Functions.

## Pré-requisitos

- Supabase auto-hospedado com extensão `pg_net` habilitada
- Service Account do Firebase (JSON)
- Acesso ao SQL Editor do Supabase

## Configuração Passo a Passo

### 1. Executar a Migration

No SQL Editor do Supabase, execute o conteúdo do arquivo:
```
supabase/migrations/20260205_push_notifications_pgnet.sql
```

Isso vai criar:
- Tabela `firebase_config` para armazenar credenciais
- Funções para enviar push notifications
- Triggers para envio automático

### 2. Gerar o Access Token do Firebase

Execute o script PowerShell:

```powershell
cd supabase
.\generate-firebase-token.ps1
```

Quando solicitado, forneça o caminho do arquivo JSON do Service Account do Firebase.

O script vai:
1. Gerar um JWT assinado
2. Trocar por um Access Token
3. Mostrar o SQL para configurar o banco

### 3. Executar o SQL Gerado

Copie o SQL gerado pelo script e execute no SQL Editor do Supabase.

Exemplo:
```sql
-- 1. Configurar dados do Firebase
UPDATE public.firebase_config SET
    project_id = 'olimpia-manager-b049d',
    client_email = 'firebase-adminsdk-xxx@olimpia-manager-b049d.iam.gserviceaccount.com',
    private_key = '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
WHERE id = 1;

-- 2. Atualizar o Access Token
SELECT update_firebase_token('ya29.c.c0ASRK0G...', 3600);

-- 3. Verificar configuração
SELECT project_id, client_email, token_expires_at FROM public.firebase_config;
```

### 4. Testar o Envio

```sql
-- Testar envio para um usuário específico
SELECT * FROM send_push_notification(
    'USER_UUID_AQUI',
    'Título do Teste',
    'Corpo da mensagem de teste',
    '{"key": "value"}'::jsonb
);

-- Criar uma notificação (dispara push automaticamente)
SELECT create_notification(
    'USER_UUID_AQUI',
    'general_announcement',
    'Nova Funcionalidade!',
    'Agora você recebe notificações push!'
);
```

## Renovação do Token

**IMPORTANTE**: O Access Token do Firebase expira em **1 hora**. Você precisa renová-lo periodicamente.

### Opção A: Renovação Manual

Execute o script `generate-firebase-token.ps1` novamente e atualize o token no banco.

### Opção B: Cron Job (Recomendado)

Se você tem `pg_cron` habilitado, pode automatizar:

```sql
-- Criar job para renovar token a cada 50 minutos
-- NOTA: Isso requer um serviço externo para gerar novos tokens
SELECT cron.schedule(
    'renovar-firebase-token',
    '*/50 * * * *',
    $$ SELECT refresh_firebase_token(); $$
);
```

### Opção C: Script Agendado (Windows)

Crie uma tarefa agendada no Windows para executar o script a cada 50 minutos:

```powershell
# Agendar tarefa
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\caminho\generate-firebase-token.ps1 -ServiceAccountJsonPath C:\caminho\service-account.json"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 50)
Register-ScheduledTask -TaskName "RenovarFirebaseToken" -Action $action -Trigger $trigger
```

## Funções Disponíveis

### `send_push_notification(user_id, title, body, data)`
Envia push para um usuário específico.

```sql
SELECT * FROM send_push_notification(
    '123e4567-e89b-12d3-a456-426614174000',
    'Olá!',
    'Esta é uma mensagem de teste',
    '{"evento_id": "abc123"}'::jsonb
);
```

### `send_push_to_users(user_ids[], title, body, data)`
Envia push para múltiplos usuários.

```sql
SELECT * FROM send_push_to_users(
    ARRAY['user1-uuid', 'user2-uuid']::uuid[],
    'Aviso Importante',
    'Mensagem para todos'
);
```

### `send_push_broadcast(title, body, data)`
Envia push para TODOS os usuários com tokens ativos.

```sql
SELECT * FROM send_push_broadcast(
    'Manutenção Programada',
    'O sistema estará em manutenção amanhã das 10h às 12h'
);
```

### `create_notification(user_id, type, title, body, evento_id, data)`
Cria uma notificação no banco (dispara push automaticamente).

```sql
SELECT create_notification(
    '123e4567-e89b-12d3-a456-426614174000',
    'game_reminder',
    'Jogo em 1 hora!',
    'Prepare-se para o jogo contra Time X',
    'evento-uuid',
    '{"local": "Quadra 1"}'::jsonb
);
```

### `update_firebase_token(access_token, expires_in_seconds)`
Atualiza o access token do Firebase.

```sql
SELECT update_firebase_token('ya29.c.c0ASRK0G...', 3600);
```

## Troubleshooting

### Erro: "Firebase access_token não configurado ou expirado"
- Execute o script `generate-firebase-token.ps1` novamente
- Execute o SQL gerado para atualizar o token

### Erro: "Firebase project_id não configurado"
- Verifique se a tabela `firebase_config` está configurada corretamente
- Execute: `SELECT * FROM firebase_config;`

### Push não está sendo enviado
1. Verifique se o usuário tem tokens FCM ativos:
   ```sql
   SELECT * FROM push_tokens WHERE user_id = 'USER_UUID' AND is_active = true;
   ```

2. Verifique os logs do pg_net:
   ```sql
   SELECT * FROM net._http_response ORDER BY id DESC LIMIT 10;
   ```

3. Verifique se a extensão pg_net está habilitada:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```

### Verificar respostas do Firebase
```sql
-- Ver as últimas requisições HTTP
SELECT
    id,
    status_code,
    content,
    created
FROM net._http_response
ORDER BY created DESC
LIMIT 20;
```

## Segurança

- A tabela `firebase_config` contém credenciais sensíveis
- Não exponha essas funções publicamente
- Use `SECURITY DEFINER` para controlar acesso
- Considere criar uma role específica para push notifications
