
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
import { TimeScoreFormValues } from '../types';
import { Bateria } from '../../tabs/scores/hooks/useBateriaData';

interface TimeScoreFieldsProps {
  form: UseFormReturn<TimeScoreFormValues>;
  bateriasData?: Bateria[];
  modalityRule?: any;
}

export function TimeScoreFields({ form, bateriasData = [], modalityRule }: TimeScoreFieldsProps) {
  const hasBaterias = modalityRule?.parametros?.baterias === true;
  const raiasPorBateria = modalityRule?.parametros?.raias_por_bateria;
  
  console.log('TimeScoreFields - hasBaterias:', hasBaterias);
  console.log('TimeScoreFields - raiasPorBateria:', raiasPorBateria);
  console.log('TimeScoreFields - bateriasData:', bateriasData);

  return (
    <div className="space-y-4">
      {/* Heat selector - only show if baterias is enabled */}
      {hasBaterias && (
        <FormField
          control={form.control}
          name="heat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bateria</FormLabel>
              <FormControl>
                <Select 
                  value={field.value?.toString() || ""} 
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a bateria" />
                  </SelectTrigger>
                  <SelectContent>
                    {bateriasData.length > 0 ? (
                      bateriasData.map((bateria) => (
                        <SelectItem key={bateria.id} value={bateria.id.toString()}>
                          Bateria {bateria.numero}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback: generate heat options 1-10 if no bateria data
                      Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Bateria {num}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Lane selector - only show if raias_por_bateria is configured */}
      {hasBaterias && raiasPorBateria && (
        <FormField
          control={form.control}
          name="lane"
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
                    {Array.from({ length: raiasPorBateria }, (_, i) => i + 1).map((lane) => (
                      <SelectItem key={lane} value={lane.toString()}>
                        Raia {lane}
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

      {/* Time input fields */}
      <div className="grid grid-cols-3 gap-2">
        <FormField
          control={form.control}
          name="minutes"
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
          name="seconds"
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
          name="milliseconds"
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
    </div>
  );
}
