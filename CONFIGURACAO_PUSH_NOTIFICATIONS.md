# Configuração de Push Notifications com Firebase

Este guia explica como configurar as credenciais do Firebase para enviar notificações push no Supabase auto-hospedado.

## Pré-requisitos

1. ✅ **Firebase Project criado**
2. ✅ **Cloud Messaging habilitado** nas configurações do projeto
3. ⏳ **Service Account JSON baixado**

## Passos para Configuração

### 1. Baixar o Service Account JSON do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto (`olimpia-manager`)
3. Vá em **Configurações do Projeto** (ícone de engrenagem) → **Contas de serviço**
4. Clique em **"Gerar nova chave privada"**
5. Salve o arquivo JSON em local seguro (NÃO commitar no Git)

### 2. Configurar Credenciais no Supabase Auto-hospedado

#### Opção A: Usando arquivo `.env` (Recomendado para desenvolvimento)

1. Edite o arquivo `.env` na **raiz do projeto** e adicione:
   - As variáveis VITE para o frontend (se ainda não existirem)
   - O conteúdo completo do JSON do Firebase em **uma única linha**
   - O Service Role Key do Supabase

```bash
# Variáveis do Supabase
VITE_SUPABASE_URL=https://sb.nova-acropole.org.br/
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Firebase (para Edge Functions)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"olimpia-manager",...}
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui
```

**⚠️ IMPORTANTE:** O JSON do Firebase deve estar em uma **única linha**, sem quebras de linha.

2. Para converter o arquivo JSON em uma linha, você pode usar:
```bash
# No PowerShell (Windows)
(Get-Content firebase-service-account.json -Raw) -replace '\r?\n', '' | Set-Clipboard

# Ou manualmente: copie o conteúdo do arquivo e remova todas as quebras de linha
```

3. Para rodar as Edge Functions localmente, use:
```bash
npx supabase functions serve --env-file .env
```

#### Opção B: Usando Docker Compose (Produção)

Se você roda o Supabase via Docker Compose, adicione no arquivo `docker-compose.yml`:

```yaml
services:
  functions:
    environment:
      - FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
      - SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key
```

### 3. Testar a Configuração

Para testar se as credenciais estão configuradas corretamente:

1. **Deploy da Edge Function:**
```bash
npx supabase functions deploy send-push
```

2. **Teste via API:**
```bash
curl -X POST https://sb.nova-acropole.org.br/functions/v1/send-push \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "seu-user-id",
    "title": "Teste",
    "body": "Mensagem de teste"
  }'
```

### 4. Verificar no Código

A Edge Function em `supabase/functions/send-push/index.ts` já está configurada para:
- ✅ Ler `FIREBASE_SERVICE_ACCOUNT` das variáveis de ambiente
- ✅ Buscar tokens FCM do usuário no banco
- ✅ Enviar notificações via Firebase Cloud Messaging API v1
- ✅ Desativar tokens inválidos automaticamente

## Estrutura dos Arquivos

```
olimpia-manager-na/
├── .env                        # ⚠️ NÃO COMMITAR - Todas as credenciais centralizadas
├── supabase/
│   ├── .env.example            # ✅ Instruções de configuração
│   ├── config.toml
│   └── functions/
│       └── send-push/
│           └── index.ts        # Edge Function que usa as credenciais
├── .gitignore                  # Protege arquivos sensíveis
└── CONFIGURACAO_PUSH_NOTIFICATIONS.md  # Este arquivo
```

## Segurança

- 🔒 **NUNCA** commite o arquivo `.env` ou o JSON do Firebase no Git
- 🔒 O `.gitignore` já está configurado para proteger:
  - `.env` (raiz)
  - `firebase-service-account*.json`
- 🔒 Use o Service Role Key apenas no backend (Edge Functions)
- 🔒 No frontend, use apenas o Anon Key (variáveis `VITE_*`)

## Troubleshooting

### Erro: "FIREBASE_SERVICE_ACCOUNT not configured"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme que a variável está em **uma única linha**
- Para Edge Functions locais, use: `npx supabase functions serve --env-file .env`

### Erro ao enviar notificações
- Verifique se o Cloud Messaging está habilitado no Firebase
- Confirme que o `project_id` no JSON corresponde ao projeto Firebase
- Teste a validade do token FCM do dispositivo

## Próximos Passos

Após configurar as credenciais:

1. ✅ Testar envio de notificação
2. ✅ Configurar triggers do banco para envios automáticos
3. ✅ Implementar tela de configurações de notificações no app
4. ✅ Adicionar badges de notificações não lidas

## Referências

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [FCM HTTP v1 API](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
