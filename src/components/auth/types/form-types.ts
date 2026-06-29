
import { z } from 'zod';

// Kept for backward compatibility but no longer used in new registration flow
export type NationalityType = 'BRASILEIRO' | 'ESTRANGEIRO';

export const createRegisterSchema = (t: (key: string) => string) => z.object({
  nome: z.string().refine((val) => {
    const parts = val.trim().split(/\s+/);
    return parts.filter(p => p.length >= 3).length >= 2;
  }, t('validation.nameMin')),
  email: z.string().email(t('validation.emailInvalid')),
  ddi: z.string().min(1, t('validation.required')),
  telefone: z.string().min(8, t('validation.phoneMin')),
  password: z.string().refine((val) => {
    // Min 8, 1 Upper, 1 Lower, 1 Number, 1 Special
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
    return val.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
  }, t('validation.passwordMin')),
  confirmPassword: z.string(),
  // Country is now the primary field for location (Brasil is default)
  country: z.string().min(1, t('validation.countryRequired')).default('Brasil'),
  state: z.string().min(1, t('validation.stateRequired')),
  branchId: z.string().min(1, t('validation.branchRequired')),
  tipo_documento: z.string(),
  numero_documento: z.string().min(1, t('validation.docRequired')),
  genero: z.enum(['Masculino', 'Feminino'], { errorMap: () => ({ message: t('validation.genderRequired') }) }),
  data_nascimento: z.date({ required_error: t('validation.birthDateRequired') }),
  acceptPrivacyPolicy: z.literal(true, { errorMap: () => ({ message: t('validation.privacyRequired') }) }),
}).refine(data => data.password === data.confirmPassword, {
  message: t('validation.passwordMismatch'),
  path: ['confirmPassword'],
}).superRefine((data, ctx) => {
  // Passport validation when document type is PASSAPORTE
  if (data.tipo_documento === 'PASSAPORTE') {
    // Max 9 chars, Uppercase, Letters/Numbers only
    const isValid = /^[A-Z0-9]{1,9}$/.test(data.numero_documento);
    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.passportInvalid'),
        path: ['numero_documento']
      });
    }
  }
  // CPF validation when document type is CPF
  if (data.tipo_documento === 'CPF') {
    // Remove formatting (dots and dashes) before validation
    const cleanCpf = data.numero_documento.replace(/\D/g, '');
    const isValid = /^\d{11}$/.test(cleanCpf);
    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.cpfInvalid'),
        path: ['numero_documento']
      });
    }
  }
});

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

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
