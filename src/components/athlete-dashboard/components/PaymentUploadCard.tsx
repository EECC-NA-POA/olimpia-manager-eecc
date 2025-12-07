import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, AlertCircle, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AthletePaymentStatus } from '../hooks/useAthletePaymentStatus';
import { useQueryClient } from '@tanstack/react-query';

interface PaymentUploadCardProps {
  userId: string;
  eventId: string;
  paymentStatus: AthletePaymentStatus | null | undefined;
  taxaInscricaoId?: number;
}

export function PaymentUploadCard({ userId, eventId, paymentStatus, taxaInscricaoId }: PaymentUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Don't show if already confirmed or exempt
  if (paymentStatus?.status_pagamento === 'confirmado' || paymentStatus?.isento) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato inválido. Use JPG, PNG, WebP ou PDF.');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo primeiro.');
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}_${eventId}_${Date.now()}.${fileExt}`;
      const filePath = `comprovantes/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('pagamentos')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro ao fazer upload do arquivo.');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('pagamentos')
        .getPublicUrl(filePath);

      // Update or create payment record
      const { data: existingPayment, error: checkError } = await supabase
        .from('pagamentos')
        .select('id')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();

      if (checkError) {
        console.error('Check error:', checkError);
      }

      if (existingPayment) {
        // Update existing payment
        const { error: updateError } = await supabase
          .from('pagamentos')
          .update({ 
            comprovante_url: urlData.publicUrl,
            status: 'pendente'
          })
          .eq('id', existingPayment.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error('Erro ao atualizar pagamento.');
        }
      } else if (taxaInscricaoId) {
        // Create new payment record
        const { error: insertError } = await supabase
          .from('pagamentos')
          .insert({
            atleta_id: userId,
            evento_id: eventId,
            taxa_inscricao_id: taxaInscricaoId,
            comprovante_url: urlData.publicUrl,
            status: 'pendente',
            valor: paymentStatus?.valor_taxa || 0,
            isento: false,
            numero_identificador: `PAG-${Date.now()}`,
            data_criacao: new Date().toISOString()
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error('Erro ao registrar pagamento.');
        }
      }

      toast.success('Comprovante enviado com sucesso! Aguarde a validação.');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh payment status
      queryClient.invalidateQueries({ queryKey: ['athlete-payment-status', userId, eventId] });

    } catch (error: any) {
      console.error('Payment upload error:', error);
      toast.error(error.message || 'Erro ao enviar comprovante.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10 shadow-sm">
      <CardHeader className="pb-2 px-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
          <CreditCard className="h-5 w-5" />
          Pagamento Pendente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <Alert className="bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
          <AlertCircle className="h-4 w-4 text-yellow-700 dark:text-yellow-500" />
          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-400">
            Para se inscrever nas modalidades, é necessário <strong>enviar o comprovante de pagamento</strong> da taxa de inscrição.
          </AlertDescription>
        </Alert>

        {/* Payment Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Taxa de Inscrição</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(paymentStatus?.valor_taxa)}
            </p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            {paymentStatus?.status_pagamento === 'pendente' ? 'Aguardando Comprovante' : 'Pendente'}
          </Badge>
        </div>

        {/* Upload Section */}
        <div className="space-y-3">
          <Label htmlFor="comprovante" className="text-sm font-medium">
            Enviar Comprovante de Pagamento
          </Label>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                ref={fileInputRef}
                id="comprovante"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="shrink-0"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileImage className="h-4 w-4" />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Formatos aceitos: JPG, PNG, WebP ou PDF (máx. 5MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
