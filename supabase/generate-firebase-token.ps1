# Script para gerar Access Token do Firebase para push notifications
# Este token deve ser gerado periodicamente (expira em 1 hora)
# Compativel com Windows PowerShell 5.1+

param(
    [Parameter(Mandatory = $false)]
    [string]$ServiceAccountJsonPath = ""
)

Write-Host "=== Gerador de Firebase Access Token ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar caminho do arquivo JSON se nao foi fornecido
if ([string]::IsNullOrEmpty($ServiceAccountJsonPath)) {
    Write-Host "Caminho do arquivo JSON do Service Account:" -ForegroundColor Yellow
    $ServiceAccountJsonPath = Read-Host "Caminho"
}

$ServiceAccountJsonPath = $ServiceAccountJsonPath.Trim('"').Trim("'")

if (-not (Test-Path $ServiceAccountJsonPath)) {
    Write-Host "ERRO: Arquivo nao encontrado: $ServiceAccountJsonPath" -ForegroundColor Red
    exit 1
}

# Ler o JSON
$serviceAccount = Get-Content $ServiceAccountJsonPath -Raw | ConvertFrom-Json

$projectId = $serviceAccount.project_id
$clientEmail = $serviceAccount.client_email
$privateKey = $serviceAccount.private_key

Write-Host ""
Write-Host "Project ID: $projectId" -ForegroundColor Green
Write-Host "Client Email: $clientEmail" -ForegroundColor Green
Write-Host ""

# Funcao para converter para Base64Url
function ConvertTo-Base64Url {
    param([byte[]]$bytes)
    $base64 = [Convert]::ToBase64String($bytes)
    return $base64.Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

function ConvertFrom-Base64Url {
    param([string]$base64url)
    $base64 = $base64url.Replace('-', '+').Replace('_', '/')
    switch ($base64.Length % 4) {
        2 { $base64 += '==' }
        3 { $base64 += '=' }
    }
    return [Convert]::FromBase64String($base64)
}

# Gerar JWT Header
$header = @{
    alg = "RS256"
    typ = "JWT"
} | ConvertTo-Json -Compress

# Calcular Unix timestamp de forma confiavel (UTC)
$epoch = [DateTime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
$now = [int][Math]::Floor(([DateTime]::UtcNow - $epoch).TotalSeconds)
$exp = $now + 3600  # 1 hora

Write-Host "Timestamp atual (UTC): $now" -ForegroundColor Gray
Write-Host "Expiracao (UTC): $exp" -ForegroundColor Gray
Write-Host "Data/Hora UTC: $([DateTime]::UtcNow.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray

# Gerar JWT Payload
$payload = @{
    iss   = $clientEmail
    sub   = $clientEmail
    aud   = "https://oauth2.googleapis.com/token"
    iat   = $now
    exp   = $exp
    scope = "https://www.googleapis.com/auth/firebase.messaging"
} | ConvertTo-Json -Compress

$headerB64 = ConvertTo-Base64Url -bytes ([System.Text.Encoding]::UTF8.GetBytes($header))
$payloadB64 = ConvertTo-Base64Url -bytes ([System.Text.Encoding]::UTF8.GetBytes($payload))
$unsignedToken = "$headerB64.$payloadB64"

# Assinar com RSA-SHA256 usando metodo compativel com Windows PowerShell
Write-Host "Gerando JWT..." -ForegroundColor Yellow

try {
    # Limpar a chave privada (remover headers e newlines)
    $cleanKey = $privateKey -replace "-----BEGIN PRIVATE KEY-----", "" -replace "-----END PRIVATE KEY-----", "" -replace "\n", "" -replace "\r", "" -replace " ", ""

    # Decodificar a chave Base64
    $keyBytes = [Convert]::FromBase64String($cleanKey)

    # Usar CNG (Cryptography Next Generation) para importar a chave PKCS#8
    # Criar um RSACng a partir dos bytes PKCS#8
    $rsa = [System.Security.Cryptography.RSA]::Create()

    # Tentar o metodo moderno primeiro (PowerShell 7+ / .NET Core)
    $imported = $false
    try {
        $bytesRead = 0
        $rsa.ImportPkcs8PrivateKey($keyBytes, [ref]$bytesRead)
        $imported = $true
        Write-Host "Chave importada usando metodo moderno" -ForegroundColor Gray
    }
    catch {
        Write-Host "Metodo moderno nao disponivel, tentando metodo alternativo..." -ForegroundColor Gray
    }

    if (-not $imported) {
        # Metodo alternativo para Windows PowerShell 5.1
        # Usar BouncyCastle ou converter manualmente

        # Criar arquivo PEM temporario
        $tempPemPath = [System.IO.Path]::GetTempFileName() + ".pem"
        $pemContent = "-----BEGIN PRIVATE KEY-----`n"

        # Quebrar a chave em linhas de 64 caracteres
        for ($i = 0; $i -lt $cleanKey.Length; $i += 64) {
            $lineLength = [Math]::Min(64, $cleanKey.Length - $i)
            $pemContent += $cleanKey.Substring($i, $lineLength) + "`n"
        }
        $pemContent += "-----END PRIVATE KEY-----"

        # Tentar usar certutil para converter (disponivel no Windows)
        $tempDerPath = [System.IO.Path]::GetTempFileName() + ".der"

        # Salvar bytes DER diretamente
        [System.IO.File]::WriteAllBytes($tempDerPath, $keyBytes)

        # Usar .NET para criar RSA a partir de parametros
        # Parse PKCS#8 manualmente

        # PKCS#8 estrutura:
        # SEQUENCE {
        #   INTEGER (version)
        #   SEQUENCE (algorithm identifier)
        #   OCTET STRING (private key - PKCS#1 RSA format)
        # }

        $reader = New-Object System.IO.BinaryReader([System.IO.MemoryStream]::new($keyBytes))

        # Funcao para ler ASN.1 tag e length
        function Read-Asn1Length {
            param($reader)
            $length = $reader.ReadByte()
            if ($length -band 0x80) {
                $numBytes = $length -band 0x7F
                $length = 0
                for ($i = 0; $i -lt $numBytes; $i++) {
                    $length = ($length -shl 8) + $reader.ReadByte()
                }
            }
            return $length
        }

        function Read-Asn1Integer {
            param($reader, $expectedSize = 0)
            $tag = $reader.ReadByte()  # 0x02 = INTEGER
            $length = Read-Asn1Length $reader
            $bytes = $reader.ReadBytes($length)
            # Remover leading zero se existir (usado para numeros positivos)
            if ($bytes[0] -eq 0 -and $bytes.Length -gt 1) {
                $bytes = $bytes[1..($bytes.Length - 1)]
            }
            # Padding para o tamanho esperado (RSA requer tamanhos especificos)
            if ($expectedSize -gt 0 -and $bytes.Length -lt $expectedSize) {
                $padded = New-Object byte[] $expectedSize
                [Array]::Copy($bytes, 0, $padded, $expectedSize - $bytes.Length, $bytes.Length)
                $bytes = $padded
            }
            return $bytes
        }

        # Ler SEQUENCE externo (PKCS#8)
        $tag = $reader.ReadByte()  # 0x30 = SEQUENCE
        $seqLength = Read-Asn1Length $reader

        # Ler version
        $versionTag = $reader.ReadByte()  # 0x02 = INTEGER
        $versionLength = Read-Asn1Length $reader
        $version = $reader.ReadBytes($versionLength)

        # Ler algorithm identifier SEQUENCE
        $algoTag = $reader.ReadByte()  # 0x30 = SEQUENCE
        $algoLength = Read-Asn1Length $reader
        $algoBytes = $reader.ReadBytes($algoLength)

        # Ler OCTET STRING contendo a chave privada PKCS#1
        $octetTag = $reader.ReadByte()  # 0x04 = OCTET STRING
        $octetLength = Read-Asn1Length $reader
        $pkcs1Bytes = $reader.ReadBytes($octetLength)

        $reader.Close()

        # Agora parse PKCS#1 RSA Private Key
        $pkcs1Reader = New-Object System.IO.BinaryReader([System.IO.MemoryStream]::new($pkcs1Bytes))

        # SEQUENCE
        $tag = $pkcs1Reader.ReadByte()
        $seqLength = Read-Asn1Length $pkcs1Reader

        # version
        $versionBytes = Read-Asn1Integer $pkcs1Reader

        # n (modulus)
        $n = Read-Asn1Integer $pkcs1Reader

        # e (public exponent)
        $e = Read-Asn1Integer $pkcs1Reader

        # d (private exponent)
        $d = Read-Asn1Integer $pkcs1Reader

        # p (prime1)
        $p = Read-Asn1Integer $pkcs1Reader

        # q (prime2)
        $q = Read-Asn1Integer $pkcs1Reader

        # dp (exponent1)
        $dp = Read-Asn1Integer $pkcs1Reader

        # dq (exponent2)
        $dq = Read-Asn1Integer $pkcs1Reader

        # qInv (coefficient)
        $qInv = Read-Asn1Integer $pkcs1Reader

        $pkcs1Reader.Close()

        # Criar RSAParameters
        $rsaParams = New-Object System.Security.Cryptography.RSAParameters
        $rsaParams.Modulus = $n
        $rsaParams.Exponent = $e
        $rsaParams.D = $d
        $rsaParams.P = $p
        $rsaParams.Q = $q
        $rsaParams.DP = $dp
        $rsaParams.DQ = $dq
        $rsaParams.InverseQ = $qInv

        # Importar parametros no RSA
        $rsa.ImportParameters($rsaParams)
        $imported = $true
        Write-Host "Chave importada usando parser PKCS#8 manual" -ForegroundColor Gray

        # Limpar arquivos temporarios
        if (Test-Path $tempPemPath) { Remove-Item $tempPemPath -Force }
        if (Test-Path $tempDerPath) { Remove-Item $tempDerPath -Force }
    }

    # Assinar os dados
    $dataBytes = [System.Text.Encoding]::UTF8.GetBytes($unsignedToken)
    $signatureBytes = $rsa.SignData($dataBytes, [System.Security.Cryptography.HashAlgorithmName]::SHA256, [System.Security.Cryptography.RSASignaturePadding]::Pkcs1)

    $signatureB64 = ConvertTo-Base64Url -bytes $signatureBytes
    $jwt = "$unsignedToken.$signatureB64"

    Write-Host "JWT gerado com sucesso!" -ForegroundColor Green

    $rsa.Dispose()
}
catch {
    Write-Host "ERRO ao gerar JWT: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalhes do erro:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Stacktrace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}

# Trocar JWT por Access Token
Write-Host ""
Write-Host "Obtendo Access Token do Google..." -ForegroundColor Yellow

# Debug: mostrar JWT (parcial)
Write-Host "JWT (primeiros 100 chars): $($jwt.Substring(0, [Math]::Min(100, $jwt.Length)))..." -ForegroundColor Gray

try {
    # Usar Invoke-WebRequest para capturar resposta completa em caso de erro
    $body = "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$jwt"

    $webResponse = Invoke-WebRequest -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded" -UseBasicParsing
    $response = $webResponse.Content | ConvertFrom-Json

    $accessToken = $response.access_token
    $expiresIn = $response.expires_in

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "ACCESS TOKEN GERADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Expira em: $expiresIn segundos (aproximadamente 1 hora)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "--- COPIE O SQL ABAIXO E EXECUTE NO SUPABASE ---" -ForegroundColor Cyan
    Write-Host ""

    # Escapar a private key para SQL (dobrar aspas simples)
    $privateKeyEscaped = $privateKey -replace "'", "''"

    # Gerar SQL para atualizar a configuracao
    $sql = @"
-- 1. Configurar dados do Firebase (execute apenas uma vez ou quando mudar o service account)
UPDATE public.firebase_config SET
    project_id = '$projectId',
    client_email = '$clientEmail',
    private_key = '$privateKeyEscaped'
WHERE id = 1;

-- 2. Atualizar o Access Token (execute sempre que gerar novo token)
SELECT update_firebase_token('$accessToken', $expiresIn);

-- 3. Verificar configuracao
SELECT
    project_id,
    client_email,
    CASE WHEN access_token IS NOT NULL THEN 'Configurado' ELSE 'NAO CONFIGURADO' END as token_status,
    token_expires_at,
    CASE
        WHEN token_expires_at > now() THEN 'VALIDO'
        ELSE 'EXPIRADO'
    END as token_validity
FROM public.firebase_config;
"@

    Write-Host $sql -ForegroundColor White
    Write-Host ""

    # Copiar para clipboard
    try {
        $sql | Set-Clipboard
        Write-Host "SQL copiado para a area de transferencia!" -ForegroundColor Green
    }
    catch {
        Write-Host "Nao foi possivel copiar para a area de transferencia." -ForegroundColor Yellow
    }
    Write-Host ""

    # Salvar token em arquivo temporario
    $tokenFile = "firebase_token_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    @"
Access Token gerado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Expira em: $expiresIn segundos

Token:
$accessToken

SQL para atualizar:
$sql
"@ | Out-File -FilePath $tokenFile -Encoding utf8
    Write-Host "Token e SQL salvos em: $tokenFile" -ForegroundColor Gray
}
catch {
    Write-Host "ERRO ao obter Access Token" -ForegroundColor Red
    Write-Host ""

    # Tentar extrair resposta do erro
    $errorResponse = $null
    if ($_.Exception.Response) {
        try {
            $responseStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseStream)
            $errorResponse = $reader.ReadToEnd()
            $reader.Close()
            $responseStream.Close()
        }
        catch { }
    }

    if ($errorResponse) {
        Write-Host "Resposta do servidor:" -ForegroundColor Yellow
        Write-Host $errorResponse -ForegroundColor Red

        # Tentar fazer parse do JSON de erro
        try {
            $errorJson = $errorResponse | ConvertFrom-Json
            Write-Host ""
            Write-Host "Erro: $($errorJson.error)" -ForegroundColor Red
            Write-Host "Descricao: $($errorJson.error_description)" -ForegroundColor Red
        }
        catch { }
    }
    else {
        Write-Host "Erro: $_" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "Possiveis causas:" -ForegroundColor Yellow
    Write-Host "1. Relogio do computador dessincronizado (verifique data/hora)" -ForegroundColor Gray
    Write-Host "2. Service Account sem permissoes para Firebase Cloud Messaging" -ForegroundColor Gray
    Write-Host "3. Chave privada invalida ou corrompida" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
