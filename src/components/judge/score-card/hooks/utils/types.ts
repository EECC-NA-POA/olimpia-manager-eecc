
// Re-export from the new types file for backward compatibility
export type { AthleteData, ScoreRecordData, SaveScoreResult } from './types/scoreTypes';

export interface ScoreRecordData {
  evento_id: string;
  modalidade_id: number;
  atleta_id: string;
  equipe_id: number | null;
  valor_pontuacao: any;
  unidade: any;
  observacoes: any;
  juiz_id: any;
  data_registro: any;
  bateria_id: number;
  // Campos de tempo separados para granularidade
  tempo_minutos?: number | null;
  tempo_segundos?: number | null;
  tempo_milissegundos?: number | null;
}

export interface SaveScoreResult {
  success: boolean;
  operation: string;
  data?: any;
}
