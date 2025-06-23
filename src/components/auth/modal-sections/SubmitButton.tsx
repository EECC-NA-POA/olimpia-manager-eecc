
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isPolicySubmitting: boolean;
}

export const SubmitButton = ({ isSubmitting, isPolicySubmitting }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit"
      className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
      disabled={isSubmitting || isPolicySubmitting}
    >
      {isSubmitting || isPolicySubmitting ? (
        <>Processando...</>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Aceitar e Continuar
        </>
      )}
    </Button>
  );
};
