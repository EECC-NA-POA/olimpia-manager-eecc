# Script para configurar credenciais do Firebase no Supabase
# Este script converte o arquivo JSON do Firebase em uma linha e adiciona ao .env na raiz

param(
    [Parameter(Mandatory = $false)]
    [string]$FirebaseJsonPath = "",

    [Parameter(Mandatory = $false)]
    [string]$ServiceRoleKey = ""
)

Write-Host "=== Configuração de Credenciais Firebase para Supabase ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos no diretório supabase/ ou na raiz
$rootEnvPath = if (Test-Path ".env.example") { "../.env" } else { ".env" }
$scriptDir = if (Test-Path ".env.example") { "supabase/" } else { "raiz do projeto" }

Write-Host "Executando a partir de: $scriptDir" -ForegroundColor Gray
Write-Host "Arquivo .env será salvo em: $rootEnvPath" -ForegroundColor Gray
Write-Host ""

# Solicitar caminho do arquivo JSON se não foi fornecido
if ([string]::IsNullOrEmpty($FirebaseJsonPath)) {
    Write-Host "Por favor, forneça o caminho para o arquivo JSON do Firebase Service Account:" -ForegroundColor Yellow
    Write-Host "(Você pode arrastar e soltar o arquivo aqui, ou colar o caminho SEM aspas)" -ForegroundColor Gray
    $FirebaseJsonPath = Read-Host "Caminho do arquivo JSON"
}

# Remover aspas extras que podem ter sido adicionadas
$FirebaseJsonPath = $FirebaseJsonPath.Trim('"').Trim("'")

# Verificar se o arquivo existe
if (-not (Test-Path $FirebaseJsonPath)) {
    Write-Host "ERRO: Arquivo não encontrado: $FirebaseJsonPath" -ForegroundColor Red
    exit 1
}

# Ler e converter o JSON para uma linha
Write-Host "Lendo arquivo JSON..." -ForegroundColor Green
try {
    $jsonContent = Get-Content $FirebaseJsonPath -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
}
catch {
    Write-Host "ERRO ao processar o arquivo JSON: $_" -ForegroundColor Red
    exit 1
}

# Solicitar Service Role Key se não foi fornecido
if ([string]::IsNullOrEmpty($ServiceRoleKey)) {
    Write-Host ""
    Write-Host "Por favor, forneça o Supabase Service Role Key:" -ForegroundColor Yellow
    Write-Host "(Você pode encontrar em: Supabase Dashboard > Settings > API > service_role)" -ForegroundColor Gray
    $ServiceRoleKey = Read-Host "Service Role Key"
}

# Atualizar arquivo .env na raiz do projeto
Write-Host ""
Write-Host "Atualizando arquivo .env na raiz do projeto..." -ForegroundColor Green

$firebaseEnvContent = @"

# Firebase Service Account Configuration
# Gerado automaticamente em $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
FIREBASE_SERVICE_ACCOUNT=$jsonContent

# Supabase Service Role Key (necessário para a Edge Function)
# ATENÇÃO: Cole aqui a chave service_role do Supabase (não a anon key)
# Você pode encontrar em: Supabase Dashboard > Settings > API > service_role
SUPABASE_SERVICE_ROLE_KEY=$ServiceRoleKey
"@

# Verificar se o arquivo .env já existe
if (Test-Path $rootEnvPath) {
    # Ler conteúdo existente e remover variáveis antigas do Firebase
    $existingContent = Get-Content $rootEnvPath -Raw
    $existingContent = $existingContent -replace '(?m)^# Firebase Service Account Configuration.*?(?=^[^#\s]|\z)', ''
    $existingContent = $existingContent -replace '(?m)^FIREBASE_SERVICE_ACCOUNT=.*\r?\n?', ''
    $existingContent = $existingContent -replace '(?m)^SUPABASE_SERVICE_ROLE_KEY=.*\r?\n?', ''
    $existingContent = $existingContent -replace '(?m)^# Supabase Service Role Key.*\r?\n?', ''
    $existingContent = $existingContent -replace '(?m)^# ATENÇÃO:.*\r?\n?', ''
    $existingContent = $existingContent -replace '(?m)^# Você pode encontrar.*\r?\n?', ''
    $existingContent = $existingContent -replace '(?m)^# Gerado automaticamente.*\r?\n?', ''
    $existingContent = $existingContent.TrimEnd()

    $finalContent = $existingContent + $firebaseEnvContent
    $finalContent | Out-File -FilePath $rootEnvPath -Encoding utf8 -Force
    Write-Host "✅ Variáveis Firebase adicionadas ao .env existente!" -ForegroundColor Green
}
else {
    $firebaseEnvContent.TrimStart() | Out-File -FilePath $rootEnvPath -Encoding utf8 -Force
    Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique o arquivo .env na raiz do projeto para confirmar que está correto" -ForegroundColor White
Write-Host "2. NÃO commite o arquivo .env no Git (já está protegido pelo .gitignore)" -ForegroundColor Yellow
Write-Host "3. Reinicie o Supabase se estiver usando Docker Compose" -ForegroundColor White
Write-Host "4. Teste o envio de notificações" -ForegroundColor White
Write-Host ""
Write-Host "Para rodar Edge Functions localmente, use:" -ForegroundColor Gray
Write-Host "  npx supabase functions serve --env-file .env" -ForegroundColor Gray
Write-Host ""
Write-Host "Para deploy, use:" -ForegroundColor Gray
Write-Host "  npx supabase functions deploy send-push" -ForegroundColor Gray
Write-Host ""
