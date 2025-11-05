import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

export function RegistrationCallToAction() {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg bg-gradient-to-r from-olimpics-orange-primary/10 to-olimpics-green-primary/10 p-6 border border-olimpics-orange-primary/20">
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold text-olimpics-text">
          Pronto para competir?
        </h3>
        <p className="text-sm text-muted-foreground">
          Inscreva-se nas modalidades que deseja participar
        </p>
        <Button 
          onClick={() => navigate('/athlete-registrations')}
          size="lg"
          className="w-full sm:w-auto font-semibold"
        >
          <ClipboardList className="mr-2 h-5 w-5" />
          Clique aqui para se inscrever nas modalidades
        </Button>
      </div>
    </div>
  );
}
