import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SessionDot {
  chamada_id: string;
  data: string;
  status: 'presente' | 'ausente' | 'atrasado' | 'nao_inscrito';
}

export interface AthleteModalityStat {
  modalidade_id: string;
  modalidade_nome: string;
  sessoes_elegiveis: number;  // chamadas após inscrição
  presentes: number;
  atrasados: number;
  ausentes: number;
  taxa: number;               // (presentes + atrasados) / elegiveis * 100
  historico: SessionDot[];    // uma bolinha por chamada elegível
}

export interface AthleteAttendanceRow {
  atleta_id: string;
  nome: string;
  numero_identificador: string | null;
  modalidades: AthleteModalityStat[];
  taxa_geral: number;         // média ponderada de todas as modalidades
}

export interface AttendanceReportData {
  modalidades: { id: string; nome: string }[];
  atletas: AthleteAttendanceRow[];
}

export function useOrganizerAttendanceReport(eventId: string | null) {
  return useQuery({
    queryKey: ['organizer-attendance-report', eventId],
    queryFn: async (): Promise<AttendanceReportData> => {
      if (!eventId) throw new Error('No event selected');

      // 1. Modalidades do evento
      const { data: mods, error: modsErr } = await supabase
        .from('modalidades')
        .select('id, nome')
        .eq('evento_id', eventId)
        .order('nome');
      if (modsErr) throw modsErr;
      if (!mods || mods.length === 0) return { modalidades: [], atletas: [] };

      const modIds = mods.map(m => m.id);

      // 2a. Representantes das modalidades do evento
      const { data: reps, error: repsErr } = await supabase
        .from('modalidade_representantes')
        .select('id, modalidade_id')
        .in('modalidade_id', modIds);
      if (repsErr) throw repsErr;
      if (!reps?.length) return { modalidades: mods, atletas: [] };

      const repIds = reps.map(r => r.id);
      // rep_id → modalidade_id
      const repModMap = new Map<string, any>(reps.map(r => [r.id as string, r.modalidade_id]));

      // 2b. Chamadas para essas reps (sem join — evita filtro em tabela relacionada)
      const { data: chamadas, error: chamErr } = await supabase
        .from('chamadas')
        .select('id, data_hora_inicio, modalidade_rep_id')
        .in('modalidade_rep_id', repIds)
        .order('data_hora_inicio', { ascending: true });
      if (chamErr) throw chamErr;

      if (!chamadas?.length) return { modalidades: mods, atletas: [] };

      const chamadaIds = chamadas.map(c => c.id);

      // 3. Presenças de todas as chamadas
      const { data: presencas, error: presErr } = await supabase
        .from('chamada_presencas')
        .select('chamada_id, atleta_id, status')
        .in('chamada_id', chamadaIds);
      if (presErr) throw presErr;

      // 4. Inscrições confirmadas nas modalidades do evento
      const { data: inscricoes, error: inscErr } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          modalidade_id,
          data_inscricao,
          usuarios!inner (
            id,
            nome_completo,
            numero_documento
          )
        `)
        .in('modalidade_id', modIds)
        .eq('evento_id', eventId)
        .eq('status', 'confirmado');
      if (inscErr) throw inscErr;
      if (!inscricoes || inscricoes.length === 0) {
        return { modalidades: mods, atletas: [] };
      }

      // --- Montar mapa de dados ---

      // chamada_id → modalidade_id (via rep)
      const chamadaModMap = new Map<string, any>();
      chamadas.forEach(c => {
        const modId = repModMap.get(c.modalidade_rep_id);
        if (modId !== undefined) chamadaModMap.set(c.id, modId);
      });

      // chamada_id → { atleta_id → status }
      const presencaMap = new Map<string, Map<string, string>>();
      (presencas || []).forEach(p => {
        if (!presencaMap.has(p.chamada_id)) presencaMap.set(p.chamada_id, new Map());
        presencaMap.get(p.chamada_id)!.set(p.atleta_id, p.status);
      });

      // modalidade_id → chamadas ordenadas
      const modChamadas = new Map<any, typeof chamadas>();
      chamadas.forEach(c => {
        const modId = chamadaModMap.get(c.id);
        if (modId === undefined) return;
        if (!modChamadas.has(modId)) modChamadas.set(modId, []);
        modChamadas.get(modId)!.push(c);
      });

      // atleta_id → lista de inscrições
      const atletaInscMap = new Map<string, { modalidade_id: string; data_inscricao: string; nome: string; numero: string | null }[]>();
      inscricoes.forEach(i => {
        const u = i.usuarios as any;
        const nome = u?.nome_completo || 'Sem nome';
        const numero = u?.numero_documento || null;
        if (!atletaInscMap.has(i.atleta_id)) atletaInscMap.set(i.atleta_id, []);
        atletaInscMap.get(i.atleta_id)!.push({
          modalidade_id: i.modalidade_id,
          data_inscricao: (i as any).data_inscricao,
          nome,
          numero
        });
      });

      // --- Calcular stats por atleta ---
      const atletas: AthleteAttendanceRow[] = [];

      atletaInscMap.forEach((inscList, atletaId) => {
        const nome = inscList[0].nome;
        const numero = inscList[0].numero;

        const modalidadesStats: AthleteModalityStat[] = inscList.map(insc => {
          const mod = mods.find(m => m.id === insc.modalidade_id);
          if (!mod) return null;

          const enrolledAt = new Date(insc.data_inscricao).getTime();
          const chamsMod = modChamadas.get(insc.modalidade_id) || [];

          // Só chamadas ocorridas APÓS a inscrição do atleta
          const elegiveis = chamsMod.filter(
            c => new Date(c.data_hora_inicio).getTime() >= enrolledAt
          );

          let presentes = 0, atrasados = 0, ausentes = 0;
          const historico: SessionDot[] = elegiveis.map(c => {
            const statusMap = presencaMap.get(c.id);
            const status = (statusMap?.get(atletaId) as SessionDot['status']) || 'ausente';
            if (status === 'presente') presentes++;
            else if (status === 'atrasado') atrasados++;
            else ausentes++;
            return { chamada_id: c.id, data: c.data_hora_inicio, status };
          });

          const total = elegiveis.length;
          const taxa = total > 0 ? Math.round(((presentes + atrasados) / total) * 100) : 0;

          return {
            modalidade_id: mod.id,
            modalidade_nome: mod.nome,
            sessoes_elegiveis: total,
            presentes,
            atrasados,
            ausentes,
            taxa,
            historico,
          };
        }).filter(Boolean) as AthleteModalityStat[];

        // Taxa geral (média ponderada pelo número de sessões elegíveis)
        const totalSessoes = modalidadesStats.reduce((s, m) => s + m.sessoes_elegiveis, 0);
        const taxaGeral = totalSessoes > 0
          ? Math.round(
              modalidadesStats.reduce((s, m) => s + m.taxa * m.sessoes_elegiveis, 0) / totalSessoes
            )
          : 0;

        atletas.push({ atleta_id: atletaId, nome, numero_identificador: numero, modalidades: modalidadesStats, taxa_geral: taxaGeral });
      });

      // Ordenar por taxa geral (piores primeiro para chamar atenção)
      atletas.sort((a, b) => a.taxa_geral - b.taxa_geral);

      return { modalidades: mods, atletas };
    },
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
  });
}
