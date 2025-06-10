
import { CampoModelo } from '@/types/dynamicScoring';

export interface UseCalculatedFieldsProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
}

export interface ScoreWithReference {
  atleta_id: string;
  valor: number;
  valorOriginal: any;
  bateria_id?: number;
}

export interface PlacementCalculationParams {
  campo: CampoModelo;
  existingScores: any[];
  allFields: CampoModelo[];
}
