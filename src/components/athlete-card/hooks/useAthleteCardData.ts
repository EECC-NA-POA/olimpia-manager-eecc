
import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteManagement } from '@/lib/api';

interface RegistradorInfo {
  nome_completo: string;
  email: string | null;
  telefone: string;
}

interface ProfileData {
  perfil: {
    nome: string;
  };
}

interface SupabaseProfileResponse {
  perfil: {
    nome: string;
  };
}

export const useAthleteCardData = (registration: AthleteManagement) => {
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [modalityStatuses, setModalityStatuses] = useState<Record<string, string>>({});
  const [isUpdatingAmount, setIsUpdatingAmount] = useState(false);
  const [localInputAmount, setLocalInputAmount] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Query to fetch payment data
  const { data: paymentData, refetch: refetchPayment } = useQuery({
    queryKey: ['payment-amount', registration.id, registration.evento_id],
    queryFn: async () => {
      console.log('Fetching payment data for:', {
        athleteId: registration.id,
        eventId: registration.evento_id
      });

      if (!registration.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('pagamentos')
          .select(`
            *,
            taxas_inscricao!pagamentos_taxa_inscricao_fk(
              id,
              valor,
              isento,
              pix_key,
              qr_code_image,
              qr_code_codigo,
              perfil:perfis!fk_taxas_inscricao_perfil(
                id,
                nome
              )
            )
          `)
          .eq('atleta_id', registration.id)
          .eq('evento_id', registration.evento_id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching payment data:', error);
          throw error;
        }

        console.log('Payment data received:', data);
        return data;
      } catch (error) {
        console.error('Error in payment query:', error);
        throw error;
      }
    },
    enabled: !!registration.id && !!registration.evento_id,
  });

  // Query to fetch registrator info
  const { data: registradorInfo } = useQuery<RegistradorInfo | null>({
    queryKey: ['registrador', registration.usuario_registrador_id],
    queryFn: async () => {
      if (!registration.usuario_registrador_id) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('nome_completo, email, telefone')
        .eq('id', registration.usuario_registrador_id)
        .maybeSingle();

      if (error || !data) return null;
      return data;
    },
    enabled: !!registration.usuario_registrador_id,
  });

  // Query to fetch user profiles
  const { data: userProfiles } = useQuery<ProfileData[]>({
    queryKey: ['user-profiles', registration.id, registration.evento_id],
    queryFn: async () => {
      if (!registration.id || !registration.evento_id) return [];
      
      const { data, error } = await supabase
        .from('papeis_usuarios')
        .select('perfil:perfil_id(nome)')
        .eq('usuario_id', registration.id)
        .eq('evento_id', registration.evento_id);

      if (error) throw error;
      
      // Transform the data to match ProfileData interface
      return (data || []).map(item => {
        const supabaseProfile = item as unknown as SupabaseProfileResponse;
        return {
          perfil: {
            nome: supabaseProfile.perfil.nome
          }
        };
      });
    },
    enabled: !!registration.id && !!registration.evento_id,
  });

  // Initialize localInputAmount when payment data is loaded
  useEffect(() => {
    if (paymentData?.valor && !localInputAmount) {
      setLocalInputAmount(paymentData.valor.toString());
    }
  }, [paymentData?.valor]);

  const hasRegistrador = !!registration.usuario_registrador_id;
  const hasRegistradorInfo = !!registradorInfo;
  const hasDependentProfile = userProfiles?.some(profile => 
    profile.perfil?.nome === 'Dependente'
  );
  const isDependent = hasRegistrador || hasDependentProfile;

  return {
    justifications,
    setJustifications,
    isUpdating,
    setIsUpdating,
    modalityStatuses,
    setModalityStatuses,
    isUpdatingAmount,
    setIsUpdatingAmount,
    localInputAmount,
    setLocalInputAmount,
    hasInitialized,
    setHasInitialized,
    paymentData,
    refetchPayment,
    registradorInfo,
    isDependent,
    hasRegistrador,
    hasRegistradorInfo
  };
};
