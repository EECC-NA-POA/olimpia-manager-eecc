
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
import { DistanceScoreFormValues } from '../types';

interface DistanceScoreFieldsProps {
  form: UseFormReturn<DistanceScoreFormValues>;
}

export function DistanceScoreFields({ form }: DistanceScoreFieldsProps) {
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
