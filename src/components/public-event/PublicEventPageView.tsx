import { useEffect, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDown, CalendarDays, ClipboardCheck, LogIn, MapPin, RefreshCw, Shapes, UserPlus, Users } from 'lucide-react';
import { LoadingImage } from '@/components/ui/loading-image';
import { usePublicEventPage } from '@/hooks/usePublicEventPage';
import { buildOficinaSchedule } from '@/lib/publicPages';
import { CtaLink } from './CtaLink';
import { OficinaCard } from './OficinaCard';
import { WeeklyAgenda } from './WeeklyAgenda';

const FALLBACK_HERO_IMAGE = '/lovable-uploads/53fe30f6-8ee7-4abc-a9ea-bf9c8ceff961.png';

const textComponents: Components = {
  h1: ({ children }) => <h2 className="mt-8 mb-3 text-2xl font-bold text-olimpics-green-primary first:mt-0 sm:text-3xl">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-8 mb-3 text-2xl font-bold text-olimpics-green-primary first:mt-0 sm:text-3xl">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 mb-2 text-xl font-semibold text-olimpics-text first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-4 text-base leading-relaxed text-gray-700 sm:text-lg">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 text-base text-gray-700 sm:text-lg">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 text-base text-gray-700 sm:text-lg">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-olimpics-text">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-olimpics-orange-primary pl-4 text-lg italic text-gray-600">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-olimpics-green-primary underline underline-offset-2">
      {children}
    </a>
  ),
};

interface PublicEventPageViewProps {
  slug: string;
  /** Origem do app principal para cadastro/login ('' = mesma origem). */
  appOrigin?: string;
  isAuthenticated?: boolean;
}

export function PublicEventPageView({ slug, appOrigin = '', isAuthenticated = false }: PublicEventPageViewProps) {
  const { data, isLoading, isError, refetch, isRefetching } = usePublicEventPage(slug);

  useEffect(() => {
    if (data?.evento.nome) document.title = data.evento.nome;
  }, [data?.evento.nome]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-olimpics-background">
        <LoadingImage text="Carregando..." />
      </div>
    );
  }

  if (isError) {
    return (
      <StatusScreen
        title="Não foi possível carregar a página agora"
        message="Verifique sua conexão e tente novamente em instantes."
        action={
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 rounded-xl bg-olimpics-green-primary px-5 py-2.5 font-semibold text-white hover:bg-olimpics-green-primary/90 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} /> Tentar novamente
          </button>
        }
      />
    );
  }

  if (!data) {
    return (
      <StatusScreen
        title="Página não encontrada"
        message="Este endereço não existe ou a página de divulgação deste evento não está mais disponível."
        action={
          <CtaLink href={`${appOrigin}/`} className="inline-flex items-center gap-2 rounded-xl bg-olimpics-green-primary px-5 py-2.5 font-semibold text-white hover:bg-olimpics-green-primary/90">
            Ir para a página inicial
          </CtaLink>
        }
      />
    );
  }

  const { evento, oficinas } = data;
  const registerHref = isAuthenticated ? `${appOrigin}/event-selection` : `${appOrigin}/login?tab=register`;
  const location = [evento.cidade, evento.estado].filter(Boolean).join(' · ');
  const monitorCount = new Set(oficinas.flatMap((o) => o.monitores.map((m) => m.nome))).size;
  const hasWeeklyAgenda = oficinas.some((o) => buildOficinaSchedule(o.horarios).weekly.length > 0);
  const eventPeriod =
    evento.data_inicio_evento && evento.data_fim_evento
      ? `${format(new Date(`${evento.data_inicio_evento}T00:00:00`), "dd 'de' MMM", { locale: ptBR })} a ${format(
          new Date(`${evento.data_fim_evento}T00:00:00`),
          "dd 'de' MMM 'de' yyyy",
          { locale: ptBR }
        )}`
      : null;

  return (
    <div className="min-h-screen bg-olimpics-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-olimpics-green-primary text-white">
        <img
          src={evento.foto_evento || FALLBACK_HERO_IMAGE}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${evento.foto_evento ? 'opacity-40' : 'opacity-20'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-olimpics-green-primary/40 to-olimpics-green-primary" />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-24 text-center sm:pb-20 sm:pt-28">
          <div className="mb-6 flex items-center justify-center gap-4">
            <img src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png" alt="Escola do Esporte com Coração" className="h-16 w-16 rounded-full bg-white/90 object-contain p-1 sm:h-20 sm:w-20" />
            <img src="/lovable-uploads/nova_acropole_logo_redondo_verde.png" alt="Nova Acrópole" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight drop-shadow sm:text-5xl md:text-6xl">
            {evento.nome}
          </h1>
          {evento.descricao && (
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">{evento.descricao}</p>
          )}

          {(location || eventPeriod) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/85">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {location}
                </span>
              )}
              {eventPeriod && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> {eventPeriod}
                </span>
              )}
            </div>
          )}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink
              href={registerHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-olimpics-orange-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-olimpics-orange-tertiary sm:w-auto"
            >
              <UserPlus className="h-5 w-5" /> {isAuthenticated ? 'Inscrever-se no evento' : 'Quero me inscrever'}
            </CtaLink>
            {oficinas.length > 0 && (
              <a
                href="#oficinas"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 sm:w-auto"
              >
                Ver oficinas <ArrowDown className="h-4 w-4" />
              </a>
            )}
          </div>

          {oficinas.length > 0 && (
            <dl className="mx-auto mt-12 grid max-w-md grid-cols-2 divide-x divide-white/20 rounded-2xl bg-white/10 py-4 backdrop-blur">
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/70">Oficinas</dt>
                <dd className="text-3xl font-bold">{oficinas.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/70">{monitorCount === 1 ? 'Filósofo monitor' : 'Filósofos monitores'}</dt>
                <dd className="text-3xl font-bold">{monitorCount}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      {/* Texto de divulgação */}
      {evento.texto && (
        <section className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={textComponents}>
            {evento.texto}
          </ReactMarkdown>
        </section>
      )}

      {/* Como participar */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <h2 className="text-center text-2xl font-bold text-olimpics-text sm:text-3xl">Como participar</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: UserPlus, title: 'Faça seu cadastro', text: 'Crie sua conta no sistema com seus dados.' },
              { icon: ClipboardCheck, title: 'Inscreva-se no evento', text: `Depois de entrar, escolha "${evento.nome}" na lista de eventos.` },
              { icon: Shapes, title: 'Escolha suas oficinas', text: 'As oficinas aparecem no seu painel: inscreva-se nas que desejar.' },
            ].map((step, i) => (
              <li key={step.title} className="relative rounded-2xl bg-olimpics-background p-6 text-center">
                <span className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-olimpics-orange-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <step.icon className="mx-auto mb-3 mt-2 h-8 w-8 text-olimpics-green-primary" />
                <h3 className="font-semibold text-olimpics-text">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{step.text}</p>
              </li>
            ))}
          </ol>
          {!isAuthenticated && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Já tem cadastro?{' '}
              <CtaLink href={`${appOrigin}/login`} className="inline-flex items-center gap-1 font-semibold text-olimpics-green-primary hover:underline">
                <LogIn className="h-4 w-4" /> Entrar
              </CtaLink>
            </p>
          )}
        </div>
      </section>

      {/* Oficinas */}
      <section id="oficinas" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-olimpics-text sm:text-4xl">Oficinas</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Dias, horários e os filósofos monitores de cada oficina. Fale direto com eles pelo WhatsApp se tiver dúvidas.
            </p>
          </div>

          {oficinas.length === 0 ? (
            <p className="rounded-2xl bg-white p-10 text-center text-gray-600 shadow-sm ring-1 ring-black/5">
              As oficinas serão divulgadas em breve.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {oficinas.map((oficina) => (
                <OficinaCard key={oficina.id} oficina={oficina} eventName={evento.nome} enrollHref={registerHref} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Calendário semanal */}
      {hasWeeklyAgenda && (
        <section className="bg-olimpics-green-primary/[0.06]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <div className="mb-10 text-center">
              <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-olimpics-text sm:text-4xl">
                <CalendarDays className="h-8 w-8 text-olimpics-green-primary" /> Semana de oficinas
              </h2>
              <p className="mt-3 text-gray-600">Veja tudo o que acontece em cada dia da semana.</p>
            </div>
            <WeeklyAgenda oficinas={oficinas} />
          </div>
        </section>
      )}

      {/* Chamada final */}
      <section className="bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-14 text-center sm:py-16">
          <Users className="mb-4 h-10 w-10 text-white/80" />
          <h2 className="text-2xl font-bold sm:text-3xl">Venha praticar com a gente</h2>
          <p className="mt-3 max-w-xl text-white/85">Faça seu cadastro, inscreva-se no evento e escolha suas oficinas.</p>
          <CtaLink
            href={registerHref}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-olimpics-green-primary shadow-lg transition-colors hover:bg-white/90"
          >
            <UserPlus className="h-5 w-5" /> {isAuthenticated ? 'Inscrever-se no evento' : 'Quero me inscrever'}
          </CtaLink>
        </div>
      </section>
    </div>
  );
}

function StatusScreen({ title, message, action }: { title: string; message: string; action: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-olimpics-background px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <img src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png" alt="" className="mx-auto mb-4 h-16 w-16 object-contain" />
        <h1 className="text-xl font-bold text-olimpics-text">{title}</h1>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-6">{action}</div>
      </div>
    </div>
  );
}
