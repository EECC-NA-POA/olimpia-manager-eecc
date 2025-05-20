
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { LocationSelector } from "./form-sections/location/LocationSelector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { PrivacyPolicyAcceptanceModal } from "./PrivacyPolicyAcceptanceModal";
import { usePrivacyPolicyAcceptance } from "@/hooks/usePrivacyPolicyAcceptance";
import { BranchDisplaySection } from "./modal-sections/BranchDisplaySection";
import { PrivacyPolicySectionModal } from "./modal-sections/PrivacyPolicySectionModal";
import { SubmitButton } from "./modal-sections/SubmitButton";

interface WelcomePolicyBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  needsLocationSelection: boolean;
  existingBranchId?: string;
  existingState?: string;
  existingBranchName?: string;
  onComplete: () => void;
}

// Schema for the form validation
const branchSelectionSchema = z.object({
  state: z.string().min(1, "Por favor, selecione um estado"),
  branchId: z.string().min(1, "Por favor, selecione uma sede"),
});

export const WelcomePolicyBranchModal = ({
  isOpen,
  onClose,
  needsLocationSelection,
  existingBranchId,
  existingState,
  existingBranchName,
  onComplete
}: WelcomePolicyBranchModalProps) => {
  const { user } = useAuth();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(branchSelectionSchema),
    defaultValues: {
      state: existingState || "",
      branchId: existingBranchId || "",
    },
  });
  
  // For handling privacy policy acceptance
  const { 
    handleAccept: handleAcceptPrivacyPolicy,
    isPending: isPrivacyPolicySubmitting 
  } = usePrivacyPolicyAcceptance({
    userId: user?.id,
    userMetadata: {
      nome_completo: user?.nome_completo || user?.user_metadata?.nome_completo || 'Usuário',
      tipo_documento: user?.tipo_documento || user?.user_metadata?.tipo_documento || 'CPF',
      numero_documento: user?.numero_documento || user?.user_metadata?.numero_documento || '00000000000',
    },
    onAcceptSuccess: () => {
      // Only close if we've already saved branch info or don't need to
      if (!needsLocationSelection || form.formState.isSubmitted) {
        toast.success("Preferências salvas com sucesso!");
        onComplete();
      }
    }
  });

  const handleSubmit = async (data: z.infer<typeof branchSelectionSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (needsLocationSelection) {
        // Update user's branch information
        const { error } = await supabase
          .from('usuarios')
          .update({ filial_id: data.branchId })
          .eq('id', user?.id);
          
        if (error) {
          console.error('Error updating user branch:', error);
          toast.error("Erro ao salvar informações da sede");
          return;
        }
      }
      
      // Handle the privacy policy acceptance
      handleAcceptPrivacyPolicy();
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("Ocorreu um erro ao salvar suas preferências");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewPrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };
  
  const handlePrivacyPolicyClose = () => {
    setShowPrivacyPolicy(false);
  };
  
  if (showPrivacyPolicy) {
    return (
      <PrivacyPolicyAcceptanceModal
        onAccept={() => {
          setShowPrivacyPolicy(false);
        }}
        onCancel={() => {
          setShowPrivacyPolicy(false);
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      // Prevent closing if the form is being submitted
      if (!isSubmitting && !isPrivacyPolicySubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-center items-center mb-2">
            Bem-vindo(a)
          </DialogTitle>
          <DialogDescription>
            {needsLocationSelection 
              ? "Para continuar, precisamos que você selecione seu estado e sede."
              : "Precisamos que você aceite os termos de privacidade para continuar."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {needsLocationSelection ? (
              <div className="p-4 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-olimpics-green-primary" />
                  <h3 className="font-medium">Sua sede</h3>
                </div>
                <LocationSelector form={form} disabled={!needsLocationSelection} />
              </div>
            ) : existingState && existingBranchId ? (
              <BranchDisplaySection 
                state={existingState} 
                branchName={existingBranchName} 
              />
            ) : null}
            
            <PrivacyPolicySectionModal onViewPrivacyPolicy={handleViewPrivacyPolicy} />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <SubmitButton 
                isSubmitting={isSubmitting} 
                isPolicySubmitting={isPrivacyPolicySubmitting} 
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
