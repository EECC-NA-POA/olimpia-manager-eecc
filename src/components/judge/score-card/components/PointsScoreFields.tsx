
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
}

export function PointsScoreFields({ form }: PointsScoreFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="score"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pontuação</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type="number" 
                step="1"
                min="0" 
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
  );
}
