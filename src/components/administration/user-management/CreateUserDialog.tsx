import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserManagement } from '@/hooks/useUserManagement';
import { toast } from 'sonner';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { PhoneInput } from '@/components/auth/form-sections/phone/PhoneInput';
import { LocationSelector } from '@/components/auth/form-sections/location/LocationSelector';

const createUserSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  ddi: z.string().default('+55'),
  telefone: z.string().min(8, 'Telefone inválido'),
  tipo_documento: z.enum(['CPF', 'RG']),
  numero_documento: z.string().min(1, 'Número do documento é obrigatório'),
  genero: z.enum(['Masculino', 'Feminino']),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  state: z.string().min(1, 'Selecione um estado'),
  branchId: z.string().min(1, 'Selecione uma sede'),
  cadastra_eventos: z.boolean().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { createUser, isCreating, checkUserExists } = useUserManagement();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nome_completo: '',
      email: '',
      senha: '',
      ddi: '+55',
      telefone: '',
      tipo_documento: 'CPF',
      numero_documento: '',
      genero: 'Masculino',
      data_nascimento: '',
      state: '',
      branchId: '',
      cadastra_eventos: false,
    },
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    form.setValue('senha', newPassword);
  };

  const handleCopyPassword = async () => {
    const password = form.getValues('senha');
    if (password) {
      await navigator.clipboard.writeText(password);
      setPasswordCopied(true);
      toast.success('Senha copiada para a área de transferência!');
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      // Validate user exists before creating
      await checkUserExists(data.email, data.numero_documento);
      
      // Format phone number with DDI
      const fullPhone = `${data.ddi}${data.telefone}`;
      
      // Create user using the service
      createUser({
        nome_completo: data.nome_completo,
        email: data.email,
        senha: data.senha,
        telefone: fullPhone,
        tipo_documento: data.tipo_documento,
        numero_documento: data.numero_documento,
        genero: data.genero,
        data_nascimento: data.data_nascimento,
        cadastra_eventos: data.cadastra_eventos || false,
      });

      // Reset form and close dialog on success
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    setShowPassword(false);
    setPasswordCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome_completo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="RG">RG</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Documento *</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Gender Section */}
            <FormField
              control={form.control}
              name="genero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecione o Gênero *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Section */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Section */}
            <PhoneInput form={form} />

            {/* Location Section */}
            <LocationSelector form={form} context="admin" />

            {/* Password Section */}
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha *</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyPassword}
                            className={passwordCopied ? "text-green-600" : ""}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePassword}
                    >
                      Gerar Senha Aleatória
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Admin Options */}
            <FormField
              control={form.control}
              name="cadastra_eventos"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Permitir cadastro de eventos
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary">
                {isCreating ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}