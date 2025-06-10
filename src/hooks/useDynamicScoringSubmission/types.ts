
export interface DynamicSubmissionData {
  eventId: string;
  modalityId: number;
  athleteId: string;
  judgeId: string;
  modeloId: number;
  formData: Record<string, any>;
  equipeId?: number;
  notes?: string;
  raia?: number;
  bateriaId?: number;
}
