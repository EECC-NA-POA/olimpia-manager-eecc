
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface EmptyStateProps {
  isLoading?: boolean;
}

export function EmptyState({ isLoading = false }: EmptyStateProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Carregando campos calculados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum campo calculado configurado para esta modalidade.</p>
          <p className="text-sm mt-1">Configure campos de colocação no modelo da modalidade.</p>
        </div>
      </CardContent>
    </Card>
  );
}
