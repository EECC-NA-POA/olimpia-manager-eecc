
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { RegisterFormData } from '../types/form-types';
import { formatBirthDate, prepareUserMetadata } from '../utils/registrationUtils';

export const useRegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      console.log('Starting registration process with values:', values);
      setIsSubmitting(true);

      // Validate required fields
      if (!values.state || !values.branchId) {
        toast.error('Por favor, selecione seu estado e sede');
        return;
      }

      // Validate privacy policy acceptance
      if (!values.acceptPrivacyPolicy) {
        toast.error('É necessário aceitar a política de privacidade para continuar');
        return;
      }

      // Format birth date
      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        toast.error('Data de nascimento inválida');
        return;
      }

      // Prepare user metadata with cleaner structure
      const userMetadata = prepareUserMetadata(values, formattedBirthDate);

      console.log('User metadata prepared:', userMetadata);

      // Sign up user with simplified metadata structure
      const result = await signUp(values.email, values.password, userMetadata);

      console.log('Signup result:', result);

      // Check if signup was successful
      if (result && (result.user || result.session)) {
        toast.success('Cadastro realizado com sucesso!');
        
        // Wait a bit for the auth state to update, then redirect
        setTimeout(() => {
          console.log('Redirecting to event selection after successful signup');
          navigate('/event-selection', { replace: true });
        }, 1500);
      } else {
        throw new Error('Falha no cadastro - nenhum usuário ou sessão retornado');
      }

    } catch (error: any) {
      console.error('Registration process error occurred:', error);
      
      // Handle specific signup errors
      if (error.message?.includes('User already registered') || 
          error.message?.includes('already registered') ||
          error.message?.includes('duplicate key value violates unique constraint')) {
        toast.error('Este email já está cadastrado. Por favor, faça login.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido. Por favor, verifique o formato.');
      } else if (error.message?.includes('Password') || error.message?.includes('password')) {
        toast.error('Senha deve ter pelo menos 6 caracteres.');
      } else if (error.message?.includes('Database error') || 
                 error.message?.includes('saving new user') ||
                 error.message?.includes('unexpected_failure')) {
        toast.error('Erro no sistema. Por favor, tente novamente em alguns instantes.');
      } else if (error.message?.includes('JWT') || error.message?.includes('token')) {
        toast.error('Erro de autenticação. Por favor, recarregue a página e tente novamente.');
      } else {
        toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
