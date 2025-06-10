
import { z } from 'zod';

export const teamFormSchema = z.object({
  nome: z.string().min(1, "Nome da equipe é obrigatório"),
  modalidade_id: z.string().min(1, "Modalidade é obrigatória"),
  cor_uniforme: z.string().optional(),
  observacoes: z.string().optional(),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
