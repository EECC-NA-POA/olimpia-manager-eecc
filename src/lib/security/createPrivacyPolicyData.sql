-- Script para criar dados da política de privacidade e configurar RLS
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se a tabela existe e criar se necessário
CREATE TABLE IF NOT EXISTS termos_privacidade (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    termo_texto TEXT NOT NULL,
    ativo BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    versao INTEGER DEFAULT 1
);

-- 2. Habilitar RLS na tabela
ALTER TABLE termos_privacidade ENABLE ROW LEVEL SECURITY;

-- 3. Criar política para permitir leitura pública de termos ativos
DROP POLICY IF EXISTS "Permitir leitura de termos ativos" ON termos_privacidade;
CREATE POLICY "Permitir leitura de termos ativos" ON termos_privacidade
    FOR SELECT
    USING (ativo = TRUE);

-- 4. Criar política para administradores gerenciarem todos os termos
DROP POLICY IF EXISTS "Administradores podem gerenciar termos" ON termos_privacidade;
CREATE POLICY "Administradores podem gerenciar termos" ON termos_privacidade
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM papeis_usuarios pu
            JOIN papeis p ON pu.papel_id = p.id
            WHERE pu.usuario_id = auth.uid()
            AND p.nome = 'Administração'
        )
    );

-- 5. Desativar todos os termos existentes
UPDATE termos_privacidade SET ativo = FALSE;

-- 6. Inserir política de privacidade padrão
INSERT INTO termos_privacidade (termo_texto, ativo, versao) VALUES (
'# Política de Privacidade

## 1. Informações Gerais

Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais quando você utiliza nossos serviços de inscrição em eventos esportivos.

## 2. Informações que Coletamos

### 2.1 Dados Pessoais
- Nome completo
- Data de nascimento
- Documento de identidade (RG/CPF)
- Endereço residencial
- Telefone e email de contato
- Informações médicas relevantes para participação em eventos

### 2.2 Dados de Participação
- Histórico de participação em eventos
- Resultados e classificações
- Preferências esportivas
- Filial/unidade de origem

## 3. Como Utilizamos suas Informações

### 3.1 Finalidades do Tratamento
- Processar inscrições em eventos esportivos
- Comunicar informações sobre eventos
- Garantir a segurança dos participantes
- Cumprir obrigações legais e regulamentares
- Melhorar nossos serviços

### 3.2 Base Legal
O tratamento de dados é realizado com base em:
- Consentimento do titular
- Execução de contrato
- Cumprimento de obrigação legal
- Legítimo interesse

## 4. Compartilhamento de Informações

### 4.1 Não Compartilhamos
Não vendemos, alugamos ou comercializamos suas informações pessoais com terceiros para fins comerciais.

### 4.2 Compartilhamento Necessário
Podemos compartilhar informações apenas quando:
- Exigido por lei ou ordem judicial
- Necessário para prestação do serviço (ex: seguro esportivo)
- Com seu consentimento explícito

## 5. Segurança dos Dados

### 5.1 Medidas de Proteção
- Criptografia de dados sensíveis
- Controle de acesso restrito
- Monitoramento de segurança
- Backup regular de informações

### 5.2 Retenção de Dados
Mantemos seus dados pelo tempo necessário para:
- Cumprir as finalidades descritas nesta política
- Atender obrigações legais
- Resolver disputas

## 6. Seus Direitos (LGPD)

Você tem direito a:
- **Confirmação e acesso**: Saber se tratamos seus dados e acessá-los
- **Correção**: Solicitar correção de dados incompletos/incorretos
- **Anonimização ou eliminação**: Solicitar exclusão de dados desnecessários
- **Portabilidade**: Receber seus dados em formato estruturado
- **Revogação do consentimento**: Retirar consentimento a qualquer momento

## 7. Cookies e Tecnologias

### 7.1 Uso de Cookies
Utilizamos cookies para:
- Melhorar experiência de navegação
- Lembrar preferências
- Analisar uso do site
- Manter sessão ativa

### 7.2 Gerenciamento
Você pode gerenciar cookies através das configurações do seu navegador.

## 8. Menores de Idade

### 8.1 Proteção Especial
Para participantes menores de 18 anos:
- Consentimento dos pais/responsáveis é obrigatório
- Dados são tratados com proteção especial
- Responsáveis podem exercer direitos em nome do menor

## 9. Alterações na Política

### 9.1 Atualizações
Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas através de:
- Email cadastrado
- Aviso no site
- Notificação no sistema

## 10. Contato e Reclamações

### 10.1 Canal de Atendimento
Para exercer seus direitos ou esclarecer dúvidas:
- Email: privacidade@novaacropole.org.br
- Telefone: [inserir telefone]
- Endereço: [inserir endereço completo]

### 10.2 Autoridade Nacional
Você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD):
- Site: https://www.gov.br/anpd/pt-br
- Email: atendimento.anpd@anpd.gov.br

## 11. Vigência

Esta política entra em vigor na data de sua publicação e permanece válida até ser substituída por nova versão.

---

**Última atualização:** ' || TO_CHAR(NOW(), 'DD/MM/YYYY') || '  
**Versão:** 1.0

Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e demais regulamentações aplicáveis.',
TRUE,
1
);

-- 7. Verificar se foi inserido corretamente
SELECT 
    id,
    LEFT(termo_texto, 100) as preview_texto,
    ativo,
    data_criacao,
    versao
FROM termos_privacidade 
WHERE ativo = TRUE
ORDER BY data_criacao DESC;

-- 8. Criar função para buscar política ativa (caso não exista)
CREATE OR REPLACE FUNCTION get_active_privacy_policy()
RETURNS TABLE (termo_texto TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT tp.termo_texto
    FROM termos_privacidade tp
    WHERE tp.ativo = TRUE
    ORDER BY tp.data_criacao DESC
    LIMIT 1;
END;
$$;

-- 9. Conceder permissões necessárias
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON termos_privacidade TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_active_privacy_policy() TO anon, authenticated;

-- Verificação final
SELECT 'Configuração concluída! Política de privacidade criada e RLS configurado.' as status;