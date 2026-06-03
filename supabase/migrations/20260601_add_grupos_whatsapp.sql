-- Grupos WhatsApp por delegação × evento
-- Um grupo pode abranger várias modalidades (ex: "Atletismo" → Corrida + Arremesso + Lançamento)
CREATE TABLE IF NOT EXISTS public.grupos_whatsapp (
  id            bigserial   PRIMARY KEY,
  evento_id     uuid        NOT NULL REFERENCES public.eventos(id)  ON DELETE CASCADE,
  filial_id     uuid        NOT NULL REFERENCES public.filiais(id)  ON DELETE CASCADE,
  nome          text        NOT NULL,
  link_grupo    text        NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gw_evento_filial ON public.grupos_whatsapp(evento_id, filial_id);

ALTER TABLE public.grupos_whatsapp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gw_select" ON public.grupos_whatsapp FOR SELECT TO authenticated USING (true);
CREATE POLICY "gw_all"    ON public.grupos_whatsapp FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- Modalidades que pertencem a cada grupo
CREATE TABLE IF NOT EXISTS public.grupos_whatsapp_modalidades (
  grupo_id      bigint  NOT NULL REFERENCES public.grupos_whatsapp(id) ON DELETE CASCADE,
  modalidade_id integer NOT NULL REFERENCES public.modalidades(id)     ON DELETE CASCADE,
  PRIMARY KEY (grupo_id, modalidade_id)
);

ALTER TABLE public.grupos_whatsapp_modalidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gwm_select" ON public.grupos_whatsapp_modalidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "gwm_all"    ON public.grupos_whatsapp_modalidades FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- Trigger atualizado_em
CREATE OR REPLACE FUNCTION public.set_gw_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_gw_updated_at
  BEFORE UPDATE ON public.grupos_whatsapp
  FOR EACH ROW EXECUTE FUNCTION public.set_gw_updated_at();

GRANT ALL ON public.grupos_whatsapp TO authenticated;
GRANT ALL ON public.grupos_whatsapp_modalidades TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.grupos_whatsapp_id_seq TO authenticated;
