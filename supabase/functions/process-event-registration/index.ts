
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  dependentId: string;
  eventId: string;
  birthDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody: RequestBody = await req.json();
    const { dependentId, eventId, birthDate } = requestBody;

    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting dependent registration process for:', { dependentId, eventId, birthDate });

    // Calculate age to determine correct profile type
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    
    // Determine age range for profile lookup
    let ageBasedProfileName = '';
    if (age <= 6) {
      ageBasedProfileName = 'Criança 0 a 6 anos';
    } else if (age <= 12) {
      ageBasedProfileName = 'Criança 7 a 12 anos';
    } else {
      throw new Error('Age exceeds dependent registration limit (12 years)');
    }

    console.log('Looking for age-based profile:', ageBasedProfileName);

    // Get the age-based profile ID first
    const { data: ageBasedProfile, error: profileError } = await supabaseAdmin
      .from('perfis')
      .select('id, nome')
      .eq('evento_id', eventId)
      .eq('nome', ageBasedProfileName)
      .single();

    if (profileError || !ageBasedProfile) {
      console.error('Error getting age-based profile:', profileError);
      throw new Error(`Age-based profile not found: ${ageBasedProfileName}`);
    }

    console.log('Found age-based profile:', ageBasedProfile);

    // Call the database function with the age-based profile ID
    const { error: registrationError } = await supabaseAdmin.rpc(
      'process_dependent_registration',
      {
        p_dependent_id: dependentId,
        p_event_id: eventId,
        p_birth_date: birthDate,
        p_profile_id: ageBasedProfile.id
      }
    );

    if (registrationError) {
      console.error('Error in process_dependent_registration:', registrationError);
      throw new Error(`Registration failed: ${registrationError.message}`);
    }

    // Double verify the registration was successful
    const { data: registration, error: verificationError } = await supabaseAdmin
      .from('inscricoes_eventos')
      .select('selected_role')
      .eq('usuario_id', dependentId)
      .eq('evento_id', eventId)
      .single();

    if (verificationError || !registration) {
      throw new Error('Failed to verify registration');
    }

    if (registration.selected_role !== ageBasedProfile.id) {
      console.error('Role mismatch:', {
        expected: ageBasedProfile.id,
        actual: registration.selected_role,
        profileName: ageBasedProfile.nome
      });
      throw new Error('Failed to set correct selected_role for dependent');
    }

    console.log('Successfully processed dependent registration with age-based profile:', {
      userId: dependentId,
      profileId: ageBasedProfile.id,
      profileName: ageBasedProfile.nome
    });

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: ageBasedProfile.id,
          name: ageBasedProfile.nome
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
