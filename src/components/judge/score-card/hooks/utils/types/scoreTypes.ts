
export interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export interface ScoreData {
  valor_pontuacao: number;
  unidade: string;
  tempo_minutos?: number;
  tempo_segundos?: number;
  tempo_milissegundos?: number;
  raia?: number;
  bateria_id?: number;
}

export interface PreparedScoreResult {
  scoreData: ScoreData;
}
