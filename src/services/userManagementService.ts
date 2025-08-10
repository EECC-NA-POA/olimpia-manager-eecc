import { supabase } from '@/lib/supabase';
import { validateAdminPermission } from '@/lib/security/roleValidation';
import { toast } from 'sonner';
import { cleanDocumentNumber } from '@/utils/documentValidation';

export interface CreateUserData {
  nome_completo: string;
  email: string;
  senha: string;
  telefone: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  data_nascimento: string;
  cadastra_eventos?: boolean;
}

export interface UserDeletionOptions {
  deleteFromBoth: boolean;
  confirmationEmail: string;
  confirmationDocument: string;
}

class UserManagementService {
  async checkUserExists(email: string, documento?: string) {
    try {
      // Verificar se existe em public.usuarios (não em auth.users via query)
      let publicUserByEmail = null;
      let publicUserByDoc = null;

      const { data: userByEmail, error: emailError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', email)
        .single();

      if (emailError && emailError.code !== 'PGRST116') {
        throw emailError;
      }
      publicUserByEmail = userByEmail;

      if (documento) {
        const { data: userByDoc, error: docError } = await supabase
          .from('usuarios')
          .select('numero_documento')
          .eq('numero_documento', documento)
          .single();

        if (docError && docError.code !== 'PGRST116') {
          throw docError;
        }
        publicUserByDoc = userByDoc;
      }

      return {
        existsInAuth: false, // Não podemos verificar auth.users via query direta
        existsInPublicByEmail: !!publicUserByEmail,
        existsInPublicByDocument: !!publicUserByDoc
      };
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserData) {
    try {
      // Security check: Only admins can create users
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Check if current user has admin permissions
      const { data: adminRoles, error: roleError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis!inner(
            nome
          )
        `)
        .eq('usuario_id', user.id);

      if (roleError) {
        console.error('Error checking admin permissions:', roleError);
        throw new Error('Erro ao verificar permissões');
      }

      const hasAdminRole = adminRoles?.some((role: any) => 
        role.perfis?.nome === 'Administração'
      );

      if (!hasAdminRole) {
        throw new Error('Acesso negado: Apenas administradores podem criar usuários');
      }

      // Verificar existência antes de criar
      const exists = await this.checkUserExists(userData.email, userData.numero_documento);
      
      if (exists.existsInPublicByEmail) {
        throw new Error('Já existe um usuário com este email na base de dados');
      }
      
      if (exists.existsInPublicByDocument) {
        throw new Error('Já existe um usuário com este documento na base de dados');
      }

      // Executar SQL direto para criar usuário em auth.users
      const { data: authResult, error: authError } = await supabase.rpc('create_auth_user', {
        user_email: userData.email,
        user_password: userData.senha,
        user_metadata: {
          nome_completo: userData.nome_completo,
          telefone: userData.telefone,
          tipo_documento: userData.tipo_documento,
          numero_documento: userData.numero_documento,
          genero: userData.genero,
          data_nascimento: userData.data_nascimento
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw new Error('Erro ao criar usuário no sistema de autenticação: ' + authError.message);
      }

      // Usar o ID retornado para criar em public.usuarios
      const userId = authResult;
      
      // Get current user's filial_id
      const { data: currentUser } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', currentUser.user?.id)
        .single();

      const { error: publicError } = await supabase
        .from('usuarios')
        .insert({
          id: userId,
          nome_completo: userData.nome_completo,
          email: userData.email,
          telefone: userData.telefone,
          tipo_documento: userData.tipo_documento,
          numero_documento: userData.numero_documento,
          genero: userData.genero,
          data_nascimento: userData.data_nascimento,
          filial_id: userProfile?.filial_id,
          usuario_registrador_id: currentUser.user?.id,
          cadastra_eventos: userData.cadastra_eventos || false,
          confirmado: true, // Auto-confirm users created by admin
          ativo: true
        });

      if (publicError) {
        console.error('Error creating public user:', publicError);
        // Tentar limpar auth.users se falhou em public.usuarios
        await supabase.rpc('delete_auth_user', { user_id: userId });
        throw new Error('Erro ao criar perfil do usuário: ' + publicError.message);
      }

      return { success: true, userId };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async deleteUser(userId: string, options: UserDeletionOptions) {
    try {
      // Buscar dados do usuário usando função SQL segura
      const { data: userDetails, error: userError } = await supabase.rpc(
        'get_user_details_for_deletion', 
        { p_user_id: userId }
      );

      console.log('🔍 DEBUG - Resultado da função SQL:', { userDetails, userError });

      if (userError) {
        console.error('❌ Erro na função SQL:', userError);
        throw new Error('Erro ao buscar dados do usuário: ' + userError.message);
      }

      if (!userDetails || userDetails.length === 0) {
        throw new Error('Usuário não encontrado em nenhuma das tabelas');
      }

      const userDetail = userDetails[0];
      const isAuthOnly = userDetail.is_auth_only;
      
      const user = {
        email: userDetail.email || '',
        numero_documento: userDetail.numero_documento || ''
      };

      // Normalizar dados para comparação
      const normalizedUserEmail = (user.email || '').toLowerCase().trim();
      const normalizedConfirmationEmail = (options.confirmationEmail || '').toLowerCase().trim();
      const normalizedUserDocument = cleanDocumentNumber(user.numero_documento || '');
      const normalizedConfirmationDocument = cleanDocumentNumber(options.confirmationDocument || '');

      console.log('🔍 DEBUG - Dados de validação:', {
        userEmail: normalizedUserEmail,
        confirmationEmail: normalizedConfirmationEmail,
        userDocument: normalizedUserDocument,
        confirmationDocument: normalizedConfirmationDocument,
        isAuthOnly,
        exists_in_usuarios: userDetail.exists_in_usuarios,
        exists_in_auth: userDetail.exists_in_auth
      });

      // Validar confirmação com dados normalizados
      const emailMatches = normalizedUserEmail === normalizedConfirmationEmail;
      const documentMatches = isAuthOnly
        ? true // Para auth-only, não exigir confirmação de documento
        : (normalizedUserDocument ? normalizedUserDocument === normalizedConfirmationDocument : true);

      if (!emailMatches || !documentMatches) {
        console.error('❌ Validação falhou:', {
          emailMatch: emailMatches,
          documentMatch: documentMatches,
        });
        throw new Error('Email ou documento de confirmação não conferem');
      }

      console.log('✅ Validação passou - prosseguindo com exclusão');

      if (isAuthOnly) {
        // Para usuários apenas auth, excluir apenas da auth.users
        const { error: authError } = await supabase.rpc('delete_auth_user', { 
          user_id: userId 
        });

        if (authError) {
          throw new Error('Erro ao excluir usuário do sistema de autenticação: ' + authError.message);
        }
      } else {
        // Lógica original para usuários completos
        if (options.deleteFromBoth) {
          // Excluir de ambas as tabelas (cascata completa)
          const { error: publicError } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', userId);

          if (publicError) {
            throw new Error('Erro ao excluir usuário da base de dados: ' + publicError.message);
          }

          const { error: authError } = await supabase.rpc('delete_auth_user', { 
            user_id: userId 
          });

          if (authError) {
            console.error('Error deleting from auth.users:', authError);
            // Não jogar erro aqui pois o principal (public) já foi excluído
          }
        } else {
          // Excluir apenas de auth.users (mantém histórico) e desativar usuário
          const { error: authError } = await supabase.rpc('delete_auth_user', { 
            user_id: userId 
          });

          if (authError) {
            throw new Error('Erro ao excluir usuário do sistema de autenticação: ' + authError.message);
          }

          // Marcar como inativo na tabela usuarios para manter histórico
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({ ativo: false })
            .eq('id', userId);

          if (updateError) {
            console.error('Error deactivating user:', updateError);
            throw new Error('Erro ao desativar usuário: ' + updateError.message);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();
