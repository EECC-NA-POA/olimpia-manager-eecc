
import React from 'react';
import { Lock, User, UserPlus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DependentRegistrationForm } from '../auth/DependentRegistrationForm';
import { EditPersonalInfoDialog } from './EditPersonalInfoDialog';

interface AccessProfileProps {
  papeis?: { nome: string; codigo: string; id?: number; }[];
  onPasswordChange?: () => void;
  userId?: string;
  telefone?: string;
  dataNascimento?: string | null;
}

export default function AccessProfile({ 
  papeis, 
  onPasswordChange,
  userId,
  telefone,
  dataNascimento,
}: AccessProfileProps) {
  const [showDependentForm, setShowDependentForm] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
        <User className="h-5 w-5" />
        Acesso
      </h3>
      
      <div className="space-y-3">
        {papeis?.map((papel, index) => (
          <div key={index} className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{papel.nome}</span>
          </div>
        ))}

        <div className="pt-2 space-y-2">
          {onPasswordChange && (
            <Button
              onClick={onPasswordChange}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Alterar Senha
            </Button>
          )}

          {userId && telefone && (
            <>
              <Button
                onClick={() => setShowEditDialog(true)}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Dados Pessoais
              </Button>
              
              <EditPersonalInfoDialog
                userId={userId}
                currentPhone={telefone}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
              />
            </>
          )}

          <Dialog open={showDependentForm} onOpenChange={setShowDependentForm}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar Dependente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Dependente</DialogTitle>
              </DialogHeader>
              <DependentRegistrationForm
                onSuccess={() => setShowDependentForm(false)}
                onCancel={() => setShowDependentForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
