
import ReactMarkdown from "react-markdown";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>
        {policyContent}
      </ReactMarkdown>
    </div>
  );
};
