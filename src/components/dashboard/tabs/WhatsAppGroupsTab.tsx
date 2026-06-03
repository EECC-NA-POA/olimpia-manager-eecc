import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  useWhatsAppGroupsByFilial,
  useUpsertWhatsAppGroup,
  useDeleteWhatsAppGroup,
  WhatsAppGroup,
} from '@/hooks/useModalityGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { MessageCircle, ExternalLink, Trash2, Loader2, Plus, Pencil } from 'lucide-react';
import { EnrollmentType } from '@/hooks/useEnrollAthleteInModality';

interface WhatsAppGroupsTabProps {
  eventId: string;
  enrollmentType: EnrollmentType;
  filialIds?: string[];
}

interface ModalityOption {
  id: number;
  nome: string;
}

function isValidWhatsAppLink(url: string): boolean {
  return url.startsWith('https://chat.whatsapp.com/') || url.startsWith('https://wa.me/');
}

/* ── Group editor dialog ─────────────────────────────────────── */
function GroupDialog({
  open,
  onOpenChange,
  eventId,
  filialId,
  modalities,
  editing,
  takenModalityIds,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eventId: string;
  filialId: string;
  modalities: ModalityOption[];
  editing: WhatsAppGroup | null;
  takenModalityIds: Set<number>;
}) {
  const upsert = useUpsertWhatsAppGroup();
  const [nome, setNome] = useState(editing?.nome ?? '');
  const [link, setLink] = useState(editing?.link_grupo ?? '');
  const [selected, setSelected] = useState<Set<number>>(new Set(editing?.modalidade_ids ?? []));

  // Re-init state when dialog opens for a different group
  const [lastEditingId, setLastEditingId] = useState<number | null | undefined>(undefined);
  if (open && lastEditingId !== (editing?.id ?? null)) {
    setLastEditingId(editing?.id ?? null);
    setNome(editing?.nome ?? '');
    setLink(editing?.link_grupo ?? '');
    setSelected(new Set(editing?.modalidade_ids ?? []));
  }

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const linkValid = isValidWhatsAppLink(link);
  const canSave = nome.trim() && linkValid && selected.size > 0;

  const handleSave = () => {
    if (!canSave) return;
    upsert.mutate(
      {
        id: editing?.id,
        eventoId: eventId,
        filialId,
        nome: nome.trim(),
        linkGrupo: link.trim(),
        modalidadeIds: Array.from(selected),
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar grupo' : 'Novo grupo WhatsApp'}</DialogTitle>
          <DialogDescription>
            Dê um nome ao grupo, cole o link e selecione as modalidades que pertencem a ele.
            Um grupo pode abranger várias modalidades (ex: "Atletismo").
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nome do grupo</label>
            <Input placeholder="Ex: Atletismo, Xadrez..." value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Link do grupo</label>
            <Input
              placeholder="https://chat.whatsapp.com/..."
              value={link}
              onChange={e => setLink(e.target.value)}
              className={link && !linkValid ? 'border-red-400' : ''}
            />
            {link && !linkValid && (
              <p className="text-xs text-red-500">Deve começar com https://chat.whatsapp.com/ ou https://wa.me/</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Modalidades neste grupo {selected.size > 0 && <Badge variant="secondary" className="ml-1">{selected.size}</Badge>}
            </label>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {modalities.map(m => {
                const takenByOther = takenModalityIds.has(m.id) && !editing?.modalidade_ids.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 px-3 py-2.5 ${takenByOther ? 'opacity-50' : 'cursor-pointer hover:bg-muted/40'}`}
                  >
                    <Checkbox
                      checked={selected.has(m.id)}
                      onCheckedChange={() => !takenByOther && toggle(m.id)}
                      disabled={takenByOther}
                    />
                    <span className="text-sm flex-1">{m.nome}</span>
                    {takenByOther && <span className="text-xs text-muted-foreground">já em outro grupo</span>}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave || upsert.isPending}>
            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Group list for a single filial ──────────────────────────── */
function FilialGroups({ eventId, filialId }: { eventId: string; filialId: string }) {
  const { data: groups = [], isLoading } = useWhatsAppGroupsByFilial(eventId, filialId);
  const remove = useDeleteWhatsAppGroup();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WhatsAppGroup | null>(null);

  // Modalities with enrollments in this event
  const { data: modalities = [], isLoading: loadingMod } = useQuery({
    queryKey: ['modalities-with-enrollments', eventId],
    queryFn: async (): Promise<ModalityOption[]> => {
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select('modalidade_id, modalidades(id, nome)')
        .eq('evento_id', eventId)
        .not('status', 'eq', 'cancelado');
      if (error) throw error;
      const seen = new Set<number>();
      return (data || [])
        .filter((r: any) => { if (seen.has(r.modalidade_id)) return false; seen.add(r.modalidade_id); return true; })
        .map((r: any) => ({ id: r.modalidade_id, nome: r.modalidades?.nome ?? 'Desconhecida' }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    },
    enabled: !!eventId,
  });

  const modalityName = (id: number) => modalities.find(m => m.id === id)?.nome ?? `#${id}`;

  // Modalities already assigned to some group (to prevent double-assignment)
  const takenModalityIds = new Set<number>();
  groups.forEach(g => g.modalidade_ids.forEach(id => takenModalityIds.add(id)));

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (g: WhatsAppGroup) => { setEditing(g); setDialogOpen(true); };

  if (isLoading || loadingMod) {
    return <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo grupo
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg border-dashed">
          Nenhum grupo cadastrado. Clique em "Novo grupo" para começar.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(g => (
            <div key={g.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-sm truncate">{g.nome}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={g.link_grupo} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-8 w-8" title="Abrir grupo">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(g)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline" size="icon"
                    className="h-8 w-8 text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => remove.mutate(g.id)}
                    disabled={remove.isPending}
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.modalidade_ids.map(id => (
                  <Badge key={id} variant="secondary" className="text-xs">{modalityName(id)}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <GroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        filialId={filialId}
        modalities={modalities}
        editing={editing}
        takenModalityIds={takenModalityIds}
      />
    </div>
  );
}

/* ── Organizer view: filial selector ─────────────────────────── */
function OrganizerView({ eventId }: { eventId: string }) {
  const [selectedFilial, setSelectedFilial] = useState<string>('');
  const { data: filiais = [], isLoading } = useQuery({
    queryKey: ['filiais-with-enrollments', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select('usuarios!atleta_id(filial_id, filiais(id, nome))')
        .eq('evento_id', eventId)
        .not('status', 'eq', 'cancelado');
      if (error) throw error;
      const seen = new Set<string>();
      return (data || [])
        .map((r: any) => r.usuarios?.filiais)
        .filter(Boolean)
        .filter((f: any) => { if (seen.has(f.id)) return false; seen.add(f.id); return true; })
        .sort((a: any, b: any) => a.nome.localeCompare(b.nome, 'pt-BR'));
    },
    enabled: !!eventId,
  });

  if (isLoading) {
    return <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Carregando delegações...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 max-w-xs">
        <label className="text-sm font-medium">Selecione a delegação</label>
        <Select value={selectedFilial} onValueChange={setSelectedFilial}>
          <SelectTrigger><SelectValue placeholder="Escolha uma delegação..." /></SelectTrigger>
          <SelectContent>
            {filiais.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {selectedFilial && <FilialGroups eventId={eventId} filialId={selectedFilial} />}
    </div>
  );
}

/* ── Main tab ────────────────────────────────────────────────── */
export function WhatsAppGroupsTab({ eventId, enrollmentType, filialIds }: WhatsAppGroupsTabProps) {
  const primaryFilialId = filialIds?.[0];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-green-600" />
        <h2 className="text-2xl font-bold text-olimpics-text">Grupos WhatsApp</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Crie grupos e associe uma ou mais modalidades a cada um. Um grupo pode unificar várias modalidades
        (ex: <strong>Atletismo</strong> → Corrida + Arremesso + Lançamento). O atleta com inscrição
        <strong> confirmada</strong> em qualquer modalidade do grupo verá o link.
      </p>

      {enrollmentType === 'delegacao' && primaryFilialId ? (
        <FilialGroups eventId={eventId} filialId={primaryFilialId} />
      ) : (
        <OrganizerView eventId={eventId} />
      )}
    </div>
  );
}
