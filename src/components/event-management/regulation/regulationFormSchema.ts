
import { z } from 'zod';

export const regulationSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  versao: z.string().min(1, 'Versão é obrigatória'),
  regulamento_texto: z.string().min(10, 'O texto do regulamento deve ter pelo menos 10 caracteres'),
  regulamento_link: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Link inválido'),
  is_ativo: z.boolean()
});

export type RegulationFormValues = z.infer<typeof regulationSchema>;
