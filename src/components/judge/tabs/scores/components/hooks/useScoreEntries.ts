
import { useState } from 'react';
import { toast } from 'sonner';

interface ScoreEntry {
  athleteId: string;
  value: string;
  notes: string;
  isEditing: boolean;
}

export function useScoreEntries() {
  const [scoreEntries, setScoreEntries] = useState<Record<string, ScoreEntry>>({});

  const startEditing = (athleteId: string, existingScores: any[]) => {
    const existingScore = existingScores.find(s => s.atleta_id === athleteId);
    setScoreEntries(prev => ({
      ...prev,
      [athleteId]: {
        athleteId,
        value: existingScore ? formatScoreValue(existingScore.valor_pontuacao, 'tempo') : '',
        notes: existingScore?.observacoes || '',
        isEditing: true,
      }
    }));
  };

  const cancelEditing = (athleteId: string) => {
    setScoreEntries(prev => {
      const newEntries = { ...prev };
      delete newEntries[athleteId];
      return newEntries;
    });
  };

  const updateEntry = (athleteId: string, field: keyof ScoreEntry, value: string) => {
    setScoreEntries(prev => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [field]: value,
      }
    }));
  };

  const validateEntry = (athleteId: string): boolean => {
    const entry = scoreEntries[athleteId];
    if (!entry || !entry.value.trim()) {
      toast.error('Valor da pontuação é obrigatório');
      return false;
    }
    return true;
  };

  const formatScoreValue = (value: number, type: string): string => {
    if (type === 'tempo') {
      const minutes = Math.floor(value / 60);
      const seconds = (value % 60).toFixed(3);
      return `${minutes.toString().padStart(2, '0')}:${seconds.padStart(6, '0')}`;
    }
    return value.toString();
  };

  return {
    scoreEntries,
    startEditing,
    cancelEditing,
    updateEntry,
    validateEntry,
    formatScoreValue
  };
}
