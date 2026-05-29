-- ================================================================
-- CAMERA & HAPTICS - PAYMENT PROOF SUPPORT
-- Migration: 20260206_add_payment_proof_to_enrollments.sql
-- ================================================================
--
-- Adiciona suporte para upload de comprovantes de pagamento
-- nas inscrições de atletas
--
-- ================================================================

-- ====================
-- PARTE 1: ADICIONAR COLUNAS À TABELA INSCRICOES_MODALIDADES
-- ====================

-- Adicionar colunas para comprovante de pagamento
ALTER TABLE public.inscricoes_modalidades
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at TIMESTAMPTZ;

-- Comentários explicativos
COMMENT ON COLUMN public.inscricoes_modalidades.payment_proof_url 
IS 'URL do comprovante de pagamento armazenado no Supabase Storage (bucket: payment-proofs)';

COMMENT ON COLUMN public.inscricoes_modalidades.payment_proof_uploaded_at 
IS 'Data e hora em que o atleta fez upload do comprovante de pagamento';

-- Index para buscar inscrições que já possuem comprovante
CREATE INDEX IF NOT EXISTS idx_inscricoes_payment_proof 
ON public.inscricoes_modalidades(payment_proof_url) 
WHERE payment_proof_url IS NOT NULL;

-- Index para buscar por data de upload
CREATE INDEX IF NOT EXISTS idx_inscricoes_payment_proof_date 
ON public.inscricoes_modalidades(payment_proof_uploaded_at DESC);

-- ====================
-- PARTE 2: ATUALIZAR VIEW (OPCIONAL)
-- ====================

-- NOTA: A view vw_inscricoes_atletas pode não existir no seu banco
-- ou ter uma estrutura diferente. Por isso, esta parte foi REMOVIDA.
-- 
-- Se você usar essa view, você pode atualizá-la manualmente depois adicionando:
--   im.payment_proof_url,
--   im.payment_proof_uploaded_at
--
-- Exemplo de como atualizar manualmente (se necessário):
-- 
-- CREATE OR REPLACE VIEW public.vw_inscricoes_atletas AS
-- SELECT 
--     ... (suas colunas existentes),
--     im.payment_proof_url,
--     im.payment_proof_uploaded_at
-- FROM ...

-- ====================
-- PARTE 3: CONFIGURAR SUPABASE STORAGE
-- ====================

-- Criar bucket para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs',
    'payment-proofs',
    false, -- Privado: apenas donos e admins podem acessar
    5242880, -- 5MB em bytes
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- ====================
-- PARTE 4: RLS POLICIES PARA STORAGE
-- ====================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can upload own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own payment proofs" ON storage.objects;

-- Política: Usuários autenticados podem fazer upload dos próprios comprovantes
CREATE POLICY "Users can upload own payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'payment-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuários podem visualizar próprios comprovantes
CREATE POLICY "Users can view own payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'payment-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Administradores podem visualizar todos os comprovantes
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'payment-proofs' AND
    EXISTS (
        SELECT 1 FROM papeis_usuarios pu
        JOIN perfis p ON pu.perfil_id = p.id
        WHERE pu.usuario_id = auth.uid()
        AND p.nome IN ('Administrativo', 'Super Administrador')
    )
);

-- Política: Usuários podem deletar próprios comprovantes (caso precisem reenviar)
CREATE POLICY "Users can delete own payment proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'payment-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ====================
-- VERIFICAÇÃO FINAL
-- ====================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'PAYMENT PROOF SUPPORT - INSTALAÇÃO CONCLUÍDA!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Colunas adicionadas:';
    RAISE NOTICE '  - inscricoes_modalidades.payment_proof_url';
    RAISE NOTICE '  - inscricoes_modalidades.payment_proof_uploaded_at';
    RAISE NOTICE '';
    RAISE NOTICE 'Storage Bucket criado:';
    RAISE NOTICE '  - payment-proofs (privado, max 5MB)';
    RAISE NOTICE '  - Formatos: JPG, PNG, PDF';
    RAISE NOTICE '';
    RAISE NOTICE 'Estrutura de pastas:';
    RAISE NOTICE '  - payment-proofs/{user_id}/{enrollment_id}_{timestamp}.jpg';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS Policies configuradas:';
    RAISE NOTICE '  ✓ Usuários podem upload próprios comprovantes';
    RAISE NOTICE '  ✓ Usuários podem ver próprios comprovantes';
    RAISE NOTICE '  ✓ Admins podem ver todos os comprovantes';
    RAISE NOTICE '  ✓ Usuários podem deletar próprios comprovantes';
    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Instalar dependências: npm install';
    RAISE NOTICE '2. Sync Capacitor: npm run cap:sync';
    RAISE NOTICE '3. Implementar services e componentes';
    RAISE NOTICE '';
END $$;
