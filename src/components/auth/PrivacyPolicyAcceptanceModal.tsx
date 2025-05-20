
import { useAuth } from "@/contexts/AuthContext";
import { X, FileText, Shield } from "lucide-react";
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
      nome_completo: user?.nome_completo || user?.user_metadata?.nome_completo || 'Usuário',
      tipo_documento: user?.tipo_documento || user?.user_metadata?.tipo_documento || 'CPF',
      numero_documento: user?.numero_documento || user?.user_metadata?.numero_documento || '00000000000',
    },
    onAcceptSuccess: onAccept
  });

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <AlertDialogHeader className="bg-olimpics-green-primary/10 dark:bg-olimpics-green-primary/20 rounded-t-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-olimpics-green-primary" />
            <AlertDialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Política de Privacidade
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2 text-gray-600 dark:text-gray-300">
            Para continuar utilizando nosso sistema, você precisa aceitar nossa política de privacidade.
          </AlertDialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </AlertDialogHeader>

        <div className="py-4 px-6">
          <div className="border rounded-md bg-white/80 dark:bg-gray-800/80 max-h-[50vh] overflow-y-auto shadow-inner">
            <PolicyContent
              isLoading={isLoading}
              error={error}
              policyContent={policyContent}
              onRetryLoad={handleRetryLoad}
            />
          </div>
        </div>

        <AlertDialogFooter className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
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
