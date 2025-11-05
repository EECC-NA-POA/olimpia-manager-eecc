
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { BranchSelector } from './BranchSelector';

interface NotificationFormFieldsProps {
  eventId: string;
  titulo: string;
  setTitulo: (value: string) => void;
  mensagem: string;
  setMensagem: (value: string) => void;
  selectedBranches: string[];
  setSelectedBranches: (branches: string[]) => void;
  isSubmitting: boolean;
  isOrganizer: boolean;
  userBranchId?: string;
}

export function NotificationFormFields({
  eventId,
  titulo,
  setTitulo,
  mensagem,
  setMensagem,
  selectedBranches,
  setSelectedBranches,
  isSubmitting,
  isOrganizer,
  userBranchId
}: NotificationFormFieldsProps) {
  return (
    <>
      <BranchSelector
        eventId={eventId}
        selectedBranches={selectedBranches}
        onBranchChange={setSelectedBranches}
        isOrganizer={isOrganizer}
        userBranchId={userBranchId}
      />

      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Digite o título da notificação"
          required
        />
      </div>

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
