
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampoModelo } from '@/types/dynamicScoring';
import { MaskedResultInput } from '@/components/judge/dynamic-scoring/MaskedResultInput';

interface CleanTeamScoringFormProps {
  modeloId: number;
  modalityId: number;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialValues?: any;
}

export function CleanTeamScoringForm({
  modeloId,
  modalityId,
  onSubmit,
  isSubmitting,
  initialValues = {}
}: CleanTeamScoringFormProps) {
  // Fetch modality rule to determine score type
  const { data: modalityRule } = useQuery({
    queryKey: ['modality-rule', modalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regras_modalidades')
        .select('regra_tipo, parametros')
        .eq('modalidade_id', modalityId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching modality rule:', error);
        return null;
      }

      console.log('Modality rule for team scoring:', data);
      return data;
    },
    enabled: !!modalityId,
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

  const handleSubmit = (data: any) => {
    console.log('Clean team form submission:', data);
    onSubmit(data);
  };

  if (isLoading) {
    return <div>Carregando formulário...</div>;
  }

  if (campos.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Nenhum campo de pontuação configurado para esta modalidade.</p>
      </div>
    );
  }

  // Determine the score format based on modality rule
  const getScoreFormat = () => {
    if (!modalityRule) return 'pontos';
    
    switch (modalityRule.regra_tipo) {
      case 'tempo':
        return 'tempo';
      case 'distancia':
        return 'distancia';
      default:
        return 'pontos';
    }
  };

  const scoreFormat = getScoreFormat();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {campos.map((campo) => (
          <FormField
            key={campo.chave_campo}
            control={form.control}
            name={campo.chave_campo}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {campo.rotulo_campo}
                  {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                  {campo.chave_campo === 'resultado' && scoreFormat === 'tempo' && (
                    <span className="text-green-600 text-xs ml-2">(MM:SS.mmm)</span>
                  )}
                  {campo.chave_campo === 'resultado' && scoreFormat === 'distancia' && (
                    <span className="text-green-600 text-xs ml-2">(##,## m)</span>
                  )}
                </FormLabel>
                <FormControl>
                  {campo.tipo_input === 'number' || campo.tipo_input === 'integer' ? (
                    <Input
                      type="number"
                      placeholder={campo.metadados?.placeholder || 'Digite um número'}
                      min={campo.metadados?.min}
                      max={campo.metadados?.max}
                      step={campo.tipo_input === 'integer' ? 1 : (campo.metadados?.step || 'any')}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  ) : campo.tipo_input === 'select' ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        {campo.metadados?.opcoes?.map((opcao) => (
                          <SelectItem key={opcao} value={opcao}>
                            {opcao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : campo.chave_campo === 'resultado' ? (
                    <MaskedResultInput
                      campo={{
                        ...campo,
                        metadados: {
                          ...campo.metadados,
                          formato_resultado: scoreFormat
                        }
                      }}
                      form={form}
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  ) : (
                    <Input
                      placeholder={campo.metadados?.placeholder || 'Digite aqui'}
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Enviando...' : 'Salvar Pontuação da Equipe'}
        </Button>
      </form>
    </Form>
  );
}
