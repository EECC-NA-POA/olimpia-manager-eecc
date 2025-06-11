
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { modelUsesBaterias, filterConfigurationFields } from '@/utils/dynamicScoringUtils';

export interface ModeloConfiguration {
  modalidade_id: number;
  modelo_id: number;
  parametros: {
    baterias?: boolean;
    num_raias?: number;
    permite_final?: boolean;
    regra_tipo?: string;
    unidade?: string;
    subunidade?: string;
    [key: string]: any;
  };
}

// Legacy type for backward compatibility
export interface ModalityRule {
  regra_tipo: string;
  parametros: {
    baterias?: boolean;
    num_raias?: number;
    permite_final?: boolean;
    unidade?: string;
    subunidade?: string;
    [key: string]: any;
  };
}

export function useModeloConfiguration(modalidadeId: number | null) {
  return useQuery({
    queryKey: ['modelo-configuration', modalidadeId],
    queryFn: async () => {
      if (!modalidadeId) return null;
      
      console.log('Buscando configuração do modelo para modalidade:', modalidadeId);
      
      // First get the modelo basic info
      const { data: modelo, error: modeloError } = await supabase
        .from('modelos_modalidade')
        .select('id, modalidade_id, codigo_modelo, descricao')
        .eq('modalidade_id', modalidadeId)
        .maybeSingle();
      
      if (modeloError) {
        console.error('Error fetching modelo configuration:', modeloError);
        throw modeloError;
      }
      
      if (!modelo) {
        console.log('Nenhum modelo encontrado para modalidade:', modalidadeId);
        return null;
      }
      
      console.log('Modelo encontrado:', modelo);
      
      // Get campos to check if baterias are used
      const { data: campos, error: camposError } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modelo.id);
      
      if (camposError) {
        console.error('Error fetching campos:', camposError);
        // Continue with default values if campos can't be fetched
      }
      
      console.log('Campos encontrados:', campos?.length || 0);
      
      // Check if model uses baterias based on campos
      const usesBaterias = campos ? modelUsesBaterias(campos) : false;
      console.log('Modelo usa baterias:', usesBaterias);
      
      return {
        modalidade_id: modelo.modalidade_id,
        modelo_id: modelo.id,
        parametros: {
          regra_tipo: 'pontos',
          baterias: usesBaterias,
          num_raias: 0,
          permite_final: usesBaterias
        }
      } as ModeloConfiguration;
    },
    enabled: !!modalidadeId,
  });
}

// Legacy function for backward compatibility
export function useModalityRules(modalidadeId: number | null) {
  const { data: config, ...rest } = useModeloConfiguration(modalidadeId);
  
  const legacyRule: ModalityRule | null = config ? {
    regra_tipo: config.parametros.regra_tipo || 'pontos',
    parametros: config.parametros
  } : null;
  
  return {
    data: legacyRule,
    ...rest
  };
}
