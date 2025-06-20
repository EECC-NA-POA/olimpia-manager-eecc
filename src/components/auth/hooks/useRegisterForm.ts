
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

      // Format birth date
      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        toast.error('Data de nascimento inválida');
        return;
      }

      // Skip user existence check to avoid JWT issues
      // Supabase auth will handle duplicate email validation during signup
      console.log('📋 Proceeding with signup - duplicate email check will be handled by Supabase auth');

      // Prepare user metadata - now includes branch ID
      const userMetadata = {
        ...prepareUserMetadata(values, formattedBirthDate),
        filial_id: values.branchId
      };

      console.log('User metadata prepared:', userMetadata);

      // Sign up user with the correct parameters: email, password, userData
      await signUp(values.email, values.password, {
        data: userMetadata
      });

      // If we reach here, signup was successful
      toast.success('Cadastro realizado com sucesso! Por favor, selecione um evento para continuar.');
      navigate('/event-selection');

    } catch (error: any) {
      console.error('Registration process error occurred:', error);
      
      // Handle specific signup errors
      if (error.message?.includes('User already registered')) {
        toast.error('Este email já está cadastrado. Por favor, faça login.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido. Por favor, verifique o formato.');
      } else if (error.message?.includes('Password')) {
        toast.error('Senha deve ter pelo menos 6 caracteres.');
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
