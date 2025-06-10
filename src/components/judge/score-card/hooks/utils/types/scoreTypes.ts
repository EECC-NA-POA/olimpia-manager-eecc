
export interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export interface ScoreData {
  valor_pontuacao: number;
  unidade: string;
  bateria_id?: number;
}

export interface PreparedScoreResult {
  scoreData: ScoreData;
}

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
}

export interface SaveScoreResult {
  success: boolean;
  operation: string;
  data?: any;
}
