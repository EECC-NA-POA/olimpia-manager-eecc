
import { z } from 'zod';

export const teamFormSchema = z.object({
  nome: z.string().min(1, 'Nome da equipe é obrigatório'),
  modalidade_id: z.string().min(1, 'Modalidade é obrigatória'),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
