import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { AlertCircle, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(50, 'A senha deve ter no máximo 50 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isProcessingToken, setIsProcessingToken] = React.useState(false);

  const fromProfile = location.state?.fromProfile;

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const checkSession = async () => {
      try {
        // Check if there are recovery parameters in the URL
        const params = new URLSearchParams(location.search);
        const recoveryType = params.get('type');
        const hasToken = params.has('token');
        const hasCode = params.has('code');
        const code = params.get('code');

        console.log('🔐 ResetPassword: Checking session...', { 
          recoveryType, 
          hasToken, 
          hasCode,
          fromProfile 
        });

        // Se houver CODE (PKCE flow), processar de forma diferente
        if (hasCode && code) {
          console.log('🔐 PKCE code detected, exchanging for session...');
          setIsProcessingToken(true);

          try {
            // Trocar o code por uma sessão
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('❌ Erro ao trocar code por sessão:', error);
              if (mounted) {
                setError('Link de recuperação inválido ou expirado. Por favor, solicite um novo link.');
                setIsProcessingToken(false);
              }
              return;
            }
            
            if (data.session) {
              console.log('✅ Sessão estabelecida com sucesso via PKCE');
              if (mounted) {
                setIsProcessingToken(false);
              }
            }
          } catch (err) {
            console.error('❌ Erro ao processar code:', err);
            if (mounted) {
              setError('Erro ao processar link de recuperação. Por favor, tente novamente.');
              setIsProcessingToken(false);
            }
          }
          return; // Não continuar com a verificação normal
        }

        // If this is a recovery link with TOKEN (legacy), wait for Supabase to process the token
        if (recoveryType === 'recovery' && hasToken && !hasCode) {
          console.log('🔗 Recovery token detected, waiting for Supabase to process...');
          setIsProcessingToken(true);

          // Set up auth state listener to detect when session is established
          authSubscription = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth state changed:', event, 'Session:', !!session);
            
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
              console.log('✅ Recovery session established');
              if (mounted) {
                setIsProcessingToken(false);
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('🔄 Token refreshed');
            }
          });

          // Also check current session after a short delay to allow Supabase to process
          setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('⏰ Delayed session check:', !!session);
            if (mounted && session) {
              setIsProcessingToken(false);
            }
          }, 1000);

          return; // Don't check session yet, let Supabase process the token
        }

        // Normal session check (not a recovery link)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session check error:', sessionError);
          if (mounted) {
            setError('Erro ao verificar sessão');
            navigate('/');
          }
          return;
        }

        // Only redirect if: no session, not from profile, and not a recovery link
        if (!session && !fromProfile && recoveryType !== 'recovery') {
          console.log('⚠️ No session found and not a recovery link, redirecting to index');
          if (mounted) {
            navigate('/');
          }
        } else {
          console.log('✅ Valid session or recovery link, staying on page');
        }
      } catch (err) {
        console.error('❌ Session check failed:', err);
        if (mounted && !location.search.includes('type=recovery')) {
          navigate('/');
        }
      }
    };

    checkSession();
    
    return () => {
      mounted = false;
      if (authSubscription?.subscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, [navigate, fromProfile, location.search]);

  const handleBack = () => {
    if (fromProfile) {
      navigate('/athlete-profile');
    } else {
      navigate('/');
    }
  };

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Starting password update process...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Erro ao verificar sessão. Por favor, faça login novamente.');
      }

      if (!session?.access_token) {
        console.error('No valid session found');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        // Check for the specific error code
        if (updateError.message && typeof updateError.message === 'string') {
          try {
            const errorBody = JSON.parse(updateError.message);
            if (errorBody.code === 'same_password') {
              throw new Error('Nova senha deve ser diferente da antiga.');
            }
          } catch {
            // If we can't parse the error message, check if it includes the error text
            if (updateError.message.includes('same_password')) {
              throw new Error('Nova senha deve ser diferente da antiga.');
            }
          }
        }
        throw new Error(updateError.message || 'Erro ao atualizar senha');
      }

      console.log('Password updated successfully');

      toast.success('Senha alterada com sucesso! Faça login novamente.', {
        duration: 3000,
      });

      // Fazer logout e redirecionar para login
      await signOut();

      // Pequeno delay para garantir que o logout complete
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 500);
      
    } catch (error: any) {
      console.error('Password update failed:', error);
      setError(error?.message || 'Erro ao atualizar senha. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while processing recovery token
  if (isProcessingToken) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-olimpics-green-primary animate-spin" />
            <h1 className="text-2xl font-bold">Processando link de recuperação...</h1>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto validamos seu link de recuperação de senha...
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Processando código de segurança
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Lock className="h-8 w-8 text-olimpics-green-primary" />
          <h1 className="text-2xl font-bold">
            {fromProfile ? 'Alterar Senha' : 'Redefinir Senha'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>

        {error && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            {error.includes('inválido ou expirado') && (
              <Button
                variant="outline"
                onClick={() => navigate('/forgot-password')}
                className="w-full"
              >
                Solicitar novo link de recuperação
              </Button>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Senha Atualizada!...' : 'Atualizar Senha'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
