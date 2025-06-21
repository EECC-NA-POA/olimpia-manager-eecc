
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
          data: userMetadata
        }
      });

      console.log('📋 Signup response - data:', data, 'error:', error);

      // For self-hosted instances, ignore email confirmation errors completely
      if (error && error.message?.includes('Error sending confirmation email')) {
        console.log('📧 Email confirmation error detected - treating as success for self-hosted instance');
        
        // Wait a moment for the trigger to potentially process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return success response for self-hosted instances
        return {
          user: { email: email },
          session: null,
          emailConfirmationError: false
        };
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

        // Verify user was created in public table
        if (data.user.id) {
          console.log('🔍 Verifying user creation in public table...');
          
          // Wait a moment for the trigger to process
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { data: userCheck, error: userCheckError } = await supabase
            .from('usuarios')
            .select('id, email, nome_completo')
            .eq('id', data.user.id)
            .maybeSingle();
            
          console.log('📋 Public table verification:', userCheck, userCheckError);
          
          if (!userCheck) {
            console.warn('⚠️ User created in auth but not in public table - trigger may have failed');
          } else {
            console.log('✅ User confirmed in both auth and public tables');
          }
        }
      }

      return data;

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
