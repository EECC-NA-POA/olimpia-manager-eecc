
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampoModelo } from '@/types/dynamicScoring';
import { CalculatedFieldsManager } from './CalculatedFieldsManager';
import { MaskedResultInput } from './MaskedResultInput';

interface DynamicScoringFormProps {
  form: UseFormReturn<any>;
  campos: CampoModelo[];
  modeloId?: number;
  modalityId?: number;
  eventId?: string;
  bateriaId?: number;
}

export function DynamicScoringForm({ 
  form, 
  campos, 
  modeloId, 
  modalityId, 
  eventId,
  bateriaId 
}: DynamicScoringFormProps) {
  // Separar campos manuais e calculados
  const manualFields = campos.filter(campo => campo.tipo_input !== 'calculated');
  const calculatedFields = campos.filter(campo => campo.tipo_input === 'calculated');

  const handleCalculationComplete = (results: any[]) => {
    // Atualizar os valores dos campos calculados no formulário
    results.forEach(result => {
      form.setValue(result.chave_campo, result.valor_calculado);
    });
  };

  const renderField = (campo: CampoModelo) => {
    if (campo.tipo_input === 'calculated') {
      // Campos calculados são exibidos como read-only
      return (
        <FormField
          key={campo.id}
          control={form.control}
          name={campo.chave_campo}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {campo.rotulo_campo}
                <span className="text-blue-600 text-xs ml-2">(Calculado)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  readOnly
                  className="bg-blue-50 border-blue-200"
                  placeholder="Aguardando cálculo..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    switch (campo.tipo_input) {
      case 'number':
      case 'integer':
        return (
          <FormField
            key={campo.id}
            control={form.control}
            name={campo.chave_campo}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {campo.rotulo_campo}
                  {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={campo.tipo_input === 'integer' ? '1' : (campo.metadados?.step || 'any')}
                    min={campo.metadados?.min}
                    max={campo.metadados?.max}
                    placeholder={`Digite ${campo.rotulo_campo.toLowerCase()}`}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'text':
        return (
          <FormField
            key={campo.id}
            control={form.control}
            name={campo.chave_campo}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {campo.rotulo_campo}
                  {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                  {campo.metadados?.formato_resultado && (
                    <span className="text-green-600 text-xs ml-2">
                      ({campo.metadados.formato_resultado})
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <MaskedResultInput
                    campo={campo}
                    form={form}
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={campo.id}
            control={form.control}
            name={campo.chave_campo}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {campo.rotulo_campo}
                  {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione ${campo.rotulo_campo.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {campo.metadados?.opcoes?.map((opcao) => (
                      <SelectItem key={opcao} value={opcao}>
                        {opcao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Gerenciador de campos calculados - mostrar apenas se houver campos calculados */}
      {calculatedFields.length > 0 && modeloId && modalityId && eventId && (
        <CalculatedFieldsManager
          modeloId={modeloId}
          modalityId={modalityId}
          eventId={eventId}
          bateriaId={bateriaId}
          onCalculationComplete={handleCalculationComplete}
        />
      )}

      {/* Campos manuais primeiro */}
      {manualFields
        .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
        .map(renderField)}

      {/* Campos calculados por último */}
      {calculatedFields
        .sort((a, b) => a.ordem_exibicao - b.ordem_exibicao)
        .map(renderField)}
    </div>
  );
}
