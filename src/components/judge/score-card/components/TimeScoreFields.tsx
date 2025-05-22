
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
import { TimeScoreFormValues } from '../types';

interface TimeScoreFieldsProps {
  form: UseFormReturn<TimeScoreFormValues>;
}

export function TimeScoreFields({ form }: TimeScoreFieldsProps) {
  return (
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
  );
}
