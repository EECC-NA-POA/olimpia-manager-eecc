
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, CheckCircle } from 'lucide-react';

interface NotificationReadersDialogProps {
  notificationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationReader {
  id: string;
  lido_em: string;
  usuario: {
    nome_completo: string;
    email: string;
    filial: {
      nome: string;
    } | null;
  };
}

export function NotificationReadersDialog({ 
  notificationId, 
  isOpen, 
  onClose 
}: NotificationReadersDialogProps) {
  const { data: readers, isLoading } = useQuery({
    queryKey: ['notification-readers', notificationId],
    queryFn: async () => {
      if (!notificationId) return [];

      console.log('Fetching readers for notification:', notificationId);

      const { data, error } = await supabase
        .from('notificacao_leituras')
        .select(`
          id,
          lido_em,
          usuario:usuarios!usuario_id (
            nome_completo,
            email,
            filial:filiais!filial_id (
              nome
            )
          )
        `)
        .eq('notificacao_id', notificationId)
        .order('lido_em', { ascending: false });

      if (error) {
        console.error('Error fetching notification readers:', error);
        throw error;
      }

      console.log('Notification readers data:', data);
      
      // Transformar os dados para corresponder à interface NotificationReader
      const transformedData: NotificationReader[] = data?.map((item: any) => ({
        id: item.id,
        lido_em: item.lido_em,
        usuario: {
          nome_completo: item.usuario?.nome_completo || 'Nome não disponível',
          email: item.usuario?.email || 'Email não disponível',
          filial: item.usuario?.filial ? { nome: item.usuario.filial.nome } : null
        }
      })) || [];

      return transformedData;
    },
    enabled: !!notificationId && isOpen,
  });

  const { data: notificationInfo } = useQuery({
    queryKey: ['notification-info', notificationId],
    queryFn: async () => {
      if (!notificationId) return null;

      const { data, error } = await supabase
        .from('notificacoes')
        .select('titulo')
        .eq('id', notificationId)
        .single();

      if (error) {
        console.error('Error fetching notification info:', error);
        throw error;
      }

      return data;
    },
    enabled: !!notificationId && isOpen,
  });

  if (!notificationId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-olimpics-orange-primary" />
            Leituras da Notificação
          </DialogTitle>
          {notificationInfo && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Notificação:</strong> {notificationInfo.titulo}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-orange-primary" />
            </div>
          ) : !readers || readers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma leitura ainda</p>
              <p className="text-sm">Esta notificação ainda não foi lida por nenhum usuário.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {readers.length} leitura{readers.length !== 1 ? 's' : ''} registrada{readers.length !== 1 ? 's' : ''}
                </span>
              </div>

              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {readers.map((reader) => (
                    <div
                      key={reader.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {reader.usuario.nome_completo}
                          </h4>
                          {reader.usuario.filial && (
                            <Badge variant="outline" className="text-xs">
                              {reader.usuario.filial.nome}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{reader.usuario.email}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(reader.lido_em), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(reader.lido_em), 'HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
