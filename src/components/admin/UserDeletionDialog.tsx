
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';

interface UserDeletionDialogProps {
  user: {
    id: string;
    nome_completo: string;
    email: string;
    numero_documento: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDeletionDialog({ user, open, onOpenChange }: UserDeletionDialogProps) {
  const [deletionType, setDeletionType] = useState<'auth_only' | 'both'>('auth_only');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmationDocument, setConfirmationDocument] = useState('');
  const [secondConfirmation, setSecondConfirmation] = useState(false);
  const { deleteUser, isDeleting } = useUserManagement();

  const isFormValid = 
    confirmationEmail === user.email && 
    confirmationDocument === user.numero_documento &&
    (deletionType === 'auth_only' || secondConfirmation);

  const handleDelete = async () => {
    if (!isFormValid) return;

    try {
      await deleteUser({
        userId: user.id,
        options: {
          deleteFromBoth: deletionType === 'both',
          confirmationEmail,
          confirmationDocument
        }
      });
      handleClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleClose = () => {
    setDeletionType('auth_only');
    setConfirmationEmail('');
    setConfirmationDocument('');
    setSecondConfirmation(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Excluir Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. 
              Usuário: <strong>{user.nome_completo}</strong> ({user.email})
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label>Tipo de Exclusão</Label>
            <RadioGroup value={deletionType} onValueChange={(value: any) => setDeletionType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auth_only" id="auth_only" />
                <Label htmlFor="auth_only" className="text-sm">
                  Excluir apenas do sistema de autenticação (mantém histórico)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="text-sm text-red-600">
                  Excluir completamente (remove todos os dados e registros)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {deletionType === 'both' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>ATENÇÃO:</strong> A exclusão completa removerá todos os registros deste usuário 
                em todos os eventos, incluindo inscrições, pagamentos e pontuações. Esta ação é irreversível.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="confirm_email">Confirme o email do usuário</Label>
              <Input
                id="confirm_email"
                type="email"
                value={confirmationEmail}
                onChange={(e) => setConfirmationEmail(e.target.value)}
                placeholder={user.email}
              />
            </div>

            <div>
              <Label htmlFor="confirm_document">Confirme o documento do usuário</Label>
              <Input
                id="confirm_document"
                value={confirmationDocument}
                onChange={(e) => setConfirmationDocument(e.target.value)}
                placeholder={user.numero_documento}
              />
            </div>
          </div>

          {deletionType === 'both' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="second_confirmation"
                  checked={secondConfirmation}
                  onChange={(e) => setSecondConfirmation(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="second_confirmation" className="text-sm">
                  Confirmo que entendo que esta ação removerá TODOS os dados do usuário 
                  de TODOS os eventos e não pode ser desfeita.
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!isFormValid || isDeleting}
              variant="destructive"
            >
              {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
