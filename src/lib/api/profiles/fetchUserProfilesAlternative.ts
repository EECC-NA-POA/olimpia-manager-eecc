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
}

export const fetchUserProfilesAlternative = async (eventId: string | null): Promise<UserProfileDataAlternative[]> => {
  if (!eventId) {
    console.log('No eventId provided');
    return [];
  }

  console.log('=== NOVA ABORDAGEM: Fetching user profiles for event:', eventId);

  try {
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

    // Estratégia 2: Buscar diretamente com join (mais simples)
    console.log('Tentando busca direta simplificada...');
    
    const { data: directUsers, error: directError } = await supabase
      .from('usuarios')
      .select(`
        id,
        email,
        user_metadata,
        inscricoes_eventos!inner(evento_id),
        papeis_usuarios(
          perfil_id,
          perfis(id, nome)
        )
      `)
      .eq('inscricoes_eventos.evento_id', eventId);

    if (directError) {
      console.error('❌ Erro na busca direta:', directError);
    } else if (directUsers && directUsers.length > 0) {
      console.log('✅ Busca direta funcionou! Usuários encontrados:', directUsers.length);
      return formatServiceUsers(directUsers);
    } else {
      console.log('⚠️ Busca direta retornou array vazio');
    }

    console.error('❌ Todas as estratégias falharam ou retornaram vazio');
    return [];

  } catch (error) {
    console.error('❌ Erro geral ao buscar usuários:', error);
    return [];
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