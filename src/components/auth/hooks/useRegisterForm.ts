
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { RegisterFormData } from '../types/form-types';
import { formatBirthDate } from '../utils/registrationUtils';
import { supabase } from '@/lib/supabase';

export const useRegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      console.log('🎯 Starting registration process');
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

      // Attempt to sign up user
      const result = await signUp(values.email, values.password, userMetadata);

      

      // Check if we have a proper result
      if (result && result.user) {
        console.log('✅ Registration successful');
        // Register privacy policy acceptance
        try {
          await registerPrivacyPolicyAcceptance(result.user.id);
          console.log('✅ Privacy policy acceptance registered successfully');
        } catch (privacyError) {
          console.error('❌ Failed to register privacy policy acceptance:', privacyError);
          // Don't fail the registration for this, just log the error
        }
        
        // Always show success message and redirect to login
        toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        setTimeout(() => {
          console.log('🔄 Redirecting to login after successful signup');
          navigate('/login?tab=login', { replace: true });
        }, 1500);
      } else {
        console.error('❌ Registration failed - no valid result returned');
        throw new Error('Falha no cadastro - resultado inválido');
      }

    } catch (error: any) {
      console.error('❌ Registration process error:', error);
      
      // Handle specific error cases
      if (error.message === 'USER_EXISTS') {
        toast.error('Este email já está cadastrado! Tente fazer login na aba "Login" ao lado.', { 
          duration: 6000 
        });
        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login?tab=login', { replace: true });
        }, 2000);
      } else if (error.message === 'MAILER_ERROR') {
        toast.success('Cadastro realizado! Problema no envio do email de confirmação. Faça login para continuar.', { 
          duration: 8000 
        });
        // Always redirect to login for email errors since user might be created
        setTimeout(() => {
          console.log('🔄 Redirecting to login after email error');
          navigate('/login?tab=login', { replace: true });
        }, 2000);
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido. Por favor, verifique o formato.');
      } else if (error.message?.includes('Password') || error.message?.includes('password')) {
        toast.error('Senha deve ter pelo menos 6 caracteres.');
      } else if (error.message?.includes('JWT') || error.message?.includes('connection')) {
        toast.error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
      } else {
        toast.error(`Erro no cadastro: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerPrivacyPolicyAcceptance = async (userId: string) => {
    try {
      console.log('Registering privacy policy acceptance');
      
      // Get the latest privacy policy
      const { data: latestPolicy, error: policyError } = await supabase
        .from('termos_privacidade')
        .select('id, versao_termo, termo_texto')
        .eq('ativo', true)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .single();
        
      if (policyError || !latestPolicy) {
        console.error('Error fetching latest policy:', policyError);
        throw new Error('Não foi possível obter a versão do termo de privacidade');
      }
      
      // Register acceptance
      const acceptanceData = {
        usuario_id: userId,
        versao_termo: latestPolicy.versao_termo,
        termo_texto: latestPolicy.termo_texto,
        termo_privacidade_id: latestPolicy.id
      };
      
      const { error: insertError } = await supabase
        .from('logs_aceite_privacidade')
        .insert(acceptanceData);
      
      if (insertError) {
        console.error('Error inserting acceptance record:', insertError);
        throw new Error('Não foi possível registrar o aceite do termo de privacidade');
      }
      
      console.log('Privacy policy acceptance registered successfully');
    } catch (error) {
      console.error('Failed to register privacy policy acceptance:', error);
      throw error;
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
