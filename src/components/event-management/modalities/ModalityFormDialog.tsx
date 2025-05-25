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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Modality, ModalityForm } from './types';

const defaultFormValues: ModalityForm = {
  nome: '',
  tipo_pontuacao: 'pontos',
  tipo_modalidade: 'individual',
  categoria: 'misto',
  status: 'Ativa',
  limite_vagas: 0,
  grupo: null,
  faixa_etaria: 'adulto'
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
        tipo_pontuacao: editingModality.tipo_pontuacao || 'pontos',
        tipo_modalidade: editingModality.tipo_modalidade || 'individual',
        categoria: editingModality.categoria || 'misto',
        status: editingModality.status || 'Ativa',
        limite_vagas: editingModality.limite_vagas || 0,
        grupo: editingModality.grupo || null,
        faixa_etaria: editingModality.faixa_etaria || 'adulto'
      });
    } else {
      setCurrentItem(defaultFormValues);
    }
  }, [editingModality, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              <Label htmlFor="tipo_modalidade">Tipo de Modalidade</Label>
              <Select 
                value={currentItem.tipo_modalidade} 
                onValueChange={(value) => handleSelectChange('tipo_modalidade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="coletivo">Coletivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo_pontuacao">Tipo de Pontuação</Label>
              <Select 
                value={currentItem.tipo_pontuacao} 
                onValueChange={(value) => handleSelectChange('tipo_pontuacao', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de pontuação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontos">Pontos</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="distancia">Distância</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={currentItem.categoria} 
                onValueChange={(value) => handleSelectChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="misto">Misto</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faixa_etaria">Faixa Etária</Label>
              <Select 
                value={currentItem.faixa_etaria} 
                onValueChange={(value) => handleSelectChange('faixa_etaria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa etária" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adulto">Adulto</SelectItem>
                  <SelectItem value="infantil">Infantil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limite_vagas">Limite de Vagas</Label>
              <Input
                id="limite_vagas"
                name="limite_vagas"
                type="number"
                value={currentItem.limite_vagas}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={currentItem.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativa">Ativa</SelectItem>
                  <SelectItem value="Em análise">Em análise</SelectItem>
                  <SelectItem value="Esgotada">Esgotada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grupo">Grupo (opcional)</Label>
              <Input
                id="grupo"
                name="grupo"
                value={currentItem.grupo || ''}
                onChange={handleInputChange}
                placeholder="Ex: Grupo A"
              />
            </div>
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
