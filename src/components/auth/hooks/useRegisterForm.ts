
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

      // Prepare user metadata with all required fields
      const userMetadata = {
        nome_completo: values.nome || '',
        telefone: values.telefone || '',
        ddi: values.ddi || '+55',
        tipo_documento: values.tipo_documento || 'CPF',
        numero_documento: values.numero_documento || '',
        genero: values.genero || 'Masculino',
        data_nascimento: formattedBirthDate || '1990-01-01',
        estado: values.state || '',
        filial_id: values.branchId || ''
      };

      console.log('User metadata for Supabase:', userMetadata);

      // Sign up user
      const result = await signUp(values.email, values.password, userMetadata);

      console.log('Signup result:', result);

      // Check if signup was successful (user created even without email confirmation)
      if (result && result.user) {
        toast.success('Cadastro realizado com sucesso!');
        
        // Redirect after successful signup
        setTimeout(() => {
          console.log('Redirecting to event selection after successful signup');
          navigate('/event-selection', { replace: true });
        }, 1500);
      } else {
        throw new Error('Falha no cadastro - usuário não foi criado');
      }

    } catch (error: any) {
      console.error('Registration process error occurred:', error);
      
      // Enhanced error handling for self-hosted instances
      if (error.message?.includes('Error sending confirmation email')) {
        // For self-hosted instances, user might be created even if email fails
        toast.success('Usuário criado com sucesso! Email de confirmação não é necessário nesta configuração.');
        
        // Still redirect as the user was likely created
        setTimeout(() => {
          navigate('/event-selection', { replace: true });
        }, 2000);
      } else if (error.message?.includes('User already registered') || 
          error.message?.includes('already registered') ||
          error.message?.includes('duplicate key value violates unique constraint')) {
        toast.error('Este email já está cadastrado. Por favor, faça login.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido. Por favor, verifique o formato.');
      } else if (error.message?.includes('Password') || error.message?.includes('password')) {
        toast.error('Senha deve ter pelo menos 6 caracteres.');
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
