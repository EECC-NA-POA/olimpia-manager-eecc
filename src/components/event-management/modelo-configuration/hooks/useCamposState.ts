
import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { CampoConfig } from './types';
import { createBateriaField } from './utils/fieldUtils';

export function useCamposState() {
  const [campos, setCampos] = useState<CampoConfig[]>([]);

  const createResultadoField = (regraType: string): CampoConfig => {
    return {
      id: 'campo_resultado_' + Date.now(),
      chave_campo: 'resultado',
      rotulo_campo: 'Resultado',
      tipo_input: 'text',
      obrigatorio: true,
      ordem_exibicao: 1,
      metadados: {
        formato_resultado: regraType === 'tempo' ? 'tempo' : regraType === 'distancia' ? 'distancia' : 'pontos'
      }
    };
  };

  const ensureResultadoField = (regraType: string) => {
    setCampos(prevCampos => {
      const hasResultadoField = prevCampos.some(campo => 
        campo.chave_campo === 'resultado'
      );

      if (!hasResultadoField) {
        const resultadoField = createResultadoField(regraType);
        // Increment ordem_exibicao of all existing fields
        const updatedCampos = prevCampos.map(campo => ({
          ...campo,
          ordem_exibicao: campo.ordem_exibicao + 1
        }));
        
        // Add resultado field at the beginning
        return [resultadoField, ...updatedCampos];
      }

      return prevCampos;
    });
  };

  const addCampo = (regraType: string) => {
    // Ensure resultado field exists first
    ensureResultadoField(regraType);
    
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
    setCampos(prev => [...prev, newCampo]);
  };

  const removeCampo = (id: string) => {
    setCampos(campos.filter(campo => {
      // Prevent removal of the resultado field
      if (campo.chave_campo === 'resultado') {
        console.log('Cannot remove required resultado field');
        return true;
      }
      return campo.id !== id;
    }));
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
    setCampos(prevCampos => {
      // Ensure resultado field exists for the new regra type
      const hasResultadoField = prevCampos.some(campo => 
        campo.chave_campo === 'resultado'
      );

      let updatedCampos = prevCampos;

      if (!hasResultadoField) {
        const resultadoField = createResultadoField(regraType);
        // Add resultado field and adjust other fields' ordem_exibicao
        updatedCampos = [
          resultadoField,
          ...prevCampos.map(campo => ({
            ...campo,
            ordem_exibicao: campo.ordem_exibicao + 1
          }))
        ];
      }

      // Update all fields with the new regra type format
      return updatedCampos.map(campo => ({
        ...campo,
        metadados: {
          ...campo.metadados,
          formato_resultado: regraType === 'tempo' ? 'tempo' : regraType === 'distancia' ? 'distancia' : 'pontos'
        }
      }));
    });
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
    handleDragEnd,
    ensureResultadoField
  };
}
