
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { teamFormSchema, type TeamFormValues } from './schemas/teamFormSchema';

interface TeamModality {
  id: number;
  nome: string;
  categoria: string;
}

interface TeamFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamFormValues) => void;
  isSubmitting: boolean;
  editingTeam?: any;
  teamModalities: TeamModality[];
  resetFormAndDialog: () => void;
}

export function TeamFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  editingTeam,
  teamModalities,
  resetFormAndDialog
}: TeamFormDialogProps) {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      nome: '',
      modalidade_id: '',
    },
  });

  // Reset form when dialog opens/closes or when editing team changes
  useEffect(() => {
    if (isOpen) {
      if (editingTeam) {
        form.reset({
          nome: editingTeam.nome || '',
          modalidade_id: editingTeam.modalidade_id?.toString() || '',
        });
      } else {
        form.reset({
          nome: '',
          modalidade_id: '',
        });
      }
    }
  }, [isOpen, editingTeam, form]);

  const handleSubmit = (data: TeamFormValues) => {
    onSubmit(data);
    if (!editingTeam) {
      form.reset();
    }
    resetFormAndDialog();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetFormAndDialog();
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
          </DialogTitle>
          <DialogDescription>
            {editingTeam ? 'Edite os dados da equipe' : 'Preencha os dados da nova equipe'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Equipe</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da equipe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modalidade_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modalidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma modalidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamModalities.map((modality) => (
                        <SelectItem 
                          key={modality.id} 
                          value={modality.id.toString()}
                        >
                          {modality.nome} - {modality.categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (editingTeam ? 'Atualizar' : 'Criar')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
