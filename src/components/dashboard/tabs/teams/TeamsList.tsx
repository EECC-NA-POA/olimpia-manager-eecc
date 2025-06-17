
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';

interface Team {
  id: number;
  nome: string;
  modalidades?: {
    nome: string;
    categoria: string;
  }; // Note: this is a single object, not an array
}

interface TeamsListProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (teamId: number) => void;
}

export function TeamsList({ teams, onEditTeam, onDeleteTeam }: TeamsListProps) {
  if (!teams || teams.length === 0) {
    return (
      <EmptyState 
        title="Nenhuma equipe cadastrada" 
        description="Crie sua primeira equipe utilizando o botão 'Nova Equipe' acima."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Equipes Cadastradas</CardTitle>
        <CardDescription>
          Gerencie as equipes para as modalidades coletivas do seu evento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.nome}</TableCell>
                <TableCell>{team.modalidades?.nome} - {team.modalidades?.categoria}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditTeam(team)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteTeam(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
