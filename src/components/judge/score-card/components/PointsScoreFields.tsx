
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
import { PointsScoreFormValues } from '../types';

interface PointsScoreFieldsProps {
  form: UseFormReturn<PointsScoreFormValues>;
  scoreType: 'distance' | 'points';
}

export function PointsScoreFields({ form, scoreType }: PointsScoreFieldsProps) {
  const label = scoreType === 'distance' ? 'Distância (metros)' : 'Pontuação';
  const placeholder = scoreType === 'distance' ? '0.00' : '0';
  const step = scoreType === 'distance' ? '0.01' : '1';
  const unit = scoreType === 'distance' ? 'm' : 'pts';

  return (
    <FormField
      control={form.control}
      name="score"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type="number" 
                step={step}
                min="0" 
                placeholder={placeholder}
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {unit}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
