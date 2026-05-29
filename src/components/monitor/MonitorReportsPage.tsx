import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import { CheckCircle2, Clock, XCircle, Calendar, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { LoadingImage } from '@/components/ui/loading-image';
import { useMonitorReports } from '@/hooks/useMonitorReports';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ── helpers ─────────────────────────────────────────────── */

function taxaColor(t: number) {
  if (t >= 75) return 'text-emerald-600';
  if (t >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function taxaBg(t: number) {
  if (t >= 75) return 'bg-emerald-500';
  if (t >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className={cn('rounded-xl border bg-card p-4 flex items-start gap-3', color)}>
      <div className="rounded-lg bg-background/70 p-2 flex-shrink-0">
        <Icon className="h-4 w-4 text-foreground/60" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function CustomLineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-semibold text-foreground mb-1">{payload[0]?.payload?.modalidade} — {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-semibold">{p.value}{p.name === 'Taxa' ? '%' : ''}</span></p>
      ))}
    </div>
  );
}

/* ── main ─────────────────────────────────────────────────── */

export default function MonitorReportsPage() {
  const { data, isLoading, error } = useMonitorReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingImage text="Carregando relatórios..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-1">
        <p className="text-sm text-destructive">Erro ao carregar relatórios</p>
        <p className="text-xs text-muted-foreground">Tente novamente mais tarde</p>
      </div>
    );
  }

  const hasData = data.totalSessions > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
        <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-foreground">Nenhuma chamada realizada ainda</p>
        <p className="text-xs text-muted-foreground">
          Crie sua primeira chamada na aba Chamadas para os relatórios aparecerem aqui.
        </p>
      </div>
    );
  }

  const lastDate = data.lastSession
    ? format(new Date(data.lastSession), "dd 'de' MMMM yyyy", { locale: ptBR })
    : '—';

  // Build cumulative attendance rate for trend line
  let cumPresAtr = 0, cumTotal = 0;
  const trendData = data.sessionTimeline.map((s, i) => {
    cumPresAtr += s.presentes + s.atrasados;
    cumTotal   += s.total;
    return {
      ...s,
      sessao: i + 1,
      taxa_acumulada: cumTotal > 0 ? Math.round((cumPresAtr / cumTotal) * 100) : 0,
    };
  });

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={Calendar}     label="Chamadas"        value={data.totalSessions}   sub="sessões realizadas"      color="" />
        <KpiCard icon={TrendingUp}   label="Taxa geral"      value={`${data.taxaGeral}%`} sub="presença + atraso"       color={data.taxaGeral >= 75 ? 'border-emerald-200' : data.taxaGeral >= 50 ? 'border-amber-200' : 'border-red-200'} />
        <KpiCard icon={CheckCircle2} label="Presenças"       value={data.totalPresentes}  sub={`+ ${data.totalAtrasados} atrasados`} color="border-emerald-200" />
        <KpiCard icon={XCircle}      label="Faltas"          value={data.totalAusentes}   sub="ausências registradas"   color={data.totalAusentes > 0 ? 'border-red-200' : ''} />
      </div>

      {/* Status breakdown (stacked bar) */}
      <Section title="Distribuição de Presenças">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {data.totalEligible > 0 && <>
            <div className="h-full bg-emerald-500" style={{ width: `${(data.totalPresentes / data.totalEligible) * 100}%` }} />
            <div className="h-full bg-amber-400"   style={{ width: `${(data.totalAtrasados / data.totalEligible) * 100}%` }} />
            <div className="h-full bg-red-400"     style={{ width: `${(data.totalAusentes  / data.totalEligible) * 100}%` }} />
          </>}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Presente ({data.totalPresentes})</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400  inline-block" /> Atrasado ({data.totalAtrasados})</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400    inline-block" /> Faltou ({data.totalAusentes})</span>
        </div>
      </Section>

      {/* Trend line — only if 2+ sessions */}
      {data.sessionTimeline.length >= 2 && (
        <Section title="Tendência de frequência (taxa acumulada)">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone" dataKey="taxa_acumulada" name="Taxa"
                stroke="#009B40" strokeWidth={2} dot={{ r: 3, fill: '#009B40' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-muted-foreground">
            Cada ponto é uma sessão. A linha mostra a taxa acumulada de presença (presente + atrasado) até aquela sessão.
          </p>
        </Section>
      )}

      {/* Per-session bars — only if 2+ sessions */}
      {data.sessionTimeline.length >= 2 && (
        <Section title="Presenças por sessão">
          <ResponsiveContainer width="100%" height={Math.max(160, data.sessionTimeline.length * 28)}>
            <BarChart
              data={data.sessionTimeline}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="date" tick={{ fontSize: 10 }} width={36} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v, name) => [v, name]}
                labelFormatter={l => `Sessão de ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="presentes" name="Presentes" stackId="a" fill="#10b981" barSize={14} />
              <Bar dataKey="atrasados" name="Atrasados" stackId="a" fill="#f59e0b" barSize={14} />
              <Bar dataKey="ausentes"  name="Ausentes"  stackId="a" fill="#f87171" barSize={14} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* Per-modality */}
      {data.modalityStats.length > 0 && (
        <Section title="Frequência por modalidade">
          <div className="space-y-3">
            {data.modalityStats.map(ms => (
              <div key={ms.modalidade_nome} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{ms.modalidade_nome}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{ms.total_sessions} sessão{ms.total_sessions !== 1 ? 'ões' : ''}</span>
                    <span className={cn('font-bold', taxaColor(ms.taxa))}>{ms.taxa}%</span>
                  </div>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-emerald-500" style={{ width: `${ms.total_eligible > 0 ? (ms.presentes  / ms.total_eligible) * 100 : 0}%` }} />
                  <div className="h-full bg-amber-400"   style={{ width: `${ms.total_eligible > 0 ? (ms.atrasados  / ms.total_eligible) * 100 : 0}%` }} />
                  <div className="h-full bg-red-400"     style={{ width: `${ms.total_eligible > 0 ? (ms.ausentes   / ms.total_eligible) * 100 : 0}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {ms.presentes}P · {ms.atrasados}A · {ms.ausentes}F de {ms.total_eligible} registros
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Athletes in alert */}
      {data.athleteAlerts.length > 0 && (
        <Section title="Atletas em alerta (frequência < 60%)">
          <div className="space-y-2">
            {data.athleteAlerts.map(a => (
              <div key={a.atleta_id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{a.presentes}P · {a.atrasados}A · {a.ausentes}F</p>
                </div>
                <span className={cn('text-sm font-bold flex-shrink-0', taxaColor(a.taxa))}>{a.taxa}%</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Atletas com menos de 60% de presença (presente + atrasado). Apenas sessões onde o atleta foi registrado são contadas.</p>
        </Section>
      )}

      {/* Footer info */}
      <p className="text-[11px] text-muted-foreground px-1 text-right">
        Última sessão: {lastDate}
      </p>
    </div>
  );
}
