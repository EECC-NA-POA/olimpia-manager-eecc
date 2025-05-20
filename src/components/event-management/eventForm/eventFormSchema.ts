
import { z } from 'zod';

// Form schema for event basic information form
export const eventBasicInfoSchema = z.object({
  nome: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição do evento deve ter pelo menos 10 caracteres'),
  tipo: z.enum(['estadual', 'nacional', 'internacional', 'regional']),
  local: z.string().optional(),
  pais: z.string().optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  data_inicio_evento: z.string().optional(),
  data_fim_evento: z.string().optional(),
  data_inicio_inscricao: z.string().optional(),
  data_fim_inscricao: z.string().optional(),
  status_evento: z.enum(['ativo', 'encerrado', 'suspenso', 'em_teste']),
  foto_evento: z.string().optional(),
  visibilidade_publica: z.boolean().default(true),
});

export type EventBasicInfoFormValues = z.infer<typeof eventBasicInfoSchema>;
