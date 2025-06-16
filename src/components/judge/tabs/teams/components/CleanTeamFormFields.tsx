
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CampoModelo } from '@/types/dynamicScoring';
import { MaskedResultInput } from '@/components/judge/dynamic-scoring/MaskedResultInput';

interface CleanTeamFormFieldsProps {
  campos: CampoModelo[];
  form: any;
  scoreFormat: string;
}

export function CleanTeamFormFields({ campos, form, scoreFormat }: CleanTeamFormFieldsProps) {
  return (
    <>
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
                        formato_resultado: scoreFormat as 'pontos' | 'tempo' | 'distancia'
                      }
                    }}
                    form={form}
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                ) : campo.tipo_input === 'text' && campo.metadados?.formato_resultado ? (
                  <MaskedResultInput
                    campo={{
                      ...campo,
                      metadados: {
                        ...campo.metadados,
                        formato_resultado: scoreFormat as 'pontos' | 'tempo' | 'distancia'
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
    </>
  );
}
