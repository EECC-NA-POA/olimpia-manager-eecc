
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PerfilTipo } from "@/lib/types/database";

interface EventRegistrationParams {
  eventId: string;
  selectedRole: PerfilTipo;
}

interface RegistrationResult {
  isExisting: boolean;
}

interface ProfileAndFeeInfo {
  taxaInscricaoId: number;
  perfilId: number;
  valor: number;
  profileName: string;
}

interface ProfileData {
  id: number;
  nome: string;
}

const mapRoleToProfileName = (role: PerfilTipo): string => {
  switch (role) {
    case 'ATL':
      return 'Atleta';
    case 'PGR':
      return 'Público Geral';
    default:
      throw new Error('Invalid role type');
  }
};

export const useEventRegistration = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        console.log('=== INICIANDO INSCRIÇÃO ===');
        console.log('EventId:', eventId);
        console.log('SelectedRole:', selectedRole);
        console.log('UserId:', userId);

        // Step 1: Get profile and fee information based on selected role
        console.log('Etapa 1: Buscando perfil e taxa...');
        const registrationInfo = await getProfileAndFeeInfo(userId, eventId, selectedRole);

        if (!registrationInfo) {
          console.error('Erro: Perfil ou taxa não encontrados');
          throw new Error('Perfil ou taxa de inscrição não encontrados para este evento');
        }

        console.log('✓ Perfil encontrado:', { 
          perfilId: registrationInfo.perfilId, 
          nome: registrationInfo.profileName 
        });
        console.log('✓ Taxa encontrada:', { 
          taxaId: registrationInfo.taxaInscricaoId, 
          valor: registrationInfo.valor 
        });

        // Step 2: Assign role to user in papeis_usuarios
        console.log('Etapa 2: Atribuindo perfil ao usuário...');
        const { data: existingRole, error: roleCheckError } = await supabase
          .from('papeis_usuarios')
          .select('*')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .eq('perfil_id', registrationInfo.perfilId)
          .maybeSingle();

        if (roleCheckError) {
          console.error('Erro ao verificar perfil existente:', roleCheckError);
          toast.error('Erro ao verificar permissões. Verifique se você tem acesso a este evento.');
          throw roleCheckError;
        }

        if (!existingRole) {
          const { error: roleError } = await supabase
            .from('papeis_usuarios')
            .insert({
              usuario_id: userId,
              evento_id: eventId,
              perfil_id: registrationInfo.perfilId,
            });

          if (roleError) {
            console.error('Erro ao atribuir perfil:', roleError);
            toast.error('Erro ao atribuir perfil. Verifique suas permissões.');
            throw roleError;
          }
          console.log('✓ Perfil atribuído com sucesso');
        } else {
          console.log('✓ Perfil já estava atribuído');
        }

        // Step 3: Check if registration already exists
        console.log('Etapa 3: Verificando inscrição existente...');
        const { data: existingRegistration, error: registrationCheckError } = await supabase
          .from('inscricoes_eventos')
          .select('*')
          .eq('evento_id', eventId)
          .eq('usuario_id', userId)
          .maybeSingle();

        if (registrationCheckError) {
          console.error('Erro ao verificar inscrição existente:', registrationCheckError);
          throw registrationCheckError;
        }

        let isExisting = false;

        if (existingRegistration) {
          console.log('✓ Inscrição já existe, atualizando...');
          isExisting = true;
          
          // Update existing registration with selected role and fee
          const { error: updateError } = await supabase
            .from('inscricoes_eventos')
            .update({
              selected_role: registrationInfo.perfilId,
              taxa_inscricao_id: registrationInfo.taxaInscricaoId,
            })
            .eq('id', existingRegistration.id);

          if (updateError) {
            console.error('Erro ao atualizar inscrição:', updateError);
            toast.error('Erro ao atualizar inscrição. Tente novamente.');
            throw updateError;
          }
          console.log('✓ Inscrição atualizada com sucesso');
        } else {
          console.log('Criando nova inscrição...');
          // Create new registration
          const { error: insertError } = await supabase
            .from('inscricoes_eventos')
            .insert({
              evento_id: eventId,
              usuario_id: userId,
              selected_role: registrationInfo.perfilId,
              taxa_inscricao_id: registrationInfo.taxaInscricaoId,
              data_inscricao: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Erro ao criar inscrição:', insertError);
            toast.error('Erro ao criar inscrição. Verifique suas permissões.');
            throw insertError;
          }
          console.log('✓ Nova inscrição criada com sucesso');
        }

        console.log('✓ Pagamento será criado automaticamente pela trigger do banco');
        console.log('=== INSCRIÇÃO CONCLUÍDA COM SUCESSO ===');
        return { isExisting };

      } catch (error: any) {
        console.error('=== ERRO NA INSCRIÇÃO ===');
        console.error('Detalhes do erro:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Registration mutation error:', error);
      toast.error('Erro ao processar inscrição. Tente novamente.');
    },
  });
};

// Helper function to get profile and fee information
async function getProfileAndFeeInfo(
  userId: string,
  eventId: string,
  selectedRole: PerfilTipo
): Promise<ProfileAndFeeInfo | null> {
  const profileName = mapRoleToProfileName(selectedRole);
  
  console.log('  → Buscando perfil:', { eventId, profileName, selectedRole });

  // Step 1: Get the profile by evento_id and name
  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .select('id, nome')
    .eq('evento_id', eventId)
    .eq('nome', profileName)
    .maybeSingle();

  if (profileError) {
    console.error('  ✗ Erro ao buscar perfil:', profileError);
    toast.error('Erro ao buscar perfil do evento');
    return null;
  }

  if (!profile) {
    console.error('  ✗ Perfil não encontrado para:', { eventId, profileName });
    
    // Fallback: Try to find profile by perfis_tipo codigo
    console.log('  → Tentando fallback por código do tipo de perfil...');
    const { data: profilesByType, error: typeError } = await supabase
      .from('perfis')
      .select('id, nome, perfis_tipo!inner(codigo)')
      .eq('evento_id', eventId)
      .eq('perfis_tipo.codigo', selectedRole)
      .maybeSingle();

    if (typeError || !profilesByType) {
      console.error('  ✗ Fallback também falhou:', typeError);
      toast.error(`Perfil "${profileName}" não está disponível para este evento`);
      return null;
    }

    console.log('  ✓ Perfil encontrado via fallback:', profilesByType);
    // Continue with the fallback profile
    const fallbackProfile = profilesByType as ProfileData;
    
    // Step 2: Get the fee for this profile
    const { data: fee, error: feeError } = await supabase
      .from('taxas_inscricao')
      .select('id, valor, perfil_id')
      .eq('perfil_id', fallbackProfile.id)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (feeError) {
      console.error('  ✗ Erro ao buscar taxa:', feeError);
      toast.error('Erro ao buscar taxa de inscrição');
      return null;
    }

    if (!fee) {
      console.error('  ✗ Taxa não encontrada para perfil:', fallbackProfile.id);
      toast.error('Taxa de inscrição não configurada para este perfil');
      return null;
    }

    console.log('  ✓ Taxa encontrada:', fee);

    return {
      taxaInscricaoId: fee.id,
      perfilId: fallbackProfile.id,
      valor: fee.valor,
      profileName: fallbackProfile.nome,
    };
  }

  // Step 2: Get the fee for this profile
  console.log('  → Buscando taxa para perfil:', profile.id);
  const { data: fee, error: feeError } = await supabase
    .from('taxas_inscricao')
    .select('id, valor, perfil_id')
    .eq('perfil_id', profile.id)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (feeError) {
    console.error('  ✗ Erro ao buscar taxa:', feeError);
    toast.error('Erro ao buscar taxa de inscrição');
    return null;
  }

  if (!fee) {
    console.error('  ✗ Taxa não encontrada para perfil:', profile.id);
    toast.error('Taxa de inscrição não configurada para este perfil');
    return null;
  }

  console.log('  ✓ Taxa encontrada:', fee);

  return {
    taxaInscricaoId: fee.id,
    perfilId: profile.id,
    valor: fee.valor,
    profileName: profile.nome,
  };
}
