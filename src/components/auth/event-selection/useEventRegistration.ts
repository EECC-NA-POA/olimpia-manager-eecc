
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";

interface EventRegistrationParams {
  eventId: string;
  selectedRole: 'ATL' | 'PGR';
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        console.log('Starting registration process with:', { userId, eventId, selectedRole });
        
        // Get user's age
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('data_nascimento')
          .eq('id', userId)
          .maybeSingle();

        if (userError || !userData) {
          console.error('Error fetching user data:', userError);
          throw new Error('Error fetching user data');
        }

        const age = userData.data_nascimento 
          ? differenceInYears(new Date(), new Date(userData.data_nascimento))
          : null;

        const isMinor = age !== null && age < 13;
        const childProfileCode = age !== null && age <= 6 ? 'C-6' : 'C+7';

        // Get profile types we'll need
        const { data: profileTypes, error: profileTypesError } = await supabase
          .from('perfis_tipo')
          .select('id, codigo')
          .in('codigo', isMinor ? [selectedRole, childProfileCode] : [selectedRole]);

        if (profileTypesError || !profileTypes?.length) {
          console.error('Error fetching profile types:', profileTypesError);
          throw new Error('Error fetching profile types');
        }

        console.log('Retrieved profile types:', profileTypes);

        // Get profile for the selected role
        const { data: profile, error: profilesError } = await supabase
          .from('perfis')
          .select('id')
          .eq('evento_id', eventId)
          .eq('perfil_tipo_id', profileTypes[0].id)
          .maybeSingle();

        if (profilesError || !profile) {
          console.error('Error fetching profiles:', profilesError);
          throw new Error('Error fetching profiles');
        }

        console.log('Retrieved profile:', profile);

        // Get registration fee for the profile
        const { data: registrationFee, error: feeError } = await supabase
          .from('taxas_inscricao')
          .select('id')
          .eq('evento_id', eventId)
          .eq('perfil_id', profile.id)
          .maybeSingle();

        if (feeError || !registrationFee) {
          console.error('Error fetching registration fee:', feeError);
          throw new Error('Error fetching registration fee');
        }

        console.log('Retrieved registration fee:', registrationFee);

        // First check if registration exists
        const { data: existingRegistration, error: checkError } = await supabase
          .from('inscricoes_eventos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('evento_id', eventId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking registration:', checkError);
          throw new Error('Error checking registration');
        }

        if (existingRegistration) {
          console.log('User already registered for this event');
          return { success: true };
        }

        // Call the create_event_registration function instead of direct insert
        const { error: registrationError } = await supabase.rpc('create_event_registration', {
          p_user_id: userId,
          p_event_id: eventId,
          p_role: selectedRole
        });

        if (registrationError) {
          console.error('Error creating registration:', registrationError);
          throw new Error('Error creating registration');
        }

        console.log('Successfully created registration');
        return { success: true };
      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao realizar inscrição');
        throw error;
      }
    }
  });
};
