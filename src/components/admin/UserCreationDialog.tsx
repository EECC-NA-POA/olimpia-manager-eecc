
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserManagement } from '@/hooks/useUserManagement';
import { CreateUserData } from '@/services/userManagementService';

const userCreationSchema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  tipo_documento: z.enum(['CPF', 'RG', 'CNH', 'Passaporte']),
  numero_documento: z.string().min(5, 'Documento deve ter pelo menos 5 caracteres'),
  genero: z.enum(['Masculino', 'Feminino', 'Outro']),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória')
});

type UserCreationFormData = z.infer<typeof userCreationSchema>;

interface UserCreationDialogProps {
  trigger?: React.ReactNode;
}

export function UserCreationDialog({ trigger }: UserCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const { createUser, isCreating } = useUserManagement();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema)
  });

  const onSubmit = async (data: UserCreationFormData) => {
    try {
      await createUser(data as CreateUserData);
      reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                {...register('nome_completo')}
                placeholder="Nome completo do usuário"
              />
              {errors.nome_completo && (
                <p className="text-sm text-red-500">{errors.nome_completo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                {...register('senha')}
                placeholder="Senha do usuário"
              />
              {errors.senha && (
                <p className="text-sm text-red-500">{errors.senha.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...register('telefone')}
                placeholder="(11) 99999-9999"
              />
              {errors.telefone && (
                <p className="text-sm text-red-500">{errors.telefone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Select onValueChange={(value) => setValue('tipo_documento', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="RG">RG</SelectItem>
                  <SelectItem value="CNH">CNH</SelectItem>
                  <SelectItem value="Passaporte">Passaporte</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_documento && (
                <p className="text-sm text-red-500">{errors.tipo_documento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número do Documento</Label>
              <Input
                id="numero_documento"
                {...register('numero_documento')}
                placeholder="000.000.000-00"
              />
              {errors.numero_documento && (
                <p className="text-sm text-red-500">{errors.numero_documento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero">Gênero</Label>
              <Select onValueChange={(value) => setValue('genero', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.genero && (
                <p className="text-sm text-red-500">{errors.genero.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                {...register('data_nascimento')}
              />
              {errors.data_nascimento && (
                <p className="text-sm text-red-500">{errors.data_nascimento.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
