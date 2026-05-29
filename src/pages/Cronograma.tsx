import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Clock, Calendar, Globe, Trophy } from 'lucide-react';
import { LoadingImage } from '@/components/ui/loading-image';
import { useCronogramaData } from '@/components/cronograma/useCronogramaData';
import { getDayLabel } from '@/components/cronograma/utils';
import { ScheduleActivity } from '@/components/cronograma/types';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ── helpers ─────────────────────────────────────────────── */

const DAY_SHORT: Record<string, string> = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua',
  quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom',
};

function shortLabel(dayKey: string): string {
  if (DAY_SHORT[dayKey]) return DAY_SHORT[dayKey];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    try {
      const d = parseISO(dayKey);
      if (isValid(d)) return format(d, 'EEE', { locale: ptBR }).replace('.', '');
    } catch { /* noop */ }
  }
  return dayKey.slice(0, 3);
}

function dayNumber(dayKey: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    try {
      const d = parseISO(dayKey);
      if (isValid(d)) return format(d, 'dd');
    } catch { /* noop */ }
  }
  return null;
}

function isISOToday(dayKey: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    try {
      const d = parseISO(dayKey);
      return isValid(d) && isToday(d);
    } catch { /* noop */ }
  }
  return false;
}

function fmtTime(t?: string): string {
  if (!t) return '';
  return t.slice(0, 5);
}

function dedup(activities: ScheduleActivity[]): Record<string, ScheduleActivity[]> {
  const grouped: Record<string, ScheduleActivity[]> = {};
  activities.forEach(a => {
    const cat = a.atividade;
    if (!grouped[cat]) grouped[cat] = [];
    const isDuplicate = grouped[cat].some(
      e => e.cronograma_atividade_id === a.cronograma_atividade_id &&
           e.modalidade_nome === a.modalidade_nome
    );
    if (!isDuplicate) grouped[cat].push(a);
  });
  return grouped;
}

/* ── Activity card ───────────────────────────────────────── */

function ActivityCard({ category, items }: { category: string; items: ScheduleActivity[] }) {
  const isGlobal  = items.some(i => i.global);
  const modalities = [...new Set(items.map(i => i.modalidade_nome).filter(Boolean))];
  const location  = items[0]?.local;

  return (
    <div className={cn(
      'rounded-xl border px-4 py-3 transition-all duration-200',
      isGlobal
        ? 'bg-emerald-50 border-emerald-200'
        : modalities.length > 0
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-border',
    )}>
      {/* Title row */}
      <div className="flex items-start gap-2">
        <div className={cn(
          'mt-0.5 rounded-md p-1 flex-shrink-0',
          isGlobal ? 'bg-emerald-100' : modalities.length > 0 ? 'bg-blue-100' : 'bg-muted',
        )}>
          {isGlobal
            ? <Globe className="h-3 w-3 text-emerald-600" />
            : <Trophy className="h-3 w-3 text-blue-600" />}
        </div>
        <p className="text-sm font-semibold text-foreground leading-snug">{category}</p>
      </div>

      {/* Location */}
      {location && (
        <div className="flex items-center gap-1.5 mt-2 ml-7">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{location}</span>
        </div>
      )}

      {/* Modality badges */}
      {modalities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-7">
          {modalities.map(m => (
            <span
              key={m}
              className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Global badge */}
      {isGlobal && (
        <div className="mt-2 ml-7">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Todos os participantes
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Timeline for one day ────────────────────────────────── */

function DayTimeline({
  groupedActivities,
  dayKey,
  timeSlots,
}: {
  groupedActivities: Record<string, Record<string, ScheduleActivity[]>>;
  dayKey: string;
  timeSlots: string[];
}) {
  const dayData = groupedActivities[dayKey] ?? {};

  // Only time slots that have activities for this day
  const relevantSlots = timeSlots.filter(slot => (dayData[slot] ?? []).length > 0);

  if (relevantSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
        <Calendar className="h-10 w-10 text-muted-foreground/30 mb-1" />
        <p className="text-sm font-medium text-foreground">Sem atividades neste dia</p>
        <p className="text-xs text-muted-foreground">Nenhuma atividade programada para {getDayLabel(dayKey)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 relative">
      {/* Vertical line */}
      <div className="absolute left-[52px] top-4 bottom-4 w-px bg-border" />

      {relevantSlots.map((slot, idx) => {
        const [start, end] = slot.split('-');
        const activities = dayData[slot] ?? [];
        const grouped = dedup(activities);

        return (
          <div key={slot} className="flex gap-4 pb-6 last:pb-0">
            {/* Time node */}
            <div className="flex-shrink-0 flex flex-col items-center w-[52px] relative z-10">
              <div className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center flex-col text-center',
                idx === 0
                  ? 'bg-olimpics-green-primary border-olimpics-green-primary text-white'
                  : 'bg-background border-border text-foreground',
              )}>
                <span className="text-[10px] font-bold leading-none">{fmtTime(start)}</span>
              </div>
              {end && <span className="text-[9px] text-muted-foreground mt-1 leading-none">até {fmtTime(end)}</span>}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 min-w-0 pt-1">
              {Object.entries(grouped).map(([category, items]) => (
                <ActivityCard key={category} category={category} items={items} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Day selector tab ────────────────────────────────────── */

function DayTab({
  dayKey,
  active,
  onClick,
}: {
  dayKey: string;
  active: boolean;
  onClick: () => void;
}) {
  const today = isISOToday(dayKey);
  const num   = dayNumber(dayKey);
  const short = shortLabel(dayKey);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-xl px-4 py-2.5 min-w-[60px] transition-all duration-200 border',
        active
          ? 'bg-olimpics-green-primary border-olimpics-green-primary text-white shadow-sm'
          : today
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-card border-border text-muted-foreground hover:border-olimpics-green-primary/40 hover:text-foreground',
      )}
    >
      {num ? (
        <>
          <span className="text-[10px] font-semibold uppercase tracking-wide leading-none opacity-80">{short}</span>
          <span className="text-lg font-bold leading-none">{num}</span>
        </>
      ) : (
        <span className="text-xs font-semibold">{short}</span>
      )}
      {today && !active && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
      )}
    </button>
  );
}

/* ── Main page ───────────────────────────────────────────── */

export default function Cronograma() {
  const { isLoading, groupedActivities, dates, timeSlots } = useCronogramaData();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default to today if present, otherwise first date
  const defaultDay = useMemo(() => {
    const todayKey = dates.find(isISOToday);
    return todayKey ?? dates[0] ?? '';
  }, [dates]);

  const [activeDay, setActiveDay] = useState<string>('');

  useEffect(() => {
    if (!activeDay && defaultDay) setActiveDay(defaultDay);
  }, [defaultDay, activeDay]);

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
        <p className="text-sm font-medium text-foreground">Cronograma ainda não disponível</p>
        <p className="text-xs text-muted-foreground">As atividades do evento aparecerão aqui quando forem cadastradas.</p>
      </div>
    );
  }

  const currentDay = activeDay || dates[0];

  // Count activities per day for badge
  const countForDay = (d: string) =>
    Object.values(groupedActivities[d] ?? {}).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 space-y-5 pt-2 sm:pt-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-olimpics-green-primary/10 border border-olimpics-green-primary/20 p-2.5">
            <Calendar className="h-5 w-5 text-olimpics-green-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Cronograma do Evento</h1>
            <p className="text-xs text-muted-foreground">{dates.length} dia{dates.length !== 1 ? 's' : ''} com atividades</p>
          </div>
        </div>

        {/* Day selector */}
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
          {dates.map(d => (
            <div key={d} className="snap-start flex-shrink-0">
              <DayTab
                dayKey={d}
                active={d === currentDay}
                onClick={() => setActiveDay(d)}
              />
            </div>
          ))}
        </div>

        {/* Day header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">{getDayLabel(currentDay)}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {countForDay(currentDay)} atividade{countForDay(currentDay) !== 1 ? 's' : ''} programada{countForDay(currentDay) !== 1 ? 's' : ''}
            </p>
          </div>
          {isISOToday(currentDay) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hoje
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" />
            Atividade geral
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-300 inline-block" />
            Por modalidade
          </span>
        </div>

        {/* Timeline */}
        <DayTimeline
          groupedActivities={groupedActivities}
          dayKey={currentDay}
          timeSlots={timeSlots}
        />

      </div>
    </div>
  );
}
