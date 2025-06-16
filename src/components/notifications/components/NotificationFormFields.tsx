
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { NotificationTargetType } from '@/types/notifications';

interface NotificationFormFieldsProps {
  titulo: string;
  setTitulo: (value: string) => void;
  conteudo: string;
  setConteudo: (value: string) => void;
  dataExpiracao: string;
  setDataExpiracao: (value: string) => void;
  tipoDestinatario: NotificationTargetType;
  setTipoDestinatario: (value: NotificationTargetType) => void;
  isOrganizer: boolean;
  isBranchFiltered: boolean;
  isSubmitting: boolean;
}

export function NotificationFormFields({
  titulo,
  setTitulo,
  conteudo,
  setConteudo,
  dataExpiracao,
  setDataExpiracao,
  tipoDestinatario,
  setTipoDestinatario,
  isOrganizer,
  isBranchFiltered,
  isSubmitting
}: NotificationFormFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Digite o título da notificação"
          required
        />
      </div>

      <div>
        <Label htmlFor="conteudo">Conteúdo *</Label>
        <RichTextEditor
          value={conteudo}
          onChange={setConteudo}
          placeholder="Digite o conteúdo da notificação. Use os botões da barra de ferramentas para formatação."
        />
      </div>

      {/* Seleção de tipo de destinatário - apenas para organizadores */}
      {isOrganizer && !isBranchFiltered && (
        <div>
          <Label htmlFor="tipo">Tipo de Destinatário</Label>
          <Select value={tipoDestinatario} onValueChange={(value: NotificationTargetType) => setTipoDestinatario(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de destinatário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Participantes</SelectItem>
              <SelectItem value="filial">Por Filial</SelectItem>
              <SelectItem value="perfil">Por Tipo de Perfil</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="expiracao">Data de Expiração (opcional)</Label>
        <Input
          id="expiracao"
          type="datetime-local"
          value={dataExpiracao}
          onChange={(e) => setDataExpiracao(e.target.value)}
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
