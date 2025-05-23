
import { useState } from 'react';
import { toast } from "sonner";
import { DependentRegisterFormData } from '../types/form-types';
import { formatBirthDate } from '../utils/registrationUtils';
import { supabase } from '@/lib/supabase';
import { differenceInYears } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { DEPENDENTS_QUERY_KEY } from '../../athlete/DependentsTable';

export const useDependentRegistration = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (values: DependentRegisterFormData) => {
    let toastId: string | number | undefined;
    let createdDependentId: string | null = null;
    
    try {
      console.log('[Dependent Registration] Starting process with values:', values);
      setIsSubmitting(true);
      toastId = toast.loading('Cadastrando dependente...');

      if (!values.data_nascimento) {
        throw new Error('Data de nascimento é obrigatória');
      }

      const formattedBirthDate = formatBirthDate(values.data_nascimento);
      if (!formattedBirthDate) {
        throw new Error('Data de nascimento inválida');
      }

      const age = differenceInYears(new Date(), values.data_nascimento);
      console.log('[Dependent Registration] Calculated age:', age);
      
      if (age >= 13) {
        throw new Error(
          'Apenas menores de 13 anos podem ser cadastrados como dependentes. ' +
          'Para maiores de 13 anos, utilize o cadastro padrão na página inicial.'
        );
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('[Dependent Registration] Current user ID:', user.id);

      const { data: parentUser, error: parentError } = await supabase
        .from('usuarios')
        .select('telefone, filial_id')
        .eq('id', user.id)
        .single();

      if (parentError) throw parentError;
      if (!parentUser) {
        throw new Error('Dados do usuário principal não encontrados');
      }

      console.log('[Dependent Registration] Parent user data:', parentUser);

      const eventId = localStorage.getItem('currentEventId');
      if (!eventId) {
        throw new Error('ID do evento não encontrado');
      }

      console.log('[Dependent Registration] Creating dependent user...');

      // First, create the dependent user
      const { data: dependent, error: userCreationError } = await supabase
        .from('usuarios')
        .insert({
          nome_completo: values.nome,
          telefone: parentUser.telefone,
          filial_id: parentUser.filial_id,
          tipo_documento: values.tipo_documento,
          numero_documento: values.numero_documento.replace(/\D/g, ''),
          genero: values.genero,
          data_nascimento: formattedBirthDate,
          usuario_registrador_id: user.id,
          confirmado: true
        })
        .select()
        .single();

      if (userCreationError) {
        console.error('[Dependent Registration] Error creating user:', userCreationError);
        throw userCreationError;
      }

      if (!dependent) {
        throw new Error('Erro ao criar usuário dependente');
      }

      createdDependentId = dependent.id;
      console.log('[Dependent Registration] Dependent user created:', dependent);

      // Process registration using the database function
      const { error: registrationError } = await supabase.rpc('process_dependent_registration', {
        p_dependent_id: dependent.id,
        p_event_id: eventId,
        p_birth_date: formattedBirthDate
      });

      if (registrationError) {
        console.error('[Dependent Registration] Process registration error:', registrationError);
        throw registrationError;
      }

      // Verify that the registration was successful by checking the profile assignments
      const { data: assignedProfiles, error: profileCheckError } = await supabase
        .from('papeis_usuarios')
        .select('perfil_id')
        .eq('usuario_id', dependent.id)
        .eq('evento_id', eventId);

      if (profileCheckError) {
        console.error('[Dependent Registration] Error checking profiles:', profileCheckError);
        throw new Error('Failed to verify profile assignments');
      }

      if (!assignedProfiles || assignedProfiles.length === 0) {
        throw new Error('No profiles were assigned to the dependent');
      }

      console.log('[Dependent Registration] Assigned profiles:', assignedProfiles);

      // Verify the event registration
      const { data: eventRegistration, error: registrationCheckError } = await supabase
        .from('inscricoes_eventos')
        .select('selected_role')
        .eq('usuario_id', dependent.id)
        .eq('evento_id', eventId)
        .single();

      if (registrationCheckError || !eventRegistration) {
        console.error('[Dependent Registration] Error checking event registration:', registrationCheckError);
        throw new Error('Failed to verify event registration');
      }

      console.log('[Dependent Registration] Event registration:', eventRegistration);

      // Handle modality registrations if any are selected
      if (values.modalidades.length > 0) {
        console.log('[Dependent Registration] Registering modalities:', values.modalidades);
        
        const modalityRegistrations = values.modalidades.map(modalityId => ({
          atleta_id: dependent.id,
          modalidade_id: modalityId,
          evento_id: eventId,
          status: 'pendente',
          data_inscricao: new Date().toISOString()
        }));

        const { error: modalitiesError } = await supabase
          .from('inscricoes_modalidades')
          .insert(modalityRegistrations);

        if (modalitiesError) {
          console.error('[Dependent Registration] Modalities registration error:', modalitiesError);
          throw modalitiesError;
        }
      }

      console.log('[Dependent Registration] Process completed successfully');
      toast.dismiss(toastId);
      toast.success('Dependente cadastrado com sucesso!');
      onSuccess?.();

      // Invalidate the dependents query to trigger a refresh
      await queryClient.invalidateQueries({
        queryKey: DEPENDENTS_QUERY_KEY(user.id, eventId)
      });

    } catch (error: any) {
      console.error('[Dependent Registration] Error:', error);
      // If we created a dependent user but registration failed, clean up
      if (createdDependentId) {
        try {
          await supabase.from('usuarios').delete().eq('id', createdDependentId);
        } catch (cleanupError) {
          console.error('[Dependent Registration] Cleanup error:', cleanupError);
        }
      }
      toast.dismiss(toastId);
      toast.error(error.message || 'Erro ao cadastrar dependente');
    } finally {
      console.log('[Dependent Registration] Finalizing process');
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
