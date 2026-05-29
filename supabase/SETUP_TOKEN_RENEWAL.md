# Setup Firebase Token Auto-Renewal via Windows Task Scheduler

Este documento explica como configurar a renovação automática do Firebase Access Token usando o Agendador de Tarefas do Windows.

## Pré-requisitos

- ✅ Windows com PowerShell 5.1+
- ✅ Service Account JSON do Firebase baixado
- ✅ Supabase URL e Service Role Key
- ✅ Migration SQL executada no Supabase

## Scripts Envolvidos

| Script | Descrição |
|--------|-----------|
| `generate-firebase-token.ps1` | Gera token manualmente (uso único ou sob demanda) |
| `renew-firebase-token.ps1` | Renovação automática (chamado pelo Task Scheduler) |
| `setup-task-scheduler.ps1` | Configura automaticamente o Task Scheduler |

---

## Opção 1: Configuração Automática

Execute o script de configuração que cria a tarefa agendada automaticamente:

```powershell
cd c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase

.\setup-task-scheduler.ps1 `
    -ServiceAccountJsonPath "C:\caminho\para\firebase-service-account.json" `
    -SupabaseUrl "https://seu-projeto.supabase.co" `
    -SupabaseServiceRoleKey "sua-service-role-key-aqui"
```

## Opção 2: Configuração Manual

### 1. Criar arquivo de configuração

Crie um arquivo `firebase-renewal-config.json` no diretório `supabase`:

```json
{
  "ServiceAccountJsonPath": "C:\\caminho\\para\\firebase-service-account.json",
  "SupabaseUrl": "https://seu-projeto.supabase.co",
  "SupabaseServiceRoleKey": "sua-service-role-key-aqui"
}
```

> [!CAUTION]
> **NUNCA comite este arquivo no Git!** Adicione ao `.gitignore`:
> ```
> supabase/firebase-renewal-config.json
> supabase/firebase-token-*.txt
> supabase/**/firebase-*.log
> ```

### 2. Abrir Agendador de Tarefas

1. Pressione `Win + R`
2. Digite `taskschd.msc` e pressione Enter
3. Clique em "Criar Tarefa..." no menu lateral direito

### 3. Configurar a Tarefa

#### Aba "Geral":
- **Nome**: `Firebase Token Auto-Renewal`
- **Descrição**: `Renova automaticamente o Access Token do Firebase a cada 50 minutos`
- ☑ **Executar estando o usuário conectado ou não**
- ☑ **Executar com privilégios mais altos**
- **Configurar para**: Windows 10

#### Aba "Gatilhos":
1. Clique em "Novo..."
2. **Iniciar a tarefa**: Em uma agenda
3. **Configurações**:
   - **Diariamente**
   - Repetir a cada: **50 minutos**
   - Durante: **Indefinidamente**
4. ☑ **Habilitado**

#### Aba "Ações":
1. Clique em "Novo..."
2. **Ação**: Iniciar um programa
3. **Programa/script**: `powershell.exe`
4. **Adicionar argumentos**:
```powershell
-ExecutionPolicy Bypass -File "c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase\renew-firebase-token.ps1" -ServiceAccountJsonPath "C:\caminho\para\service-account.json" -SupabaseUrl "https://seu-projeto.supabase.co" -SupabaseServiceRoleKey "sua-service-role-key"
```

> [!TIP]
> Substitua os valores pelos caminhos e credenciais reais do seu projeto.

#### Aba "Condições":
- ☐ **Iniciar a tarefa apenas se o computador estiver conectado à energia CA** (desmarcar)
- ☑ **Iniciar somente se a seguinte conexão de rede estiver disponível**: Qualquer conexão

#### Aba "Configurações":
- ☑ **Permitir que a tarefa seja executada sob demanda**
- ☑ **Se a tarefa falhar, reiniciar a cada**: 10 minutos
- **Tentar reiniciar até**: 3 vezes

### 4. Salvar e Testar

1. Clique em OK para salvar
2. Insira suas credenciais do Windows se solicitado
3. **Teste manual**:
   - Clique com botão direito na tarefa
   - Selecione "Executar"
   - Verifique o log em: `supabase\firebase-token-renewal.log`

---

## Verificação

### Verificar se a tarefa está rodando:

```powershell
Get-ScheduledTask -TaskName "Firebase Token Auto-Renewal"
```

### Verificar último resultado:

```powershell
Get-ScheduledTaskInfo -TaskName "Firebase Token Auto-Renewal"
```

### Verificar logs:

```powershell
Get-Content c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase\firebase-token-renewal.log -Tail 50
```

### Verificar token no Supabase:

Execute no SQL Editor:
```sql
SELECT 
    project_id,
    CASE WHEN access_token IS NOT NULL THEN 'Configurado' ELSE 'NAO CONFIGURADO' END as token_status,
    token_expires_at,
    CASE
        WHEN token_expires_at > now() THEN 'VALIDO'
        ELSE 'EXPIRADO'
    END as token_validity,
    token_expires_at - now() as tempo_restante
FROM public.firebase_config;
```

---

## Troubleshooting

### Problema: Tarefa não executa

**Solução:**
1. Verificar se o usuário tem permissões administrativas
2. Verificar se o caminho do script está correto
3. Executar manualmente o script para testar:
   ```powershell
   cd c:\Users\jrpmc\Documents\_SkyVidya\repos\olimpia-manager-na\supabase
   .\renew-firebase-token.ps1 -ServiceAccountJsonPath "..." -SupabaseUrl "..." -SupabaseServiceRoleKey "..."
   ```

### Problema: Script falha com erro de execução

**Solução:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: Token não atualiza no Supabase

**Solução:**
1. Verificar conectividade com a internet
2. Verificar se a Service Role Key está correta
3. Verificar se a função `update_firebase_token` existe no banco:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'update_firebase_token';
   ```

### Problema: Erro "Service Account not found"

**Solução:**
- Verificar caminho absoluto do arquivo JSON
- Garantir que o arquivo não foi movido ou renomeado

---

## Monitoramento

### Configurar alerta de falha (opcional):

1. Abra a tarefa no Task Scheduler
2. Vá para "Histórico"
3. ☑ **Habilitar Histórico de Todas as Tarefas**
4. Configure filtros para eventos de erro

### Script de monitoramento:

Crie `monitor-token-expiration.ps1`:

```powershell
# Verificar expiracao do token
$config = Get-Content "c:\...\firebase-renewal-config.json" | ConvertFrom-Json

$headers = @{
    "apikey" = $config.SupabaseServiceRoleKey
    "Authorization" = "Bearer $($config.SupabaseServiceRoleKey)"
}

$response = Invoke-RestMethod -Uri "$($config.SupabaseUrl)/rest/v1/firebase_config?select=token_expires_at&id=eq.1" -Headers $headers

$expiresAt = [DateTime]::Parse($response[0].token_expires_at)
$timeLeft = $expiresAt - [DateTime]::UtcNow

if ($timeLeft.TotalMinutes -lt 10) {
    Write-Host "ALERTA: Token expira em $($timeLeft.TotalMinutes) minutos!" -ForegroundColor Red
    # Enviar email, notificacao, etc.
} else {
    Write-Host "Token OK. Expira em $($timeLeft.TotalMinutes) minutos" -ForegroundColor Green
}
```

---

## Segurança

> [!WARNING]
> **Proteção das Credenciais**
> 
> As credenciais ficam armazenadas:
> 1. **Service Account JSON**: Arquivo no disco (proteja com permissões do Windows)
> 2. **Service Role Key**: Nos argumentos da tarefa agendada
> 
> **Recomendações:**
> - Restrinja acesso ao arquivo JSON apenas ao usuário que executa a tarefa
> - Use Windows Credential Manager para armazenar a Service Role Key (método avançado)
> - Monitore o log de execução da tarefa regularmente

---

## Alternativas

Se você preferir não usar Task Scheduler, pode:

1. **Executar em servidor Linux com cron**:
   ```cron
   */50 * * * * /path/to/renew-token.sh
   ```

2. **Usar Supabase Edge Function com cron nativo**:
   - Criar Edge Function que renova o token
   - Usar `pg_cron` para chamar a função

3. **Usar serviço externo**:
   - Configurar webhook no Zapier/Make
   - Agendar chamada a cada 50 minutos
