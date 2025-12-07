import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Users, User, LogOut, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RegisteredModality {
  inscricao_id: string;
  modalidade_id: string;
  modalidade_nome: string;
  tipo: string;
  categoria: string;
  status: string;
  data_inscricao: string;
  grupo?: string;
}

interface MyEnrollmentsListProps {
  enrollments: RegisteredModality[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onWithdraw: (inscricaoId: string) => void;
  isWithdrawing: boolean;
  isReadOnly?: boolean;
}

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'confirmada':
    case 'confirmado':
      return 'default';
    case 'pendente':
      return 'secondary';
    case 'cancelada':
    case 'cancelado':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'confirmada':
    case 'confirmado':
      return 'Confirmada';
    case 'pendente':
      return 'Pendente';
    case 'cancelada':
    case 'cancelado':
      return 'Cancelada';
    default:
      return status || 'Desconhecido';
  }
};

const getCategoryLabel = (categoria: string): string => {
  switch (categoria?.toLowerCase()) {
    case 'masculino':
      return 'Masculino';
    case 'feminino':
      return 'Feminino';
    case 'mista':
    case 'misto':
      return 'Mista';
    default:
      return categoria || '';
  }
};

const getTypeIcon = (tipo: string) => {
  return tipo?.toLowerCase() === 'equipe' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />;
};

export function MyEnrollmentsList({
  enrollments,
  isOpen,
  onOpenChange,
  onWithdraw,
  isWithdrawing,
  isReadOnly = false
}: MyEnrollmentsListProps) {
  if (enrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Minhas Inscrições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Você ainda não está inscrito em nenhuma modalidade neste evento.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group enrollments by grupo
  const groupedEnrollments = enrollments.reduce((acc, enrollment) => {
    const group = enrollment.grupo || 'Outras';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(enrollment);
    return acc;
  }, {} as Record<string, RegisteredModality[]>);

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Minhas Inscrições
                <Badge variant="secondary" className="ml-2">
                  {enrollments.length}
                </Badge>
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {Object.entries(groupedEnrollments).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {group}
                </h4>
                <div className="grid gap-3">
                  {items.map((enrollment) => (
                    <div
                      key={enrollment.inscricao_id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getTypeIcon(enrollment.tipo)}
                        </div>
                        <div>
                          <p className="font-medium">{enrollment.modalidade_nome}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{enrollment.tipo === 'equipe' ? 'Equipe' : 'Individual'}</span>
                            {enrollment.categoria && (
                              <>
                                <span>•</span>
                                <span>{getCategoryLabel(enrollment.categoria)}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>
                              {format(new Date(enrollment.data_inscricao), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                          {getStatusLabel(enrollment.status)}
                        </Badge>
                        {!isReadOnly && enrollment.status?.toLowerCase() !== 'cancelada' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onWithdraw(enrollment.inscricao_id)}
                            disabled={isWithdrawing}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
