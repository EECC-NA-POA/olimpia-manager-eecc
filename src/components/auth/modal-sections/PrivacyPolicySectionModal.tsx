
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PolicyContent } from "@/components/auth/privacy-policy/PolicyContent";
import { fetchActivePrivacyPolicy } from "@/lib/api/privacyPolicy";

interface PrivacyPolicySectionModalProps {
  onClose: () => void;
}

export const PrivacyPolicySectionModal = ({ onClose }: PrivacyPolicySectionModalProps) => {
  const [policyContent, setPolicyContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadPolicy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await fetchActivePrivacyPolicy();
      setPolicyContent(content);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Política de Privacidade</DialogTitle>
        </DialogHeader>
        <PolicyContent
          isLoading={isLoading}
          error={error}
          policyContent={policyContent}
          onRetryLoad={loadPolicy}
        />
      </DialogContent>
    </Dialog>
  );
};
