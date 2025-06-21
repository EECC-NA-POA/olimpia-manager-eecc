
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
      if (error) {
        if (error.message?.includes('Error sending confirmation email')) {
          console.log('📧 Email confirmation error detected for self-hosted instance');
          
          // Check if user was actually created despite email error
          try {
            console.log('🔍 Checking if user was created despite email error...');
            const { data: { user }, error: sessionError } = await supabase.auth.getUser();
            
            if (user) {
              console.log('✅ User was created successfully despite email error');
              return { user, session: null, needsLogin: false };
            }
          } catch (checkError) {
            console.log('❌ User check failed:', checkError);
          }
          
          // Return specific error for email configuration
          throw new Error('MAILER_ERROR');
        }
        
        // Handle user already exists error
        if (error.message?.includes('User already registered') || 
            error.message?.includes('already registered') ||
            error.message?.includes('duplicate key value')) {
          console.log('⚠️ User already exists');
          throw new Error('USER_EXISTS');
        }
        
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
      
      // Don't transform special errors
      if (error.message === 'MAILER_ERROR' || error.message === 'USER_EXISTS') {
        throw error;
      }
      
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { signUp, loading };
};
