
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);

  const signUp = useCallback(async (email: string, password: string, userData?: any): Promise<any> => {
    try {
      setLoading(true);
      console.log('🚀 Starting signup process for:', email);
      console.log('📝 User data received:', userData);

      // Ensure we have properly formatted user metadata
      const userMetadata = {
        nome_completo: userData?.nome_completo || '',
        telefone: userData?.telefone || '',
        ddi: userData?.ddi || '+55',
        tipo_documento: userData?.tipo_documento || 'CPF',
        numero_documento: userData?.numero_documento || '',
        genero: userData?.genero || 'Masculino',
        data_nascimento: userData?.data_nascimento || '1990-01-01',
        estado: userData?.estado || '',
        filial_id: userData?.filial_id || ''
      };

      console.log('📝 Final user metadata for Supabase:', userMetadata);

      // Attempt to sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      console.log('📋 Signup response - data:', data, 'error:', error);

      // Handle specific email confirmation error for self-hosted instances
      if (error && error.message?.includes('Error sending confirmation email')) {
        console.log('📧 Email confirmation error detected for self-hosted instance');
        
        // For self-hosted instances, try a different approach - create user without email confirmation
        try {
          console.log('🔄 Attempting alternative signup without email confirmation...');
          
          // Try signing up with different options
          const { data: altData, error: altError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userMetadata,
              // Don't require email confirmation for self-hosted
            }
          });

          if (altError && !altError.message?.includes('Error sending confirmation email')) {
            throw altError;
          }

          if (altData.user) {
            console.log('✅ Alternative signup successful');
            return altData;
          }
        } catch (altErr) {
          console.error('❌ Alternative signup also failed:', altErr);
        }

        // If all else fails, inform user about email configuration
        throw new Error('Erro de configuração do servidor de email. Entre em contato com o administrador do sistema.');
      }

      // Handle other errors normally
      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      // Success case with user data
      if (data.user) {
        console.log('✅ Signup successful:', {
          user: data.user.id,
          session: !!data.session,
          needsConfirmation: !data.session
        });

        return data;
      } else {
        throw new Error('Nenhum usuário foi criado');
      }

    } catch (error: any) {
      console.error('❌ Sign up error occurred:', error);
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { signUp, loading };
};
