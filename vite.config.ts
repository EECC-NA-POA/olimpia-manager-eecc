import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";

// Get Git commit hash and build time
const getGitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

const getBuildTime = () => {
  return new Date().toISOString();
};

// Interrompe o build de produção se as variáveis críticas não estiverem
// configuradas no ambiente do pipeline (Lovable ou qualquer outro). Um
// console.warn sozinho já se mostrou insuficiente: builds de produção sem
// essas variáveis já passaram despercebidos, publicando um app com uma
// chave anon placeholder que só falha depois, de forma intermitente e
// disfarçada de bug de login/servidor (401 no Kong).
const failBuildIfSupabaseEnvMissing = (mode: string) => {
  if (mode !== 'production') return;
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) return;

  console.error(
    '\n❌ BUILD ABORTADO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no ambiente de build de produção.\n' +
    '   Configure essas variáveis no pipeline de deploy antes de tentar novamente.\n'
  );
  process.exit(1);
};

// Remove o script de edição visual da Lovable (cdn.gpteng.co/gptengineer.js) do
// build de produção — mesmo critério do componentTagger (só roda em dev).
// Fora do ambiente de edição da Lovable, esse script de terceiro não tem uso e
// só amplia a superfície de ataque (acesso total à sessão autenticada).
const stripGptEngineerScriptInProd = (mode: string) => ({
  name: 'strip-gptengineer-script-in-prod',
  transformIndexHtml(html: string) {
    if (mode === 'development') return html;
    return html.replace(
      /\s*<script[^>]*src="https:\/\/cdn\.gpteng\.co\/gptengineer\.js"[^>]*><\/script>\s*/,
      '\n  '
    );
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  if (command === 'build') failBuildIfSupabaseEnvMissing(mode);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
      stripGptEngineerScriptInProd(mode),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(getGitHash()),
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(getBuildTime()),
    },
    esbuild: {
      // Remove console.*/debugger do bundle de produção — evita vazar PII
      // (nomes, CPF, email, listas de atletas) para o console do navegador.
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
