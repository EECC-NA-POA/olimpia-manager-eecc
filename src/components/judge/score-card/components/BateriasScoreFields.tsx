
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';

interface BateriasScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function BateriasScoreFields({ form, rule }: BateriasScoreFieldsProps) {
  const parametros = rule.parametros || {};
  const numTentativas = parametros.num_tentativas || 1;
  const numRaias = parametros.num_raias || parametros.raias_por_bateria;
  const unidade = parametros.unidade || 'pontos';

  console.log('BateriasScoreFields - numTentativas:', numTentativas);
  console.log('BateriasScoreFields - numRaias:', numRaias);
  console.log('BateriasScoreFields - unidade:', unidade);

  // Generate array of attempts
  const tentativas = Array.from({ length: numTentativas }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {tentativas.map((tentativa) => (
        <div key={tentativa} className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sm">Tentativa {tentativa}</h4>
          
          {/* Lane selector if multiple lanes are configured */}
          {numRaias && (
            <FormField
              control={form.control}
              name={`tentativa_${tentativa}_raia`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raia</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value?.toString() || ""} 
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a raia" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: numRaias }, (_, i) => i + 1).map((raia) => (
                          <SelectItem key={raia} value={raia.toString()}>
                            Raia {raia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Score input based on unit type */}
          {unidade === 'tempo' ? (
            // Time input fields for tempo modalities
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name={`tentativa_${tentativa}_minutes`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="min" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`tentativa_${tentativa}_seconds`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segundos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="59"
                        placeholder="seg" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`tentativa_${tentativa}_milliseconds`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milissegundos</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="999"
                        placeholder="ms" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : unidade === 'distancia' ? (
            // Distance input fields
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`tentativa_${tentativa}_meters`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metros</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`tentativa_${tentativa}_centimeters`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centímetros</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="99"
                        placeholder="00" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            // Generic score input for points or other units
            <FormField
              control={form.control}
              name={`tentativa_${tentativa}_score`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado ({unidade})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step={unidade === 'pontos' ? '1' : '0.01'}
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
