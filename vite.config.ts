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

// Avisar em tempo de build se variáveis críticas não estiverem configuradas
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '\n⚠️  ATENÇÃO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no ambiente de build.\n' +
    '   Chamadas públicas ao Supabase (filiais, eventos) vão falhar em produção.\n' +
    '   Verifique o arquivo .env ou as variáveis de ambiente do servidor de deploy.\n'
  );
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
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
}));
