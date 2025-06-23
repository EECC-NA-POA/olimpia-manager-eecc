
import React from "react";
import { Info } from "lucide-react";

interface PrivacyPolicySectionModalProps {
  onViewPrivacyPolicy: () => void;
}

export const PrivacyPolicySectionModal = ({ onViewPrivacyPolicy }: PrivacyPolicySectionModalProps) => {
  return (
    <div className="p-4 bg-muted/50 rounded-md">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-olimpics-green-primary" />
        <h3 className="font-medium">Termos de Privacidade</h3>
      </div>
      <p className="text-sm mt-2 text-muted-foreground">
        Para utilizar nosso sistema, você precisa aceitar nossa política de privacidade.
        {" "}
        <button 
          type="button"
          onClick={onViewPrivacyPolicy}
          className="text-olimpics-green-primary hover:underline font-medium"
        >
          Clique aqui para ler os termos
        </button>
      </p>
    </div>
  );
};
