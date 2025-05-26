
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
  SelectValue 
} from "@/components/ui/select";
import { UseFormReturn } from 'react-hook-form';
import { MetersAndCentimetersField } from './MetersAndCentimetersField';
import { Bateria } from '../../tabs/scores/hooks/useBateriaData';

interface DistanceScoreFieldsProps {
  form: UseFormReturn<any>;
  useMetersAndCentimeters?: boolean;
  baterias?: boolean;
  raiasPorBateria?: number;
  bateriasData?: Bateria[];
}

export function DistanceScoreFields({ 
  form, 
  useMetersAndCentimeters = true, 
  baterias = false,
  raiasPorBateria,
  bateriasData = []
}: DistanceScoreFieldsProps) {
  // For distance scoring with rules that specify subunidade = 'cm', use separate meters and centimeters inputs
  if (useMetersAndCentimeters) {
    return (
      <div className="space-y-4">
        {/* Heat selector if baterias is enabled */}
        {baterias && bateriasData.length > 0 && (
          <FormField
            control={form.control}
            name="heat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bateria *</FormLabel>
                <FormControl>
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a bateria" />
                    </SelectTrigger>
                    <SelectContent>
                      {bateriasData.map((bateria) => (
                        <SelectItem key={bateria.id} value={bateria.id.toString()}>
                          Bateria {bateria.numero}
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

        {/* Lane selector if raiasPorBateria is specified */}
        {baterias && raiasPorBateria && (
          <FormField
            control={form.control}
            name="lane"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raia *</FormLabel>
                <FormControl>
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
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

        <MetersAndCentimetersField
          form={form}
          metersName="meters"
          centimetersName="centimeters"
          label="Distância"
        />
      </div>
    );
  }

  // For other distance scoring, use a single decimal input
  return (
    <div className="space-y-4">
      {/* Heat selector if baterias is enabled */}
      {baterias && bateriasData.length > 0 && (
        <FormField
          control={form.control}
          name="heat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bateria *</FormLabel>
              <FormControl>
                <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a bateria" />
                  </SelectTrigger>
                  <SelectContent>
                    {bateriasData.map((bateria) => (
                      <SelectItem key={bateria.id} value={bateria.id.toString()}>
                        Bateria {bateria.numero}
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

      {/* Lane selector if raiasPorBateria is specified */}
      {baterias && raiasPorBateria && (
        <FormField
          control={form.control}
          name="lane"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raia *</FormLabel>
              <FormControl>
                <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
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

      <FormField
        control={form.control}
        name="score"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distância</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  min="0" 
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="pr-12"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  m
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
