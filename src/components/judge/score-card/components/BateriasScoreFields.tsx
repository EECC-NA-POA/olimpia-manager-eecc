
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
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';

interface BateriasScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function BateriasScoreFields({ form, rule }: BateriasScoreFieldsProps) {
  const parametros = rule.parametros || {};
  const raiasPorBateria = parametros.raias_por_bateria;
  
  console.log('BateriasScoreFields - Rule type:', rule.regra_tipo);
  console.log('BateriasScoreFields - Parameters:', parametros);

  // Determine field type based on rule type
  const renderScoreFields = () => {
    switch (rule.regra_tipo) {
      case 'tempo':
        return (
          <>
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="tentativa_1_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min={0}
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tentativa_1_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segundos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min={0}
                        max={59}
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tentativa_1_milliseconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milissegundos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min={0}
                        max={999}
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      case 'distancia':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="tentativa_1_meters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metros</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min={0}
                        step="1"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tentativa_1_centimeters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centímetros</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min={0}
                        max={99}
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      default:
        // For points, sets, arrows, etc.
        return (
          <FormField
            control={form.control}
            name="tentativa_1_score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Resultado ({rule.regra_tipo === 'sets' ? 'sets' : 
                           rule.regra_tipo === 'arrows' ? 'pontos' : 'pontos'})
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min={0}
                    step={rule.regra_tipo === 'arrows' ? '1' : '0.1'}
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-blue-800">
        Tentativa 1
      </div>
      
      {renderScoreFields()}
      
      {raiasPorBateria && (
        <FormField
          control={form.control}
          name="tentativa_1_raia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raia</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a raia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: raiasPorBateria }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Raia {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
