import { LoadingImage } from '@/components/ui/loading-image';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Users, MapPin, ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEventBranches } from '@/hooks/useEventBranches';
import {
    useDelegacoes,
    createDelegacao,
    updateDelegacao,
    deleteDelegacao,
    setDelegacaoFiliais,
    addDelegacaoRepresentante,
    removeDelegacaoRepresentante,
} from '@/hooks/useDelegacoes';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface DelegationsManagerProps {
    eventId: string;
}

export function DelegationsManager({ eventId }: DelegationsManagerProps) {
    const queryClient = useQueryClient();
    const { data: delegacoes = [], isLoading } = useDelegacoes(eventId);
    const { data: eventBranches = [] } = useEventBranches(eventId);

    // Fetch delegation representatives (users with RDD role in this event)
    const { data: delegationReps = [] } = useQuery({
        queryKey: ['delegation-reps-for-event', eventId],
        queryFn: async () => {
            // Get users who have the RDD (Representante de Delegação) role for this event
            const { data, error } = await supabase
                .from('papeis_usuarios')
                .select(`
                    usuario_id,
                    perfis!inner(
                        perfis_tipo!inner(codigo)
                    ),
                    usuarios!papeis_usuarios_usuario_id_fkey(id, nome_completo, email)
                `)
                .eq('evento_id', eventId);

            if (error) {
                console.error('Error fetching delegation reps:', error);
                return [];
            }

            // Filter for RDD role and deduplicate by usuario_id
            const seen = new Map<string, any>();
            for (const row of (data || [])) {
                const roleCode = (row as any).perfis?.perfis_tipo?.codigo;
                if (roleCode !== 'RDD') continue;
                if (seen.has(row.usuario_id)) continue;

                const user = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios;
                if (user?.nome_completo) {
                    seen.set(row.usuario_id, {
                        id: row.usuario_id,
                        nome_completo: user.nome_completo,
                        email: user.email || '',
                    });
                }
            }
            return Array.from(seen.values());
        },
        enabled: !!eventId,
    });

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createDesc, setCreateDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!createName.trim()) return;
        setIsSubmitting(true);
        try {
            await createDelegacao(eventId, createName.trim(), createDesc.trim());
            toast.success('Delegação criada com sucesso!');
            setCreateName('');
            setCreateDesc('');
            setShowCreateDialog(false);
            queryClient.invalidateQueries({ queryKey: ['delegacoes', eventId] });
        } catch (err: any) {
            toast.error(err.message || 'Erro ao criar delegação');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDelegacao(id);
            toast.success('Delegação removida');
            queryClient.invalidateQueries({ queryKey: ['delegacoes', eventId] });
        } catch (err: any) {
            toast.error(err.message || 'Erro ao remover delegação');
        }
    };

    const refetch = () => queryClient.invalidateQueries({ queryKey: ['delegacoes', eventId] });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingImage size="sm" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="border-olimpics-green-primary/20">
                <CardHeader className="bg-olimpics-green-primary/5 px-4 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Users className="h-5 w-5 text-olimpics-green-primary flex-shrink-0" />
                            <div className="min-w-0">
                                <CardTitle className="text-olimpics-green-primary text-lg">
                                    Delegações
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Agrupe filiais em delegações para eventos nacionais/internacionais
                                </CardDescription>
                            </div>
                        </div>

                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-1 w-full sm:w-auto flex-shrink-0">
                                    <Plus className="h-4 w-4" />
                                    Nova Delegação
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nova Delegação</DialogTitle>
                                    <DialogDescription>
                                        Crie uma delegação para agrupar várias filiais sob uma representação única.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div>
                                        <Label>Nome</Label>
                                        <Input
                                            value={createName}
                                            onChange={(e) => setCreateName(e.target.value)}
                                            placeholder="Ex: Delegação Brasil"
                                        />
                                    </div>
                                    <div>
                                        <Label>Descrição (opcional)</Label>
                                        <Textarea
                                            value={createDesc}
                                            onChange={(e) => setCreateDesc(e.target.value)}
                                            placeholder="Ex: Todas as filiais brasileiras"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreate} disabled={!createName.trim() || isSubmitting}>
                                        {isSubmitting ? 'Salvando...' : 'Criar'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    {delegacoes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">Nenhuma delegação criada</p>
                            <p className="text-sm mt-1">Crie uma delegação para agrupar filiais deste evento.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {delegacoes.map((delegacao: any) => (
                                <DelegationCard
                                    key={delegacao.id}
                                    delegacao={delegacao}
                                    eventBranches={eventBranches}
                                    delegationReps={delegationReps}
                                    isExpanded={expandedId === delegacao.id}
                                    onToggle={() => setExpandedId(expandedId === delegacao.id ? null : delegacao.id)}
                                    onDelete={() => handleDelete(delegacao.id)}
                                    refetch={refetch}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// --- Sub-component: single delegation card ---

interface DelegationCardProps {
    delegacao: any;
    eventBranches: any[];
    delegationReps: any[];
    isExpanded: boolean;
    onToggle: () => void;
    onDelete: () => void;
    refetch: () => void;
}

function DelegationCard({ delegacao, eventBranches, delegationReps, isExpanded, onToggle, onDelete, refetch }: DelegationCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(delegacao.nome);
    const [editDesc, setEditDesc] = useState(delegacao.descricao || '');
    const [isSaving, setIsSaving] = useState(false);

    // Current filiais for this delegation
    const currentFilialIds = (delegacao.delegacao_filiais || []).map((df: any) => df.filial_id);
    const currentReps = (delegacao.delegacao_representantes || []).map((dr: any) => {
        const user = Array.isArray(dr.usuarios) ? dr.usuarios[0] : dr.usuarios;
        return { id: dr.usuario_id, nome_completo: user?.nome_completo || '', email: user?.email || '' };
    });

    // Available reps = those not already in THIS delegation
    const availableReps = delegationReps.filter(
        (r: any) => !currentReps.some((cr: any) => cr.id === r.id)
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDelegacao(delegacao.id, editName.trim(), editDesc.trim());
            setIsEditing(false);
            toast.success('Delegação atualizada');
            refetch();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFilialToggle = async (filialId: string, checked: boolean) => {
        const newFilials = checked
            ? [...currentFilialIds, filialId]
            : currentFilialIds.filter((id: string) => id !== filialId);
        try {
            await setDelegacaoFiliais(delegacao.id, newFilials);
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Erro ao atualizar filiais');
        }
    };

    const handleAddRep = async (userId: string) => {
        try {
            await addDelegacaoRepresentante(delegacao.id, userId);
            toast.success('Representante adicionado');
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Erro ao adicionar representante');
        }
    };

    const handleRemoveRep = async (userId: string) => {
        try {
            await removeDelegacaoRepresentante(delegacao.id, userId);
            toast.success('Representante removido');
            refetch();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const filialCount = currentFilialIds.length;
    const repCount = currentReps.length;

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div>
                        <h4 className="font-semibold text-sm">{delegacao.nome}</h4>
                        {delegacao.descricao && (
                            <p className="text-xs text-muted-foreground truncate">{delegacao.descricao}</p>
                        )}
                    </div>
                    <div className="flex gap-1.5">
                        <Badge variant="secondary" className="text-xs gap-1">
                            <MapPin className="h-3 w-3" />
                            {filialCount} {filialCount === 1 ? 'filial' : 'filiais'}
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1">
                            <Users className="h-3 w-3" />
                            {repCount} {repCount === 1 ? 'rep' : 'reps'}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remover delegação?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação removerá a delegação, suas filiais associadas e seus representantes. Não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                                    Remover
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className="p-4 space-y-4 border-t">
                    {/* Edit name/description */}
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="text-sm"
                                />
                                <Textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={1}
                                    className="text-sm"
                                />
                                <div className="flex gap-1">
                                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1">
                                        <Save className="h-3 w-3" /> Salvar
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-1">
                                <Edit2 className="h-3 w-3" /> Editar
                            </Button>
                        )}
                    </div>

                    {/* Filiais section */}
                    <div>
                        <Label className="text-sm font-semibold mb-2 block">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            Filiais desta delegação
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {eventBranches.map((branch: any) => {
                                const filialId = branch.id;
                                const filialName = branch.nome || 'N/A';
                                const filialCity = branch.cidade || '';
                                const filialState = branch.estado || '';
                                const isChecked = currentFilialIds.includes(filialId);

                                return (
                                    <label
                                        key={filialId}
                                        className={`flex items-center gap-2 p-2 rounded border text-sm cursor-pointer transition ${isChecked ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(checked) => handleFilialToggle(filialId, !!checked)}
                                        />
                                        <div className="min-w-0">
                                            <span className="font-medium">{filialName}</span>
                                            {(filialCity || filialState) && (
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    ({filialCity}{filialCity && filialState ? ', ' : ''}{filialState})
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Gestor da Delegação section */}
                    <div>
                        <Label className="text-sm font-semibold mb-2 block">
                            <Users className="h-4 w-4 inline mr-1" />
                            Gestor da Delegação
                        </Label>

                        {/* Current reps */}
                        {currentReps.length > 0 && (
                            <div className="space-y-1 mb-2">
                                {currentReps.map((rep: any) => (
                                    <div key={rep.id} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                        <div>
                                            <span className="font-medium">{rep.nome_completo}</span>
                                            <span className="text-xs text-muted-foreground ml-2">{rep.email}</span>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-red-500"
                                            onClick={() => handleRemoveRep(rep.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add rep */}
                        {availableReps.length > 0 && (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {availableReps.map((rep: any) => (
                                    <div key={rep.id} className="flex items-center justify-between p-2 border rounded text-sm hover:bg-gray-50">
                                        <div>
                                            <span>{rep.nome_completo}</span>
                                            <span className="text-xs text-muted-foreground ml-2">{rep.email}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 text-xs"
                                            onClick={() => handleAddRep(rep.id)}
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Adicionar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {availableReps.length === 0 && currentReps.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Nenhum usuário com perfil "Representante de Delegação" (RDD) encontrado para este evento. Adicione esse perfil a um usuário primeiro.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

