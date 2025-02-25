
CREATE OR REPLACE FUNCTION public.process_dependent_registration(p_dependent_id uuid, p_event_id uuid, p_birth_date date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_age INTEGER;
  v_child_profile_type_id uuid;
  v_dependent_profile_type_id uuid;
  v_child_profile_id INTEGER;
  v_dependent_profile_id INTEGER;
  v_registration_fee_id INTEGER;
  v_next_identifier VARCHAR;
  v_fee_amount NUMERIC;
  v_child_profile_code text;
BEGIN
  -- Calculate age
  v_age := DATE_PART('year', AGE(CURRENT_DATE, p_birth_date));
  RAISE LOG 'Processing dependent registration. Age: %, Birth Date: %', v_age, p_birth_date;
  
  -- Determine the appropriate profile type code based on age
  v_child_profile_code := CASE 
    WHEN v_age <= 6 THEN 'C-6'
    WHEN v_age <= 12 THEN 'C+7'
    ELSE NULL
  END;
  
  IF v_child_profile_code IS NULL THEN
    RAISE EXCEPTION 'Invalid age for dependent registration: %', v_age;
  END IF;

  -- Get profile type IDs
  SELECT id INTO v_child_profile_type_id
  FROM public.perfis_tipo
  WHERE codigo = v_child_profile_code;

  SELECT id INTO v_dependent_profile_type_id
  FROM public.perfis_tipo
  WHERE codigo = 'DEP';

  IF v_child_profile_type_id IS NULL OR v_dependent_profile_type_id IS NULL THEN
    RAISE EXCEPTION 'Profile types not found. Child: %, Dependent: %', v_child_profile_code, 'DEP';
  END IF;

  -- Get the corresponding profile IDs for this event
  SELECT id INTO v_child_profile_id
  FROM public.perfis
  WHERE evento_id = p_event_id
  AND perfil_tipo_id = v_child_profile_type_id;

  SELECT id INTO v_dependent_profile_id
  FROM public.perfis
  WHERE evento_id = p_event_id
  AND perfil_tipo_id = v_dependent_profile_type_id;

  IF v_child_profile_id IS NULL OR v_dependent_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profiles not found for event. Child profile: %, Dependent profile: %', 
      v_child_profile_id, v_dependent_profile_id;
  END IF;

  RAISE LOG 'Found profiles. Child Profile ID: %, Dependent Profile ID: %', 
    v_child_profile_id, v_dependent_profile_id;

  -- Get registration fee for the child profile
  SELECT id, valor INTO v_registration_fee_id, v_fee_amount
  FROM public.taxas_inscricao
  WHERE evento_id = p_event_id
  AND perfil_id = v_child_profile_id;

  IF v_registration_fee_id IS NULL THEN
    RAISE EXCEPTION 'Registration fee not found for child profile: %', v_child_profile_id;
  END IF;

  RAISE LOG 'Found registration fee ID: %, Amount: %', v_registration_fee_id, v_fee_amount;

  -- Generate next identifier for pagamentos
  SELECT LPAD(
    (COALESCE(
      (SELECT MAX(CAST(NULLIF(numero_identificador, '') AS INTEGER))
       FROM public.pagamentos 
       WHERE evento_id = p_event_id), 
      0) + 1
    )::TEXT,
    3,
    '0'
  ) INTO v_next_identifier;

  -- Begin transaction block
  BEGIN
    -- First, assign both profiles
    INSERT INTO public.papeis_usuarios (usuario_id, perfil_id, evento_id)
    VALUES 
      (p_dependent_id, v_child_profile_id, p_event_id),
      (p_dependent_id, v_dependent_profile_id, p_event_id);

    -- Create payment record with confirmed status and isento flag
    INSERT INTO public.pagamentos (
      atleta_id,
      evento_id,
      taxa_inscricao_id,
      valor,
      status,
      data_criacao,
      numero_identificador,
      isento,
      data_validacao
    )
    VALUES (
      p_dependent_id,
      p_event_id,
      v_registration_fee_id,
      v_fee_amount,
      'confirmado',
      CURRENT_TIMESTAMP,
      v_next_identifier,
      true,
      CURRENT_TIMESTAMP
    );

    -- Create event registration with explicitly set child profile as selected_role
    -- This is the key change: we're explicitly using v_child_profile_id
    INSERT INTO public.inscricoes_eventos (
      usuario_id,
      evento_id,
      taxa_inscricao_id,
      selected_role,
      data_inscricao
    )
    VALUES (
      p_dependent_id,
      p_event_id,
      v_registration_fee_id,
      v_child_profile_id,  -- Explicitly using the age-based profile ID
      CURRENT_TIMESTAMP
    );

    -- Double-check that the correct role was set
    IF NOT EXISTS (
      SELECT 1 
      FROM public.inscricoes_eventos 
      WHERE usuario_id = p_dependent_id 
      AND evento_id = p_event_id 
      AND selected_role = v_child_profile_id
    ) THEN
      RAISE EXCEPTION 'Failed to set correct selected_role for dependent';
    END IF;

    -- Update user status to confirmed
    UPDATE public.usuarios
    SET confirmado = true
    WHERE id = p_dependent_id;

    RAISE LOG 'Successfully registered dependent user. ID: %, Event: %, Selected Role (age-based profile): %', 
      p_dependent_id, p_event_id, v_child_profile_id;

  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in dependent registration: %', SQLERRM;
    RAISE;
  END;
END;
$function$;
