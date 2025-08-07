
import { z } from 'zod';

// Form schema for event creation
export const eventSchema = z.object({
  nome: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Descrição do evento deve ter pelo menos 10 caracteres'),
  tipo: z.enum(['estadual', 'nacional', 'internacional', 'regional'], {
    required_error: 'Selecione o tipo do evento',
  }),
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
  status_evento: z.enum(['ativo', 'encerrado', 'suspenso', 'encerrado_oculto']),
  visibilidade_publica: z.boolean().default(false),
  foto_evento: z.string().optional(),
  selectedBranches: z.array(z.string().uuid()).optional(),
  // Campos para taxas de inscrição - Atleta
  taxa_atleta: z.number().min(0, 'Taxa do atleta deve ser maior ou igual a zero').default(0),
  pix_key_atleta: z.string().optional(),
  data_limite_inscricao_atleta: z.date().optional(),
  contato_nome_atleta: z.string().optional(),
  contato_telefone_atleta: z.string().optional(),
  isento_atleta: z.boolean().default(false),
  link_formulario_atleta: z.string().optional(),
  mostra_card_atleta: z.boolean().default(false),
  // Campos para taxas de inscrição - Público Geral
  taxa_publico_geral: z.number().min(0, 'Taxa do público geral deve ser maior ou igual a zero').default(0),
  pix_key_publico_geral: z.string().optional(),
  data_limite_inscricao_publico_geral: z.date().optional(),
  contato_nome_publico_geral: z.string().optional(),
  contato_telefone_publico_geral: z.string().optional(),
  isento_publico_geral: z.boolean().default(false),
  link_formulario_publico_geral: z.string().optional(),
  mostra_card_publico_geral: z.boolean().default(false),
}).refine(data => data.data_fim_inscricao >= data.data_inicio_inscricao, {
  message: 'A data de fim das inscrições deve ser posterior à data de início',
  path: ['data_fim_inscricao'],
}).refine(
  data => !data.data_inicio_evento || !data.data_fim_evento || data.data_fim_evento >= data.data_inicio_evento, {
  message: 'A data de fim do evento deve ser posterior à data de início',
  path: ['data_fim_evento'],
});

export type EventFormValues = z.infer<typeof eventSchema>;
