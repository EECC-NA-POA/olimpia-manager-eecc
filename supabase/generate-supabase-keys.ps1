# Script para gerar chaves JWT válidas para Supabase Self-Hosted
# Estas chaves são necessárias para que o PostgREST aceite as requisições

param(
    [Parameter(Mandatory=$true)]
    [string]$JwtSecret
)

Write-Host "=== Gerador de Chaves Supabase ===" -ForegroundColor Cyan
Write-Host ""

# Função para converter para Base64 URL Safe
function ConvertTo-Base64Url {
    param([string]$Input)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Input)
    $base64 = [Convert]::ToBase64String($bytes)
    return $base64.Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

# Função para criar HMAC-SHA256
function Get-HmacSha256 {
    param(
        [string]$Message,
        [string]$Secret
    )
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($Secret)
    $bytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Message))
    $base64 = [Convert]::ToBase64String($bytes)
    return $base64.Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

# Função para criar JWT
function New-SupabaseJwt {
    param(
        [string]$Role,
        [string]$Secret
    )

    # Header
    $header = '{"alg":"HS256","typ":"JWT"}'
    $headerBase64 = ConvertTo-Base64Url -Input $header

    # Payload - expira em 10 anos
    $iat = [int][double]::Parse((Get-Date -UFormat %s))
    $exp = $iat + (10 * 365 * 24 * 60 * 60)  # 10 anos

    $payload = @{
        role = $Role
        iss = "supabase"
        iat = $iat
        exp = $exp
    } | ConvertTo-Json -Compress

    $payloadBase64 = ConvertTo-Base64Url -Input $payload

    # Signature
    $message = "$headerBase64.$payloadBase64"
    $signature = Get-HmacSha256 -Message $message -Secret $Secret

    return "$message.$signature"
}

# Gerar as chaves
Write-Host "Gerando chaves com JWT_SECRET fornecido..." -ForegroundColor Yellow
Write-Host ""

$anonKey = New-SupabaseJwt -Role "anon" -Secret $JwtSecret
$serviceRoleKey = New-SupabaseJwt -Role "service_role" -Secret $JwtSecret

Write-Host "=== CHAVE ANON (para o frontend) ===" -ForegroundColor Green
Write-Host $anonKey
Write-Host ""

Write-Host "=== CHAVE SERVICE_ROLE (para backend/admin) ===" -ForegroundColor Magenta
Write-Host $serviceRoleKey
Write-Host ""

Write-Host "=== Instruções ===" -ForegroundColor Cyan
Write-Host "1. Copie a CHAVE ANON e cole no arquivo .env como:"
Write-Host "   VITE_SUPABASE_ANON_KEY=$anonKey" -ForegroundColor White
Write-Host ""
Write-Host "2. Copie a CHAVE SERVICE_ROLE e cole no arquivo .env como:"
Write-Host "   SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey" -ForegroundColor White
Write-Host ""
Write-Host "3. Estas mesmas chaves também precisam estar configuradas"
Write-Host "   no seu Supabase self-hosted (docker-compose.yml ou .env)" -ForegroundColor Yellow
Write-Host ""

# Salvar em arquivo para facilitar
$outputFile = "generated-keys.txt"
@"
# Chaves geradas em $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Use o mesmo JWT_SECRET que está configurado no seu Supabase

VITE_SUPABASE_ANON_KEY=$anonKey

SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey
"@ | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Chaves salvas em: $outputFile" -ForegroundColor Green
