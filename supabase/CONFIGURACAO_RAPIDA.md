# Configuração Rápida - Firebase Credentials

## Método Mais Simples (Recomendado)

### 1. Copie o arquivo JSON para o diretório supabase

Copie o arquivo JSON que você baixou do Firebase para dentro da pasta `supabase/`:

```powershell
# Exemplo: copiar o arquivo para o diretório supabase
Copy-Item "C:\Users\jrpmc\Documents\_Nova Acrópole\repos\olimpia-manager-b049d-firebase-adminsdk-fbsvc-5814124f71.json" -Destination ".\firebase-credentials.json"
```

### 2. Execute o script apontando para o arquivo local

```powershell
.\setup-firebase-credentials.ps1 -FirebaseJsonPath ".\firebase-credentials.json"
```

Ou simplesmente:

```powershell
.\setup-firebase-credentials.ps1
```

E quando pedir o caminho, digite apenas:
```
.\firebase-credentials.json
```

---

## Método Manual (Alternativa)

Se preferir fazer manualmente:

### 1. Abra o arquivo JSON do Firebase

Abra o arquivo `olimpia-manager-b049d-firebase-adminsdk-fbsvc-5814124f71.json` em um editor de texto.

### 2. Converta para uma linha

No PowerShell:
```powershell
$json = Get-Content "caminho\do\arquivo.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
$json | Set-Clipboard
```

Isso vai copiar o JSON em uma linha para sua área de transferência.

### 3. Edite o arquivo `.env` na raiz do projeto

Adicione as variáveis ao arquivo `.env` na **raiz do projeto** (não em `supabase/`):

```env
# Variáveis existentes do Supabase
VITE_SUPABASE_URL=https://sb.nova-acropole.org.br/
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Adicione estas variáveis para Edge Functions
FIREBASE_SERVICE_ACCOUNT=<cole aqui o JSON copiado>
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui
```

### 4. Obtenha o Service Role Key

No dashboard do Supabase auto-hospedado:
1. Vá em **Settings** → **API**
2. Copie o valor de **service_role** key
3. Cole no arquivo `.env`

---

## Verificação

Após configurar, verifique que o arquivo `.env` contém as variáveis:

```powershell
Get-Content ..\.env | Select-String "FIREBASE|SUPABASE"
```

Para rodar Edge Functions localmente:
```bash
npx supabase functions serve --env-file ../.env
```

---

## Próximo Passo

Após configurar, teste o envio:

```bash
npx supabase functions deploy send-push
```
