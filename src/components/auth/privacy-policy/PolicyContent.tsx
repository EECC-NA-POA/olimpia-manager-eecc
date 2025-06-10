
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

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
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !policyContent || (typeof policyContent === 'string' && policyContent.includes('Não foi possível carregar'))) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500">
          Não foi possível carregar a política de privacidade. Por favor, tente novamente.
        </p>
        <Button 
          onClick={onRetryLoad}
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

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
