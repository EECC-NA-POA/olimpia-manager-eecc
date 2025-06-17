
import React from 'react';
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
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { TeamFormFields } from './components/TeamFormFields';
import { teamFormSchema, TeamFormValues } from './schemas/teamFormSchema';

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
    }
  });

  // If editingTeam changes, update form values
  React.useEffect(() => {
    if (editingTeam) {
      form.reset({
        nome: editingTeam.nome,
        modalidade_id: String(editingTeam.modalidade_id),
      });
    } else {
      form.reset({
        nome: '',
        modalidade_id: '',
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
            <TeamFormFields 
              form={form}
              teamModalities={teamModalities}
              editingTeam={editingTeam}
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
