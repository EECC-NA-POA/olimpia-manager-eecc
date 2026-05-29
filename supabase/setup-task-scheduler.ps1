# Script para configurar automaticamente o Windows Task Scheduler
# para renovacao do Firebase Access Token

param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceAccountJsonPath,
    
    [Parameter(Mandatory = $true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory = $true)]
    [string]$SupabaseServiceRoleKey,
    
    [Parameter(Mandatory = $false)]
    [string]$TaskName = "Firebase Token Auto-Renewal",
    
    [Parameter(Mandatory = $false)]
    [int]$IntervalMinutes = 50
)

Write-Host "=== Configuracao do Task Scheduler para Renovacao de Token ===" -ForegroundColor Cyan
Write-Host ""

# Validar parametros
if (-not (Test-Path $ServiceAccountJsonPath)) {
    Write-Host "ERRO: Arquivo Service Account nao encontrado: $ServiceAccountJsonPath" -ForegroundColor Red
    exit 1
}

if ($SupabaseUrl -notmatch "^https?://") {
    Write-Host "ERRO: URL do Supabase invalida. Deve comecar com http:// ou https://" -ForegroundColor Red
    exit 1
}

if ($SupabaseServiceRoleKey.Length -lt 20) {
    Write-Host "ERRO: Service Role Key parece invalida (muito curta)" -ForegroundColor Red
    exit 1
}

Write-Host "Parametros validados:" -ForegroundColor Green
Write-Host "  Service Account: $ServiceAccountJsonPath" -ForegroundColor Gray
Write-Host "  Supabase URL: $SupabaseUrl" -ForegroundColor Gray
Write-Host "  Intervalo: $IntervalMinutes minutos" -ForegroundColor Gray
Write-Host ""

# Caminho do script de renovacao
$scriptDir = $PSScriptRoot
$renewScriptPath = Join-Path $scriptDir "renew-firebase-token.ps1"

if (-not (Test-Path $renewScriptPath)) {
    Write-Host "ERRO: Script renew-firebase-token.ps1 nao encontrado em: $renewScriptPath" -ForegroundColor Red
    exit 1
}

# Verificar se tarefa ja existe
try {
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Tarefa '$TaskName' ja existe." -ForegroundColor Yellow
        $response = Read-Host "Deseja sobrescrever? (S/N)"
        if ($response -ne 'S' -and $response -ne 's') {
            Write-Host "Operacao cancelada." -ForegroundColor Yellow
            exit 0
        }
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Tarefa existente removida." -ForegroundColor Green
    }
}
catch {
    # Tarefa nao existe, continuar
}

Write-Host "Criando nova tarefa agendada..." -ForegroundColor Yellow
Write-Host ""

try {
    # Criar acao
    $arguments = "-ExecutionPolicy Bypass -NoProfile -File `"$renewScriptPath`" " +
    "-ServiceAccountJsonPath `"$ServiceAccountJsonPath`" " +
    "-SupabaseUrl `"$SupabaseUrl`" " +
    "-SupabaseServiceRoleKey `"$SupabaseServiceRoleKey`""
    
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arguments
    
    # Criar gatilho (trigger)
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) -RepetitionDuration ([TimeSpan]::MaxValue)
    
    # Configuracoes principais
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 10)
    
    # Principal (usuario que executa)
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Highest
    
    # Registrar tarefa
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Description "Renova automaticamente o Firebase Access Token a cada $IntervalMinutes minutos para push notifications" `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "TAREFA CRIADA COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nome da tarefa: $TaskName" -ForegroundColor Cyan
    Write-Host "Intervalo: A cada $IntervalMinutes minutos" -ForegroundColor Cyan
    Write-Host "Primeira execucao: $(Get-Date)" -ForegroundColor Cyan
    Write-Host ""
    
    # Executar teste imediato
    Write-Host "Deseja executar um teste imediato? (S/N)" -ForegroundColor Yellow
    $testResponse = Read-Host
    
    if ($testResponse -eq 'S' -or $testResponse -eq 's') {
        Write-Host ""
        Write-Host "Executando teste..." -ForegroundColor Yellow
        Start-ScheduledTask -TaskName $TaskName
        
        Start-Sleep -Seconds 5
        
        # Verificar resultado
        $taskInfo = Get-ScheduledTaskInfo -TaskName $TaskName
        Write-Host ""
        Write-Host "Ultimo resultado: $($taskInfo.LastTaskResult)" -ForegroundColor $(if ($taskInfo.LastTaskResult -eq 0) { "Green" } else { "Red" })
        Write-Host "Ultima execucao: $($taskInfo.LastRunTime)" -ForegroundColor Gray
        Write-Host "Proxima execucao: $($taskInfo.NextRunTime)" -ForegroundColor Gray
        
        # Mostrar log se existir
        $logPath = Join-Path $scriptDir "firebase-token-renewal.log"
        if (Test-Path $logPath) {
            Write-Host ""
            Write-Host "--- Ultimas linhas do log ---" -ForegroundColor Cyan
            Get-Content $logPath -Tail 10 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
        }
    }
    
    Write-Host ""
    Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "1. Verificar logs em: $scriptDir\firebase-token-renewal.log" -ForegroundColor Gray
    Write-Host "2. Monitorar a tarefa no Task Scheduler (taskschd.msc)" -ForegroundColor Gray
    Write-Host "3. Verificar expiracao do token no Supabase periodicamente" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Comandos uteis:" -ForegroundColor Yellow
    Write-Host "  Executar manualmente: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "  Ver status: Get-ScheduledTaskInfo -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "  Desabilitar: Disable-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host "  Remover: Unregister-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "ERRO ao criar tarefa agendada:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalhes:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}
