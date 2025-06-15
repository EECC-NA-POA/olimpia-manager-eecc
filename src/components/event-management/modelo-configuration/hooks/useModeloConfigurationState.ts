
import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

interface CampoConfig {
  id: string;
  chave_campo: string;
  rotulo_campo: string;
  tipo_input: string;
  obrigatorio: boolean;
  ordem_exibicao: number;
  metadados: any;
}

interface ModeloConfig {
  baterias: boolean;
  num_raias: number;
  permite_final: boolean;
  regra_tipo: string;
  formato_resultado: string;
  tipo_calculo: string;
  campo_referencia: string;
  contexto: string;
  ordem_calculo: string;
}

export function useModeloConfigurationState(editingModelo: any) {
  const [config, setConfig] = useState<ModeloConfig>({
    baterias: false,
    num_raias: 0,
    permite_final: false,
    regra_tipo: 'pontos',
    formato_resultado: '',
    tipo_calculo: '',
    campo_referencia: '',
    contexto: '',
    ordem_calculo: 'asc'
  });

  const [campos, setCampos] = useState<CampoConfig[]>([]);

  const createDefaultField = (regraType: string): CampoConfig => {
    const baseField = {
      id: 'campo_' + Date.now(),
      chave_campo: regraType,
      rotulo_campo: getDefaultLabel(regraType),
      tipo_input: 'number',
      obrigatorio: true,
      ordem_exibicao: 1,
      metadados: {}
    };

    switch (regraType) {
      case 'tempo':
        return {
          ...baseField,
          metadados: {
            formato_resultado: 'tempo',
            placeholder: 'MM:SS.mmm'
          }
        };
      case 'distancia':
        return {
          ...baseField,
          metadados: {
            formato_resultado: 'distancia',
            placeholder: '##,## m'
          }
        };
      case 'pontos':
        return {
          ...baseField,
          metadados: {
            formato_resultado: 'pontos',
            placeholder: '###.##'
          }
        };
      default:
        return baseField;
    }
  };

  const getDefaultLabel = (regraType: string): string => {
    switch (regraType) {
      case 'tempo': return 'Tempo';
      case 'distancia': return 'Distância';
      case 'pontos': return 'Pontos';
      default: return 'Resultado';
    }
  };

  const createBateriaField = (): CampoConfig => {
    return {
      id: 'campo_bateria_' + Date.now(),
      chave_campo: 'bateria',
      rotulo_campo: 'Bateria',
      tipo_input: 'integer',
      obrigatorio: true,
      ordem_exibicao: 1, // Always first
      metadados: {
        min: 1,
        max: 999,
        readonly: true // Campo será preenchido automaticamente
      }
    };
  };

  useEffect(() => {
    if (editingModelo) {
      console.log('Loading modelo for editing:', editingModelo);
      console.log('Available parametros:', editingModelo.parametros);
      console.log('Available campos_modelo:', editingModelo.campos_modelo);
      
      // Load configuration from parametros (already processed by useModeloConfigurationData)
      const loadedConfig = {
        baterias: editingModelo.parametros?.baterias || false,
        num_raias: editingModelo.parametros?.num_raias || 0,
        permite_final: editingModelo.parametros?.permite_final || false,
        regra_tipo: editingModelo.parametros?.regra_tipo || 'pontos',
        formato_resultado: editingModelo.parametros?.formato_resultado || '',
        tipo_calculo: editingModelo.parametros?.tipo_calculo || '',
        campo_referencia: editingModelo.parametros?.campo_referencia || '',
        contexto: editingModelo.parametros?.contexto || '',
        ordem_calculo: editingModelo.parametros?.ordem_calculo || 'asc'
      };
      
      console.log('Loaded config from parametros:', loadedConfig);
      setConfig(loadedConfig);
      
      // Load campos from parametros.campos (already processed by useModeloConfigurationData)
      let camposToLoad: CampoConfig[] = [];
      
      if (editingModelo.parametros?.campos && Array.isArray(editingModelo.parametros.campos)) {
        camposToLoad = editingModelo.parametros.campos.map((campo: any) => ({
          id: campo.id ? String(campo.id) : `campo_${Date.now()}_${Math.random()}`,
          chave_campo: campo.chave_campo || '',
          rotulo_campo: campo.rotulo_campo || '',
          tipo_input: campo.tipo_input || 'number',
          obrigatorio: campo.obrigatorio || false,
          ordem_exibicao: campo.ordem_exibicao || 1,
          metadados: campo.metadados || {}
        }));
      }
      
      console.log('Loaded campos:', camposToLoad);
      
      // If no campos exist, create a default one based on regra_tipo
      if (camposToLoad.length === 0) {
        const defaultCampo = createDefaultField(loadedConfig.regra_tipo);
        camposToLoad = [defaultCampo];
        console.log('Created default campo:', defaultCampo);
      }
      
      setCampos(camposToLoad);
    } else {
      // Reset to defaults when not editing
      setConfig({
        baterias: false,
        num_raias: 0,
        permite_final: false,
        regra_tipo: 'pontos',
        formato_resultado: '',
        tipo_calculo: '',
        campo_referencia: '',
        contexto: '',
        ordem_calculo: 'asc'
      });
      setCampos([]);
    }
  }, [editingModelo]);

  const handleBateriasChange = (checked: boolean) => {
    const newConfig = { ...config, baterias: checked };
    setConfig(newConfig);

    if (checked) {
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

  const handleRegraTypeChange = (value: string) => {
    const newConfig = { ...config, regra_tipo: value };
    
    if (value === 'tempo') {
      newConfig.formato_resultado = 'tempo';
      newConfig.campo_referencia = 'tempo';
    }
    
    setConfig(newConfig);

    // Atualizar campos existentes com o novo tipo
    const updatedCampos = campos.map(campo => ({
      ...campo,
      metadados: {
        ...campo.metadados,
        formato_resultado: value === 'tempo' ? 'tempo' : value === 'distancia' ? 'distancia' : 'pontos'
      }
    }));
    setCampos(updatedCampos);
  };

  const addCampo = () => {
    const newCampo: CampoConfig = {
      id: 'campo_' + Date.now(),
      chave_campo: '',
      rotulo_campo: '',
      tipo_input: 'number',
      obrigatorio: false,
      ordem_exibicao: campos.length + 1,
      metadados: {
        formato_resultado: config.regra_tipo === 'tempo' ? 'tempo' : config.regra_tipo === 'distancia' ? 'distancia' : 'pontos'
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
    config,
    setConfig,
    campos,
    setCampos,
    handleBateriasChange,
    handleRegraTypeChange,
    addCampo,
    removeCampo,
    updateCampo,
    handleDragEnd
  };
}
