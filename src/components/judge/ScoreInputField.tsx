
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeValue {
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export type ScoreValue = number | TimeValue;

interface ScoreInputFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  scoreType: 'time' | 'distance' | 'points';
  placeholder?: string;
}

export const ScoreInputField = ({ 
  form, 
  name, 
  label, 
  scoreType,
  placeholder 
}: ScoreInputFieldProps) => {
  if (scoreType === 'time') {
    return (
      <div className="space-y-2">
        <FormLabel>{label}</FormLabel>
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name={`${name}.minutes`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="00" 
                      min={0}
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      min
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${name}.seconds`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="00" 
                      min={0}
                      max={59}
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      seg
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${name}.milliseconds`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="000" 
                      min={0}
                      max={999}
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ms
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }
  
  // For distance or points
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type="number" 
                placeholder={placeholder || "0"} 
                step={scoreType === 'distance' ? '0.01' : '1'}
                min={0}
                {...field} 
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {scoreType === 'distance' ? 'm' : 'pts'}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
