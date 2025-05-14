
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

// Add the dependent registration schema
export const dependentRegisterSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  tipo_documento: z.string(),
  numero_documento: z.string(),
  genero: z.string(),
  data_nascimento: z.date().refine(date => {
    if (!date) return false;
    const age = new Date().getFullYear() - date.getFullYear();
    return age < 13; // Must be under 13 years old
  }, {
    message: 'Dependente deve ter menos de 13 anos',
  }),
  modalidades: z.array(z.string()).min(1, 'Selecione pelo menos uma modalidade'),
});

export type DependentRegisterFormData = z.infer<typeof dependentRegisterSchema>;
