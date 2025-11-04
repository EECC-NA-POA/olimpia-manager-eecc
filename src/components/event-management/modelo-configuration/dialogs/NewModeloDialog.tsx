import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface NewModeloDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { modalidade_id: number; codigo_modelo: string; descricao?: string }) => void;
  eventId: string | null;
  isSaving: boolean;
}

export function NewModeloDialog({ isOpen, onClose, onSave, eventId, isSaving }: NewModeloDialogProps) {
  const [modalidadeId, setModalidadeId] = useState<string>('');
  const [codigoModelo, setCodigoModelo] = useState('');
  const [descricao, setDescricao] = useState('');

  // Fetch modalities for this event
  const { data: modalidades = [] } = useQuery({
    queryKey: ['modalidades', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria')
        .eq('evento_id', eventId)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId && isOpen
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modalidadeId || !codigoModelo) {
      return;
    }

    onSave({
      modalidade_id: parseInt(modalidadeId),
      codigo_modelo: codigoModelo,
      descricao: descricao || undefined
    });
  };

  const handleClose = () => {
    setModalidadeId('');
    setCodigoModelo('');
    setDescricao('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Modelo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modalidade">Modalidade *</Label>
            <Select value={modalidadeId} onValueChange={setModalidadeId}>
              <SelectTrigger id="modalidade">
                <SelectValue placeholder="Selecione uma modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalidades.map((modalidade) => (
                  <SelectItem key={modalidade.id} value={modalidade.id.toString()}>
                    {modalidade.nome} {modalidade.categoria ? `(${modalidade.categoria})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo">Código do Modelo *</Label>
            <Input
              id="codigo"
              value={codigoModelo}
              onChange={(e) => setCodigoModelo(e.target.value)}
              placeholder="Ex: MODELO_100M"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição opcional do modelo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !modalidadeId || !codigoModelo}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
            >
              {isSaving ? 'Criando...' : 'Criar Modelo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
