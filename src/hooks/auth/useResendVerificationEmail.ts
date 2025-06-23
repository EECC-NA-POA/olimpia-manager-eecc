
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { toast } from "sonner";

export const useResendVerificationEmail = () => {
  const [loading, setLoading] = useState(false);

  const resendVerificationEmail = useCallback(async (email: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('📧 Resending verification email for:', email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('❌ Resend verification error:', error);
        throw error;
      }

      console.log('✅ Verification email sent successfully');
      toast.success('Email de verificação reenviado com sucesso!');
      
    } catch (error: any) {
      console.error('Resend verification error occurred');
      const errorMessage = handleSupabaseError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { resendVerificationEmail, loading };
};
