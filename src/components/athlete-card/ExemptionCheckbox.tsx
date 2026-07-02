
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExemptionInfo {
  isento_por_nome: string | null;
  isento_justificativa: string | null;
}

interface ExemptionCheckboxProps {
  canManage: boolean;
  isExempt: boolean;
  isUpdatingExemption: boolean;
  onExemptionChange: (checked: boolean, justificativa?: string) => void;
  exemptionInfo?: ExemptionInfo | null;
  disabled?: boolean;
}

export const ExemptionCheckbox: React.FC<ExemptionCheckboxProps> = ({
  canManage,
  isExempt,
  isUpdatingExemption,
  onExemptionChange,
  exemptionInfo,
  disabled
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [justificativa, setJustificativa] = useState('');

  if (!canManage) return null;

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Isentar exige justificativa → abre o diálogo
      setJustificativa('');
      setDialogOpen(true);
    } else {
      // Remover isenção não exige justificativa
      onExemptionChange(false);
    }
  };

  const handleConfirm = () => {
    if (!justificativa.trim()) return;
    onExemptionChange(true, justificativa.trim());
    setDialogOpen(false);
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="exempt-checkbox"
          checked={isExempt}
          onCheckedChange={handleToggle}
          disabled={isUpdatingExemption || !!disabled}
        />
        <label htmlFor="exempt-checkbox" className="text-sm font-medium text-blue-700">
          Marcar como isento (valor do pagamento será zerado)
        </label>
        {isUpdatingExemption && (
          <div className="text-xs text-blue-600">Atualizando...</div>
        )}
      </div>

      {isExempt && (
        <div className="mt-2 text-xs text-blue-600 space-y-0.5">
          {exemptionInfo?.isento_por_nome && (
            <p>✓ Isento por {exemptionInfo.isento_por_nome}</p>
          )}
          {exemptionInfo?.isento_justificativa && (
            <p className="italic">Justificativa: {exemptionInfo.isento_justificativa}</p>
          )}
          {!exemptionInfo?.isento_por_nome && <p>✓ Atleta marcado como isento deste evento</p>}
        </div>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conceder isenção</AlertDialogTitle>
            <AlertDialogDescription>
              O valor do pagamento será zerado e a isenção ficará registrada em seu nome.
              Informe o motivo da isenção.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Ex.: pagou a taxa internacional da EECC junto com as Olimpíadas Internacionais"
            className="min-h-[90px]"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleConfirm(); }}
              disabled={!justificativa.trim()}
            >
              Confirmar isenção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
