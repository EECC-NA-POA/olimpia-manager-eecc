import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, ExternalLink, MessageCircle, Copy, CheckCircle2 } from 'lucide-react';
import { AthletePaymentStatus } from '../hooks/useAthletePaymentStatus';
import { toast } from 'sonner';

interface PaymentUploadCardProps {
  userId: string;
  eventId: string;
  paymentStatus: AthletePaymentStatus | null | undefined;
  taxaInscricaoId?: number;
}

export function PaymentUploadCard({ paymentStatus }: PaymentUploadCardProps) {
  const [copied, setCopied] = React.useState(false);

  // Don't show if already confirmed or exempt
  if (paymentStatus?.status_pagamento === 'confirmado' || paymentStatus?.isento) {
    return null;
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPhoneForWhatsApp = (phone: string | null | undefined): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('55')) return cleaned;
    return `55${cleaned}`;
  };

  const handleCopyPix = async () => {
    if (paymentStatus?.pix_key) {
      try {
        await navigator.clipboard.writeText(paymentStatus.pix_key);
        setCopied(true);
        toast.success('Chave PIX copiada!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Erro ao copiar');
      }
    }
  };

  const handleOpenForm = () => {
    if (paymentStatus?.link_formulario) {
      window.open(paymentStatus.link_formulario, '_blank');
    }
  };

  const hasFormLink = !!paymentStatus?.link_formulario;

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
            Para se inscrever nas modalidades, é necessário <strong>enviar o comprovante de pagamento</strong> da taxa de inscrição através do formulário.
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
            Aguardando Comprovante
          </Badge>
        </div>

        {/* PIX Info */}
        {paymentStatus?.pix_key && (
          <div className="p-3 rounded-lg bg-background border border-border/50 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Chave PIX</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted px-2 py-1 rounded truncate">
                {paymentStatus.pix_key}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyPix}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* QR Code */}
        {paymentStatus?.qr_code_image && (
          <div className="flex justify-center p-3 rounded-lg bg-background border border-border/50">
            <img 
              src={paymentStatus.qr_code_image} 
              alt="QR Code PIX" 
              className="max-w-[180px] rounded"
            />
          </div>
        )}

        {/* Submit Button */}
        {hasFormLink ? (
          <Button 
            onClick={handleOpenForm}
            className="w-full bg-olimpics-orange-primary hover:bg-olimpics-orange-secondary"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Enviar Comprovante de Pagamento
          </Button>
        ) : (
          <Alert className="bg-muted border-border">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              O link para envio do comprovante ainda não está disponível. Entre em contato com a organização.
            </AlertDescription>
          </Alert>
        )}

        {/* Contact Info */}
        {paymentStatus?.contato_telefone && (
          <div className="pt-2 border-t border-border/50">
            <a
              href={`https://wa.me/${formatPhoneForWhatsApp(paymentStatus.contato_telefone)}?text=Olá! Tenho uma dúvida sobre o pagamento da taxa de inscrição.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>Dúvidas? Fale com {paymentStatus.contato_nome || 'a organização'}</span>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
