import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserManagement } from '@/hooks/useUserManagement';
import { CreateUserData } from '@/services/userManagementService';
import { toast } from 'sonner';

const userCreationSchema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  tipo_documento: z.literal('CPF'),
  numero_documento: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido'),
  genero: z.enum(['Masculino', 'Feminino', 'Outro']),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória')
});

type UserCreationFormData = z.infer<typeof userCreationSchema>;

interface UserCreationDialogProps {
  trigger?: React.ReactNode;
}

// Função para gerar senha aleatória
const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function UserCreationDialog({ trigger }: UserCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const { createUser, isCreating } = useUserManagement();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      tipo_documento: 'CPF',
      senha: generateRandomPassword()
    }
  });

  const senha = watch('senha');

  // Gerar nova senha aleatória
  const handleGenerateNewPassword = () => {
    const newPassword = generateRandomPassword();
    setValue('senha', newPassword);
    setPasswordCopied(false); // Reset copy status when generating new password
  };

  // Copiar senha para a área de transferência
  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(senha);
      setPasswordCopied(true);
      toast.success('Senha copiada para a área de transferência!');
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setPasswordCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar senha:', error);
      toast.error('Erro ao copiar senha');
    }
  };

  // Gerar senha aleatória quando o diálogo abre
  useEffect(() => {
    if (open) {
      setValue('senha', generateRandomPassword());
    }
  }, [open, setValue]);

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
      setShowPassword(false);
      setPasswordCopied(false);
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
            <div className="space-y-2 md:col-span-2">
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
              <Label>Tipo de Documento</Label>
              <Input
                value="CPF"
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número do CPF</Label>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="senha">Senha (gerada automaticamente)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    {...register('senha')}
                    className="pr-10"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyPassword}
                  className="gap-2"
                >
                  {passwordCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateNewPassword}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Nova Senha
                </Button>
              </div>
              {errors.senha && (
                <p className="text-sm text-red-500">{errors.senha.message}</p>
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
