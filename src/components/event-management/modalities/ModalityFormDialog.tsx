
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Modality } from './hooks/useModalitiesData';
import { ModalityForm } from './hooks/useModalityMutations';

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

interface ModalityFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ModalityForm) => Promise<boolean>;
  editingModality: Modality | null;
  isSaving: boolean;
}

export function ModalityFormDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  editingModality, 
  isSaving 
}: ModalityFormDialogProps) {
  const [currentItem, setCurrentItem] = useState<ModalityForm>(defaultFormValues);

  useEffect(() => {
    if (editingModality) {
      setCurrentItem({
        nome: editingModality.nome || '',
        descricao: editingModality.descricao || '',
        vagas: editingModality.vagas || 0,
        is_ativo: editingModality.is_ativo || true,
        genero: editingModality.genero || 'MISTO',
        faixa_etaria_min: editingModality.faixa_etaria_min || 0,
        faixa_etaria_max: editingModality.faixa_etaria_max || null,
        tipo: editingModality.tipo || 'INDIVIDUAL'
      });
    } else {
      setCurrentItem(defaultFormValues);
    }
  }, [editingModality, isOpen]);

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
    const success = await onSave(currentItem);
    if (success) {
      onClose();
      setCurrentItem(defaultFormValues);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingModality ? 'Editar Modalidade' : 'Adicionar Modalidade'}
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
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
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
  );
}
