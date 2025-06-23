
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { Profile } from '../types';

interface ProfilesTableProps {
  profiles: Profile[];
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: number) => void;
  isDeleting: boolean;
}

export function ProfilesTable({ profiles, onEditProfile, onDeleteProfile, isDeleting }: ProfilesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Taxa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => {
          const fee = profile.taxas_inscricao?.[0];
          return (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">{profile.nome}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {profile.perfis_tipo.descricao || profile.perfis_tipo.codigo}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {profile.descricao || '-'}
              </TableCell>
              <TableCell>
                {fee?.isento ? (
                  <Badge variant="secondary">Isento</Badge>
                ) : (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    R$ {fee?.valor?.toFixed(2) || '0,00'}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {fee?.mostra_card ? (
                  <Badge variant="default">Visível</Badge>
                ) : (
                  <Badge variant="secondary">Oculto</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditProfile(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteProfile(profile.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
