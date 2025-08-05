import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface UserTypesSummaryProps {
  users: Array<{ tipo_cadastro: string }>;
}

export function UserTypesSummary({ users }: UserTypesSummaryProps) {
  const counts = {
    completo: users.filter(u => u.tipo_cadastro === 'Completo').length,
    apenasUsuario: users.filter(u => u.tipo_cadastro === 'Apenas Usuário').length,
    apenasAuth: users.filter(u => u.tipo_cadastro === 'Apenas Auth').length,
    outros: users.filter(u => !['Completo', 'Apenas Usuário', 'Apenas Auth'].includes(u.tipo_cadastro)).length
  };

  const total = users.length;

  if (total === 0) return null;

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-muted-foreground">
            Total: {total} usuários
          </span>
          
          {counts.completo > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-olimpics-green-primary text-white">
                ✓ Completo
              </Badge>
              <span className="text-muted-foreground">{counts.completo}</span>
            </div>
          )}
          
          {counts.apenasUsuario > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500 text-white">
                👤 Apenas Usuário
              </Badge>
              <span className="text-muted-foreground">{counts.apenasUsuario}</span>
            </div>
          )}
          
          {counts.apenasAuth > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-olimpics-orange-primary text-olimpics-orange-primary">
                🔑 Apenas Auth
              </Badge>
              <span className="text-muted-foreground">{counts.apenasAuth}</span>
            </div>
          )}
          
          {counts.outros > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                ❌ Outros
              </Badge>
              <span className="text-muted-foreground">{counts.outros}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}