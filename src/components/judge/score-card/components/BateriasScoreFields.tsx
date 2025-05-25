
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
  const numTentativas = rule.parametros.num_tentativas || 3;
  const numRaias = rule.parametros.num_raias;
  const unidade = rule.parametros.unidade || 'pontos';

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Registro por tentativas ({numTentativas} tentativa{numTentativas > 1 ? 's' : ''})
      </div>
      
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
