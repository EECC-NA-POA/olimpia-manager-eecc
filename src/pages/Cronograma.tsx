import React, { useMemo } from 'react';
import { MapPin, Clock, Calendar, Globe, Trophy } from 'lucide-react';
import { LoadingImage } from '@/components/ui/loading-image';
import { useCronogramaData } from '@/components/cronograma/useCronogramaData';
import { getDayLabel } from '@/components/cronograma/utils';
import { ScheduleActivity } from '@/components/cronograma/types';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ── Color palette ───────────────────────────────────────────
   12 distinct colors assigned per modality (deterministic).
   Index 0 reserved for "global" (emerald).
─────────────────────────────────────────────────────────── */
const PALETTE = [
  { bg: 'bg-sky-100',    border: 'border-sky-300',    text: 'text-sky-800',    dot: 'bg-sky-500'    },
  { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-800', dot: 'bg-violet-500' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', dot: 'bg-orange-500' },
  { bg: 'bg-pink-100',   border: 'border-pink-300',   text: 'text-pink-800',   dot: 'bg-pink-500'   },
  { bg: 'bg-teal-100',   border: 'border-teal-300',   text: 'text-teal-800',   dot: 'bg-teal-500'   },
  { bg: 'bg-amber-100',  border: 'border-amber-300',  text: 'text-amber-800',  dot: 'bg-amber-500'  },
  { bg: 'bg-red-100',    border: 'border-red-300',    text: 'text-red-800',    dot: 'bg-red-500'    },
  { bg: 'bg-cyan-100',   border: 'border-cyan-300',   text: 'text-cyan-800',   dot: 'bg-cyan-500'   },
  { bg: 'bg-lime-100',   border: 'border-lime-300',   text: 'text-lime-800',   dot: 'bg-lime-500'   },
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  { bg: 'bg-rose-100',   border: 'border-rose-300',   text: 'text-rose-800',   dot: 'bg-rose-500'   },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', dot: 'bg-yellow-500' },
];

const GLOBAL_COLOR = { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' };

/* ── Helpers ────────────────────────────────────────────────── */

function fmtTime(t?: string | null): string {
  if (!t) return '';
  return t.slice(0, 5);
}

function dayLabel(dayKey: string): { short: string; num: string | null; full: string; today: boolean } {
  const today = isISODateToday(dayKey);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    try {
      const d = parseISO(dayKey);
      if (isValid(d)) {
        return {
          short: format(d, 'EEE', { locale: ptBR }).replace('.', ''),
          num: format(d, 'dd'),
          full: format(d, "EEEE, dd 'de' MMMM", { locale: ptBR }),
          today,
        };
      }
    } catch { /* noop */ }
  }
  const MAP: Record<string, string> = {
    segunda: 'Seg', terca: 'Ter', quarta: 'Qua',
    quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom',
  };
  return { short: MAP[dayKey] ?? dayKey.slice(0, 3), num: null, full: getDayLabel(dayKey), today };
}

function isISODateToday(dayKey: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    try { const d = parseISO(dayKey); return isValid(d) && isToday(d); } catch { /* noop */ }
  }
  return false;
}

/* Build modality→color map from all unique modality names */
function buildColorMap(activities: ScheduleActivity[]): Map<string, typeof PALETTE[0]> {
  const names = [...new Set(activities.map(a => a.modalidade_nome).filter(Boolean) as string[])].sort();
  const map = new Map<string, typeof PALETTE[0]>();
  names.forEach((name, i) => map.set(name, PALETTE[i % PALETTE.length]));
  return map;
}

/* Deduplicate activities in a slot by (id, modalidade_nome) */
function dedup(activities: ScheduleActivity[]): ScheduleActivity[] {
  const seen = new Set<string>();
  return activities.filter(a => {
    const key = `${a.cronograma_atividade_id}-${a.modalidade_nome ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ── Activity card ─────────────────────────────────────────── */

function ActivityCard({
  activity,
  colorMap,
}: {
  activity: ScheduleActivity;
  colorMap: Map<string, typeof PALETTE[0]>;
}) {
  const color = activity.global
    ? GLOBAL_COLOR
    : activity.modalidade_nome
      ? (colorMap.get(activity.modalidade_nome) ?? PALETTE[0])
      : { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' };

  return (
    <div className={cn(
      'rounded-lg border px-3 py-2 transition-all',
      color.bg, color.border,
    )}>
      {/* Dot + name */}
      <div className="flex items-start gap-2">
        <span className={cn('mt-1.5 h-2 w-2 rounded-full flex-shrink-0', color.dot)} />
        <p className={cn('text-xs font-semibold leading-snug', color.text)}>{activity.atividade}</p>
      </div>

      {activity.local && (
        <div className="flex items-center gap-1 mt-1.5 pl-4">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-[11px] text-muted-foreground leading-tight">{activity.local}</span>
        </div>
      )}
      {activity.horario_inicio && (
        <div className="flex items-center gap-1 mt-1 pl-4">
          <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-[11px] text-muted-foreground">
            {fmtTime(activity.horario_inicio)}
            {activity.horario_fim ? ` – ${fmtTime(activity.horario_fim)}` : ''}
          </span>
        </div>
      )}
      {activity.modalidade_nome && (
        <div className="mt-1.5 pl-4">
          <span className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border',
            color.bg, color.border, color.text,
          )}>
            {activity.modalidade_nome}
          </span>
        </div>
      )}
      {activity.global && (
        <div className="mt-1.5 pl-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            <Globe className="h-2.5 w-2.5" /> Todos
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Week Grid (desktop) ───────────────────────────────────── */

function WeekGrid({
  dates,
  timeSlots,
  groupedActivities,
  colorMap,
}: {
  dates: string[];
  timeSlots: string[];
  groupedActivities: Record<string, Record<string, ScheduleActivity[]>>;
  colorMap: Map<string, typeof PALETTE[0]>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr>
            {/* Time column header */}
            <th className="w-20 sticky left-0 z-20 bg-muted/60 backdrop-blur border-b border-r border-border p-3 text-left">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horário</span>
            </th>
            {dates.map(d => {
              const { short, num, today } = dayLabel(d);
              return (
                <th
                  key={d}
                  className={cn(
                    'border-b border-r last:border-r-0 border-border p-3 text-center min-w-[140px]',
                    today ? 'bg-olimpics-green-primary/10' : 'bg-muted/30',
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{short}</span>
                    {num && (
                      <span className={cn(
                        'text-lg font-bold leading-none',
                        today ? 'text-olimpics-green-primary' : 'text-foreground',
                      )}>{num}</span>
                    )}
                    {today && (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-olimpics-green-primary" />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, slotIdx) => {
            const [start, end] = slot.split('-');
            return (
              <tr key={slot} className={slotIdx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                {/* Time cell */}
                <td className="sticky left-0 z-10 bg-inherit border-r border-b border-border px-3 py-3 align-top w-20">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs font-bold text-foreground tabular-nums">{fmtTime(start)}</span>
                    {end && <span className="text-[10px] text-muted-foreground tabular-nums">{fmtTime(end)}</span>}
                  </div>
                </td>
                {dates.map(d => {
                  const { today } = dayLabel(d);
                  const activities = dedup(groupedActivities[d]?.[slot] ?? []);
                  return (
                    <td
                      key={d}
                      className={cn(
                        'border-r last:border-r-0 border-b border-border px-2 py-2 align-top min-w-[140px]',
                        today && 'bg-olimpics-green-primary/5',
                      )}
                    >
                      {activities.length > 0 ? (
                        <div className="space-y-1.5">
                          {activities.map((act, i) => (
                            <ActivityCard key={i} activity={act} colorMap={colorMap} />
                          ))}
                        </div>
                      ) : (
                        <div className="h-full min-h-[40px]" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Day section (mobile) ──────────────────────────────────── */

function MobileDaySection({
  dayKey,
  slots,
  groupedActivities,
  colorMap,
}: {
  dayKey: string;
  slots: string[];
  groupedActivities: Record<string, Record<string, ScheduleActivity[]>>;
  colorMap: Map<string, typeof PALETTE[0]>;
}) {
  const { full, today } = dayLabel(dayKey);
  const relevantSlots = slots.filter(s => (groupedActivities[dayKey]?.[s] ?? []).length > 0);
  if (relevantSlots.length === 0) return null;

  return (
    <section>
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl mb-3',
        today
          ? 'bg-olimpics-green-primary text-white'
          : 'bg-muted/50 border border-border',
      )}>
        <Calendar className={cn('h-4 w-4 flex-shrink-0', today ? 'text-white' : 'text-muted-foreground')} />
        <span className={cn('text-sm font-semibold capitalize', today ? 'text-white' : 'text-foreground')}>
          {full}
        </span>
        {today && (
          <span className="ml-auto text-xs font-medium bg-white/20 rounded-full px-2 py-0.5">Hoje</span>
        )}
      </div>

      <div className="space-y-0 relative pl-2">
        {/* Vertical line */}
        <div className="absolute left-[54px] top-2 bottom-2 w-px bg-border" />

        {relevantSlots.map((slot, idx) => {
          const [start, end] = slot.split('-');
          const activities = dedup(groupedActivities[dayKey]?.[slot] ?? []);
          return (
            <div key={slot} className="flex gap-3 pb-5 last:pb-0">
              {/* Time bubble */}
              <div className="flex-shrink-0 w-[52px] flex flex-col items-center relative z-10">
                <div className={cn(
                  'w-[42px] rounded-full border-2 py-1.5 flex flex-col items-center text-center',
                  idx === 0
                    ? 'bg-olimpics-green-primary border-olimpics-green-primary text-white'
                    : 'bg-background border-border text-foreground',
                )}>
                  <span className="text-[10px] font-bold leading-none tabular-nums">{fmtTime(start)}</span>
                  {end && <span className="text-[9px] leading-none mt-0.5 opacity-70 tabular-nums">{fmtTime(end)}</span>}
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 min-w-0 pt-1">
                {activities.map((act, i) => (
                  <ActivityCard key={i} activity={act} colorMap={colorMap} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Legend ─────────────────────────────────────────────────── */

function Legend({ colorMap, hasGlobal }: { colorMap: Map<string, typeof PALETTE[0]>; hasGlobal: boolean }) {
  if (colorMap.size === 0 && !hasGlobal) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {hasGlobal && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Atividade geral
        </span>
      )}
      {[...colorMap.entries()].map(([name, color]) => (
        <span
          key={name}
          className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium', color.bg, color.border, color.text)}
        >
          <span className={cn('h-2 w-2 rounded-full', color.dot)} />
          {name}
        </span>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */

export default function Cronograma() {
  const { isLoading, activities, groupedActivities, dates, timeSlots } = useCronogramaData();

  const colorMap = useMemo(() => buildColorMap(activities ?? []), [activities]);
  const hasGlobal = useMemo(() => (activities ?? []).some(a => a.global), [activities]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingImage />
      </div>
    );
  }

  if (!dates.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-2 px-4">
        <Calendar className="h-12 w-12 text-muted-foreground/30 mb-2" />
        <p className="text-base font-semibold text-foreground">Cronograma ainda não disponível</p>
        <p className="text-sm text-muted-foreground">As atividades do evento aparecerão aqui quando forem cadastradas.</p>
      </div>
    );
  }

  const totalActivities = (activities ?? []).length;

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-6 pt-2 sm:pt-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-olimpics-green-primary/10 border border-olimpics-green-primary/20 p-2.5">
              <Calendar className="h-5 w-5 text-olimpics-green-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">Cronograma Completo</h1>
              <p className="text-xs text-muted-foreground">
                {dates.length} dia{dates.length !== 1 ? 's' : ''} · {totalActivities} atividade{totalActivities !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {/* Legend chips */}
          <div className="hidden sm:block">
            <Legend colorMap={colorMap} hasGlobal={hasGlobal} />
          </div>
        </div>

        {/* Legend for mobile */}
        <div className="sm:hidden">
          <Legend colorMap={colorMap} hasGlobal={hasGlobal} />
        </div>

        {/* Desktop: full week grid */}
        <div className="hidden md:block">
          <WeekGrid
            dates={dates}
            timeSlots={timeSlots}
            groupedActivities={groupedActivities}
            colorMap={colorMap}
          />
        </div>

        {/* Mobile: day sections */}
        <div className="md:hidden space-y-6">
          {dates.map(d => (
            <MobileDaySection
              key={d}
              dayKey={d}
              slots={timeSlots}
              groupedActivities={groupedActivities}
              colorMap={colorMap}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
