
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { PersonalInfoSection } from './form-sections/PersonalInfoSection';
import { ContactSection } from './form-sections/ContactSection';
import { AuthSection } from './form-sections/AuthSection';
import { PrivacyPolicySection } from './form-sections/PrivacyPolicySection';
import { registerSchema, RegisterFormData } from './types/form-types';
import { useRegisterForm } from './hooks/useRegisterForm';

export const SignUpForm = () => {
  const { isSubmitting, handleSubmit: onSubmit } = useRegisterForm();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      ddi: '+55',
      telefone: '',
      password: '',
      confirmPassword: '',
      state: undefined,
      branchId: undefined,
      tipo_documento: 'CPF',
      numero_documento: '',
      genero: 'Masculino',
      data_nascimento: undefined,
      acceptPrivacyPolicy: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <PersonalInfoSection form={form} />
          <ContactSection form={form} />
          <AuthSection form={form} />
          <PrivacyPolicySection form={form} />
        </div>

        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          Após concluir seu cadastro, você poderá se inscrever nos eventos disponíveis
          fazendo login no sistema.
        </div>

        <Button
          type="submit"
          className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !form.watch('acceptPrivacyPolicy')}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            'Cadastrar'
          )}
        </Button>
      </form>
    </Form>
  );
};
