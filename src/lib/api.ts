
import { supabase } from './supabase';

export interface AthleteModality {
  id: string;
  modalidade: string;
  status: string;
  justificativa_status: string;
}

export interface AthleteManagement {
  id: string;
  nome_atleta: string;
  email: string;
  telefone: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  numero_identificador?: string;
  status_confirmacao: boolean;
  filial_id: string;
  filial_nome: string;
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
  modalidades: AthleteModality[];
}

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  total_inscritos: number;
  valor_total_pago: number;
  valor_total_pendente: number;
  total_atletas_pendentes_pagamento: number;
  inscritos_por_status_pagamento: Record<string, number>;
  modalidades_populares: Record<string, {
    Masculino: number;
    Feminino: number;
    Misto: number;
  }>;
  media_pontuacao_por_modalidade: Record<string, number>;
  top_modalidades_masculino: Record<string, number>;
  top_modalidades_feminino: Record<string, number>;
  top_modalidades_misto: Record<string, number>;
}

interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  filial_id: string;
  filial_nome: string;
  profiles: Array<{
    perfil_id: number;
    perfil_nome: string;
  }>;
}

interface SupabaseUserRole {
  perfil_id: number;
  perfis: {
    nome: string;
  }[];
}

interface SupabaseUserData {
  id: string;
  nome_completo: string;
  email: string;
  filial_id: string;
  filiais: {
    nome: string;
  }[];
}

interface UserRole {
  perfil_id: number;
  perfis: {
    nome: string;
  }[];
}

export const updatePaymentAmount = async (
  athleteId: string,
  amount: number
): Promise<void> => {
  console.log('Updating payment amount:', { athleteId, amount });
  
  try {
    const { error } = await supabase
      .from('pagamentos')
      .update({ valor: amount })
      .eq('atleta_id', athleteId);

    if (error) {
      console.error('Error updating payment amount:', error);
      throw new Error(error.message);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error in updatePaymentAmount:', error);
    throw error;
  }
};

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches...');
  const { data, error } = await supabase
    .from('filiais')
    .select('*');

  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }

  return data || [];
};

export const fetchBranchAnalytics = async (): Promise<BranchAnalytics[]> => {
  console.log('Fetching branch analytics from view...');
  try {
    const { data, error } = await supabase
      .from('vw_analytics_inscricoes')
      .select('*');

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    if (!data) {
      console.log('No data returned from analytics view');
      return [];
    }

    console.log('Branch analytics response:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchBranchAnalytics:', error);
    throw error;
  }
};

export const fetchAthleteManagement = async (filterByBranch: boolean = false): Promise<AthleteManagement[]> => {
  console.log('Starting fetchAthleteManagement with filterByBranch:', filterByBranch);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('No authenticated user found');
    }

    console.log('Current user ID:', user.id);

    let userBranchId: string | null = null;
    if (filterByBranch) {
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', user.id)
        .single();
      
      userBranchId = userProfile?.filial_id;
      console.log('User branch ID:', userBranchId);
    }

    let query = supabase
      .from('vw_athletes_management')
      .select('*');

    if (filterByBranch && userBranchId) {
      query = query.eq('filial_id', userBranchId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching athletes:', error);
      throw error;
    }

    console.log('Raw athletes data:', data);
    console.log('Number of raw athletes:', data?.length);

    if (!data) {
      console.log('No athletes data returned');
      return [];
    }

    const athletesMap = new Map<string, AthleteManagement>();

    data.forEach(record => {
      if (!athletesMap.has(record.atleta_id)) {
        athletesMap.set(record.atleta_id, {
          id: record.atleta_id,
          nome_atleta: record.nome_atleta,
          email: record.email,
          telefone: record.telefone,
          tipo_documento: record.tipo_documento,
          numero_documento: record.numero_documento,
          genero: record.genero,
          numero_identificador: record.numero_identificador,
          status_confirmacao: record.status_confirmacao,
          filial_id: record.filial_id,
          filial_nome: record.filial_nome,
          status_pagamento: record.status_pagamento || 'pendente',
          modalidades: []
        });
      }

      if (record.modalidade_nome) {
        const athlete = athletesMap.get(record.atleta_id)!;
        const modalityExists = athlete.modalidades.some(m => m.id === record.inscricao_id);
        
        if (!modalityExists && record.inscricao_id) {
          athlete.modalidades.push({
            id: record.inscricao_id.toString(),
            modalidade: record.modalidade_nome,
            status: record.status_inscricao || 'pendente',
            justificativa_status: record.justificativa_status || ''
          });
        }
      }
    });

    const athletes = Array.from(athletesMap.values());
    console.log('Processed athletes:', athletes.length);
    
    return athletes;
  } catch (error) {
    console.error('Error in fetchAthleteManagement:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  athleteId: string,
  status: string
): Promise<void> => {
  console.log('Updating payment status:', { athleteId, status });
  
  try {
    const { error } = await supabase
      .rpc('atualizar_status_pagamento', {
        p_atleta_id: athleteId,
        p_novo_status: status
      });

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error(error.message);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    throw error;
  }
};

export const updateModalityStatus = async (
  modalityId: string,
  status: string,
  justification: string
): Promise<void> => {
  console.log('Updating modality status:', { modalityId, status, justification });
  const { error } = await supabase
    .rpc('atualizar_status_inscricao', {
      inscricao_id: parseInt(modalityId),
      novo_status: status,
      justificativa: justification
    });

  if (error) {
    console.error('Error updating modality status:', error);
    throw error;
  }

  return Promise.resolve();
};

export const fetchUserProfiles = async (): Promise<UserProfile[]> => {
  console.log('Fetching user profiles...');
  
  const { data: users, error: usersError } = await supabase
    .from('usuarios')
    .select(`
      id,
      nome_completo,
      email,
      filial_id,
      filiais (
        nome
      ),
      papeis_usuarios (
        perfil_id,
        perfis (
          nome
        )
      )
    `);

  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw usersError;
  }

  console.log('Raw users data:', users);

  const formattedUsers = users?.map((user) => {
    // Get branch name from the nested filiais array's first element
    const branchName = Array.isArray(user.filiais) && user.filiais[0]?.nome || 'Sem filial';

    // Get profiles from the nested papeis_usuarios array
    const profiles = user.papeis_usuarios?.map(papel => ({
      perfil_id: papel.perfil_id,
      perfil_nome: Array.isArray(papel.perfis) && papel.perfis[0]?.nome || ''
    })) || [];

    return {
      id: user.id,
      nome_completo: user.nome_completo,
      email: user.email,
      filial_id: user.filial_id,
      filial_nome: branchName,
      profiles: profiles
    };
  }) || [];

  console.log('Formatted users:', formattedUsers);
  return formattedUsers;
};

export const updateUserProfiles = async (userId: string, profileIds: number[]): Promise<void> => {
  const { error } = await supabase
    .rpc('assign_user_profiles', {
      p_user_id: userId,
      p_profile_ids: profileIds
    });

  if (error) throw error;
};
