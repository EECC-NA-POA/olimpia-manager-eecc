import { z } from "zod";

export const editPersonalInfoSchema = z.object({
  telefone: z.string()
    .min(1, "Telefone é obrigatório")
    .refine((value) => {
      // Remove mask characters and check if we have at least 10 digits
      const digitsOnly = value.replace(/\D/g, '');
      return digitsOnly.length >= 10;
    }, "Telefone deve ter pelo menos 10 dígitos"),
  
  data_nascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  })
    .refine((date) => date <= new Date(), "A data não pode ser no futuro")
    .refine((date) => date >= new Date("1900-01-01"), "A data não pode ser anterior a 01/01/1900"),
});

export type EditPersonalInfoFormData = z.infer<typeof editPersonalInfoSchema>;
