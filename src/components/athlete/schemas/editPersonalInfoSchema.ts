import { z } from "zod";

export const editPersonalInfoSchema = z.object({
  telefone: z.string()
    .min(1, "Telefone é obrigatório")
    .refine((value) => {
      // Remove mask characters and check if we have at least 10 digits
      const digitsOnly = value.replace(/\D/g, '');
      return digitsOnly.length >= 10;
    }, "Telefone deve ter pelo menos 10 dígitos"),
});

export type EditPersonalInfoFormData = z.infer<typeof editPersonalInfoSchema>;
