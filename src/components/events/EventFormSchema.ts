
import { z } from 'zod';

// Form schema for event creation
export const eventSchema = z.object({
  nome: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição do evento deve ter pelo menos 10 caracteres'),
  tipo: z.enum(['estadual', 'nacional', 'internacional', 'regional']),
  data_inicio_inscricao: z.date({
    required_error: 'Data de início das inscrições é obrigatória',
  }),
  data_fim_inscricao: z.date({
    required_error: 'Data de fim das inscrições é obrigatória',
  }),
  data_inicio_evento: z.date().optional(),
  data_fim_evento: z.date().optional(),
  pais: z.string().optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  status_evento: z.enum(['ativo', 'encerrado', 'suspenso']),
  visibilidade_publica: z.boolean().default(true),
  foto_evento: z.string().optional(),
  selectedBranches: z.array(z.string().uuid()).optional(),
}).refine(data => data.data_fim_inscricao >= data.data_inicio_inscricao, {
  message: 'A data de fim das inscrições deve ser posterior à data de início',
  path: ['data_fim_inscricao'],
}).refine(
  data => !data.data_inicio_evento || !data.data_fim_evento || data.data_fim_evento >= data.data_inicio_evento, {
  message: 'A data de fim do evento deve ser posterior à data de início',
  path: ['data_fim_evento'],
});

export type EventFormValues = z.infer<typeof eventSchema>;
