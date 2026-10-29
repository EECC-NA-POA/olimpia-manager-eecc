// Páginas públicas de divulgação por evento (rota /event/:slug e subdomínio
// <slug>.nova-acropole.org.br). Dados vêm da RPC get_pagina_publica_evento.

export const PUBLIC_PAGE_ROOT_DOMAIN = 'nova-acropole.org.br';
// Num subdomínio de divulgação não há sessão (outra origem), então cadastro e
// login sempre apontam para o app principal.
export const MAIN_APP_ORIGIN = 'https://olimpia.nova-acropole.org.br';

// Subdomínios que já são de outros serviços e nunca podem virar página de evento.
const RESERVED_SLUGS = ['olimpia', 'www', 'sb', 'studio-sb', 'api', 'app', 'admin', 'mail', 'email'];

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export interface PublicPageEvent {
  id: string;
  nome: string;
  descricao: string | null;
  texto: string | null;
  foto_evento: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  data_inicio_evento: string | null;
  data_fim_evento: string | null;
  data_inicio_inscricao: string | null;
  data_fim_inscricao: string | null;
  status_evento: string | null;
}

export interface PublicPageActivity {
  atividade: string | null;
  dia: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  local: string | null;
  recorrente: boolean;
  dias_semana: string[] | null;
  horarios_por_dia: Record<string, { inicio?: string; fim?: string }> | null;
  locais_por_dia: Record<string, string> | null;
  data_fim_recorrencia: string | null;
}

export interface PublicPageMonitor {
  nome: string;
  telefone: string | null;
}

export interface PublicPageOficina {
  id: number;
  nome: string;
  categoria: string | null;
  faixa_etaria: string | null;
  status: string;
  horarios: PublicPageActivity[];
  monitores: PublicPageMonitor[];
}

export interface PublicPageData {
  evento: PublicPageEvent;
  oficinas: PublicPageOficina[];
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
}

export function validateSlug(slug: string): string | null {
  if (!slug) return 'Informe o endereço da página.';
  if (!SLUG_REGEX.test(slug)) {
    return 'Use de 3 a 50 caracteres: letras minúsculas, números e hífen (sem hífen no início ou no fim).';
  }
  if (RESERVED_SLUGS.includes(slug)) return 'Este endereço é reservado. Escolha outro.';
  return null;
}

/** Slug do evento quando o app é aberto em <slug>.nova-acropole.org.br; senão null. */
export function getPublicPageSlugFromHost(hostname: string): string | null {
  const host = hostname.toLowerCase();
  const suffix = `.${PUBLIC_PAGE_ROOT_DOMAIN}`;
  if (!host.endsWith(suffix)) return null;
  const label = host.slice(0, -suffix.length);
  if (!SLUG_REGEX.test(label) || RESERVED_SLUGS.includes(label)) return null;
  return label;
}

export const buildPublicPagePath = (slug: string) => `/event/${slug}`;

export const buildPublicPageSubdomainUrl = (slug: string) => `https://${slug}.${PUBLIC_PAGE_ROOT_DOMAIN}`;

/** Número no formato do wa.me (só dígitos, com DDI). Números de até 11 dígitos são tratados como brasileiros. */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.length <= 11 ? `55${digits}` : digits;
}

// ---------------------------------------------------------------------------
// Horários
// ---------------------------------------------------------------------------

export const WEEKDAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
// Segunda primeiro, domingo por último (semana de oficinas).
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const DAY_KEY_TO_INDEX: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  'terça': 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
  'sábado': 6,
};

export interface WeeklySlot {
  weekday: number;
  inicio: string | null;
  fim: string | null;
  local: string | null;
}

export interface DatedSlot {
  date: string; // YYYY-MM-DD
  weekday: number;
  inicio: string | null;
  fim: string | null;
  local: string | null;
}

export interface OficinaSchedule {
  weekly: WeeklySlot[];
  dated: DatedSlot[];
}

const todayIso = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const formatTime = (time: string | null) => (time ? time.substring(0, 5) : '');

export const formatTimeRange = (inicio: string | null, fim: string | null) => {
  if (!inicio) return '';
  return fim ? `${formatTime(inicio)} às ${formatTime(fim)}` : formatTime(inicio);
};

/** Agenda semanal (atividades recorrentes vigentes) e próximas datas avulsas de uma oficina. */
export function buildOficinaSchedule(horarios: PublicPageActivity[]): OficinaSchedule {
  const today = todayIso();
  const weekly: WeeklySlot[] = [];
  const dated: DatedSlot[] = [];

  horarios.forEach((h) => {
    if (h.recorrente && Array.isArray(h.dias_semana) && h.dias_semana.length > 0) {
      if (h.data_fim_recorrencia && h.data_fim_recorrencia < today) return;
      h.dias_semana.forEach((key) => {
        const weekday = DAY_KEY_TO_INDEX[key.toLowerCase()];
        if (weekday === undefined) return;
        const horario = h.horarios_por_dia?.[key] || h.horarios_por_dia?.[key.toLowerCase()];
        weekly.push({
          weekday,
          inicio: horario?.inicio || h.horario_inicio,
          fim: horario?.fim || h.horario_fim,
          local: h.locais_por_dia?.[key] || h.locais_por_dia?.[key.toLowerCase()] || h.local,
        });
      });
    } else if (h.dia && h.dia >= today) {
      dated.push({
        date: h.dia,
        weekday: new Date(`${h.dia}T00:00:00`).getDay(),
        inicio: h.horario_inicio,
        fim: h.horario_fim,
        local: h.local,
      });
    }
  });

  const dedupe = <T,>(items: T[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return {
    weekly: dedupe(weekly).sort(
      (a, b) =>
        WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday) ||
        (a.inicio || '').localeCompare(b.inicio || '')
    ),
    dated: dedupe(dated).sort((a, b) => a.date.localeCompare(b.date) || (a.inicio || '').localeCompare(b.inicio || '')),
  };
}
