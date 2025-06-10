
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ParametrosFields } from './ParametrosFields';
import { RuleForm, Modality } from './types';
import { useBatteryOperations } from './hooks/useBatteryOperations';
import { toast } from 'sonner';

interface ModalityRuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modalityId: string, ruleForm: RuleForm) => Promise<void>;
  editingModalityId: string | null;
  modalities: Modality[];
  isSaving: boolean;
}

const defaultFormValues: RuleForm = {
  regra_tipo: 'pontos',
  parametros: {}
};

const getDefaultParametersForType = (regraTipo: string): RuleForm['parametros'] => {
  switch (regraTipo) {
    case 'distancia':
      return {
        unidade: 'metros',
        subunidade: 'cm',
        max_subunidade: 99,
        baterias: false,
        raias_por_bateria: undefined,
        num_baterias: undefined
      };
    case 'tempo':
      return {
        formato_tempo: 'mm:ss.SS' as const
      };
    case 'baterias':
      return {
        num_tentativas: 1,
        num_raias: undefined,
        unidade: 'pontos'
      };
    case 'sets':
      return {
        melhor_de: 3,
        vencer_sets_para_seguir: 2,
        pontua_por_set: true,
        unidade: 'sets'
      };
    case 'arrows':
      return {
        fase_classificacao: true,
        num_flechas_classificacao: 72,
        fase_eliminacao: true,
        sets_por_combate: 5,
        flechas_por_set: 3,
        pontos_vitoria_set: 2,
        pontos_empate_set: 1,
        pontos_para_vencer: 6,
        shoot_off: true,
        num_flechas: 6
      };
    default:
      return {};
  }
};

export function ModalityRuleDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  editingModalityId, 
  modalities, 
  isSaving 
}: ModalityRuleDialogProps) {
  const [currentItem, setCurrentItem] = useState<RuleForm>(defaultFormValues);
  const { deleteBaterias } = useBatteryOperations();

  useEffect(() => {
    if (editingModalityId) {
      const modality = modalities.find(m => m.id === editingModalityId);
      
      if (modality?.regra) {
        setCurrentItem({
          regra_tipo: modality.regra.regra_tipo,
          parametros: modality.regra.parametros
        });
      } else {
        setCurrentItem(defaultFormValues);
      }
    }
  }, [editingModalityId, modalities]);

  const handleSave = async () => {
    if (!editingModalityId) return;
    
    await onSave(editingModalityId, currentItem);
    onClose();
    setCurrentItem(defaultFormValues);
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

  const handleResetParameters = async () => {
    if (!editingModalityId) return;
    
    try {
      // Find the modality to get evento_id
      const modality = modalities.find(m => m.id === editingModalityId);
      
      if (modality?.evento_id) {
        console.log('Deleting existing baterias before resetting parameters...');
        await deleteBaterias(editingModalityId, modality.evento_id);
        toast.success('Baterias excluídas ao resetar configuração');
      }
      
      // Reset parameters to default
      const defaultParams = getDefaultParametersForType(currentItem.regra_tipo);
      setCurrentItem({
        ...currentItem,
        parametros: defaultParams
      });
    } catch (error) {
      console.error('Error deleting baterias during reset:', error);
      toast.error('Erro ao excluir baterias durante o reset');
      
      // Still reset parameters even if bateria deletion fails
      const defaultParams = getDefaultParametersForType(currentItem.regra_tipo);
      setCurrentItem({
        ...currentItem,
        parametros: defaultParams
      });
    }
  };

  const handleRuleTypeChange = (value: any) => {
    const defaultParams = getDefaultParametersForType(value);
    setCurrentItem({ 
      regra_tipo: value, 
      parametros: defaultParams 
    });
  };

  const handleClose = () => {
    onClose();
    setCurrentItem(defaultFormValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              onValueChange={handleRuleTypeChange}
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
          
          <ParametrosFields 
            currentItem={currentItem} 
            updateParametros={updateParametros}
            onResetParameters={handleResetParameters}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
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
