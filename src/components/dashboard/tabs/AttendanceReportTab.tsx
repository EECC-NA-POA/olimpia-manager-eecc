import { useState } from 'react';
import { useOrganizerAttendanceReport, AthleteAttendanceRow, AthleteModalityStat } from '@/hooks/useOrganizerAttendanceReport';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertTriangle, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { LoadingImage } from '@/components/ui/loading-image';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ---------- helpers ---------- */

function taxaColor(taxa: number) {
  if (taxa >= 75) return 'text-green-700 bg-green-100 border-green-200';
  if (taxa >= 40) return 'text-amber-700 bg-amber-100 border-amber-200';
  return 'text-red-700 bg-red-100 border-red-200';
}

function rowBorder(taxa: number) {
  if (taxa >= 75) return 'border-l-green-400';
  if (taxa >= 40) return 'border-l-amber-400';
  return 'border-l-red-400';
}

function StatusDot({ status }: { status: string }) {
  const cls =
    status === 'presente'  ? 'bg-green-500' :
    status === 'atrasado'  ? 'bg-amber-400' :
    status === 'ausente'   ? 'bg-red-400'   : 'bg-gray-200';
  return <span className={cn('inline-block h-3 w-3 rounded-full flex-shrink-0', cls)} title={status} />;
}

/* ---------- sparkline de taxa acumulada por sessão ---------- */
function TrendChart({ stat }: { stat: AthleteModalityStat }) {
  if (stat.historico.length === 0) return null;

  let presAcc = 0;
  const data = stat.historico.map((h, i) => {
    if (h.status === 'presente' || h.status === 'atrasado') presAcc++;
    return {
      sessao: i + 1,
      label: format(new Date(h.data), 'dd/MM', { locale: ptBR }),
      taxa: Math.round((presAcc / (i + 1)) * 100),
    };
  });

  return (
    <div className="mt-3">
      <p className="text-xs text-muted-foreground mb-1 font-medium">Taxa acumulada de presença por sessão</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
          <Tooltip
            formatter={(v: number) => [`${v}%`, 'Taxa']}
            labelFormatter={l => `Sessão ${l}`}
          />
          <Line
            type="monotone"
            dataKey="taxa"
            stroke="#009B40"
            strokeWidth={2}
            dot={{ r: 3, fill: '#009B40' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- linha de atleta ---------- */
function AthleteRow({ atleta, modFiltro }: { atleta: AthleteAttendanceRow; modFiltro: string }) {
  const [open, setOpen] = useState(false);

  const mods = modFiltro === 'all'
    ? atleta.modalidades
    : atleta.modalidades.filter(m => m.modalidade_id === modFiltro);

  if (mods.length === 0) return null;

  // taxa da visão filtrada
  const totalSessoes = mods.reduce((s, m) => s + m.sessoes_elegiveis, 0);
  const taxa = totalSessoes > 0
    ? Math.round(mods.reduce((s, m) => s + m.taxa * m.sessoes_elegiveis, 0) / totalSessoes)
    : 0;

  if (totalSessoes === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className={cn(
          'flex items-center gap-3 px-4 py-3 border-l-4 border border-border/50 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors',
          rowBorder(taxa)
        )}>
          {/* Nome + ID */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{atleta.nome}</p>
            {atleta.numero_identificador && (
              <p className="text-xs text-muted-foreground font-mono"># {atleta.numero_identificador}</p>
            )}
          </div>

          {/* Stats rápidas */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
            <span className="text-green-600 font-medium">
              {mods.reduce((s, m) => s + m.presentes, 0)}P
            </span>
            <span className="text-amber-500 font-medium">
              {mods.reduce((s, m) => s + m.atrasados, 0)}A
            </span>
            <span className="text-red-500 font-medium">
              {mods.reduce((s, m) => s + m.ausentes, 0)}F
            </span>
            <span className="text-muted-foreground">/ {totalSessoes} sessões</span>
          </div>

          {/* Taxa % */}
          <Badge variant="outline" className={cn('text-xs font-bold flex-shrink-0', taxaColor(taxa))}>
            {taxa}%
          </Badge>

          {taxa < 50 && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />}

          <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', open && 'rotate-180')} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-4 mt-1 mb-3 space-y-4 border-l-2 border-border/40 pl-4">
          {mods.map(mod => (
            <div key={mod.modalidade_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{mod.modalidade_nome}</p>
                <Badge variant="outline" className={cn('text-xs font-bold', taxaColor(mod.taxa))}>
                  {mod.taxa}% — {mod.presentes + mod.atrasados}/{mod.sessoes_elegiveis} sessões
                </Badge>
              </div>

              {/* Bolinhas de histórico */}
              <div className="flex flex-wrap gap-1.5">
                {mod.historico.map((h, i) => (
                  <div key={h.chamada_id} className="flex flex-col items-center gap-0.5">
                    <StatusDot status={h.status} />
                    <span className="text-[9px] text-muted-foreground">
                      {format(new Date(h.data), 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Gráfico de tendência */}
              {mod.historico.length >= 3 && <TrendChart stat={mod} />}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ---------- componente principal ---------- */
export function AttendanceReportTab() {
  const { currentEventId } = useAuth();
  const { data, isLoading, error } = useOrganizerAttendanceReport(currentEventId);
  const [modFiltro, setModFiltro] = useState('all');
  const [ordemFiltro, setOrdemFiltro] = useState<'taxa_asc' | 'taxa_desc' | 'nome'>('taxa_asc');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingImage text="Calculando frequências..." size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 text-sm">
        Erro ao carregar relatório de chamadas.
      </div>
    );
  }

  if (!data || data.atletas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Nenhuma chamada registrada para este evento ainda.
      </div>
    );
  }

  // Filtrar + ordenar
  let atletas = [...data.atletas];

  // Filtrar só quem tem sessões na modalidade selecionada
  if (modFiltro !== 'all') {
    atletas = atletas.filter(a => a.modalidades.some(m => m.modalidade_id === modFiltro && m.sessoes_elegiveis > 0));
  } else {
    atletas = atletas.filter(a => a.modalidades.some(m => m.sessoes_elegiveis > 0));
  }

  if (ordemFiltro === 'taxa_desc') atletas.sort((a, b) => b.taxa_geral - a.taxa_geral);
  else if (ordemFiltro === 'nome') atletas.sort((a, b) => a.nome.localeCompare(b.nome));
  // taxa_asc: já vem ordenado do hook (piores primeiro)

  // Resumo
  const total = atletas.length;
  const emAlerta = atletas.filter(a => {
    const mods = modFiltro === 'all' ? a.modalidades : a.modalidades.filter(m => m.modalidade_id === modFiltro);
    const totalS = mods.reduce((s, m) => s + m.sessoes_elegiveis, 0);
    const taxa = totalS > 0 ? Math.round(mods.reduce((s, m) => s + m.taxa * m.sessoes_elegiveis, 0) / totalS) : 0;
    return taxa < 50 && totalS > 0;
  }).length;
  const mediaGeral = total > 0 ? Math.round(atletas.reduce((s, a) => s + a.taxa_geral, 0) / total) : 0;

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={modFiltro} onValueChange={setModFiltro}>
          <SelectTrigger className="w-52 text-sm">
            <SelectValue placeholder="Modalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as modalidades</SelectItem>
            {data.modalidades.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ordemFiltro} onValueChange={v => setOrdemFiltro(v as any)}>
          <SelectTrigger className="w-44 text-sm">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="taxa_asc">
              <span className="flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" />Menor frequência</span>
            </SelectItem>
            <SelectItem value="taxa_desc">
              <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Maior frequência</span>
            </SelectItem>
            <SelectItem value="nome">Nome (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Atletas</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className={cn('text-2xl font-bold', mediaGeral >= 75 ? 'text-green-600' : mediaGeral >= 40 ? 'text-amber-500' : 'text-red-500')}>
            {mediaGeral}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Média geral</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <AlertTriangle className={cn('h-4 w-4 mx-auto mb-1', emAlerta > 0 ? 'text-amber-500' : 'text-muted-foreground')} />
          <p className={cn('text-2xl font-bold', emAlerta > 0 ? 'text-amber-600' : 'text-foreground')}>
            {emAlerta}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Em alerta (&lt;50%)</p>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> Presente</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" /> Atrasado</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" /> Faltou</span>
        <span className="ml-auto">Clique numa linha para ver o histórico</span>
      </div>

      {/* Lista de atletas */}
      <div className="space-y-2">
        {atletas.map(a => (
          <AthleteRow key={a.atleta_id} atleta={a} modFiltro={modFiltro} />
        ))}
      </div>
    </div>
  );
}
