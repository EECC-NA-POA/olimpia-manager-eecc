
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Athlete {
  inscricao_id: number;
  atleta_id: string;
  atleta_nome: string;
  tipo_documento: string;
  numero_documento: string;
  numero_identificador?: string;
  filial_id?: number | null;
  filial_nome?: string | null;
  equipe_id?: number | null;
  equipe_nome?: string | null;
  origem_uf?: string | null;
  origem_cidade?: string | null;
}

export function useAthletes(modalityId: number | null, eventId: string | null) {
  const { data: athletes, isLoading: isLoadingAthletes, error } = useQuery({
    queryKey: ['athletes', modalityId, eventId],
    queryFn: async () => {
      console.log('=== INICIANDO BUSCA DE ATLETAS ===');
      console.log('Parâmetros recebidos:', { modalityId, eventId });
      
      if (!modalityId || !eventId) {
        console.log('Parâmetros obrigatórios ausentes:', { modalityId, eventId });
        throw new Error('ID da modalidade e do evento são obrigatórios para buscar atletas');
      }

      try {
        // Etapa 1: Verificar se a modalidade existe
        console.log('Etapa 1: Verificando existência da modalidade...');
        const { data: modalityCheck, error: modalityError } = await supabase
          .from('modalidades')
          .select('id, nome, categoria, tipo_pontuacao')
          .eq('id', modalityId)
          .single();
        
        console.log('Resultado da verificação da modalidade:', { modalityCheck, modalityError });
        
        if (modalityError) {
          console.error('Erro ao verificar modalidade:', modalityError);
          throw new Error(`Erro ao verificar modalidade: ${modalityError.message}`);
        }

        if (!modalityCheck) {
          console.error('Modalidade não encontrada');
          throw new Error('Modalidade não encontrada no sistema');
        }

        // Etapa 2: Buscar todas as inscrições para esta modalidade e evento
        console.log('Etapa 2: Buscando inscrições na modalidade...');
        const { data: allEnrollments, error: allEnrollmentsError } = await supabase
          .from('inscricoes_modalidades')
          .select('*')
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId);
        
        console.log('Resultado das inscrições:', { 
          total: allEnrollments?.length || 0, 
          data: allEnrollments?.slice(0, 3), // Mostrar apenas os primeiros 3 para debug
          error: allEnrollmentsError 
        });

        if (allEnrollmentsError) {
          console.error('Erro ao buscar inscrições:', allEnrollmentsError);
          throw new Error(`Erro ao buscar inscrições: ${allEnrollmentsError.message}`);
        }

        if (!allEnrollments || allEnrollments.length === 0) {
          console.log('Nenhuma inscrição encontrada para esta combinação modalidade/evento');
          return [];
        }

        // Etapa 3: Filtrar inscrições confirmadas
        const confirmedEnrollments = allEnrollments.filter(e => e.status === 'confirmado');
        console.log('Inscrições confirmadas após filtro:', {
          total: allEnrollments.length,
          confirmadas: confirmedEnrollments.length,
          status_encontrados: [...new Set(allEnrollments.map(e => e.status))]
        });

        if (confirmedEnrollments.length === 0) {
          console.log('Nenhuma inscrição confirmada encontrada');
          return [];
        }

        // Etapa 4: Obter IDs dos atletas
        const athleteIds = confirmedEnrollments.map(e => e.atleta_id);
        console.log('IDs dos atletas a buscar:', athleteIds);

        // Etapa 5: Buscar dados dos usuários/atletas
        console.log('Etapa 5: Buscando dados dos usuários...');
        const { data: usersData, error: usersError } = await supabase
          .from('usuarios')
          .select(`
            id,
            nome_completo,
            tipo_documento,
            numero_documento,
            filial_id
          `)
          .in('id', athleteIds);

        console.log('Resultado dos dados de usuários:', {
          total: usersData?.length || 0,
          athleteIds_buscados: athleteIds,
          usuarios_encontrados: usersData?.map(u => ({ id: u.id, nome: u.nome_completo })),
          error: usersError
        });

        if (usersError) {
          console.error('Erro ao buscar dados dos usuários:', usersError);
          throw new Error(`Erro ao buscar dados dos atletas: ${usersError.message}`);
        }

        if (!usersData || usersData.length === 0) {
          console.log('Nenhum dado de usuário encontrado para os IDs de atletas');
          throw new Error('Dados dos atletas não encontrados no sistema');
        }

        // Etapa 6: Buscar dados das filiais separadamente
        console.log('Etapa 6: Buscando dados das filiais...');
        const filialIds = usersData.map(u => u.filial_id).filter(Boolean);
        console.log('IDs das filiais a buscar:', filialIds);

        let filiaisData = [];
        if (filialIds.length > 0) {
          const { data: filiaisResult, error: filiaisError } = await supabase
            .from('filiais')
            .select('id, nome, estado')
            .in('id', filialIds);

          console.log('Resultado dos dados das filiais:', {
            total: filiaisResult?.length || 0,
            data: filiaisResult,
            error: filiaisError
          });

          if (filiaisError) {
            console.error('Erro ao buscar filiais:', filiaisError);
            // Não falhar por erro de filiais, apenas log
          } else {
            filiaisData = filiaisResult || [];
          }
        }

        // Etapa 7: Construir array de atletas
        console.log('Etapa 7: Construindo array de atletas...');
        const athletes = usersData.map((user: any) => {
          // Encontrar a inscrição correspondente
          const enrollment = confirmedEnrollments.find(e => e.atleta_id === user.id);
          if (!enrollment) {
            console.warn('Inscrição não encontrada para usuário:', user.id);
            return null;
          }

          // Encontrar dados da filial
          const filial = filiaisData.find(f => f.id === user.filial_id);
          
          const athlete: Athlete = {
            inscricao_id: enrollment.id,
            atleta_id: user.id,
            atleta_nome: user.nome_completo || 'Nome não informado',
            tipo_documento: user.tipo_documento || 'CPF',
            numero_documento: user.numero_documento || '',
            filial_id: user.filial_id,
            filial_nome: filial?.nome || null,
            equipe_id: null,
            equipe_nome: filial?.nome || null,
            origem_uf: filial?.estado || null,
            origem_cidade: filial?.nome || null,
          };

          return athlete;
        }).filter(Boolean) as Athlete[];

        console.log('=== RESULTADO FINAL ===');
        console.log('Total de atletas construídos:', athletes.length);
        console.log('Atletas:', athletes.map(a => ({ id: a.atleta_id, nome: a.atleta_nome })));
        console.log('=== FIM DA BUSCA DE ATLETAS ===');
        
        if (athletes.length === 0) {
          throw new Error('Nenhum atleta encontrado para esta modalidade neste evento');
        }
        
        return athletes;
      } catch (error) {
        console.error('=== ERRO NA BUSCA DE ATLETAS ===');
        console.error('Objeto de erro completo:', error);
        console.error('Mensagem do erro:', error.message);
        console.error('Stack do erro:', error.stack);
        
        // Re-throw com mensagem mais clara
        throw new Error(error.message || 'Erro desconhecido ao buscar atletas');
      }
    },
    enabled: !!modalityId && !!eventId,
    retry: (failureCount, error) => {
      console.log('Tentativa de retry:', failureCount, 'Erro:', error?.message);
      // Retry apenas para erros de rede, não para dados não encontrados
      if (error?.message?.includes('não encontrado') || error?.message?.includes('não existem')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  console.log('=== RESULTADO DO HOOK useAthletes ===');
  console.log('Resultado do hook:', { 
    atletasEncontrados: athletes?.length || 0, 
    carregando: isLoadingAthletes,
    erro: error?.message,
    modalityId,
    eventId
  });

  // Mostrar toast de erro mais amigável
  if (error) {
    console.error('Erro capturado no hook:', error);
    toast.error(`Erro ao carregar atletas: ${error.message}`);
  }

  return { 
    data: athletes, 
    isLoading: isLoadingAthletes, 
    error: error?.message || null 
  };
}
