# Script para renovacao automatica do Firebase Access Token
# Este script deve ser executado via Task Scheduler a cada 50 minutos

param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceAccountJsonPath,
    
    [Parameter(Mandatory = $true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory = $true)]
    [string]$SupabaseServiceRoleKey,
    
    [Parameter(Mandatory = $false)]
    [string]$LogPath = "$PSScriptRoot\firebase-token-renewal.log"
)

# Funcao para escrever log
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogPath -Value $logMessage
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        default { Write-Host $logMessage -ForegroundColor Gray }
    }
}

Write-Log "=== Iniciando renovacao automatica do Firebase Token ===" "INFO"

try {
    # Verificar se arquivo existe
    if (-not (Test-Path $ServiceAccountJsonPath)) {
        Write-Log "Arquivo service account nao encontrado: $ServiceAccountJsonPath" "ERROR"
        exit 1
    }
    
    Write-Log "Gerando novo token via generate-firebase-token.ps1..." "INFO"
    
    # Executar script de geracao de token
    $scriptPath = Join-Path $PSScriptRoot "generate-firebase-token.ps1"
    if (-not (Test-Path $scriptPath)) {
        Write-Log "Script generate-firebase-token.ps1 nao encontrado em: $scriptPath" "ERROR"
        exit 1
    }
    
    # Capturar saida do script
    $output = & $scriptPath -ServiceAccountJsonPath $ServiceAccountJsonPath 2>&1
    
    # Extrair access token da saida
    $accessTokenLine = $output | Select-String -Pattern "SELECT update_firebase_token\('([^']+)', (\d+)\);" -AllMatches
    
    if (-not $accessTokenLine) {
        Write-Log "Falha ao extrair access token da saida do script" "ERROR"
        Write-Log "Saida do script: $output" "ERROR"
        exit 1
    }
    
    $accessToken = $accessTokenLine.Matches[0].Groups[1].Value
    $expiresIn = $accessTokenLine.Matches[0].Groups[2].Value
    
    Write-Log "Token gerado com sucesso. Expira em: $expiresIn segundos" "SUCCESS"
    
    # Atualizar token no Supabase via API REST
    Write-Log "Atualizando token no Supabase..." "INFO"
    
    $headers = @{
        "apikey" = $SupabaseServiceRoleKey
        "Authorization" = "Bearer $SupabaseServiceRoleKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    }
    
    # Chamar funcao via RPC
    $rpcUrl = "$SupabaseUrl/rest/v1/rpc/update_firebase_token"
    $body = @{
        p_access_token = $accessToken
        p_expires_in_seconds = [int]$expiresIn
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $rpcUrl -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Log "Token atualizado com sucesso no Supabase!" "SUCCESS"
        
        # Verificar expiracao
        $verifyUrl = "$SupabaseUrl/rest/v1/firebase_config?select=token_expires_at&id=eq.1"
        $verifyResponse = Invoke-RestMethod -Uri $verifyUrl -Method Get -Headers $headers
        
        if ($verifyResponse -and $verifyResponse.Count -gt 0) {
            $expiresAt = $verifyResponse[0].token_expires_at
            Write-Log "Token expira em (UTC): $expiresAt" "INFO"
        }
        
        exit 0
    }
    catch {
        Write-Log "Erro ao atualizar token no Supabase via API REST" "ERROR"
        Write-Log "Erro: $($_.Exception.Message)" "ERROR"
        
        # Fallback: tentar via psql se disponivel
        Write-Log "Tentativa de fallback via SQL direto nao implementada" "WARNING"
        exit 1
    }
}
catch {
    Write-Log "Erro geral: $_" "ERROR"
    Write-Log "Stack: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}
