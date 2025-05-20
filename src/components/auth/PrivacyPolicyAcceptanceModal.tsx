
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import { PolicyContent } from "./privacy-policy/PolicyContent";
import { PolicyActions } from "./privacy-policy/PolicyActions";
import { usePrivacyPolicyAcceptance } from "@/hooks/usePrivacyPolicyAcceptance";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyAcceptanceModalProps {
  onAccept: () => void;
  onCancel: () => void;
}

export const PrivacyPolicyAcceptanceModal = ({ 
  onAccept, 
  onCancel 
}: PrivacyPolicyAcceptanceModalProps) => {
  const { user } = useAuth();
  
  const { 
    policyContent,
    isLoading,
    error,
    handleRetryLoad,
    handleAccept,
    accepted,
    isPending,
    policyContentHasError
  } = usePrivacyPolicyAcceptance({
    userId: user?.id,
    userMetadata: {
      nome_completo: user?.nome_completo || user?.user_metadata?.nome_completo,
      tipo_documento: user?.tipo_documento || user?.user_metadata?.tipo_documento,
      numero_documento: user?.numero_documento || user?.user_metadata?.numero_documento,
    },
    onAcceptSuccess: onAccept
  });

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Política de Privacidade
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2">
            Para continuar utilizando nosso sistema, você precisa aceitar nossa política de privacidade.
          </AlertDialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="border rounded-md p-4 max-h-[50vh] overflow-y-auto bg-muted/30">
            <PolicyContent
              isLoading={isLoading}
              error={error}
              policyContent={policyContent}
              onRetryLoad={handleRetryLoad}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <PolicyActions
            onAccept={handleAccept}
            onCancel={onCancel}
            isLoading={isLoading}
            isPending={isPending}
            isAccepted={accepted}
            isDisabled={policyContentHasError}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
