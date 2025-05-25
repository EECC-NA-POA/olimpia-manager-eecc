
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

interface ArrowsScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function ArrowsScoreFields({ form, rule }: ArrowsScoreFieldsProps) {
  const numFlechas = rule.parametros.num_flechas || 6;
  const zonas = rule.parametros.zonas || [
    { nome: '10', pontos: 10 },
    { nome: '9', pontos: 9 },
    { nome: '8', pontos: 8 },
    { nome: '7', pontos: 7 },
    { nome: '6', pontos: 6 },
    { nome: '5', pontos: 5 },
    { nome: 'Miss', pontos: 0 }
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Pontuação por flecha ({numFlechas} flechas)
      </div>
      
      {Array.from({ length: numFlechas }, (_, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`flechas.${index}.zona`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flecha {index + 1}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a zona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {zonas.map((zona) => (
                    <SelectItem key={zona.nome} value={zona.pontos.toString()}>
                      {zona.nome} ({zona.pontos} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
