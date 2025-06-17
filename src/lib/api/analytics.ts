
import { supabase } from '@/lib/supabase';
import { BranchAnalytics } from '@/types/api';

export const fetchBranchAnalytics = async (eventId: string | null, filterByBranch: boolean = false): Promise<BranchAnalytics[]> => {
  if (!eventId) {
    console.log('No event ID provided for analytics');
    return [];
  }

  console.log('fetchBranchAnalytics called with:', { eventId, filterByBranch });

  try {
    // First get the user's filial_id if we're in delegation mode
    let userFilialId: string | undefined;
    
    if (filterByBranch) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from('usuarios')
          .select('filial_id')
          .eq('id', user.id)
          .single();
          
        userFilialId = userProfile?.filial_id;
        console.log('Filtering analytics by filial_id:', userFilialId);
        
        if (!userFilialId) {
          console.warn('User has no branch assigned, returning empty analytics');
          return [];
        }
      } else {
        console.warn('No authenticated user found for branch filtering, returning empty analytics');
        return [];
      }
    }

    // Check if the view exists first
    const { error: viewCheckError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_name', 'vw_analytics_filiais')
      .single();

    if (viewCheckError) {
      console.warn('View vw_analytics_filiais does not exist, using alternative approach');
      
      // Alternative approach: Build analytics from base tables including dependents
      // Get all filiais first
      let filiaisQuery = supabase
        .from('filiais')
        .select('id, nome');

      if (filterByBranch && userFilialId) {
        filiaisQuery = filiaisQuery.eq('id', userFilialId);
      }

      const { data: filiais, error: filiaisError } = await filiaisQuery;
      
      if (filiaisError) throw filiaisError;
      
      console.log('Building analytics for filiais:', filiais);

      // Build analytics for each filial including dependents
      const analyticsPromises = filiais?.map(async (filial) => {
        console.log(`Building analytics for filial: ${filial.nome} (${filial.id})`);
        
        // Get total registered users including dependents for this filial
        const { data: totalUsers, error: totalError } = await supabase
          .from('usuarios')
          .select('id, tipo_perfil')
          .eq('filial_id', filial.id)
          .in('tipo_perfil', ['atleta', 'dependente']); // Include both athletes and dependents

        if (totalError) {
          console.error('Error fetching total users for filial:', filial.id, totalError);
          return null;
        }

        console.log(`Total users (including dependents) in filial ${filial.nome}:`, totalUsers?.length || 0);
        console.log(`Breakdown:`, {
          atletas: totalUsers?.filter(u => u.tipo_perfil === 'atleta').length || 0,
          dependentes: totalUsers?.filter(u => u.tipo_perfil === 'dependente').length || 0
        });

        // Get registrations for this event including dependents with payment info
        const { data: registrations, error: regError } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            status,
            usuarios!inscricoes_modalidades_atleta_id_fkey(filial_id, tipo_perfil),
            pagamentos(status, valor)
          `)
          .eq('evento_id', eventId)
          .eq('usuarios.filial_id', filial.id);

        if (regError) {
          console.error('Error fetching registrations for filial:', filial.id, regError);
          return null;
        }

        console.log(`Registrations (including dependents) for filial ${filial.nome}:`, registrations?.length || 0);

        // Calculate status counts including dependents and their payment status
        const statusCounts = {
          confirmado: 0,
          pendente: 0,
          cancelado: 0
        };

        let totalPago = 0;
        let totalPendente = 0;

        registrations?.forEach(reg => {
          // Fix: Handle usuarios as an array of objects from the join
          const usuarios = reg.usuarios as { filial_id: string; tipo_perfil: string }[] | null;
          if (usuarios && Array.isArray(usuarios)) {
            usuarios.forEach(usuario => {
              if (['atleta', 'dependente'].includes(usuario.tipo_perfil)) {
                if (reg.status in statusCounts) {
                  statusCounts[reg.status as keyof typeof statusCounts]++;
                }

                // Calculate payment totals including dependents
                if (Array.isArray(reg.pagamentos)) {
                  reg.pagamentos.forEach((pagamento: any) => {
                    if (pagamento.status === 'confirmado') {
                      totalPago += Number(pagamento.valor) || 0;
                    } else if (pagamento.status === 'pendente') {
                      totalPendente += Number(pagamento.valor) || 0;
                    }
                  });
                }
              }
            });
          }
        });

        console.log(`Status counts for filial ${filial.nome}:`, statusCounts);
        console.log(`Payment totals for filial ${filial.nome}:`, { totalPago, totalPendente });

        const totalInscritosGeral = statusCounts.confirmado + statusCounts.pendente + statusCounts.cancelado;

        console.log(`Final counts for filial ${filial.nome}:`, {
          totalInscritosGeral,
          statusCounts,
          totalPago,
          totalPendente
        });

        return {
          filial_id: filial.id,
          filial: filial.nome,
          total_inscritos_geral: totalInscritosGeral,
          total_inscritos_modalidades: totalInscritosGeral, // Same as geral for this implementation
          total_inscritos_por_status: [
            { status_pagamento: 'confirmado', quantidade: statusCounts.confirmado },
            { status_pagamento: 'pendente', quantidade: statusCounts.pendente },
            { status_pagamento: 'cancelado', quantidade: statusCounts.cancelado }
          ],
          inscritos_por_status_pagamento: [
            { status_pagamento: 'confirmado', quantidade: statusCounts.confirmado },
            { status_pagamento: 'pendente', quantidade: statusCounts.pendente },
            { status_pagamento: 'cancelado', quantidade: statusCounts.cancelado }
          ],
          modalidades_populares: [], // Simplified for now
          valor_total_pago: totalPago,
          valor_total_pendente: totalPendente
        } as BranchAnalytics;
      }) || [];

      const results = await Promise.all(analyticsPromises);
      const validResults = results.filter((result): result is BranchAnalytics => result !== null);
      
      console.log('Built analytics data (including dependents):', validResults);
      console.log('Total from built analytics:', validResults.reduce((sum, r) => sum + r.total_inscritos_geral, 0));
      return validResults;
    }

    // If view exists, use it but ensure it includes dependents
    let query = supabase
      .from('vw_analytics_filiais')
      .select('*')
      .eq('evento_id', eventId);

    // For delegation representatives, only show their branch
    if (filterByBranch && userFilialId) {
      query = query.eq('filial_id', userFilialId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    console.log('Analytics data from view (should include dependents):', data);
    return data as BranchAnalytics[] || [];
  } catch (error) {
    console.error('Error fetching branch analytics:', error);
    return []; // Return empty array to prevent UI breakage
  }
};
