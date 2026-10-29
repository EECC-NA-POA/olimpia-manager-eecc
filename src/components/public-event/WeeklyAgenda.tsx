import { MapPin } from 'lucide-react';
import {
  buildOficinaSchedule,
  formatTimeRange,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type PublicPageOficina,
} from '@/lib/publicPages';

interface AgendaItem {
  oficina: string;
  inicio: string | null;
  fim: string | null;
  local: string | null;
}

/** Calendário da semana: em cada dia, as oficinas recorrentes e seus horários. */
export function WeeklyAgenda({ oficinas }: { oficinas: PublicPageOficina[] }) {
  const byDay = new Map<number, AgendaItem[]>();
  oficinas.forEach((oficina) => {
    buildOficinaSchedule(oficina.horarios).weekly.forEach((slot) => {
      const items = byDay.get(slot.weekday) || [];
      items.push({ oficina: oficina.nome, inicio: slot.inicio, fim: slot.fim, local: slot.local });
      byDay.set(slot.weekday, items);
    });
  });

  const days = WEEKDAY_ORDER.filter((d) => byDay.has(d));
  if (days.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {days.map((day) => {
        const items = (byDay.get(day) || []).sort((a, b) => (a.inicio || '').localeCompare(b.inicio || ''));
        return (
          <div key={day} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-3 border-b border-olimpics-green-primary/15 pb-2 text-sm font-bold uppercase tracking-wide text-olimpics-green-primary">
              {WEEKDAY_LABELS[day]}
            </h3>
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-[5.75rem] flex-shrink-0 whitespace-nowrap pt-0.5 text-xs font-semibold tabular-nums text-olimpics-orange-primary">
                    {formatTimeRange(item.inicio, item.fim).replace(' às ', '–') || '—'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug text-gray-800">{item.oficina}</p>
                    {item.local && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" /> {item.local}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
