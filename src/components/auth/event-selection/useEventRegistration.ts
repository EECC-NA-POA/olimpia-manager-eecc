
import { useMutation } from "@tanstack/react-query";
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
  numeroIdentificador: string;
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams): Promise<RegistrationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        // Get correct profile and registration fee information
        const registrationInfo = await getProfileAndFeeInfo(userId, eventId, selectedRole);
        console.log('Retrieved registration info:', registrationInfo);

        if (!registrationInfo) {
          throw new Error('Could not determine profile and registration fee information');
        }

        // First, check if registration exists
        const { data: existingRegistration, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking registration:', checkError);
          throw checkError;
        }

        // Create or update user role for the event
        const { error: roleError } = await supabase
          .from('papeis_usuarios')
          .upsert({
            usuario_id: userId,
            perfil_id: registrationInfo.perfilId,
            evento_id: eventId
          }, {
            onConflict: 'usuario_id,evento_id'
          });

        if (roleError) {
          console.error('Error assigning user role:', roleError);
          throw roleError;
        }

        // Insert or update registration with explicit conflict handling
        const { data: registration, error: registrationError } = await supabase
          .from('inscricoes_eventos')
          .upsert(
            {
              usuario_id: userId,
              evento_id: eventId,
              selected_role: selectedRole, // Store the actual role type (ATL or PGR)
              taxa_inscricao_id: registrationInfo.taxaInscricaoId
            },
            {
              onConflict: 'usuario_id,evento_id',
              ignoreDuplicates: false
            }
          )
          .select();

        if (registrationError) {
          console.error('Error creating/updating registration:', registrationError);
          throw registrationError;
        }

        console.log('Successfully created/updated registration with role:', selectedRole);
        return { success: true, isExisting: !!existingRegistration };
      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao realizar inscrição');
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
    console.log(`Fetching profile info for user ${userId} in event ${eventId} with role ${selectedRole}`);

    // Get profile ID based on selected role - ensure correct profile name mapping
    const profileName = selectedRole === 'ATL' ? 'Atleta' : 'Público Geral';
    console.log('Looking for profile with name:', profileName);

    const { data: profileData, error: profileError } = await supabase
      .from('perfis')
      .select('id')
      .eq('evento_id', eventId)
      .eq('nome', profileName)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Could not determine user profile');
    }

    if (!profileData) {
      console.error('No profile found for', profileName);
      throw new Error(`Profile "${profileName}" not found for this event`);
    }

    console.log('Found profile:', profileData);

    // Get user identifier
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('numero_identificador')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error('Could not fetch user information');
    }

    if (!userData) {
      console.error('No user found with ID:', userId);
      throw new Error('User not found');
    }

    // Get registration fee information
    const { data: feeData, error: feeError } = await supabase
      .from('taxas_inscricao')
      .select('id, valor')
      .eq('evento_id', eventId)
      .eq('perfil_id', profileData.id)
      .maybeSingle();

    if (feeError) {
      console.error('Error fetching registration fee:', feeError);
      throw new Error('Could not determine registration fee');
    }

    if (!feeData) {
      console.error('No registration fee found for profile:', profileData.id);
      throw new Error('Registration fee not configured for this profile');
    }

    return {
      taxaInscricaoId: feeData.id,
      perfilId: profileData.id,
      valor: feeData.valor,
      numeroIdentificador: userData.numero_identificador
    };
  } catch (error) {
    console.error('Error in getProfileAndFeeInfo:', error);
    return null;
  }
}
