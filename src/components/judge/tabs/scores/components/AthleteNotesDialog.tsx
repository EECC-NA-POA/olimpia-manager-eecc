
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AthleteNotesDialogProps {
  athleteId: string;
  athleteName: string;
  modalityId: number;
  eventId: string;
  currentNotes?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AthleteNotesDialog({
  athleteId,
  athleteName,
  modalityId,
  eventId,
  currentNotes = '',
  open,
  onOpenChange
}: AthleteNotesDialogProps) {
  const [notes, setNotes] = useState(currentNotes);
  const queryClient = useQueryClient();

  const saveNotesMutation = useMutation({
    mutationFn: async (notesText: string) => {
      // Check if there's already a record for this athlete
      const { data: existingScore } = await supabase
        .from('pontuacoes')
        .select('id')
        .eq('atleta_id', athleteId)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .single();

      if (existingScore) {
        // Update existing record
        const { error } = await supabase
          .from('pontuacoes')
          .update({ observacoes: notesText || null })
          .eq('id', existingScore.id);

        if (error) throw error;
      } else {
        // Create new record with only notes
        const { error } = await supabase
          .from('pontuacoes')
          .insert({
            atleta_id: athleteId,
            modalidade_id: modalityId,
            evento_id: eventId,
            observacoes: notesText || null,
            data_registro: new Date().toISOString()
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', modalityId, eventId] });
      toast.success('Observações salvas com sucesso!');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving notes:', error);
      toast.error('Erro ao salvar observações');
    }
  });

  const handleSave = () => {
    saveNotesMutation.mutate(notes);
  };

  const handleClose = () => {
    setNotes(currentNotes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Observações para {athleteName}
          </DialogTitle>
          <DialogDescription>
            Adicione observações sobre o desempenho do atleta nesta modalidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Estas observações serão visíveis aos atletas em seus relatórios de pontuação.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Observações
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite suas observações sobre o desempenho do atleta..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 caracteres
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saveNotesMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveNotesMutation.isPending}
            >
              {saveNotesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Observações'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
