
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from '@tanstack/react-query';
import { fetchActivePrivacyPolicy } from "@/lib/api/privacyPolicy";
import { FormField, FormItem } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

export const PrivacyPolicySection = () => {
  const [open, setOpen] = useState(false);
  const form = useFormContext();
  
  const { 
    data: privacyPolicy, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: fetchActivePrivacyPolicy,
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  const handleOpenDialog = () => {
    // If there was an error, try refetching when the dialog is opened
    if (isError) {
      refetch();
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleRetry = () => {
    toast.info("Tentando buscar a política de privacidade novamente...");
    refetch();
  };

  return (
    <div className="flex flex-col space-y-2">
      <FormField
        control={form.control}
        name="acceptPrivacyPolicy"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <div className="grid gap-1.5 leading-none">
                <div className="flex items-center">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Li e aceito a{" "}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm font-medium text-primary"
                      onClick={handleOpenDialog}
                      type="button"
                    >
                      Política de Privacidade
                    </Button>
                  </Label>
                </div>
              </div>
            </div>
          </FormItem>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Política de Privacidade</DialogTitle>
            <DialogDescription>
              Por favor, leia atentamente nossa política de privacidade
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  Erro ao carregar política de privacidade.
                  {error instanceof Error && <p className="text-xs mt-2">{error.message}</p>}
                </div>
                <Button onClick={handleRetry} variant="outline" className="mx-auto">
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: privacyPolicy || 'Política de privacidade não disponível no momento.' }} />
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleCloseDialog}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
