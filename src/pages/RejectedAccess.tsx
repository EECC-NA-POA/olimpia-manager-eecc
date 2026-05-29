import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RejectedAccess() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-red text-center">
            Acesso Negado
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            Seu cadastro foi rejeitado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-olimpics-red" />
          </div>
          <p className="text-center text-sm text-gray-600">
            Infelizmente seu cadastro não foi aprovado.
            Entre em contato com os organizadores para mais informações.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="w-full"
          >
            Voltar para a Tela Inicial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}