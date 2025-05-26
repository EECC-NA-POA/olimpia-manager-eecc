
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';

interface BateriasScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function BateriasScoreFields({ form, rule }: BateriasScoreFieldsProps) {
  // Provide default values if parametros is empty
  const parametros = rule.parametros || {};
  const numTentativas = parametros.num_tentativas || 3;
  const numRaias = parametros.num_raias;
  const unidade = parametros.unidade || 'pontos';

  console.log('BateriasScoreFields - numTentativas:', numTentativas);
  console.log('BateriasScoreFields - numRaias:', numRaias);
  console.log('BateriasScoreFields - unidade:', unidade);

  // Watch tentativas to calculate best result
  const tentativas = form.watch('tentativas') || [];
  const melhorResultado = tentativas.reduce((melhor: any, atual: any) => {
    if (!melhor || (atual?.valor > melhor?.valor)) return atual;
    return melhor;
  }, null);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Registro por tentativas ({numTentativas} tentativa{numTentativas > 1 ? 's' : ''})
        {unidade && ` - Unidade: ${unidade}`}
      </div>
      
      {melhorResultado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 font-medium">
            Melhor resultado: {melhorResultado.valor} {unidade}
            {melhorResultado.raia && ` (Raia ${melhorResultado.raia})`}
          </p>
        </div>
      )}
      
      {Array.from({ length: numTentativas }, (_, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <h4 className="font-medium">Tentativa {index + 1}</h4>
          
          {numRaias && (
            <FormField
              control={form.control}
              name={`tentativas.${index}.raia`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a raia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: numRaias }, (_, i) => (
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
          
          <FormField
            control={form.control}
            name={`tentativas.${index}.valor`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resultado</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      step={unidade === 'tempo' ? '0.01' : '0.01'}
                      min="0" 
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {unidade}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
