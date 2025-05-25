
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  nome: string;
  regra?: ModalityRule;
}

interface ModalityRule {
  id?: string;
  modalidade_id: string;
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'baterias' | 'sets' | 'arrows';
  parametros: {
    unidade?: string;
    num_tentativas?: number;
    num_sets?: number;
    pontua_por_set?: boolean;
    num_raias?: number;
    zonas?: Array<{ nome: string; pontos: number }>;
    num_flechas?: number;
    formato_tempo?: 'mm:ss.SS' | 'hh:mm:ss';
    [key: string]: any;
  };
}

interface RuleForm {
  regra_tipo: 'pontos' | 'distancia' | 'tempo' | 'baterias' | 'sets' | 'arrows';
  parametros: {
    unidade?: string;
    num_tentativas?: number;
    num_sets?: number;
    pontua_por_set?: boolean;
    num_raias?: number;
    zonas?: Array<{ nome: string; pontos: number }>;
    num_flechas?: number;
    formato_tempo?: 'mm:ss.SS' | 'hh:mm:ss';
  };
}

const defaultFormValues: RuleForm = {
  regra_tipo: 'pontos',
  parametros: {}
};

export function EventModalityRulesSection({ eventId }: { eventId: string | null }) {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<RuleForm>(defaultFormValues);
  const [editingModalityId, setEditingModalityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchModalitiesAndRules = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        // Fetch modalities
        const { data: modalitiesData, error: modalitiesError } = await supabase
          .from('modalidades')
          .select('id, nome')
          .eq('evento_id', eventId)
          .order('nome');
        
        if (modalitiesError) throw modalitiesError;

        // Fetch existing rules
        const { data: rulesData, error: rulesError } = await supabase
          .from('modalidade_regras')
          .select('*')
          .in('modalidade_id', modalitiesData?.map(m => m.id) || []);
        
        if (rulesError) throw rulesError;

        // Combine modalities with their rules
        const modalitiesWithRules = modalitiesData?.map(modality => ({
          ...modality,
          regra: rulesData?.find(rule => rule.modalidade_id === modality.id)
        })) || [];
        
        setModalities(modalitiesWithRules);
      } catch (error) {
        console.error('Error fetching modalities and rules:', error);
        toast.error('Erro ao carregar modalidades e regras');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModalitiesAndRules();
  }, [eventId]);

  const openAddRuleDialog = (modalityId: string) => {
    const modality = modalities.find(m => m.id === modalityId);
    setEditingModalityId(modalityId);
    
    if (modality?.regra) {
      setCurrentItem({
        regra_tipo: modality.regra.regra_tipo,
        parametros: modality.regra.parametros
      });
    } else {
      setCurrentItem(defaultFormValues);
    }
    
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingModalityId) return;
    
    setIsSaving(true);
    try {
      const modality = modalities.find(m => m.id === editingModalityId);
      
      if (modality?.regra) {
        // Update existing rule
        const { error } = await supabase
          .from('modalidade_regras')
          .update({
            regra_tipo: currentItem.regra_tipo,
            parametros: currentItem.parametros
          })
          .eq('modalidade_id', editingModalityId);
        
        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('modalidade_regras')
          .insert({
            modalidade_id: editingModalityId,
            regra_tipo: currentItem.regra_tipo,
            parametros: currentItem.parametros
          });
        
        if (error) throw error;
      }
      
      // Refresh the data
      const { data: updatedRule } = await supabase
        .from('modalidade_regras')
        .select('*')
        .eq('modalidade_id', editingModalityId)
        .single();
      
      setModalities(modalities.map(m => 
        m.id === editingModalityId 
          ? { ...m, regra: updatedRule }
          : m
      ));
      
      toast.success('Regra salva com sucesso!');
      setIsDialogOpen(false);
      setEditingModalityId(null);
      setCurrentItem(defaultFormValues);
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Erro ao salvar regra');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (modalityId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('modalidade_regras')
        .delete()
        .eq('modalidade_id', modalityId);
      
      if (error) throw error;
      
      setModalities(modalities.map(m => 
        m.id === modalityId 
          ? { ...m, regra: undefined }
          : m
      ));
      
      toast.success('Regra excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Erro ao excluir regra');
    }
  };

  const updateParametros = (field: string, value: any) => {
    setCurrentItem({
      ...currentItem,
      parametros: {
        ...currentItem.parametros,
        [field]: value
      }
    });
  };

  const renderParametrosFields = () => {
    switch (currentItem.regra_tipo) {
      case 'distancia':
        return (
          <div className="space-y-4">
            <div>
              <Label>Unidade</Label>
              <Select 
                value={currentItem.parametros.unidade || 'metros'} 
                onValueChange={(value) => updateParametros('unidade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metros">Metros</SelectItem>
                  <SelectItem value="centimetros">Centímetros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'tempo':
        return (
          <div className="space-y-4">
            <div>
              <Label>Formato do Tempo</Label>
              <Select 
                value={currentItem.parametros.formato_tempo || 'mm:ss.SS'} 
                onValueChange={(value) => updateParametros('formato_tempo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm:ss.SS">mm:ss.SS</SelectItem>
                  <SelectItem value="hh:mm:ss">hh:mm:ss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'baterias':
        return (
          <div className="space-y-4">
            <div>
              <Label>Número de Tentativas</Label>
              <Input
                type="number"
                min="1"
                value={currentItem.parametros.num_tentativas || 1}
                onChange={(e) => updateParametros('num_tentativas', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label>Número de Raias (opcional)</Label>
              <Input
                type="number"
                min="1"
                value={currentItem.parametros.num_raias || ''}
                onChange={(e) => updateParametros('num_raias', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label>Unidade</Label>
              <Select 
                value={currentItem.parametros.unidade || 'pontos'} 
                onValueChange={(value) => updateParametros('unidade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontos">Pontos</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="metros">Metros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'sets':
        return (
          <div className="space-y-4">
            <div>
              <Label>Número de Sets</Label>
              <Input
                type="number"
                min="1"
                value={currentItem.parametros.num_sets || 1}
                onChange={(e) => updateParametros('num_sets', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentItem.parametros.pontua_por_set !== false}
                onCheckedChange={(checked) => updateParametros('pontua_por_set', checked)}
              />
              <Label>Pontua por set (se desmarcado, apenas vitórias contam)</Label>
            </div>
          </div>
        );
      
      case 'arrows':
        return (
          <div className="space-y-4">
            <div>
              <Label>Número de Flechas</Label>
              <Input
                type="number"
                min="1"
                value={currentItem.parametros.num_flechas || 6}
                onChange={(e) => updateParametros('num_flechas', parseInt(e.target.value))}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const filteredModalities = modalities.filter(modality => 
    modality.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Regras de Pontuação das Modalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar modalidade..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Tipo de Regra</TableHead>
                  <TableHead>Parâmetros</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModalities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhuma modalidade encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModalities.map((modality) => (
                    <TableRow key={modality.id}>
                      <TableCell className="font-medium">{modality.nome}</TableCell>
                      <TableCell>
                        {modality.regra ? (
                          <Badge variant="default">
                            {modality.regra.regra_tipo === 'pontos' ? 'Pontos' :
                             modality.regra.regra_tipo === 'distancia' ? 'Distância' :
                             modality.regra.regra_tipo === 'tempo' ? 'Tempo' :
                             modality.regra.regra_tipo === 'baterias' ? 'Baterias' :
                             modality.regra.regra_tipo === 'sets' ? 'Sets' :
                             modality.regra.regra_tipo === 'arrows' ? 'Flechas' :
                             modality.regra.regra_tipo}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Não configurada</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {modality.regra && (
                          <div className="text-sm">
                            {Object.entries(modality.regra.parametros).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={modality.regra ? "default" : "secondary"}>
                          {modality.regra ? 'Configurada' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openAddRuleDialog(modality.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {modality.regra && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteRule(modality.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
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
              Configurar Regra de Pontuação
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Tipo de Regra</Label>
              <Select 
                value={currentItem.regra_tipo} 
                onValueChange={(value: any) => setCurrentItem({ ...currentItem, regra_tipo: value, parametros: {} })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontos">Pontos</SelectItem>
                  <SelectItem value="distancia">Distância</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="baterias">Baterias/Tentativas</SelectItem>
                  <SelectItem value="sets">Sets</SelectItem>
                  <SelectItem value="arrows">Flechas (Tiro com Arco)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {renderParametrosFields()}
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
