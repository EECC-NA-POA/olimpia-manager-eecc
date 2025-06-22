
import { useSignUp } from './auth/useSignUp';
import { useSignIn } from './auth/useSignIn';
import { useSignOut } from './auth/useSignOut';
import { useResendVerificationEmail } from './auth/useResendVerificationEmail';

export const useAuthOperations = () => {
  const { signUp, loading: signUpLoading } = useSignUp();
  const { signIn, loading: signInLoading } = useSignIn();
  const { signOut, loading: signOutLoading } = useSignOut();
  const { resendVerificationEmail, loading: resendLoading } = useResendVerificationEmail();

  const loading = signUpLoading || signInLoading || signOutLoading || resendLoading;

  return {
    signUp,
    signIn,
    signOut,
    resendVerificationEmail,
    loading
  };
};
