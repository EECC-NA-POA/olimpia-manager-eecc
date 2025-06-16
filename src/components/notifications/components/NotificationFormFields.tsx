
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface NotificationFormFieldsProps {
  mensagem: string;
  setMensagem: (value: string) => void;
  isSubmitting: boolean;
}

export function NotificationFormFields({
  mensagem,
  setMensagem,
  isSubmitting
}: NotificationFormFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="mensagem">Mensagem *</Label>
        <RichTextEditor
          value={mensagem}
          onChange={setMensagem}
          placeholder="Digite a mensagem da notificação. Use os botões da barra de ferramentas para formatação."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Notificação'}
        </Button>
      </div>
    </>
  );
}
