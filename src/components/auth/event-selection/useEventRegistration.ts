
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

        // Step 2: Process registration directly (avoiding RPC to prevent column name issues)
        
        // 2.1: Create or get event registration
        let registrationId: string;
        const { data: existingReg, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing registration:', checkError);
          throw new Error('Failed to check registration status');
        }

        if (existingReg) {
          registrationId = existingReg.id;
          console.log('User already registered, using existing registration:', registrationId);
        } else {
          const { data: newReg, error: regError } = await supabase
            .from('inscricoes_eventos')
            .insert({
              usuario_id: userId,
              evento_id: eventId,
              data_inscricao: new Date().toISOString()
            })
            .select('id')
            .single();

          if (regError || !newReg) {
            console.error('Error creating registration:', regError);
            throw new Error('Failed to create event registration');
          }

          registrationId = newReg.id;
          console.log('Created new registration:', registrationId);
        }

        // 2.2: Assign profile to user
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('papeis_usuarios')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .eq('perfil_id', registrationInfo.perfilId)
          .maybeSingle();

        if (profileCheckError) {
          console.error('Error checking existing profile:', profileCheckError);
          throw new Error('Failed to check profile status');
        }

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('papeis_usuarios')
            .insert({
              usuario_id: userId,
              evento_id: eventId,
              perfil_id: registrationInfo.perfilId
            });

          if (profileError) {
            console.error('Error assigning profile:', profileError);
            throw new Error('Failed to assign profile');
          }
          console.log('Profile assigned successfully');
        } else {
          console.log('Profile already assigned');
        }

        // 2.3: Create payment record
        const { error: paymentError } = await supabase
          .from('pagamentos')
          .insert({
            inscricao_id: registrationId,
            taxa_inscricao_id: registrationInfo.taxaInscricaoId,
            valor: registrationInfo.valor,
            status: registrationInfo.valor === 0 ? 'pago' : 'pendente',
            data_pagamento: registrationInfo.valor === 0 ? new Date().toISOString() : null
          });

        if (paymentError && paymentError.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating payment record:', paymentError);
          // Don't throw here as the registration is already complete
          console.log('Payment record creation failed but continuing...');
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
