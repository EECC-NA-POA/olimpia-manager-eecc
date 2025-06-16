
import { useEffect } from 'react';
import { ModeloConfig, CampoConfig } from './types';
import { createDefaultField } from './utils/fieldUtils';

interface UseModeloDataLoaderProps {
  editingModelo: any;
  setConfig: (config: ModeloConfig) => void;
  setCampos: (campos: CampoConfig[]) => void;
}

export function useModeloDataLoader({ editingModelo, setConfig, setCampos }: UseModeloDataLoaderProps) {
  useEffect(() => {
    if (editingModelo) {
      console.log('Loading modelo for editing:', editingModelo);
      console.log('Available parametros:', editingModelo.parametros);
      console.log('Available campos_modelo:', editingModelo.campos_modelo);
      
      // Load configuration from parametros (already processed by useModeloConfigurationData)
      const loadedConfig = {
        baterias: editingModelo.parametros?.baterias || false,
        num_raias: editingModelo.parametros?.num_raias ?? 0, // Use nullish coalescing to allow 0
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
  }, [editingModelo, setConfig, setCampos]);
}
