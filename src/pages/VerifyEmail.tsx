import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  
  // Get email from either search params or location state
  const email = searchParams.get('email') || (location.state as any)?.email;

  useEffect(() => {
    // Check if this is a redirect back from email verification
    const token = searchParams.get('token');
    if (token) {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    try {
      setIsResending(true);
      await resendVerificationEmail(email);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            Verifique seu Email
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            Enviamos um link de verificação para seu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-olimpics-green-primary" />
          </div>
          <p className="text-center text-sm text-gray-600">
            Por favor, verifique sua caixa de entrada e clique no link de verificação.
            {email && <span className="block font-medium mt-2">{email}</span>}
          </p>
          {email && (
            <Button
              onClick={handleResendEmail}
              className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                'Reenviar Email'
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Voltar para a Tela Inicial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}