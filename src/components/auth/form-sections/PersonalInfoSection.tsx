
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import InputMask from 'react-input-mask';
import { UseFormReturn } from 'react-hook-form';
import { formRow, formColumn } from '@/lib/utils/form-layout';

interface PersonalInfoSectionProps {
  form: UseFormReturn<any>;
  hideContactInfo?: boolean;
}

export const PersonalInfoSection = ({ form, hideContactInfo }: PersonalInfoSectionProps) => {
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
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-left w-full">Nome Completo</FormLabel>
            <FormControl>
              <Input
                placeholder="Seu nome completo"
                className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="data_nascimento"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data de Nascimento</FormLabel>
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
                      className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
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
                <PopoverContent className="w-auto p-0" align="start">
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

      {/* Document type and number in the same row */}
      <div className={formRow}>
        <FormField
          control={form.control}
          name="tipo_documento"
          render={({ field }) => (
            <FormItem className={formColumn}>
              <FormLabel>Tipo de Documento</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue="CPF"
                value="CPF"
                disabled={true}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="CPF" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero_documento"
          render={({ field }) => (
            <FormItem className={formColumn}>
              <FormLabel>Número do Documento</FormLabel>
              <FormControl>
                <InputMask
                  mask="999.999.999-99"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      placeholder="000.000.000-00"
                      className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary"
                    />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="genero"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selecione o Gênero</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "Masculino"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
