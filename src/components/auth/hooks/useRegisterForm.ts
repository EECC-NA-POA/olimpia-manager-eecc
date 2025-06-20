
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { RegisterFormData } from '../types/form-types';
import { formatBirthDate } from '../utils/registrationUtils';

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

      // Prepare simplified user metadata - only essential fields
      const userMetadata = {
        nome_completo: values.nome || '',
        telefone: values.telefone || '',
        estado: values.state || '',
        filial_id: values.branchId || ''
      };

      console.log('Simplified user metadata for Supabase:', userMetadata);

      // Sign up user with minimal metadata
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
      
      // Enhanced error handling
      if (error.message?.includes('User already registered') || 
          error.message?.includes('already registered') ||
          error.message?.includes('duplicate key value violates unique constraint')) {
        toast.error('Este email já está cadastrado. Por favor, faça login.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido. Por favor, verifique o formato.');
      } else if (error.message?.includes('Password') || error.message?.includes('password')) {
        toast.error('Senha deve ter pelo menos 6 caracteres.');
      } else if (error.message?.includes('Error sending confirmation email')) {
        toast.success('Usuário criado! Para instâncias auto-hospedadas, a confirmação por email pode estar desabilitada.');
        // Still redirect even if email confirmation fails
        setTimeout(() => {
          navigate('/event-selection', { replace: true });
        }, 2000);
      } else {
        toast.error(`Erro no cadastro: ${error.message}`);
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
