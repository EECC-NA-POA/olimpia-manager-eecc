
import React, { useState } from 'react';
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from 'react-hook-form';
import { PrivacyPolicySectionModal } from '../modal-sections/PrivacyPolicySectionModal';

interface PrivacyPolicySectionProps {
  form: UseFormReturn<any>;
}

export const PrivacyPolicySection = ({ form }: PrivacyPolicySectionProps) => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const handleViewPolicy = () => {
    setShowPolicyModal(true);
  };

  const handleClosePolicy = () => {
    setShowPolicyModal(false);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="acceptPrivacyPolicy"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Aceito a{' '}
                <button
                  type="button"
                  onClick={handleViewPolicy}
                  className="text-olimpics-green-primary hover:underline font-medium"
                >
                  política de privacidade
                </button>
                {' '}e os termos de uso
              </label>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      {showPolicyModal && (
        <PrivacyPolicySectionModal
          onClose={handleClosePolicy}
        />
      )}
    </>
  );
};
