
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
  return (
    <FormField
      control={form.control}
      name="score"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {scoreType === 'distance' ? 'Distância (metros)' : 'Pontuação'}
          </FormLabel>
          <FormControl>
            <Input 
              type="number" 
              step={scoreType === 'distance' ? '0.01' : '1'}
              min="0" 
              placeholder={scoreType === 'distance' ? '0.00' : '0'}
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
