
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

interface MetersAndCentimetersFieldProps {
  form: UseFormReturn<any>;
  metersName: string;
  centimetersName: string;
  label?: string;
  maxCentimeters?: number;
}

export function MetersAndCentimetersField({ 
  form, 
  metersName, 
  centimetersName, 
  label = "Distância",
  maxCentimeters = 99
}: MetersAndCentimetersFieldProps) {
  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div className="flex items-center gap-2">
        <FormField
          control={form.control}
          name={metersName}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0"
                    min="0" 
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0) {
                        field.onChange(value);
                      }
                    }}
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
        <FormField
          control={form.control}
          name={centimetersName}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max={maxCentimeters}
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0 && value <= maxCentimeters) {
                        field.onChange(value);
                      }
                    }}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    cm
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        Centímetros: 0 - {maxCentimeters}
      </div>
    </div>
  );
}
