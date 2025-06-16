
import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { CampoConfig } from './types';
import { createBateriaField } from './utils/fieldUtils';

export function useCamposState() {
  const [campos, setCampos] = useState<CampoConfig[]>([]);

  const addCampo = (regraType: string) => {
    const newCampo: CampoConfig = {
      id: 'campo_' + Date.now(),
      chave_campo: '',
      rotulo_campo: '',
      tipo_input: 'number',
      obrigatorio: false,
      ordem_exibicao: campos.length + 1,
      metadados: {
        formato_resultado: regraType === 'tempo' ? 'tempo' : regraType === 'distancia' ? 'distancia' : 'pontos'
      }
    };
    setCampos([...campos, newCampo]);
  };

  const removeCampo = (id: string) => {
    setCampos(campos.filter(campo => campo.id !== id));
  };

  const updateCampo = (id: string, updates: Partial<CampoConfig>) => {
    setCampos(campos.map(campo => 
      campo.id === id ? { ...campo, ...updates } : campo
    ));
  };

  const handleBateriaToggle = (enabled: boolean) => {
    if (enabled) {
      // Check if bateria field already exists
      const bateriaFieldExists = campos.some(campo => 
        campo.chave_campo === 'bateria' || campo.chave_campo === 'numero_bateria'
      );

      if (!bateriaFieldExists) {
        // Add bateria field as the first field and increment ordem_exibicao of other fields
        const bateriaField = createBateriaField();
        setCampos(prevCampos => {
          // Increment ordem_exibicao of all existing fields
          const updatedCampos = prevCampos.map(campo => ({
            ...campo,
            ordem_exibicao: campo.ordem_exibicao + 1
          }));
          
          // Add bateria field at the beginning
          return [bateriaField, ...updatedCampos];
        });
      }
    } else {
      // Remove bateria field and adjust ordem_exibicao of remaining fields
      setCampos(prevCampos => {
        const filteredCampos = prevCampos.filter(campo => 
          campo.chave_campo !== 'bateria' && campo.chave_campo !== 'numero_bateria'
        );
        
        // Reorder remaining fields to ensure continuous numbering
        return filteredCampos.map((campo, index) => ({
          ...campo,
          ordem_exibicao: index + 1
        }));
      });
    }
  };

  const updateCamposForRegraType = (regraType: string) => {
    // Atualizar campos existentes com o novo tipo
    const updatedCampos = campos.map(campo => ({
      ...campo,
      metadados: {
        ...campo.metadados,
        formato_resultado: regraType === 'tempo' ? 'tempo' : regraType === 'distancia' ? 'distancia' : 'pontos'
      }
    }));
    setCampos(updatedCampos);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCampos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update ordem_exibicao based on new positions
        return newItems.map((item, index) => ({
          ...item,
          ordem_exibicao: index + 1
        }));
      });
    }
  };

  return {
    campos,
    setCampos,
    addCampo,
    removeCampo,
    updateCampo,
    handleBateriaToggle,
    updateCamposForRegraType,
    handleDragEnd
  };
}
