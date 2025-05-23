
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Users } from 'lucide-react';

interface NoTeamsMessageProps {
  isOrganizer?: boolean;
}

export function NoTeamsMessage({ isOrganizer = false }: NoTeamsMessageProps) {
  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">Nenhuma equipe cadastrada</CardTitle>
        <CardDescription>
          {isOrganizer 
            ? "Ainda não há equipes formadas pelos representantes de delegação para esta modalidade."
            : "Você ainda não criou nenhuma equipe para esta modalidade."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          {isOrganizer 
            ? "As equipes serão exibidas aqui quando os representantes de delegação as criarem."
            : "Use o formulário acima para criar sua primeira equipe e começar a adicionar atletas."
          }
        </p>
      </CardContent>
    </Card>
  );
}
