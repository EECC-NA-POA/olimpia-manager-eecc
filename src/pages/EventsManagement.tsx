
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EventForm } from '@/components/events/EventForm';
import { useAdminAccess } from '@/hooks/useAdminAccess';

export default function EventsManagement() {
  const { isAdmin } = useAdminAccess();

  if (!isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-olimpics-text">
          Cadastro de Eventos
        </h1>
      </div>

      <Card className="border-olimpics-green-primary/20">
        <CardHeader className="bg-olimpics-green-primary/5">
          <CardTitle className="text-olimpics-green-primary text-xl">
            Novo Evento
          </CardTitle>
          <CardDescription className="mt-1.5">
            Preencha as informações abaixo para cadastrar um novo evento.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}
