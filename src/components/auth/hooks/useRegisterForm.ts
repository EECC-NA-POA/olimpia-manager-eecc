
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
      console.log('🎯 Starting registration process with values:', values);
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

      console.log('📝 User metadata for registration:', userMetadata);

      // Attempt to sign up user
      const result = await signUp(values.email, values.password, userMetadata);

      console.log('📋 Registration result:', result);

      // Check if we have a proper result
      if (result && result.user) {
        console.log('✅ Registration successful - user created with ID:', result.user.id);
        
        // For self-hosted instances that don't send confirmation emails
        if (!result.session) {
          toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
          setTimeout(() => {
            console.log('🔄 Redirecting to login after successful signup');
            // Stay on login page but switch to login tab
            window.location.reload();
          }, 1500);
        } else {
          toast.success('Cadastro realizado com sucesso!');
          setTimeout(() => {
            console.log('🔄 Redirecting to event selection after successful signup');
            navigate('/event-selection', { replace: true });
          }, 1500);
        }
      } else {
        console.error('❌ Registration failed - no valid result returned');
        throw new Error('Falha no cadastro - resultado inválido');
      }

    } catch (error: any) {
      console.error('❌ Registration process error:', error);
      
      // Handle specific error cases
      if (error.message === 'USER_EXISTS') {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">Este email já está cadastrado!</p>
            <p className="text-sm">Tente fazer login na aba "Login" ao lado.</p>
          </div>, 
          { duration: 6000 }
        );
      } else if (error.message === 'MAILER_ERROR') {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">Problema na configuração do servidor de email</p>
            <ul className="text-sm space-y-1">
              <li>• O cadastro pode ter sido criado mesmo assim</li>
              <li>• Tente fazer login na aba "Login"</li>
              <li>• Se não conseguir, contate o administrador</li>
            </ul>
          </div>, 
          { duration: 10000 }
        );
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

  return {
    isSubmitting,
    handleSubmit
  };
};
