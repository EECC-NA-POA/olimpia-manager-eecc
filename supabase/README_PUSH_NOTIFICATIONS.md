# Push Notifications - Quick Start

Sistema completo de **push notifications** usando Firebase Cloud Messaging (FCM) + Supabase.

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| **[GUIA_EXECUCAO.md](GUIA_EXECUCAO.md)** | 📖 Guia passo a passo para executar todo o setup (COMECE AQUI) |
| **[SETUP_TOKEN_RENEWAL.md](SETUP_TOKEN_RENEWAL.md)** | ⏰ Guia de configuração da renovação automática do token |
| **[PUSH_NOTIFICATIONS_PGNET.md](PUSH_NOTIFICATIONS_PGNET.md)** | 🔧 Documentação técnica da abordagem pg_net |

## 🚀 Quick Start

### 1. Executar Migration SQL

```sql
-- Copie TUDO de: supabase/migrations/00_EXECUTAR_PUSH_NOTIFICATIONS.sql
-- Cole no SQL Editor do Supabase e execute
```

### 2. Configurar Firebase Token

```powershell
cd supabase
.\generate-firebase-token.ps1
# Quando solicitado, forneça caminho do service-account.json
# Copie e execute o SQL gerado no Supabase
```

### 3. Configurar Renovação Automática

```powershell
.\setup-task-scheduler.ps1 `
    -ServiceAccountJsonPath "C:\caminho\para\service-account.json" `
    -SupabaseUrl "https://seu-projeto.supabase.co" `
    -SupabaseServiceRoleKey "sua-service-role-key"
```

### 4. Testar

```sql
-- No Supabase SQL Editor:
SELECT create_notification(
    'user-uuid',
    'general_announcement',
    'Teste de Push',
    'Sistema funcionando!',
    NULL,
    '{}'::jsonb
);

-- Verificar:
SELECT push_sent, push_sent_at 
FROM notifications 
ORDER BY created_at DESC LIMIT 1;
```

## 📁 Arquivos Principais

### Scripts PowerShell

| Script | Uso |
|--------|-----|
| `generate-firebase-token.ps1` | Gerar token manualmente (primeira vez ou sob demanda) |
| `renew-firebase-token.ps1` | Renovação automática (chamado pelo Task Scheduler) |
| `setup-task-scheduler.ps1` | Configurar renovação automática no Windows |

### Migration SQL

- `migrations/00_EXECUTAR_PUSH_NOTIFICATIONS.sql` - Cria todas as tabelas, funções e triggers

### Frontend (já implementado)

- `src/services/pushNotifications.ts` - Serviço de push
- `src/hooks/usePushNotifications.ts` - Hook React

## 🔑 Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| `push_tokens` | Tokens FCM dos dispositivos (user_id, fcm_token, platform) |
| `notifications` | Histórico de notificações enviadas (title, body, push_sent) |
| `firebase_config` | Configuração do Firebase (access_token, expires_at) |

## 🛠️ Funções SQL Disponíveis

```sql
-- Enviar para um usuário
SELECT * FROM send_push_notification(
    'user-uuid',
    'Título',
    'Mensagem',
    '{"key": "value"}'::jsonb
);

-- Enviar para múltiplos usuários
SELECT * FROM send_push_to_users(
    ARRAY['uuid1', 'uuid2']::uuid[],
    'Título',
    'Mensagem'
);

-- Broadcast (todos os usuários)
SELECT * FROM send_push_broadcast(
    'Aviso Geral',
    'Mensagem para todos'
);

-- Criar notificação (envia automaticamente via trigger)
SELECT create_notification(
    'user-uuid',
    'game_reminder',
    'Jogo em 30 min!',
    'Prepare-se',
    'evento-uuid',
    '{}'::jsonb
);
```

## ⚙️ Tipos de Notificação

| Tipo | Descrição | Navegação |
|------|-----------|-----------|
| `enrollment_confirmed` | Inscrição confirmada | `/m/events/{evento_id}` |
| `game_reminder` | Lembrete de jogo | `/m/events/{evento_id}` |
| `result_published` | Resultado publicado | `/m/events/{evento_id}` |
| `general_announcement` | Aviso geral | `/m/notifications` |

## 🔍 Monitoramento

### Verificar token válido

```sql
SELECT 
    token_expires_at,
    EXTRACT(EPOCH FROM (token_expires_at - now())) / 60 as minutos_restantes,
    CASE 
        WHEN token_expires_at > now() + interval '10 min' THEN '✓ OK'
        ELSE '⚠ VERIFICAR'
    END as status
FROM firebase_config;
```

### Ver últimas notificações

```sql
SELECT 
    created_at,
    type,
    title,
    push_sent,
    push_sent_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
```

### Verificar tarefa agendada

```powershell
Get-ScheduledTaskInfo -TaskName "Firebase Token Auto-Renewal"
Get-Content .\firebase-token-renewal.log -Tail 20
```

## 🔐 Segurança

**Arquivos sensíveis protegidos no `.gitignore`:**
- `firebase-service-account*.json`
- `supabase/firebase_token_*.txt`
- `supabase/firebase-renewal-config.json`
- `supabase/firebase-token-renewal.log`

**RLS ativado em todas as tabelas:**
- Usuários só acessam próprios tokens e notificações
- `firebase_config` acessível apenas via funções SECURITY DEFINER

## ❓ Troubleshooting

### Token expirado?

```powershell
cd supabase
.\generate-firebase-token.ps1
# Execute o SQL gerado
```

### Push não sendo enviado?

```sql
-- Ver logs do pg_net
SELECT status_code, created, content::text 
FROM net._http_response 
ORDER BY created DESC LIMIT 10;

-- Processar notificação manualmente
SELECT process_notification_push('notification-uuid');
```

### Tarefa agendada não roda?

```powershell
# Verificar status
Get-ScheduledTask -TaskName "Firebase Token Auto-Renewal"

# Executar manualmente
Start-ScheduledTask -TaskName "Firebase Token Auto-Renewal"

# Ver log
Get-Content .\firebase-token-renewal.log -Tail 50
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte o [GUIA_EXECUCAO.md](GUIA_EXECUCAO.md) completo
2. Verifique a seção de Troubleshooting
3. Revise os logs: `firebase-token-renewal.log`
4. Verifique queries no SQL Editor

---

**Status**: ✅ Sistema completo implementado e pronto para deploy  
**Abordagem**: pg_net com renovação automática via Task Scheduler  
**Intervalo de renovação**: 50 minutos (token expira em 60 minutos)
