
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { CampoModelo } from '@/types/dynamicScoring';

interface UseCleanTeamScoringFormProps {
  modeloId: number;
  modalityId: number;
  initialValues?: any;
}

export function useCleanTeamScoringForm({ 
  modeloId, 
  modalityId, 
  initialValues = {} 
}: UseCleanTeamScoringFormProps) {
  // Fetch modality basic info to determine score type
  const { data: modalityInfo } = useQuery({
    queryKey: ['modality-info', modalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, tipo_pontuacao')
        .eq('id', modalityId)
        .single();

      if (error) {
        console.error('Error fetching modality info:', error);
        return null;
      }

      console.log('Modality info for team scoring:', data);
      return data;
    },
    enabled: !!modalityId,
  });

  // Fetch modelo configuration to check for specific scoring rules
  const { data: modeloConfig } = useQuery({
    queryKey: ['modelo-config', modeloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modelos_modalidade')
        .select('parametros')
        .eq('id', modeloId)
        .single();

      if (error) {
        console.error('Error fetching modelo config:', error);
        return null;
      }

      console.log('Modelo config for team scoring:', data);
      return data;
    },
    enabled: !!modeloId,
  });

  // Fetch scoring fields only - NO battery or configuration fields
  const { data: campos = [], isLoading } = useQuery({
    queryKey: ['clean-team-campos', modeloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modeloId)
        .order('ordem_exibicao');

      if (error) throw error;

      // Ultra aggressive filtering to exclude ALL configuration fields
      const scoringFields = (data as CampoModelo[]).filter(campo => {
        const chaveLower = campo.chave_campo.toLowerCase();
        
        // Exclude configuration input types
        if (campo.tipo_input === 'configuration' || campo.tipo_input === 'checkbox') {
          return false;
        }
        
        // Exclude ALL known configuration fields by key
        const configurationKeys = [
          'bateria', 'baterias', 'numero_bateria', 'equipe',
          'configuracao_pontuacao', 'configuracao', 'pontuacao_config',
          'usar_baterias', 'config_pontos', 'config', 'configuracao_de_pontuacao'
        ];
        
        if (configurationKeys.some(key => chaveLower.includes(key))) {
          return false;
        }
        
        // Additional check: if the field label contains "configuração"
        if (campo.rotulo_campo?.toLowerCase().includes('configuração')) {
          return false;
        }
        
        return true;
      });

      console.log('Clean team scoring fields:', scoringFields);
      return scoringFields;
    },
    enabled: !!modeloId,
  });

  // Create dynamic schema
  const createSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    campos.forEach(campo => {
      if (campo.tipo_input === 'number' || campo.tipo_input === 'integer') {
        schemaFields[campo.chave_campo] = campo.obrigatorio 
          ? z.number({ required_error: `${campo.rotulo_campo} é obrigatório` })
          : z.number().optional();
      } else if (campo.tipo_input === 'select') {
        schemaFields[campo.chave_campo] = campo.obrigatorio
          ? z.string({ required_error: `${campo.rotulo_campo} é obrigatório` })
          : z.string().optional();
      } else {
        schemaFields[campo.chave_campo] = campo.obrigatorio
          ? z.string({ required_error: `${campo.rotulo_campo} é obrigatório` })
          : z.string().optional();
      }
    });

    schemaFields.notes = z.string().optional();

    return z.object(schemaFields);
  };

  const schema = createSchema();
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      notes: initialValues?.notes || '',
    },
  });

  // Determine the score format based on modality type and modelo config
  const getScoreFormat = () => {
    // First check modelo config for specific rules
    if (modeloConfig?.parametros?.regra_tipo) {
      switch (modeloConfig.parametros.regra_tipo) {
        case 'tempo':
          return 'tempo';
        case 'distancia':
          return 'distancia';
        case 'pontos':
          return 'pontos';
      }
    }
    
    // Then check modality type_pontuacao
    if (modalityInfo?.tipo_pontuacao) {
      switch (modalityInfo.tipo_pontuacao) {
        case 'tempo':
          return 'tempo';
        case 'distancia':
          return 'distancia';
        case 'pontos':
        default:
          return 'pontos';
      }
    }
    
    // Default fallback
    return 'pontos';
  };

  const scoreFormat = getScoreFormat();

  console.log('Score format determined:', scoreFormat, {
    modalityInfo: modalityInfo?.tipo_pontuacao,
    modeloConfig: modeloConfig?.parametros?.regra_tipo
  });

  return {
    campos,
    isLoading,
    form,
    scoreFormat,
    modalityInfo,
    modeloConfig
  };
}
