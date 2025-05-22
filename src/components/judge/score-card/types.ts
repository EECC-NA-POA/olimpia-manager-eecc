
import { z } from 'zod';

export interface AthleteScoreCardProps {
  athlete: {
    atleta_id: string;
    atleta_nome: string;
    tipo_documento: string;
    numero_documento: string;
    numero_identificador?: string;
    equipe_id?: number;
  };
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'time' | 'distance' | 'points';
}

export interface ScoreRecord {
  id?: number;
  valor_pontuacao?: number;
  tempo_minutos?: number;
  tempo_segundos?: number;
  tempo_milissegundos?: number;
  tipo_pontuacao?: 'time' | 'distance' | 'points';
  unidade?: string;
  posicao_final?: number;
  medalha?: string;
  observacoes?: string;
}

// Schema for time score form
export const timeScoreSchema = z.object({
  minutes: z.coerce.number().default(0),
  seconds: z.coerce.number().default(0),
  milliseconds: z.coerce.number().default(0),
  notes: z.string().optional(),
});

// Schema for points/distance score form
export const pointsScoreSchema = z.object({
  score: z.coerce.number().default(0),
  notes: z.string().optional(),
});

export type TimeScoreFormValues = z.infer<typeof timeScoreSchema>;
export type PointsScoreFormValues = z.infer<typeof pointsScoreSchema>;
