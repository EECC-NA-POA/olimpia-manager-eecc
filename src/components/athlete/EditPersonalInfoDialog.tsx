import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';
import { editPersonalInfoSchema, type EditPersonalInfoFormData } from './schemas/editPersonalInfoSchema';
import { useUpdatePersonalInfo } from '@/hooks/useUpdatePersonalInfo';

interface EditPersonalInfoDialogProps {
  userId: string;
  currentPhone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPersonalInfoDialog = ({
  userId,
  currentPhone,
  open,
  onOpenChange,
}: EditPersonalInfoDialogProps) => {
  const updateMutation = useUpdatePersonalInfo();

  const form = useForm<EditPersonalInfoFormData>({
    resolver: zodResolver(editPersonalInfoSchema),
    defaultValues: {
      telefone: currentPhone || '',
    },
  });

  const onSubmit = async (data: EditPersonalInfoFormData) => {
    try {
      await updateMutation.mutateAsync({
        userId,
        telefone: data.telefone,
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
