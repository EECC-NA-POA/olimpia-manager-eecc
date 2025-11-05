import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import InputMask from 'react-input-mask';
import { editPersonalInfoSchema, type EditPersonalInfoFormData } from './schemas/editPersonalInfoSchema';
import { useUpdatePersonalInfo } from '@/hooks/useUpdatePersonalInfo';

interface EditPersonalInfoDialogProps {
  userId: string;
  currentPhone: string;
  currentBirthDate?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPersonalInfoDialog = ({
  userId,
  currentPhone,
  currentBirthDate,
  open,
  onOpenChange,
}: EditPersonalInfoDialogProps) => {
  const [dateInputValue, setDateInputValue] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const updateMutation = useUpdatePersonalInfo();

  // Parse current birth date
  const parsedBirthDate = currentBirthDate ? new Date(currentBirthDate) : undefined;

  const form = useForm<EditPersonalInfoFormData>({
    resolver: zodResolver(editPersonalInfoSchema),
    defaultValues: {
      telefone: currentPhone || '',
      data_nascimento: parsedBirthDate,
    },
  });

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      if (parsedBirthDate && isValid(parsedBirthDate)) {
        setDateInputValue(format(parsedBirthDate, 'dd/MM/yyyy'));
      } else {
        setDateInputValue("");
      }
      setDateError(null);
    }
  }, [open, parsedBirthDate]);

  const handleDateInput = (event: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = event.target.value;
    setDateInputValue(value);
    
    // Clear error when user is typing
    if (dateError) {
      setDateError(null);
    }
    
    // Only try to parse when we have 10 characters
    if (value.length === 10) {
      const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
      
      if (isValid(parsedDate)) {
        // Let Zod schema handle date range validation
        field.onChange(parsedDate);
      } else {
        setDateError("Data inválida");
      }
    } else if (value.length < 10) {
      // Clear field value if input is incomplete
      field.onChange(undefined);
    }
  };

  const onSubmit = async (data: EditPersonalInfoFormData) => {
    try {
      await updateMutation.mutateAsync({
        userId,
        telefone: data.telefone,
        data_nascimento: data.data_nascimento,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Dados Pessoais</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Telefone</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          type="tel"
                          placeholder="(XX) XXXXX-XXXX"
                          className="border-olimpics-green-primary/20 focus-visible:ring-olimpics-green-primary bg-white text-gray-900"
                        />
                      )}
                    </InputMask>
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
                  <FormLabel className="text-gray-700">Data de Nascimento</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <InputMask
                        mask="99/99/9999"
                        value={dateInputValue}
                        onChange={(e) => handleDateInput(e, field)}
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
                          className="pointer-events-auto"
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
