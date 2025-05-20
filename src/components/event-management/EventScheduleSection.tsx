
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { LoadingState } from '@/components/dashboard/components/LoadingState';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Plus } from 'lucide-react';

interface ScheduleItem {
  id: string;
  evento_id: string;
  titulo: string;
  descricao: string;
  local: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: string;
}

interface ScheduleForm {
  titulo: string;
  descricao: string;
  local: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: string;
}

const defaultFormValues: ScheduleForm = {
  titulo: '',
  descricao: '',
  local: '',
  data: '',
  hora_inicio: '',
  hora_fim: '',
  tipo: 'JOGO'
};

export function EventScheduleSection({ eventId }: { eventId: string | null }) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<ScheduleForm>(defaultFormValues);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch schedule items
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('cronograma')
          .select('*')
          .eq('evento_id', eventId)
          .order('data', { ascending: true })
          .order('hora_inicio', { ascending: true });
        
        if (error) throw error;
        
        setScheduleItems(data || []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        toast.error('Erro ao carregar itens de cronograma');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedule();
  }, [eventId]);

  const openAddDialog = () => {
    setEditingId(null);
    setCurrentItem(defaultFormValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ScheduleItem) => {
    // Format date to YYYY-MM-DD for input[type="date"]
    const formattedDate = item.data ? new Date(item.data).toISOString().split('T')[0] : '';
    
    setEditingId(item.id);
    setCurrentItem({
      titulo: item.titulo || '',
      descricao: item.descricao || '',
      local: item.local || '',
      data: formattedDate,
      hora_inicio: item.hora_inicio || '',
      hora_fim: item.hora_fim || '',
      tipo: item.tipo || 'JOGO'
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentItem({
      ...currentItem,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!eventId) return;
    
    // Basic validation
    if (!currentItem.titulo || !currentItem.data) {
      toast.error('Preencha pelo menos o título e a data');
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from('cronograma')
          .update({
            titulo: currentItem.titulo,
            descricao: currentItem.descricao,
            local: currentItem.local,
            data: currentItem.data,
            hora_inicio: currentItem.hora_inicio,
            hora_fim: currentItem.hora_fim,
            tipo: currentItem.tipo
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        // Update local state
        setScheduleItems(scheduleItems.map(item => 
          item.id === editingId 
            ? { ...item, ...currentItem } 
            : item
        ));
        
        toast.success('Item de cronograma atualizado com sucesso!');
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('cronograma')
          .insert({
            evento_id: eventId,
            titulo: currentItem.titulo,
            descricao: currentItem.descricao,
            local: currentItem.local,
            data: currentItem.data,
            hora_inicio: currentItem.hora_inicio,
            hora_fim: currentItem.hora_fim,
            tipo: currentItem.tipo
          })
          .select();
        
        if (error) throw error;
        
        // Update local state
        if (data && data.length > 0) {
          setScheduleItems([...scheduleItems, data[0]]);
        }
        
        toast.success('Item de cronograma adicionado com sucesso!');
      }
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setEditingId(null);
      setCurrentItem(defaultFormValues);
    } catch (error) {
      console.error('Error saving schedule item:', error);
      toast.error('Erro ao salvar item de cronograma');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item do cronograma?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('cronograma')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setScheduleItems(scheduleItems.filter(item => item.id !== id));
      
      toast.success('Item de cronograma excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast.error('Erro ao excluir item de cronograma');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Cronograma do Evento</h3>
              <Button 
                onClick={openAddDialog} 
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Item
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum item de cronograma encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  scheduleItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.titulo}</TableCell>
                      <TableCell>{formatDate(item.data)}</TableCell>
                      <TableCell>
                        {item.hora_inicio} {item.hora_fim ? `- ${item.hora_fim}` : ''}
                      </TableCell>
                      <TableCell>{item.local}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Item do Cronograma' : 'Adicionar Item ao Cronograma'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                value={currentItem.titulo}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={currentItem.data}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={currentItem.tipo} 
                  onValueChange={(value) => handleSelectChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JOGO">Jogo</SelectItem>
                    <SelectItem value="CERIMONIA">Cerimônia</SelectItem>
                    <SelectItem value="TREINAMENTO">Treinamento</SelectItem>
                    <SelectItem value="REUNIAO">Reunião</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora de Início</Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  value={currentItem.hora_inicio}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hora_fim">Hora de Término</Label>
                <Input
                  id="hora_fim"
                  name="hora_fim"
                  type="time"
                  value={currentItem.hora_fim}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                name="local"
                value={currentItem.local}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={currentItem.descricao}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
