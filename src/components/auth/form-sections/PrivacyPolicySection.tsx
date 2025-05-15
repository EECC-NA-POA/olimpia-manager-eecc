
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import remarkGfm from 'remark-gfm';
import { toast } from "sonner";

interface PrivacyPolicySectionProps {
  form: UseFormReturn<any>;
}

export const PrivacyPolicySection = ({ form }: PrivacyPolicySectionProps) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [policyText, setPolicyText] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Function to fetch the privacy policy directly when dialog opens
  const fetchPrivacyPolicy = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPolicyText(null); // Reset policy text when loading new content
    
    try {
      console.log('Fetching privacy policy...');
      
      // Before fetching, ensure we have a valid session or use anonymous access
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log('No active session, using anonymous access');
      }
      
      // Direct query to get the active privacy policy
      const { data, error: fetchError } = await supabase
        .from('termos_privacidade')
        .select('termo_texto')
        .eq('ativo', true)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Error fetching privacy policy:', fetchError);
        setError(new Error(fetchError.message));
        toast.error('Erro ao carregar política de privacidade. Tente novamente.');
        return;
      }

      if (!data) {
        console.log('No active privacy policy found');
        setError(new Error('Nenhuma política de privacidade ativa encontrada.'));
        return;
      }

      console.log('Privacy policy fetched successfully');
      setPolicyText(data.termo_texto);
    } catch (err) {
      console.error('Unexpected error fetching privacy policy:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar política de privacidade'));
      toast.error('Erro ao carregar política de privacidade. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open dialog and fetch policy
  const handleOpenDialog = () => {
    setDialogOpen(true);
    fetchPrivacyPolicy();
  };

  // Retry fetching if there was an error
  const handleRetry = () => {
    fetchPrivacyPolicy();
  };

  return (
    <>
      <FormField
        control={form.control}
        name="acceptPrivacyPolicy"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <div className="text-sm text-muted-foreground">
                Li e concordo com a{" "}
                <button
                  type="button"
                  className="text-olimpics-green-primary hover:underline"
                  onClick={handleOpenDialog}
                >
                  Política de Privacidade
                </button>
              </div>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Política de Privacidade</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4 rounded-md border p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-center text-red-500">
                  {error.message || 'Erro ao carregar política de privacidade.'}
                </p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-olimpics-green-primary text-white rounded-md hover:bg-olimpics-green-secondary"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : policyText ? (
              <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-a:text-olimpics-green-primary prose-a:no-underline hover:prose-a:underline prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:mb-4 prose-p:mb-4 prose-ul:my-4 prose-li:my-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-3" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4" {...props} />,
                    li: ({node, ...props}) => <li className="my-1" {...props} />,
                    a: ({node, ...props}) => (
                      <a
                        className="text-olimpics-green-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {policyText}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Política de privacidade não disponível no momento. Por favor, tente novamente.
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
