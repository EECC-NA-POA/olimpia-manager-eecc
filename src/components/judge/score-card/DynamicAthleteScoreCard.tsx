
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { DynamicScoreForm } from './components/DynamicScoreForm';
import { useDynamicAthleteScoreCard } from './hooks/useDynamicAthleteScoreCard';
import { AthleteScoreCardProps } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

export function DynamicAthleteScoreCard({ 
  athlete, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType
}: AthleteScoreCardProps) {
  const isMobile = useIsMobile();
  
  const {
    existingScore,
    modelo,
    hasDynamicScoring,
    initialFormData
  } = useDynamicAthleteScoreCard(
    athlete,
    modalityId,
    eventId,
    judgeId
  );

  console.log('DynamicAthleteScoreCard - Debug info:', {
    athleteName: athlete.atleta_nome,
    modalityId,
    hasDynamicScoring,
    modelo: modelo ? {
      id: modelo.id,
      codigo: modelo.codigo_modelo,
      descricao: modelo.descricao
    } : null,
    existingScore: existingScore ? 'Has score' : 'No score'
  });

  // If no dynamic scoring model is configured, return empty
  if (!hasDynamicScoring || !modelo) {
    console.log('No dynamic scoring available for athlete:', athlete.atleta_nome);
    return null;
  }

  const triggerButton = (
    <Button 
      variant={existingScore ? "outline" : "default"}
      size="sm"
      className={isMobile ? 'text-xs h-8' : ''}
    >
      {existingScore ? "Editar" : "Pontuar"}
    </Button>
  );

  const content = (
    <>
      {existingScore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-blue-800 text-sm font-medium">
            ✓ Pontuação registrada
          </div>
          <div className="text-blue-700 text-xs mt-1">
            {existingScore.observacoes && `Observações: ${existingScore.observacoes}`}
          </div>
        </div>
      )}

      {modelo && (
        <DynamicScoreForm
          modeloId={modelo.id}
          modalityId={modalityId}
          athleteId={athlete.atleta_id}
          equipeId={athlete.equipe_id}
          eventId={eventId!}
          judgeId={judgeId}
          initialValues={initialFormData}
        />
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {triggerButton}
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center pb-4">
            <DrawerTitle className="text-lg">
              Pontuação - {athlete.atleta_nome}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Pontuação - {athlete.atleta_nome}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
