
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
}

export const SubmitButton = ({ isSubmitting }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit"
      className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>Processando...</>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Continuar
        </>
      )}
    </Button>
  );
};
