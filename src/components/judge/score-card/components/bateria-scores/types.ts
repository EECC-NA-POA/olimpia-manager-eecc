
export interface BateriaScore {
  id: number;
  bateria_id: number;
  valor_pontuacao: number | null;
  unidade: string;
  observacoes: string | null;
  bateria_numero?: number;
}

export interface BateriaScoresDisplayProps {
  athleteId: string;
  modalityId: number;
  eventId: string;
  judgeId: string;
  baterias: Array<{ id: number; numero: number }>;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}
