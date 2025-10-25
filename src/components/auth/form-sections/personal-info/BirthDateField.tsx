
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import InputMask from 'react-input-mask';
import { UseFormReturn } from 'react-hook-form';

interface BirthDateFieldProps {
  form: UseFormReturn<any>;
}

export const BirthDateField = ({ form }: BirthDateFieldProps) => {
  const [dateInputValue, setDateInputValue] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const handleDateInput = (event: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = event.target.value;
    setDateInputValue(value);
    
    if (value.length === 10) { // Complete date entered (DD/MM/YYYY)
      const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
      
      if (!isValid(parsedDate)) {
        setDateError("Data inválida");
        return;
      }

      // Check if date is in the future
      if (parsedDate > new Date()) {
        setDateError("A data não pode ser no futuro");
        return;
      }

      // Check if date is before 1900
      if (parsedDate < new Date('1900-01-01')) {
        setDateError("A data não pode ser anterior a 01/01/1900");
        return;
      }

      setDateError(null);
      field.onChange(parsedDate);
    }
  };

  return (
    <FormField
      control={form.control}
      name="data_nascimento"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-gray-700">Data de Nascimento</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <InputMask
                mask="99/99/9999"
                value={dateInputValue}
                onChange={(e) => handleDateInput(e, field)}
                onFocus={() => {
                  if (field.value) {
                    setDateInputValue(format(field.value, 'dd/MM/yyyy'));
                  }
                }}
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    placeholder="DD/MM/AAAA"
                    className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                  />
                )}
              </InputMask>
            </FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`px-2`}
                  onClick={() => {
                    if (field.value) {
                      setDateInputValue(format(field.value, 'dd/MM/yyyy'));
                    }
                  }}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    if (date) {
                      setDateInputValue(format(date, 'dd/MM/yyyy'));
                      setDateError(null);
                    }
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {dateError && (
            <p className="text-sm font-medium text-destructive">{dateError}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
