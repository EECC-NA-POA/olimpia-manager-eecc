
import { z } from 'zod';

export const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  ddi: z.string(),
  telefone: z.string().min(8, 'Telefone inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  state: z.string().optional(),
  branchId: z.string().uuid('Selecione uma sede').optional(),
  tipo_documento: z.string(),
  numero_documento: z.string(),
  genero: z.string(),
  data_nascimento: z.date().optional(),
  acceptPrivacyPolicy: z.boolean(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
