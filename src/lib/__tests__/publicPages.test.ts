import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildOficinaSchedule,
  getPublicPageSlugFromHost,
  slugify,
  toWhatsAppNumber,
  validateSlug,
  type PublicPageActivity,
} from '../publicPages';

const activity = (overrides: Partial<PublicPageActivity>): PublicPageActivity => ({
  atividade: 'Treino',
  dia: null,
  horario_inicio: null,
  horario_fim: null,
  local: null,
  recorrente: false,
  dias_semana: null,
  horarios_por_dia: null,
  locais_por_dia: null,
  data_fim_recorrencia: null,
  ...overrides,
});

describe('slugify / validateSlug', () => {
  it('gera slug sem acentos e válido', () => {
    const slug = slugify('Oficinas da Escola do Esporte com Coração — POA 2026!');
    expect(slug).toBe('oficinas-da-escola-do-esporte-com-coracao-poa-2026');
    expect(validateSlug(slug)).toBeNull();
  });

  it('rejeita formato inválido e reservados', () => {
    expect(validateSlug('-abc')).not.toBeNull();
    expect(validateSlug('ab')).not.toBeNull();
    expect(validateSlug('Oficinas')).not.toBeNull();
    expect(validateSlug('olimpia')).not.toBeNull();
  });
});

describe('getPublicPageSlugFromHost', () => {
  it('reconhece <slug>.nova-acropole.org.br', () => {
    expect(getPublicPageSlugFromHost('oficinas-eecc.nova-acropole.org.br')).toBe('oficinas-eecc');
  });

  it('ignora o app principal, serviços reservados e outros hosts', () => {
    expect(getPublicPageSlugFromHost('olimpia.nova-acropole.org.br')).toBeNull();
    expect(getPublicPageSlugFromHost('sb.nova-acropole.org.br')).toBeNull();
    expect(getPublicPageSlugFromHost('nova-acropole.org.br')).toBeNull();
    expect(getPublicPageSlugFromHost('a.b.nova-acropole.org.br')).toBeNull();
    expect(getPublicPageSlugFromHost('localhost')).toBeNull();
    expect(getPublicPageSlugFromHost('preview--x.lovable.app')).toBeNull();
  });
});

describe('toWhatsAppNumber', () => {
  it('adiciona DDI 55 a números brasileiros, inclusive DDD 55', () => {
    expect(toWhatsAppNumber('(51) 99999-0000')).toBe('5551999990000');
    expect(toWhatsAppNumber('55 98888-0000')).toBe('5555988880000');
  });

  it('mantém número já com DDI e descarta vazio/curto', () => {
    expect(toWhatsAppNumber('+55 51 99999-0000')).toBe('5551999990000');
    expect(toWhatsAppNumber('')).toBeNull();
    expect(toWhatsAppNumber(null)).toBeNull();
    expect(toWhatsAppNumber('1234')).toBeNull();
  });
});

describe('buildOficinaSchedule', () => {
  afterEach(() => vi.useRealTimers());

  it('expande recorrentes por dia da semana e mantém só datas futuras', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T12:00:00'));

    const { weekly, dated } = buildOficinaSchedule([
      activity({
        recorrente: true,
        dias_semana: ['quinta', 'terca'],
        horarios_por_dia: { terca: { inicio: '19:00', fim: '20:30' }, quinta: { inicio: '18:00', fim: '19:00' } },
        locais_por_dia: { quinta: 'Sala 3' },
        local: 'Sede',
      }),
      activity({ dia: '2026-10-01', horario_inicio: '08:00:00' }),
      activity({ dia: '2026-11-21', horario_inicio: '07:30:00', local: 'Orla' }),
    ]);

    expect(weekly).toEqual([
      { weekday: 2, inicio: '19:00', fim: '20:30', local: 'Sede' },
      { weekday: 4, inicio: '18:00', fim: '19:00', local: 'Sala 3' },
    ]);
    expect(dated).toHaveLength(1);
    expect(dated[0]).toMatchObject({ date: '2026-11-21', weekday: 6, local: 'Orla' });
  });

  it('ignora recorrência já encerrada', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T12:00:00'));

    const { weekly } = buildOficinaSchedule([
      activity({ recorrente: true, dias_semana: ['segunda'], data_fim_recorrencia: '2026-06-30' }),
    ]);
    expect(weekly).toEqual([]);
  });
});
