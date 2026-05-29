
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);

  const signUp = useCallback(async (email: string, password: string, userData?: any): Promise<any> => {
    try {
      setLoading(true);
      console.log('🚀 Starting signup process');
      console.log('📝 User data received (sanitized)');

      // Ensure we have properly formatted user metadata with all required fields
      // Clean CPF formatting if needed
      let numeroDocumento = String(userData?.numero_documento || '').trim();
      if (userData?.tipo_documento === 'CPF') {
        numeroDocumento = numeroDocumento.replace(/\D/g, ''); // Remove non-digits
      }

      const userMetadata = {
        nome_completo: String(userData?.nome_completo || userData?.nome || '').trim(),
        telefone: String(userData?.telefone || '').replace(/\D/g, '').trim(), // Clean phone too
        ddi: String(userData?.ddi || '+55').trim(),
        tipo_documento: String(userData?.tipo_documento || 'CPF').trim(),
        numero_documento: numeroDocumento,
        genero: String(userData?.genero || 'Masculino').trim(),
        data_nascimento: userData?.data_nascimento || '1990-01-01',
        estado: String(userData?.estado || userData?.state || '').trim(),
        pais: String(userData?.pais || userData?.country || 'Brasil').trim(),
        filial_id: String(userData?.filial_id || userData?.branchId || '').trim()
      };

      console.log('📝 User metadata prepared for Supabase');

      // Attempt to sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      console.log('📋 Signup response received');

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
        console.log('✅ Signup successful');

        // Verificar se o usuário foi criado na tabela usuarios
        try {
          console.log('🔍 Checking if user was created in usuarios table...');
          const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuarios')
            .select('id, nome_completo, email')
            .eq('id', data.user.id)
            .single();
          
          if (usuarioError) {
            console.error('❌ Error checking usuarios table:', usuarioError);
            console.log('🔧 User was created in auth but not in usuarios table - trigger may have failed');
            
            // Trigger falhou, criar usuário manualmente na tabela usuarios
            console.log('🔧 Attempting to create user manually in usuarios table...');
            try {
              // Prepare complete user data for manual insertion
              const usuarioData = {
                id: data.user.id,
                nome_completo: userMetadata.nome_completo || 'Nome não informado',
                email: data.user.email || '',
                telefone: userMetadata.telefone,
                ddi: userMetadata.ddi,
                tipo_documento: userMetadata.tipo_documento,
                numero_documento: userMetadata.numero_documento,
                genero: userMetadata.genero,
                data_nascimento: userMetadata.data_nascimento,
                estado: userMetadata.estado,
                pais: userMetadata.pais || 'Brasil',
                filial_id: userMetadata.filial_id || null,
                confirmado: false,
                ativo: true,
                data_criacao: new Date().toISOString()
              };

              console.log('📝 Inserting user data (sanitized)');
              
              const { data: insertData, error: insertError } = await supabase
                .from('usuarios')
                .insert(usuarioData)
                .select()
                .single();
              
              if (insertError) {
                console.error('❌ Failed to create user in usuarios table:', insertError);
                throw new Error('Falha ao criar usuário na tabela usuarios');
              } else {
                console.log('✅ User created manually in usuarios table');
                
                // Também tentar atribuir papel de ATL (atleta) como faz o trigger
                try {
                  const { error: roleError } = await supabase
                    .from('usuario_papel_evento')
                    .insert({
                      usuario_id: data.user.id,
                      papel: 'ATL',
                      evento_id: null,
                      created_at: new Date().toISOString()
                    });
                  
                  if (roleError) {
                    console.error('❌ Failed to assign ATL role:', roleError);
                  } else {
                    console.log('✅ ATL role assigned successfully');
                  }
                } catch (roleError) {
                  console.error('❌ Error assigning ATL role:', roleError);
                }
              }
            } catch (insertError) {
              console.error('❌ Error creating user manually:', insertError);
              throw new Error('Falha ao criar usuário no sistema');
            }
          } else {
            console.log('✅ User found in usuarios table');
          }
        } catch (checkError) {
          console.error('❌ Error checking usuarios table:', checkError);
        }

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
