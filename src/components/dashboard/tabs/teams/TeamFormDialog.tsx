
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Form validation schema
const teamFormSchema = z.object({
  nome: z.string().min(1, "Nome da equipe é obrigatório"),
  modalidade_id: z.string().min(1, "Modalidade é obrigatória"),
  cor_uniforme: z.string().optional(),
  observacoes: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface TeamFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamFormValues) => void;
  isSubmitting: boolean;
  editingTeam: any | null;
  teamModalities: any[];
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
  // Form methods
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      nome: editingTeam?.nome || '',
      modalidade_id: editingTeam ? String(editingTeam.modalidade_id) : '',
      cor_uniforme: editingTeam?.cor_uniforme || '',
      observacoes: editingTeam?.observacoes || ''
    }
  });

  // If editingTeam changes, update form values
  React.useEffect(() => {
    if (editingTeam) {
      form.reset({
        nome: editingTeam.nome,
        modalidade_id: String(editingTeam.modalidade_id),
        cor_uniforme: editingTeam.cor_uniforme || '',
        observacoes: editingTeam.observacoes || '',
      });
    } else {
      form.reset({
        nome: '',
        modalidade_id: '',
        cor_uniforme: '',
        observacoes: ''
      });
    }
  }, [editingTeam, form]);

  const handleSubmit = (data: TeamFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingTeam ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
          <DialogDescription>
            {editingTeam 
              ? 'Edite as informações da equipe abaixo.' 
              : 'Preencha as informações abaixo para criar uma nova equipe.'}
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
                    <Input placeholder="Nome da equipe" {...field} />
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
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    disabled={!!editingTeam}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma modalidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamModalities?.map((modality: any) => (
                        <SelectItem key={modality.id} value={String(modality.id)}>
                          {modality.nome} - {modality.categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cor_uniforme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Uniforme</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Azul e Branco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input placeholder="Observações sobre a equipe (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetFormAndDialog}>
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
