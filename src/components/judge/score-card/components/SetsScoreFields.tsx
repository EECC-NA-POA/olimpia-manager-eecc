
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from 'react-hook-form';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';

interface SetsScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function SetsScoreFields({ form, rule }: SetsScoreFieldsProps) {
  const numSets = rule.parametros.num_sets || 3;
  const pontuaPorSet = rule.parametros.pontua_por_set !== false;

  if (!pontuaPorSet) {
    // Victory-only scoring
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Resultado por vitórias de set ({numSets} sets)
        </div>
        
        {Array.from({ length: numSets }, (_, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`sets.${index}.vencedor`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Set {index + 1}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vitoria" id={`set-${index}-win`} />
                      <Label htmlFor={`set-${index}-win`}>Vitória</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="derrota" id={`set-${index}-loss`} />
                      <Label htmlFor={`set-${index}-loss`}>Derrota</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    );
  }

  // Points per set scoring
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Pontuação por set ({numSets} sets)
      </div>
      
      {Array.from({ length: numSets }, (_, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`sets.${index}.pontos`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set {index + 1}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    pts
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
