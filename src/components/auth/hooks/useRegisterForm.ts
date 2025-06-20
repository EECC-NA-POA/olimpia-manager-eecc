
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { RegisterFormData } from '../types/form-types';
import { formatBirthDate, checkExistingUser, prepareUserMetadata } from '../utils/registrationUtils';
import { supabase } from '@/lib/supabase';

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

      // Get the latest privacy policy version - with improved error handling
      let privacyPolicy;
      try {
        const { data, error } = await supabase
          .from('termos_privacidade')
          .select('*')
          .eq('ativo', true)
          .order('data_criacao', { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          console.error('Error fetching privacy policy:', error);
          toast.error('Erro ao verificar política de privacidade. Tente novamente.');
          return;
        }
        
        if (!data) {
          toast.error('Política de privacidade não encontrada. Por favor, contate o suporte.');
          return;
        }
        
        privacyPolicy = data;
      } catch (err) {
        console.error('Unexpected error fetching privacy policy:', err);
        toast.error('Erro ao verificar política de privacidade');
        return;
      }

      // Format birth date
      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        toast.error('Data de nascimento inválida');
        return;
      }

      // Check for existing user
      const { data: existingUser, error: checkError } = await checkExistingUser(values.email);
      if (checkError) {
        console.error('Error checking user existence:', checkError);
        toast.error('Erro ao verificar cadastro existente.');
        return;
      }

      if (existingUser) {
        toast.error("Este e-mail já está cadastrado. Por favor, faça login.");
        return;
      }

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
      toast.error('Erro ao realizar cadastro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
