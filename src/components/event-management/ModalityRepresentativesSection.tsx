
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingState } from '@/components/dashboard/components/LoadingState';

interface ModalityRepresentative {
  id: string;
  filial_id: string;
  modalidade_id: number;
  atleta_id: string;
  criado_em: string;
  atualizado_em?: string;
  filial_nome: string;
  modalidade_nome: string;
  atleta_nome: string;
  atleta_email: string;
}

interface EnrolledAthlete {
  id: string;
  nome: string;
  email: string;
  filial_id: string;
  filial_nome: string;
}

interface Modality {
  id: number;
  nome: string;
}

export function ModalityRepresentativesSection({ eventId }: { eventId: string | null }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState<ModalityRepresentative | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilial, setSelectedFilial] = useState<string>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [formData, setFormData] = useState({
    filial_id: '',
    modalidade_id: '',
    atleta_id: ''
  });

  const queryClient = useQueryClient();

  // Fetch representatives
  const { data: representatives = [], isLoading: isLoadingRepresentatives } = useQuery({
    queryKey: ['modality-representatives', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidade_representantes')
        .select(`
          *,
          filiais!modalidade_representantes_filial_id_fkey (nome),
          modalidades!modalidade_representantes_modalidade_id_fkey (nome),
          usuarios!modalidade_representantes_atleta_id_fkey (nome, email)
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      return data.map(rep => ({
        id: rep.id,
        filial_id: rep.filial_id,
        modalidade_id: rep.modalidade_id,
        atleta_id: rep.atleta_id,
        criado_em: rep.criado_em,
        atualizado_em: rep.atualizado_em,
        filial_nome: rep.filiais?.nome || '',
        modalidade_nome: rep.modalidades?.nome || '',
        atleta_nome: rep.usuarios?.nome || '',
        atleta_email: rep.usuarios?.email || ''
      }));
    },
    enabled: !!eventId,
  });

  // Fetch enrolled athletes
  const { data: enrolledAthletes = [], isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['enrolled-athletes', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          usuarios!inner (
            id,
            nome,
            email,
            filiais!inner (
              id,
              nome
            )
          )
        `)
        .eq('evento_id', eventId)
        .eq('status', 'confirmada');

      if (error) throw error;

      // Remove duplicates and format data
      const uniqueAthletes = data.reduce((acc, item) => {
        const athlete = item.usuarios;
        if (athlete && !acc.find(a => a.id === athlete.id)) {
          acc.push({
            id: athlete.id,
            nome: athlete.nome,
            email: athlete.email,
            filial_id: athlete.filiais?.id || '',
            filial_nome: athlete.filiais?.nome || ''
          });
        }
        return acc;
      }, [] as EnrolledAthlete[]);

      return uniqueAthletes.sort((a, b) => a.nome.localeCompare(b.nome));
    },
    enabled: !!eventId,
  });

  // Fetch modalities
  const { data: modalities = [], isLoading: isLoadingModalities } = useQuery({
    queryKey: ['event-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome')
        .eq('evento_id', eventId)
        .order('nome');

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Mutation for saving representative
  const saveRepresentativeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingRepresentative) {
        const { error } = await supabase
          .from('modalidade_representantes')
          .update({
            filial_id: data.filial_id,
            modalidade_id: parseInt(data.modalidade_id),
            atleta_id: data.atleta_id,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', editingRepresentative.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('modalidade_representantes')
          .insert({
            filial_id: data.filial_id,
            modalidade_id: parseInt(data.modalidade_id),
            atleta_id: data.atleta_id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modality-representatives', eventId] });
      toast.success(editingRepresentative ? 'Representante atualizado com sucesso!' : 'Representante adicionado com sucesso!');
      setIsDialogOpen(false);
      setEditingRepresentative(null);
      setFormData({ filial_id: '', modalidade_id: '', atleta_id: '' });
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar representante: ${error.message}`);
    },
  });

  // Mutation for deleting representative
  const deleteRepresentativeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('modalidade_representantes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modality-representatives', eventId] });
      toast.success('Representante removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover representante: ${error.message}`);
    },
  });

  // Filter representatives
  const filteredRepresentatives = representatives.filter(rep => {
    const matchesSearch = rep.atleta_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.modalidade_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rep.filial_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilial = selectedFilial === 'all' || rep.filial_id === selectedFilial;
    const matchesModality = selectedModality === 'all' || rep.modalidade_id.toString() === selectedModality;

    return matchesSearch && matchesFilial && matchesModality;
  });

  // Get unique filials from representatives for filter
  const filials = Array.from(new Set(representatives.map(rep => ({ id: rep.filial_id, nome: rep.filial_nome }))))
    .filter(f => f.nome)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const handleEdit = (representative: ModalityRepresentative) => {
    setEditingRepresentative(representative);
    setFormData({
      filial_id: representative.filial_id,
      modalidade_id: representative.modalidade_id.toString(),
      atleta_id: representative.atleta_id
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRepresentative(null);
    setFormData({ filial_id: '', modalidade_id: '', atleta_id: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.filial_id || !formData.modalidade_id || !formData.atleta_id) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    saveRepresentativeMutation.mutate(formData);
  };

  const getAvailableAthletes = () => {
    if (!formData.filial_id) return [];
    return enrolledAthletes.filter(athlete => athlete.filial_id === formData.filial_id);
  };

  if (isLoadingRepresentatives || isLoadingAthletes || isLoadingModalities) {
    return <LoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-olimpics-green-primary">Representantes de Modalidades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por atleta, modalidade ou filial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedFilial} onValueChange={setSelectedFilial}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por filial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as filiais</SelectItem>
                  {filials.map(filial => (
                    <SelectItem key={filial.id} value={filial.id}>
                      {filial.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedModality} onValueChange={setSelectedModality}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  {modalities.map(modality => (
                    <SelectItem key={modality.id} value={modality.id.toString()}>
                      {modality.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Representante
            </Button>
          </div>

          {/* Representatives Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Filial</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepresentatives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {representatives.length === 0 
                          ? 'Nenhum representante cadastrado'
                          : 'Nenhum representante encontrado com os filtros aplicados'
                        }
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRepresentatives.map((representative) => (
                    <TableRow key={representative.id}>
                      <TableCell className="font-medium">{representative.atleta_nome}</TableCell>
                      <TableCell>{representative.atleta_email}</TableCell>
                      <TableCell>{representative.filial_nome}</TableCell>
                      <TableCell>{representative.modalidade_nome}</TableCell>
                      <TableCell>
                        {new Date(representative.criado_em).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(representative)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja remover este representante?')) {
                                deleteRepresentativeMutation.mutate(representative.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRepresentative ? 'Editar Representante' : 'Adicionar Representante'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="filial">Filial</Label>
                  <Select 
                    value={formData.filial_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, filial_id: value, atleta_id: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma filial" />
                    </SelectTrigger>
                    <SelectContent>
                      {filials.map(filial => (
                        <SelectItem key={filial.id} value={filial.id}>
                          {filial.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <Select 
                    value={formData.modalidade_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, modalidade_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalities.map(modality => (
                        <SelectItem key={modality.id} value={modality.id.toString()}>
                          {modality.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="atleta">Atleta</Label>
                  <Select 
                    value={formData.atleta_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, atleta_id: value }))}
                    disabled={!formData.filial_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.filial_id 
                          ? "Selecione uma filial primeiro" 
                          : "Selecione um atleta"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableAthletes().map(athlete => (
                        <SelectItem key={athlete.id} value={athlete.id}>
                          {athlete.nome} ({athlete.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saveRepresentativeMutation.isPending}
                    className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                  >
                    {saveRepresentativeMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
