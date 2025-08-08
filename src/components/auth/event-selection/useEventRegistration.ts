
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PerfilTipo } from "@/lib/types/database";

interface EventRegistrationParams {
  eventId: string;
  selectedRole: PerfilTipo;
}

interface RegistrationResult {
  success: boolean;
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
  taxas_inscricao: {
    id: number;
    valor: number;
    perfil_id: number;
  } | {
    id: number;
    valor: number;
    perfil_id: number;
  }[];
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
        console.log('Starting registration process for event:', eventId, 'with role:', selectedRole);

        // Step 1: Get profile and fee information based on selected role
        const registrationInfo = await getProfileAndFeeInfo(userId, eventId, selectedRole);
        console.log('Retrieved registration info:', registrationInfo);

        if (!registrationInfo) {
          throw new Error('Could not determine profile and registration fee information');
        }

        // Step 2: Begin transaction for registration process
        const { error: transactionError } = await supabase.rpc('process_event_registration', {
          p_user_id: userId,
          p_event_id: eventId,
          p_profile_id: registrationInfo.perfilId,
          p_registration_fee_id: registrationInfo.taxaInscricaoId
        });

        if (transactionError) {
          console.error('Error in registration transaction:', transactionError);
          throw new Error('Failed to complete registration process');
        }

        console.log('Registration process completed successfully');
        // Invalidate events query so UI reflects registration status
        await queryClient.invalidateQueries({ queryKey: ['events', userId] });
        return { success: true, isExisting: false };

      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error('Erro ao realizar inscrição. Por favor, tente novamente.');
        throw error;
      }
    }
  });
};

async function getProfileAndFeeInfo(
  userId: string,
  eventId: string,
  selectedRole: PerfilTipo
): Promise<ProfileAndFeeInfo | null> {
  try {
    const profileName = mapRoleToProfileName(selectedRole);
    console.log('Fetching profile and fee info for:', { userId, eventId, profileName });

    // Step 1: Get the profile with its registration fee using explicit FK relationship
    const { data, error } = await supabase
      .from('perfis')
      .select(`
        id,
        nome,
        taxas_inscricao!fk_taxas_inscricao_perfil (
          id,
          valor,
          perfil_id
        )
      `)
      .eq('evento_id', eventId)
      .eq('nome', profileName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Could not find profile information');
    }

    if (!data || !data.taxas_inscricao) {
      console.error('Missing profile or fee data:', data);
      throw new Error('Registration fee not configured for this profile');
    }

    const profileData = data as ProfileData;
    const feeData = Array.isArray(profileData.taxas_inscricao) 
      ? profileData.taxas_inscricao[0]
      : profileData.taxas_inscricao;

    if (!feeData) {
      throw new Error('No registration fee found for this profile');
    }

    console.log('Found profile data:', profileData);
    console.log('Found fee data:', feeData);

    const result: ProfileAndFeeInfo = {
      taxaInscricaoId: feeData.id,
      perfilId: profileData.id,
      valor: feeData.valor,
      profileName: profileData.nome
    };

    console.log('Final registration info:', result);
    return result;

  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    throw error;
  }
}
