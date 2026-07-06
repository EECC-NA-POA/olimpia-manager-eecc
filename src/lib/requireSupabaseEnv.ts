// Builds anteriores caiam silenciosamente numa anon key placeholder quando
// VITE_SUPABASE_ANON_KEY/VITE_SUPABASE_URL faltavam no ambiente de build —
// o app subia normalmente e só quebrava depois, de forma intermitente e
// disfarçada de bug de login/servidor (401 "Invalid authentication
// credentials" no Kong). Falhar alto e visível aqui torna esse tipo de
// build quebrado impossível de confundir com outra coisa.
export function requireSupabaseEnv(
  url: string | undefined,
  anonKey: string | undefined
): { url: string; anonKey: string } {
  if (url && anonKey) {
    return { url, anonKey };
  }

  const message =
    'Erro de configuração: credenciais do Supabase não foram definidas neste build (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Contate o responsável pela publicação do site.';

  if (typeof document !== 'undefined') {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;padding:24px;text-align:center;background:#1a1a1a;color:#fff;">
        <div style="max-width:480px;">
          <div style="font-size:32px;margin-bottom:16px;">⚠️</div>
          <p style="font-size:16px;line-height:1.5;">${message}</p>
        </div>
      </div>
    `;
  }

  throw new Error(message);
}
