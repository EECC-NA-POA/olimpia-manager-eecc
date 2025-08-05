
import { RefreshCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { sanitizeHtml } from "@/lib/security/htmlSanitizer";

const FALLBACK_POLICY = `
# Política de Privacidade

## 1. Coleta de Informações
Coletamos informações quando você se registra em nosso site, faz uma inscrição em eventos, ou preenche um formulário.

## 2. Uso das Informações
As informações que coletamos de você podem ser usadas para:
- Personalizar sua experiência
- Melhorar nosso website
- Processar transações
- Enviar emails periódicos

## 3. Proteção de Informações
Implementamos uma variedade de medidas de segurança para manter a segurança de suas informações pessoais.

## 4. Cookies
Utilizamos cookies para melhorar sua experiência de navegação.

## 5. Divulgação a Terceiros
Não vendemos, comercializamos ou transferimos para terceiros suas informações pessoais identificáveis.

## 6. Conformidade com a LGPD
Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD).

## 7. Contato
Se você tiver alguma dúvida sobre esta política de privacidade, entre em contato conosco.

---
*Última atualização: ${new Date().toLocaleDateString('pt-BR')}*
`;

interface PolicyContentProps {
  isLoading: boolean;
  error: unknown;
  policyContent: string | null;
  onRetryLoad: () => void;
}

export const PolicyContent = ({
  isLoading,
  error,
  policyContent,
  onRetryLoad
}: PolicyContentProps) => {
  console.log('🎯 PolicyContent - Render state:', { isLoading, error: !!error, hasContent: !!policyContent });

  if (isLoading) {
    console.log('⏳ PolicyContent - Showing loading state');
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  const shouldShowFallback = error || !policyContent || 
    policyContent.includes('Não foi possível carregar') || 
    policyContent.includes('Para visualizar nossa política') ||
    policyContent.trim().length < 50;

  if (shouldShowFallback) {
    console.log('⚠️ PolicyContent - Showing fallback content due to:', { error: !!error, hasContent: !!policyContent, contentLength: policyContent?.length });
    
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Exibindo política padrão
            </span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Não foi possível carregar a política atualizada. Exibindo versão padrão.
          </p>
          <Button 
            onClick={onRetryLoad} 
            variant="outline"
            size="sm"
            className="mt-3 gap-2 h-8"
          >
            <RefreshCcw className="w-3 h-3" />
            Tentar carregar versão atualizada
          </Button>
        </div>
        
        <div className="prose prose-sm max-w-none dark:prose-invert bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-olimpics-green-primary dark:text-olimpics-green-secondary mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-olimpics-green-secondary dark:text-olimpics-green-primary mt-6 mb-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="my-3 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
              li: ({ node, ...props }) => <li className="text-gray-700 dark:text-gray-300 mb-1" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
              em: ({ node, ...props }) => <em className="italic" {...props} />,
            }}
          >
            {FALLBACK_POLICY}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  console.log('✅ PolicyContent - Showing actual policy content');
  
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="markdown-content">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-olimpics-green-primary dark:text-olimpics-green-secondary mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-olimpics-green-secondary dark:text-olimpics-green-primary mt-6 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="my-3 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3 space-y-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="text-gray-700 dark:text-gray-300 mb-1" {...props} />,
            a: ({ node, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />,
            hr: ({ node, ...props }) => <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />,
            table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" {...props} /></div>,
            thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-700" {...props} />,
            tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
            th: ({ node, ...props }) => <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300" {...props} />,
            td: ({ node, ...props }) => <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300" {...props} />,
            code: ({ className, children, node, ...props }: any) => {
              // Check if this code block is inline or a block based on className
              const isInline = !className;
              
              return isInline 
                ? <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-sm" {...props}>{children}</code>
                : <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm overflow-x-auto my-4" {...props}>{children}</code>;
            },
            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
          }}
        >
          {policyContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};
