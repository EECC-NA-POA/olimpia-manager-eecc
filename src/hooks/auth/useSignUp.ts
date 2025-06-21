
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

      // Handle errors properly - don't mask them
      if (error) {
        console.error('❌ Signup error:', error);
        
        // For self-hosted instances, check if it's just an email confirmation issue
        if (error.message?.includes('Error sending confirmation email')) {
          console.log('📧 Email confirmation error detected for self-hosted instance');
          
          // Check if user was actually created despite email error
          if (data?.user) {
            console.log('✅ User was created despite email confirmation error');
            
            // Wait for trigger to process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify user creation
            const { data: userCheck, error: userCheckError } = await supabase
              .from('usuarios')
              .select('id, email, nome_completo')
              .eq('id', data.user.id)
              .maybeSingle();
              
            console.log('📋 User verification:', userCheck, userCheckError);
            
            if (userCheck) {
              console.log('✅ User confirmed in public table');
              return data;
            } else {
              console.error('❌ User not found in public table after creation');
              throw new Error('Usuário criado mas não encontrado na base de dados. Tente novamente.');
            }
          } else {
            throw new Error('Falha ao criar usuário: ' + error.message);
          }
        } else {
          throw error;
        }
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
          
          // Wait for the trigger to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: userCheck, error: userCheckError } = await supabase
            .from('usuarios')
            .select('id, email, nome_completo')
            .eq('id', data.user.id)
            .maybeSingle();
            
          console.log('📋 Public table verification:', userCheck, userCheckError);
          
          if (!userCheck) {
            console.error('❌ User created in auth but not in public table - trigger failed');
            throw new Error('Usuário criado parcialmente. Entre em contato com o suporte.');
          } else {
            console.log('✅ User confirmed in both auth and public tables');
          }
        }

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
