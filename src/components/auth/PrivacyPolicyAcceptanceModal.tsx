
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchActivePrivacyPolicy } from "@/lib/api/privacyPolicy";
import { supabase } from "@/lib/supabase";
import { LogOut, X } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyAcceptanceModalProps {
  onAccept: () => void;
  onCancel: () => void;
}

export const PrivacyPolicyAcceptanceModal = ({ onAccept, onCancel }: PrivacyPolicyAcceptanceModalProps) => {
  const { user } = useAuth();
  const [accepted, setAccepted] = useState(false);
  
  // Fetch the latest privacy policy
  const { data: policyContent, isLoading, error } = useQuery({
    queryKey: ['latest-privacy-policy'],
    queryFn: fetchActivePrivacyPolicy,
    retry: 3,
  });

  // Mutation to register user acceptance
  const registerAcceptanceMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('Usuário não identificado');
        }
        
        // Get the latest privacy policy version
        const { data: latestPolicy, error: policyError } = await supabase
          .from('termos_privacidade')
          .select('id, versao_termo, termo_texto')
          .eq('ativo', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (policyError || !latestPolicy) {
          console.error('Error fetching latest policy:', policyError);
          throw new Error('Não foi possível obter a versão do termo de privacidade');
        }
        
        console.log('Registering privacy policy acceptance for user:', user.id, 'policy:', latestPolicy.versao_termo);
        
        // Register user acceptance
        const { error: acceptanceError } = await supabase
          .from('logs_aceite_privacidade')
          .insert({
            usuario_id: user.id,
            termo_id: latestPolicy.id,
            nome_completo: user.nome_completo || user.user_metadata?.nome_completo,
            tipo_documento: user.tipo_documento || user.user_metadata?.tipo_documento,
            numero_documento: user.numero_documento || user.user_metadata?.numero_documento,
            versao_termo: latestPolicy.versao_termo,
            termo_texto: latestPolicy.termo_texto
          });
          
        if (acceptanceError) {
          console.error('Error registering acceptance:', acceptanceError);
          throw new Error('Não foi possível registrar o aceite do termo de privacidade');
        }
        
        return true;
      } catch (error) {
        console.error('Error in registerAcceptanceMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Privacy policy acceptance registered successfully');
      toast.success("Termo de privacidade aceito com sucesso!");
      onAccept();
    },
    onError: (error) => {
      console.error('Failed to register privacy policy acceptance:', error);
      toast.error("Não foi possível registrar o aceite do termo de privacidade");
    }
  });

  const handleAccept = () => {
    setAccepted(true);
    registerAcceptanceMutation.mutate();
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Política de Privacidade
          </AlertDialogTitle>
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
          <p className="mb-4 text-sm text-muted-foreground">
            Para continuar utilizando nosso sistema, você precisa aceitar nossa política de privacidade.
          </p>
          
          <div className="border rounded-md p-4 max-h-[50vh] overflow-y-auto bg-muted/30">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                Erro ao carregar a política de privacidade. Por favor, tente novamente mais tarde.
              </div>
            ) : (
              <div 
                dangerouslySetInnerHTML={{ __html: policyContent || 'Política de privacidade não disponível no momento.' }} 
                className="policy-content prose prose-sm max-w-none dark:prose-invert"
              />
            )}
          </div>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={onCancel}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
          
          <Button
            className="w-full sm:w-auto"
            onClick={handleAccept}
            disabled={isLoading || registerAcceptanceMutation.isPending || accepted}
          >
            {registerAcceptanceMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
                Processando...
              </>
            ) : (
              "Concordo com a Política de Privacidade"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
