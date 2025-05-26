
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { MetersAndCentimetersField } from './MetersAndCentimetersField';

interface DistanceScoreFieldsProps {
  form: UseFormReturn<any>;
  useMetersAndCentimeters?: boolean;
  maxSubunidade?: number;
}

export function DistanceScoreFields({ 
  form, 
  useMetersAndCentimeters = true, 
  maxSubunidade = 99 
}: DistanceScoreFieldsProps) {
  // For distance scoring with rules that specify subunidade = 'cm', use separate meters and centimeters inputs
  if (useMetersAndCentimeters) {
    return (
      <MetersAndCentimetersField
        form={form}
        metersName="meters"
        centimetersName="centimeters"
        label="Distância"
        maxCentimeters={maxSubunidade}
      />
    );
  }

  // For other distance scoring, use a single decimal input
  return (
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
  );
}
