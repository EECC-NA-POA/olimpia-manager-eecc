
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
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { fetchActivePrivacyPolicy } from "@/lib/api/privacyPolicy";

interface PrivacyPolicySectionProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const PrivacyPolicySection = ({
  value,
  onChange,
}: PrivacyPolicySectionProps) => {
  const [open, setOpen] = useState(false);
  
  const { data: privacyPolicy, isLoading, isError, error } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: fetchActivePrivacyPolicy,
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={value}
          onCheckedChange={(checked) => {
            onChange(checked === true);
          }}
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
              <div className="text-red-500">
                Erro ao carregar política de privacidade. Tente novamente.
                {error instanceof Error && <p className="text-xs">{error.message}</p>}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: privacyPolicy || '' }} />
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
