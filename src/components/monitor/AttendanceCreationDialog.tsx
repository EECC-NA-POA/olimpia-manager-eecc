
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useModalityAthletes } from "@/hooks/useModalityAthletes";
import { useMonitorMutations } from "@/hooks/useMonitorMutations";
import AttendanceFormStep from './attendance-creation/AttendanceFormStep';
import AttendanceMarkingStep from './attendance-creation/AttendanceMarkingStep';

interface AttendanceCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modalidadeRepId: string | null;
  modalityName: string;
}

interface AthleteAttendance {
  id: string;
  nome_completo: string;
  email: string;
  numero_identificador: string | null;
  status: 'presente' | 'ausente' | 'atrasado';
}

export default function AttendanceCreationDialog({ 
  open, 
  onOpenChange, 
  modalidadeRepId,
  modalityName 
}: AttendanceCreationDialogProps) {
  const [step, setStep] = useState<'form' | 'attendance'>('form');
  const [sessionForm, setSessionForm] = useState({
    data_hora_inicio: '',
    data_hora_fim: '',
    descricao: ''
  });
  const [athletesAttendance, setAthletesAttendance] = useState<AthleteAttendance[]>([]);

  const { data: athletes, isLoading: athletesLoading } = useModalityAthletes(modalidadeRepId || undefined);
  const { createSessionWithAttendance } = useMonitorMutations();

  useEffect(() => {
    if (athletes && step === 'attendance') {
      // Inicializar todos os atletas como presentes
      const initialAttendance = athletes.map(athlete => ({
        id: athlete.id,
        nome_completo: athlete.nome_completo,
        email: athlete.email,
        numero_identificador: athlete.numero_identificador,
        status: 'presente' as const
      }));
      setAthletesAttendance(initialAttendance);
    }
  }, [athletes, step]);

  const handleNext = () => {
    if (!sessionForm.data_hora_inicio) {
      return;
    }
    setStep('attendance');
  };

  const handleBack = () => {
    setStep('form');
  };

  const handleStatusChange = (athleteId: string, status: 'presente' | 'ausente' | 'atrasado') => {
    setAthletesAttendance(prev => 
      prev.map(athlete => 
        athlete.id === athleteId ? { ...athlete, status } : athlete
      )
    );
  };

  const handleCreateSession = async () => {
    if (!modalidadeRepId) return;

    try {
      const attendances = athletesAttendance.map(athlete => ({
        atleta_id: athlete.id,
        status: athlete.status
      }));

      await createSessionWithAttendance.mutateAsync({
        modalidade_rep_id: modalidadeRepId,
        data_hora_inicio: sessionForm.data_hora_inicio,
        data_hora_fim: sessionForm.data_hora_fim || undefined,
        descricao: sessionForm.descricao || 'Chamada de presença',
        attendances
      });

      // Reset form and close dialog
      setSessionForm({ data_hora_inicio: '', data_hora_fim: '', descricao: '' });
      setStep('form');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (athletesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando atletas...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Nova Chamada' : 'Marcar Presenças'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <AttendanceFormStep
            modalityName={modalityName}
            sessionForm={sessionForm}
            onSessionFormChange={setSessionForm}
            athletes={athletes}
            onNext={handleNext}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <AttendanceMarkingStep
            sessionForm={sessionForm}
            modalityName={modalityName}
            athletesAttendance={athletesAttendance}
            onStatusChange={handleStatusChange}
            onBack={handleBack}
            onCreateSession={handleCreateSession}
            isCreating={createSessionWithAttendance.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
