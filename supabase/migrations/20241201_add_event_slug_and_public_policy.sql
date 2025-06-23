
-- Adicionar coluna slug_pagina à tabela eventos
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS slug_pagina VARCHAR(255);

-- Criar índice único para o slug_pagina quando visibilidade_publica = true
DROP INDEX IF EXISTS idx_eventos_slug_pagina_publico;
CREATE UNIQUE INDEX idx_eventos_slug_pagina_publico 
ON eventos (slug_pagina) 
WHERE visibilidade_publica = true AND slug_pagina IS NOT NULL;

-- Remover policy existente se houver
DROP POLICY IF EXISTS "Permitir acesso público a eventos visíveis" ON eventos;

-- Criar policy para permitir acesso público de leitura a eventos com visibilidade pública
CREATE POLICY "Permitir acesso público a eventos visíveis" 
ON eventos 
FOR SELECT 
TO anon, authenticated
USING (visibilidade_publica = true);

-- Função para gerar slug automaticamente baseado no nome do evento
CREATE OR REPLACE FUNCTION generate_event_slug(event_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Converter nome para slug (lowercase, remover acentos, substituir espaços por hífens)
    base_slug := lower(
        regexp_replace(
            translate(
                event_name,
                'àáâãäåāăąèéêëēĕėęěìíîïīĭįòóôõöøōŏőùúûüūŭůűųñç',
                'aaaaaaaaaeeeeeeeeeiiiiiiiooooooooouuuuuuuuunc'
            ),
            '[^a-z0-9]+', '-', 'g'
        )
    );
    
    -- Remover hífens do início e fim
    base_slug := trim(both '-' from base_slug);
    
    -- Limitar a 50 caracteres
    base_slug := substring(base_slug from 1 for 50);
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Verificar se o slug já existe (apenas para eventos públicos)
    WHILE EXISTS (
        SELECT 1 FROM eventos 
        WHERE slug_pagina = final_slug 
        AND visibilidade_publica = true
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar slug automaticamente quando um evento se torna público
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o evento está sendo criado ou atualizado para ser público e não tem slug
    IF NEW.visibilidade_publica = true AND (NEW.slug_pagina IS NULL OR NEW.slug_pagina = '') THEN
        NEW.slug_pagina := generate_event_slug(NEW.nome);
    END IF;
    
    -- Se o evento não é mais público, limpar o slug
    IF NEW.visibilidade_publica = false THEN
        NEW.slug_pagina := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON eventos;
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT OR UPDATE ON eventos
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- Gerar slugs para eventos públicos existentes que não têm slug
UPDATE eventos 
SET slug_pagina = generate_event_slug(nome)
WHERE visibilidade_publica = true 
AND (slug_pagina IS NULL OR slug_pagina = '');
