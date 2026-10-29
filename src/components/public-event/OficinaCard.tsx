import { CalendarDays, Clock, MapPin, MessageCircle, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  buildOficinaSchedule,
  formatTimeRange,
  toWhatsAppNumber,
  WEEKDAY_LABELS,
  type PublicPageOficina,
} from '@/lib/publicPages';
import { CtaLink } from './CtaLink';

const MAX_DATED_SLOTS = 4;

// "Sábado, 21 de novembro"
const formatDate = (date: string) => {
  const text = format(new Date(`${date}T00:00:00`), "EEEE, dd 'de' MMMM", { locale: ptBR });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

interface OficinaCardProps {
  oficina: PublicPageOficina;
  eventName: string;
  enrollHref: string;
}

export function OficinaCard({ oficina, eventName, enrollHref }: OficinaCardProps) {
  const { weekly, dated } = buildOficinaSchedule(oficina.horarios);
  const visibleDated = dated.slice(0, MAX_DATED_SLOTS);
  const isSoldOut = oficina.status === 'Esgotada';
  const tags = [oficina.categoria, oficina.faixa_etaria].filter(Boolean) as string[];

  return (
    <article className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden transition-shadow hover:shadow-lg">
      <div className="h-1.5 bg-gradient-to-r from-olimpics-green-primary to-olimpics-orange-primary" />

      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <header className="space-y-2">
          <h3 className="text-xl font-bold text-olimpics-text leading-tight">{oficina.nome}</h3>
          {(tags.length > 0 || isSoldOut) && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-medium capitalize">
                  {tag}
                </Badge>
              ))}
              {isSoldOut && (
                <Badge className="bg-olimpics-orange-primary/15 text-olimpics-orange-primary hover:bg-olimpics-orange-primary/15">
                  Vagas esgotadas
                </Badge>
              )}
            </div>
          )}
        </header>

        <section aria-label="Horários" className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <CalendarDays className="h-3.5 w-3.5" /> Quando acontece
          </h4>
          {weekly.length === 0 && dated.length === 0 ? (
            <p className="text-sm text-gray-500">Horários a definir.</p>
          ) : (
            <ul className="space-y-1.5">
              {weekly.map((slot, i) => (
                <li key={`w-${i}`} className="rounded-lg bg-olimpics-green-primary/5 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="font-semibold text-olimpics-green-primary">{WEEKDAY_LABELS[slot.weekday]}</span>
                    {slot.inicio && (
                      <span className="flex items-center gap-1 text-gray-700">
                        <Clock className="h-3.5 w-3.5" /> {formatTimeRange(slot.inicio, slot.fim)}
                      </span>
                    )}
                  </div>
                  {slot.local && (
                    <p className="mt-0.5 flex items-center gap-1 text-gray-500">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> {slot.local}
                    </p>
                  )}
                </li>
              ))}
              {visibleDated.map((slot, i) => (
                <li key={`d-${i}`} className="rounded-lg bg-olimpics-orange-primary/5 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="font-semibold text-olimpics-orange-primary">{formatDate(slot.date)}</span>
                    {slot.inicio && (
                      <span className="flex items-center gap-1 text-gray-700">
                        <Clock className="h-3.5 w-3.5" /> {formatTimeRange(slot.inicio, slot.fim)}
                      </span>
                    )}
                  </div>
                  {slot.local && (
                    <p className="mt-0.5 flex items-center gap-1 text-gray-500">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> {slot.local}
                    </p>
                  )}
                </li>
              ))}
              {dated.length > MAX_DATED_SLOTS && (
                <li className="text-xs text-gray-500 px-1">
                  e mais {dated.length - MAX_DATED_SLOTS} {dated.length - MAX_DATED_SLOTS === 1 ? 'data' : 'datas'}
                </li>
              )}
            </ul>
          )}
        </section>

        <section aria-label="Filósofos monitores" className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {oficina.monitores.length > 1 ? 'Filósofos monitores' : 'Filósofo monitor'}
          </h4>
          {oficina.monitores.length === 0 ? (
            <p className="text-sm text-gray-500">A definir.</p>
          ) : (
            <ul className="space-y-2">
              {oficina.monitores.map((monitor) => {
                const whatsapp = toWhatsAppNumber(monitor.telefone);
                const firstName = monitor.nome.split(' ')[0];
                const message = `Olá, ${firstName}! Vi a oficina de ${oficina.nome} na página de divulgação de ${eventName} e gostaria de saber mais.`;
                return (
                  <li key={monitor.nome} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-olimpics-green-primary/10 text-sm font-bold text-olimpics-green-primary">
                        {firstName.charAt(0).toUpperCase()}
                      </span>
                      <span className="break-words text-sm font-medium leading-snug text-gray-800">{monitor.nome}</span>
                    </div>
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Falar com ${monitor.nome} pelo WhatsApp`}
                        className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1ebe5b]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-auto pt-1">
          <CtaLink
            href={enrollHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-olimpics-green-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-olimpics-green-primary/90"
          >
            <UserPlus className="h-4 w-4" /> Quero participar
          </CtaLink>
        </div>
      </div>
    </article>
  );
}
