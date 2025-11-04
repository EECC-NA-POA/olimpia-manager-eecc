import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const branchSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cidade: z.string()
    .trim()
    .min(3, 'Cidade deve ter pelo menos 3 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  estado: z.string()
    .min(2, 'Selecione um estado')
    .max(2, 'Estado inválido')
});

type BranchFormData = z.infer<typeof branchSchema>;

interface NewBranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BranchFormData) => Promise<void>;
  isSaving: boolean;
}

export function NewBranchDialog({ isOpen, onClose, onSave, isSaving }: NewBranchDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      nome: '',
      cidade: '',
      estado: ''
    }
  });

  const estadoValue = watch('estado');

  const onSubmit = async (data: BranchFormData) => {
    await onSave(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Filial</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Filial *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Ex: Filial Centro"
              className={errors.nome ? 'border-destructive' : ''}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input
              id="cidade"
              {...register('cidade')}
              placeholder="Ex: São Paulo"
              className={errors.cidade ? 'border-destructive' : ''}
            />
            {errors.cidade && (
              <p className="text-sm text-destructive">{errors.cidade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado *</Label>
            <Select 
              value={estadoValue} 
              onValueChange={(value) => setValue('estado', value)}
            >
              <SelectTrigger 
                id="estado"
                className={errors.estado ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASIL.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.estado && (
              <p className="text-sm text-destructive">{errors.estado.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
            >
              {isSaving ? 'Criando...' : 'Criar Filial'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
