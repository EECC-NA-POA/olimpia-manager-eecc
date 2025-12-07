
import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, BookOpen, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/lib/types/database";

interface EventSummaryCardProps {
  event: Event;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = parseISO(dateString);
  if (!isValid(date)) return null;
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'ativo':
      return 'default';
    case 'encerrado':
    case 'suspenso':
      return 'destructive';
    case 'em_teste':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'ativo':
      return 'Ativo';
    case 'encerrado':
      return 'Encerrado';
    case 'suspenso':
      return 'Suspenso';
    case 'em_teste':
      return 'Em Teste';
    default:
      return status;
  }
};

export const EventSummaryCard = ({ event }: EventSummaryCardProps) => {
  const startDate = formatDate(event.data_inicio_evento);
  const endDate = formatDate(event.data_fim_evento);
  const registrationEndDate = formatDate(event.data_fim_inscricao);
  
  const location = [event.cidade, event.estado, event.pais]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="border-olimpics-green-primary/20 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-olimpics-green-primary/10 to-olimpics-green-secondary/10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-olimpics-green-primary">
              {event.nome}
            </CardTitle>
            <Badge 
              variant={getStatusBadgeVariant(event.status_evento)} 
              className="mt-2"
            >
              {getStatusLabel(event.status_evento)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Dates */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-olimpics-green-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            {startDate && (
              <p className="text-sm font-medium text-foreground">
                {startDate}
                {endDate && startDate !== endDate && ` até ${endDate}`}
              </p>
            )}
            {registrationEndDate && (
              <p className="text-xs text-muted-foreground">
                Inscrições até {registrationEndDate}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-olimpics-green-primary flex-shrink-0" />
            <p className="text-sm text-foreground">{location}</p>
          </div>
        )}

        {/* Description */}
        {event.descricao && (
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-olimpics-green-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground line-clamp-3">
              {event.descricao}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/regulamento">
              <BookOpen className="h-4 w-4 mr-2" />
              Ver Regulamento
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cronograma">
              <Calendar className="h-4 w-4 mr-2" />
              Ver Cronograma
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
