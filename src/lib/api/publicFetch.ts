/**
 * Utilitário para chamadas públicas ao servidor Supabase self-hosted.
 *
 * O servidor usa uma chave anon que não é JWT padrão. O cliente Supabase JS
 * envia Authorization: Bearer <chave>, que o PostgREST rejeita ao tentar
 * validar como JWT (PGRST301 - Expected 3 parts; got 1).
 *
 * A solução correta para este servidor é usar apenas o header `apikey`
 * (sem Authorization), que o servidor aceita sem validação JWT.
 *
 * Use esta função para qualquer dado publicamente acessível (sem login),
 * como filiais, eventos públicos, etc.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Busca dados de uma tabela/view pública do Supabase via REST.
 * Não envia Authorization header — só apikey quando disponível.
 */
export async function publicFetch<T>(
  path: string,
  params?: Record<string, string>
): Promise<T[]> {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL não está configurada no ambiente de build.');
  }

  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const url = `${SUPABASE_URL}/rest/v1/${path}${qs}`;

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Erro ao buscar ${path}: HTTP ${response.status} ${body}`);
  }

  return response.json() as Promise<T[]>;
}

/**
 * Chama uma RPC pública (função SQL com GRANT para anon) via REST.
 * Mesmo esquema de headers de publicFetch: só apikey, sem Authorization.
 */
export async function publicRpc<T>(
  fn: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL não está configurada no ambiente de build.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Erro ao chamar ${fn}: HTTP ${response.status} ${body}`);
  }

  return response.json() as Promise<T>;
}
