import { supabase } from '../../supabase';

export interface UserProfileDataAlternative {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  profiles: Array<{
    id: number;
    nome: string;
  }>;
  latestPaymentStatus?: string;
  paymentStatus?: string;
}

export const fetchUserProfilesAlternative = async (eventId: string | null): Promise<UserProfileDataAlternative[]> => {
  if (!eventId) {
    console.log('No eventId provided');
    return [];
  }

  console.log('=== NOVA ABORDAGEM: Fetching user profiles for event:', eventId);

  try {
    // First check if user has admin permission
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      throw new Error('Usuário não autenticado');
    }

    console.log('Verificando permissões administrativas...');
    const { data: adminCheck, error: adminError } = await supabase
      .from('papeis_usuarios')
      .select(`
        perfis!inner(nome)
      `)
      .eq('usuario_id', user.id)
      .eq('evento_id', eventId)
      .eq('perfis.nome', 'Administração')
      .maybeSingle();

    if (adminError) {
      console.error('❌ Erro ao verificar permissões:', adminError);
      throw new Error('Erro ao verificar permissões administrativas');
    }

    if (!adminCheck) {
      console.error('❌ Usuário não tem permissão administrativa para este evento');
      throw new Error('Acesso negado: permissão administrativa necessária');
    }

    console.log('✅ Permissão administrativa confirmada');

    // Estratégia 1: Usar função RPC personalizada
    console.log('Tentando buscar usuários via RPC...');
    
    const { data: rpcUsers, error: rpcError } = await supabase
      .rpc('get_event_users_admin', { 
        p_event_id: eventId 
      });

    if (rpcError) {
      console.error('❌ Erro no RPC:', rpcError);
    } else if (rpcUsers && rpcUsers.length > 0) {
      console.log('✅ RPC funcionou! Usuários encontrados:', rpcUsers.length);
      return formatRpcUsers(rpcUsers);
    } else {
      console.log('⚠️ RPC retornou array vazio');
    }

    // Estratégia 2: Buscar através de inscricoes_eventos (mais confiável)
    console.log('Tentando busca via inscricoes_eventos...');
    
    const { data: inscricoes, error: inscricoesError } = await supabase
      .from('inscricoes_eventos')
      .select(`
        usuario_id,
        usuarios!inner(
          id,
          email,
          nome_completo,
          telefone
        )
      `)
      .eq('evento_id', eventId);

    if (inscricoesError) {
      console.error('❌ Erro na busca de inscrições:', inscricoesError);
    } else if (inscricoes && inscricoes.length > 0) {
      console.log('✅ Busca por inscrições funcionou! Usuários encontrados:', inscricoes.length);
      
      // Get profiles for each user
      const userIds = inscricoes.map(i => i.usuario_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          usuario_id,
          perfis(id, nome)
        `)
        .in('usuario_id', userIds)
        .eq('evento_id', eventId);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
      }

      // Get payment status for each user
      const { data: payments, error: paymentsError } = await supabase
        .from('pagamentos')
        .select('atleta_id, status')
        .in('atleta_id', userIds)
        .eq('evento_id', eventId);

      if (paymentsError) {
        console.error('❌ Erro ao buscar pagamentos:', paymentsError);
      }

      return formatInscricoesUsers(inscricoes, profiles || [], payments || []);
    } else {
      console.log('⚠️ Busca de inscrições retornou array vazio');
    }

    console.error('❌ Todas as estratégias falharam ou retornaram vazio');
    return [];

  } catch (error) {
    console.error('❌ Erro geral ao buscar usuários:', error);
    throw error;
  }
};

const formatRpcUsers = (users: any[]): UserProfileDataAlternative[] => {
  return users.map(user => ({
    id: user.id,
    nome_completo: user.nome_completo || user.email,
    email: user.email,
    telefone: user.telefone,
    profiles: user.profiles || [],
    latestPaymentStatus: user.latest_payment_status
  }));
};

const formatDirectUsers = (users: any[]): UserProfileDataAlternative[] => {
  const userMap = new Map<string, UserProfileDataAlternative>();

  users.forEach(item => {
    const userId = item.usuario_id;
    const userInfo = item.usuarios;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        id: userId,
        nome_completo: userInfo.user_metadata?.nome_completo || userInfo.email,
        email: userInfo.email,
        telefone: userInfo.user_metadata?.telefone,
        profiles: []
      });
    }

    const user = userMap.get(userId)!;
    
    if (item.papeis_usuarios?.perfis) {
      const profile = {
        id: item.papeis_usuarios.perfis.id,
        nome: item.papeis_usuarios.perfis.nome
      };
      
      if (!user.profiles.find(p => p.id === profile.id)) {
        user.profiles.push(profile);
      }
    }
  });

  return Array.from(userMap.values());
};

const formatServiceUsers = (users: any[]): UserProfileDataAlternative[] => {
  return users.map(user => ({
    id: user.id,
    nome_completo: user.user_metadata?.nome_completo || user.email,
    email: user.email,
    telefone: user.user_metadata?.telefone,
    profiles: user.papeis_usuarios?.map((pu: any) => ({
      id: pu.perfis.id,
      nome: pu.perfis.nome
    })) || []
  }));
};

const formatInscricoesUsers = (inscricoes: any[], profiles: any[], payments: any[] = []): UserProfileDataAlternative[] => {
  const profilesMap = new Map<string, any[]>();
  const paymentsMap = new Map<string, string>();
  
  // Group profiles by user ID
  profiles.forEach(profile => {
    const userId = profile.usuario_id;
    if (!profilesMap.has(userId)) {
      profilesMap.set(userId, []);
    }
    if (profile.perfis) {
      profilesMap.get(userId)!.push({
        id: profile.perfis.id,
        nome: profile.perfis.nome
      });
    }
  });

  // Group payments by user ID
  payments.forEach(payment => {
    paymentsMap.set(payment.atleta_id, payment.status);
  });

  return inscricoes.map(inscricao => ({
    id: inscricao.usuarios.id,
    nome_completo: inscricao.usuarios.nome_completo || inscricao.usuarios.email,
    email: inscricao.usuarios.email,
    telefone: inscricao.usuarios.telefone,
    profiles: profilesMap.get(inscricao.usuario_id) || [],
    paymentStatus: paymentsMap.get(inscricao.usuario_id) || 'pendente'
  }));
};