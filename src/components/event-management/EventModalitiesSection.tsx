
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
import { Switch } from '@/components/ui/switch';
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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Plus, Search } from 'lucide-react';

interface Modality {
  id: string;
  evento_id: string;
  nome: string;
  descricao: string;
  vagas: number;
  is_ativo: boolean;
  genero: string;
  faixa_etaria_min: number;
  faixa_etaria_max: number | null;
  tipo: string;
}

interface ModalityForm {
  nome: string;
  descricao: string;
  vagas: number;
  is_ativo: boolean;
  genero: string;
  faixa_etaria_min: number;
  faixa_etaria_max: number | null;
  tipo: string;
}

const defaultFormValues: ModalityForm = {
  nome: '',
  descricao: '',
  vagas: 0,
  is_ativo: true,
  genero: 'MISTO',
  faixa_etaria_min: 0,
  faixa_etaria_max: null,
  tipo: 'INDIVIDUAL'
};

export function EventModalitiesSection({ eventId }: { eventId: string | null }) {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<ModalityForm>(defaultFormValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch modalities
  useEffect(() => {
    const fetchModalities = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('modalidades')
          .select('*')
          .eq('evento_id', eventId)
          .order('nome');
        
        if (error) throw error;
        
        setModalities(data || []);
      } catch (error) {
        console.error('Error fetching modalities:', error);
        toast.error('Erro ao carregar modalidades');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModalities();
  }, [eventId]);

  const openAddDialog = () => {
    setEditingId(null);
    setCurrentItem(defaultFormValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Modality) => {
    setEditingId(item.id);
    setCurrentItem({
      nome: item.nome || '',
      descricao: item.descricao || '',
      vagas: item.vagas || 0,
      is_ativo: item.is_ativo || true,
      genero: item.genero || 'MISTO',
      faixa_etaria_min: item.faixa_etaria_min || 0,
      faixa_etaria_max: item.faixa_etaria_max || null,
      tipo: item.tipo || 'INDIVIDUAL'
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? 
      Number(e.target.value) : 
      e.target.value;
    
    setCurrentItem({
      ...currentItem,
      [e.target.name]: value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentItem({
      ...currentItem,
      is_ativo: checked
    });
  };

  const handleSave = async () => {
    if (!eventId) return;
    
    // Basic validation
    if (!currentItem.nome) {
      toast.error('O nome da modalidade é obrigatório');
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing item
        const { error } = await supabase
          .from('modalidades')
          .update({
            nome: currentItem.nome,
            descricao: currentItem.descricao,
            vagas: currentItem.vagas,
            is_ativo: currentItem.is_ativo,
            genero: currentItem.genero,
            faixa_etaria_min: currentItem.faixa_etaria_min,
            faixa_etaria_max: currentItem.faixa_etaria_max,
            tipo: currentItem.tipo
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        // Update local state
        setModalities(modalities.map(item => 
          item.id === editingId 
            ? { ...item, ...currentItem } 
            : item
        ));
        
        toast.success('Modalidade atualizada com sucesso!');
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('modalidades')
          .insert({
            evento_id: eventId,
            nome: currentItem.nome,
            descricao: currentItem.descricao,
            vagas: currentItem.vagas,
            is_ativo: currentItem.is_ativo,
            genero: currentItem.genero,
            faixa_etaria_min: currentItem.faixa_etaria_min,
            faixa_etaria_max: currentItem.faixa_etaria_max,
            tipo: currentItem.tipo
          })
          .select();
        
        if (error) throw error;
        
        // Update local state
        if (data && data.length > 0) {
          setModalities([...modalities, data[0]]);
        }
        
        toast.success('Modalidade adicionada com sucesso!');
      }
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setEditingId(null);
      setCurrentItem(defaultFormValues);
    } catch (error) {
      console.error('Error saving modality:', error);
      toast.error('Erro ao salvar modalidade');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta modalidade?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('modalidades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setModalities(modalities.filter(item => item.id !== id));
      
      toast.success('Modalidade excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting modality:', error);
      toast.error('Erro ao excluir modalidade');
    }
  };

  const filteredModalities = modalities.filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar modalidade..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={openAddDialog} 
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Modalidade
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Gênero</TableHead>
                  <TableHead>Faixa Etária</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModalities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Nenhuma modalidade encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModalities.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>
                        {item.tipo === 'INDIVIDUAL' ? 'Individual' : 
                         item.tipo === 'EQUIPE' ? 'Equipe' : 
                         item.tipo === 'DUPLA' ? 'Dupla' : item.tipo}
                      </TableCell>
                      <TableCell>
                        {item.genero === 'MASCULINO' ? 'Masculino' : 
                         item.genero === 'FEMININO' ? 'Feminino' : 'Misto'}
                      </TableCell>
                      <TableCell>
                        {item.faixa_etaria_min}{item.faixa_etaria_max ? ` - ${item.faixa_etaria_max}` : '+'} anos
                      </TableCell>
                      <TableCell>{item.vagas}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_ativo ? "default" : "secondary"}>
                          {item.is_ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Modalidade' : 'Adicionar Modalidade'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Modalidade</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={currentItem.nome}
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
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="EQUIPE">Equipe</SelectItem>
                    <SelectItem value="DUPLA">Dupla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genero">Gênero</Label>
                <Select 
                  value={currentItem.genero} 
                  onValueChange={(value) => handleSelectChange('genero', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MISTO">Misto</SelectItem>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vagas">Número de Vagas</Label>
                <Input
                  id="vagas"
                  name="vagas"
                  type="number"
                  value={currentItem.vagas}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="faixa_etaria_min">Idade Mínima</Label>
                <Input
                  id="faixa_etaria_min"
                  name="faixa_etaria_min"
                  type="number"
                  value={currentItem.faixa_etaria_min}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="faixa_etaria_max">Idade Máxima (deixe em branco para sem limite)</Label>
                <Input
                  id="faixa_etaria_max"
                  name="faixa_etaria_max"
                  type="number"
                  value={currentItem.faixa_etaria_max || ''}
                  onChange={handleInputChange}
                  placeholder="Sem limite"
                />
              </div>
              
              <div className="space-y-2 flex items-center">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="is_ativo">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_ativo"
                      checked={currentItem.is_ativo}
                      onCheckedChange={handleSwitchChange}
                    />
                    <span>{currentItem.is_ativo ? 'Ativa' : 'Inativa'}</span>
                  </div>
                </div>
              </div>
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
