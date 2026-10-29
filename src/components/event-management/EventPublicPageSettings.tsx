import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Copy, ExternalLink, Globe, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Event } from '@/lib/types/database';
import { buildPublicPagePath, buildPublicPageSubdomainUrl, slugify, validateSlug } from '@/lib/publicPages';

const SUGGESTED_TEXT = `## Não é só esporte: é esporte filosófico

As oficinas fazem parte da vida de quem é membro. **Todos os membros têm direito a participar — a participação já está incluída na mensalidade de membro.** Basta se inscrever e começar a participar.

Aqui o esporte vem junto com a filosofia: cada encontro é uma oportunidade de colocar em prática o que estudamos, de nos conhecermos melhor e de fortalecer a convivência entre os membros.

Escolha a oficina que mais combina com você, conheça os filósofos monitores e venha praticar com a gente!`;

interface EventPublicPageSettingsProps {
  eventId: string | null;
  eventData: Event;
  onUpdate: () => void;
}

export function EventPublicPageSettings({ eventId, eventData, onUpdate }: EventPublicPageSettingsProps) {
  const migrationApplied = eventData.pagina_publica_ativa !== undefined;
  const [ativa, setAtiva] = useState(false);
  const [slug, setSlug] = useState('');
  const [texto, setTexto] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAtiva(!!eventData.pagina_publica_ativa);
    setSlug(eventData.pagina_publica_slug || slugify(eventData.nome || ''));
    setTexto(eventData.pagina_publica_texto || '');
  }, [eventData.pagina_publica_ativa, eventData.pagina_publica_slug, eventData.pagina_publica_texto, eventData.nome]);

  const slugError = slug ? validateSlug(slug) : null;
  const savedSlug = eventData.pagina_publica_ativa ? eventData.pagina_publica_slug : null;
  const pageUrl = savedSlug ? `${window.location.origin}${buildPublicPagePath(savedSlug)}` : null;

  const handleSave = async () => {
    if (!eventId) return;
    const error = validateSlug(slug);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      const { data: updated, error: updateError } = await supabase
        .from('eventos')
        .update({
          pagina_publica_ativa: ativa,
          pagina_publica_slug: slug,
          pagina_publica_texto: texto.trim() ? texto.trim() : null,
        })
        .eq('id', eventId)
        .select('id');

      if (updateError) {
        if (updateError.code === '23505') {
          toast.error('Este endereço já está em uso por outro evento. Escolha outro.');
        } else {
          toast.error('Não foi possível salvar a página pública: ' + updateError.message);
        }
        return;
      }

      if (!updated || updated.length === 0) {
        toast.error('Não foi possível salvar: seu usuário não tem permissão para editar este evento.');
        return;
      }

      toast.success(ativa ? 'Página pública salva e publicada!' : 'Configuração salva. A página está desligada.');
      onUpdate();
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar. Selecione o link e copie manualmente.');
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-olimpics-green-primary">
          <Globe className="h-5 w-5" /> Página pública de divulgação
        </CardTitle>
        <CardDescription>
          Página aberta, sem login, que divulga as modalidades (oficinas) deste evento com os horários do cronograma,
          os filósofos monitores (com botão de WhatsApp) e o botão de inscrição.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!migrationApplied ? (
          <Alert variant="warning" className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <AlertDescription>
              Recurso ainda não disponível no banco: é preciso rodar a migração
              <code className="mx-1 rounded bg-muted px-1">20261028_pagina_publica_evento.sql</code>
              no SQL Editor do Supabase.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pagina_publica_ativa" className="flex-1">
                Página pública ativa
                <span className="block text-xs font-normal text-muted-foreground">
                  Nome e WhatsApp dos filósofos monitores das modalidades ficam visíveis publicamente.
                </span>
              </Label>
              <Switch id="pagina_publica_ativa" checked={ativa} onCheckedChange={setAtiva} />
            </div>

            {ativa && !eventData.visibilidade_publica && (
              <Alert className="flex gap-3 border-olimpics-orange-primary/40 bg-olimpics-orange-primary/5">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-olimpics-orange-primary" />
                <AlertDescription>
                  A <strong>Visibilidade Pública</strong> do evento (acima) está desligada: quem se cadastrar pela página
                  não vai encontrar este evento na tela de seleção para se inscrever.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="pagina_publica_slug">Endereço da página</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="pl-3 text-sm text-muted-foreground whitespace-nowrap">/event/</span>
                  <Input
                    id="pagina_publica_slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    maxLength={50}
                    className="border-0 pl-0.5 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="oficinas-eecc"
                  />
                </div>
                <Button type="button" variant="outline" onClick={() => setSlug(slugify(eventData.nome || ''))}>
                  <Wand2 className="mr-2 h-4 w-4" /> Gerar pelo nome
                </Button>
              </div>
              {slugError ? (
                <p className="text-xs text-destructive">{slugError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Também serve como subdomínio: <span className="font-mono">{buildPublicPageSubdomainUrl(slug || 'endereco')}</span>{' '}
                  (funciona depois que o DNS e a hospedagem desse subdomínio forem configurados).
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <Label htmlFor="pagina_publica_texto">Texto de divulgação</Label>
                <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setTexto(SUGGESTED_TEXT)}>
                  Usar texto sugerido
                </Button>
              </div>
              <Textarea
                id="pagina_publica_texto"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={9}
                placeholder="Mensagem exibida logo abaixo do topo da página. Aceita **negrito**, listas com - e títulos com ##."
              />
            </div>

            {pageUrl && (
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Link publicado</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="flex-1 break-all text-sm">{pageUrl}</code>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => copyLink(pageUrl)}>
                      <Copy className="mr-1.5 h-4 w-4" /> Copiar
                    </Button>
                    <Button type="button" size="sm" variant="outline" asChild>
                      <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1.5 h-4 w-4" /> Abrir
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !!slugError}
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              >
                {isSaving ? 'Salvando...' : 'Salvar página pública'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
