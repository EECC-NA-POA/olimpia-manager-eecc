
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

  console.log('🔍 Privacy Policy Modal - Render state:', { isLoading, error: !!error, hasContent: !!policyContent });

  const loadPolicy = async () => {
    console.log('📥 Privacy Policy Modal - Starting to load policy...');
    setIsLoading(true);
    setError(null);
    try {
      const content = await fetchActivePrivacyPolicy();
      console.log('✅ Privacy Policy Modal - Policy loaded successfully:', content?.substring(0, 100) + '...');
      setPolicyContent(content);
    } catch (err) {
      console.error('❌ Privacy Policy Modal - Error loading policy:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Privacy Policy Modal - Component mounted, loading policy...');
    loadPolicy();
  }, []);

  console.log('🎨 Privacy Policy Modal - Rendering dialog with open=true');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto z-[100] bg-background border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Política de Privacidade</DialogTitle>
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
