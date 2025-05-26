
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
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export interface ScoreRecord {
  id?: number;
  valor_pontuacao?: number;
  tempo_minutos?: number;
  tempo_segundos?: number;
  tempo_milissegundos?: number;
  tipo_pontuacao?: 'tempo' | 'distancia' | 'pontos';
  unidade?: string;
  bateria_id?: number;
  observacoes?: string;
  dados_json?: any; // Added this property to fix the TypeScript error
}

// Schema for time score form (tempo)
export const timeScoreSchema = z.object({
  minutes: z.coerce.number().min(0, 'Minutos devem ser positivos').default(0),
  seconds: z.coerce.number().min(0, 'Segundos devem ser positivos').max(59, 'Segundos devem ser entre 0 e 59').default(0),
  milliseconds: z.coerce.number().min(0, 'Milissegundos devem ser positivos').max(999, 'Milissegundos devem ser entre 0 e 999').default(0),
  notes: z.string().optional(),
});

// Schema for distance score form with meters and centimeters (distancia)
export const distanceScoreSchema = z.object({
  meters: z.coerce.number().min(0, 'Metros devem ser positivos').default(0),
  centimeters: z.coerce.number().min(0, 'Centímetros devem ser positivos').max(99, 'Centímetros devem ser entre 0 e 99').default(0),
  notes: z.string().optional(),
});

// Legacy schema for distance score form (distancia) - for backward compatibility
export const legacyDistanceScoreSchema = z.object({
  score: z.coerce.number().min(0, 'A distância deve ser positiva').default(0),
  notes: z.string().optional(),
});

// Schema for points score form (pontos)
export const pointsScoreSchema = z.object({
  score: z.coerce.number().min(0, 'A pontuação deve ser positiva').default(0),
  notes: z.string().optional(),
});

export type TimeScoreFormValues = z.infer<typeof timeScoreSchema>;
export type DistanceScoreFormValues = z.infer<typeof distanceScoreSchema>;
export type LegacyDistanceScoreFormValues = z.infer<typeof legacyDistanceScoreSchema>;
export type PointsScoreFormValues = z.infer<typeof pointsScoreSchema>;

export type ScoreFormValues = TimeScoreFormValues | DistanceScoreFormValues | PointsScoreFormValues;
