
import { z } from 'zod';

// Form schema for event basic information form
export const eventBasicInfoSchema = z.object({
  nome: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição do evento deve ter pelo menos 10 caracteres'),
  tipo: z.enum(['estadual', 'nacional', 'internacional', 'regional']),
  pais: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  data_inicio_evento: z.string().optional().nullable(),
  data_fim_evento: z.string().optional().nullable(),
  data_inicio_inscricao: z.string().optional().nullable(),
  data_fim_inscricao: z.string().optional().nullable(),
  status_evento: z.enum(['ativo', 'encerrado', 'suspenso', 'em_teste', 'encerrado_oculto']),
  foto_evento: z.string().optional().nullable(),
  visibilidade_publica: z.boolean().default(true),
});

export type EventBasicInfoFormValues = z.infer<typeof eventBasicInfoSchema>;
