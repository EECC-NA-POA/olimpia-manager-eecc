import { Button } from "@/components/ui/button";

const PaymentInfo = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5551995033119", "_blank");
  };

  return (
    <div className="space-y-4 p-4 bg-olimpics-background rounded-lg border border-olimpics-green-primary/20">
      <h3 className="text-lg font-semibold text-olimpics-green-primary">Payment Information</h3>
      
      <div className="grid gap-2 text-olimpics-text">
        <p className="flex items-center gap-2">
          <span className="text-lg">💰</span> Amount: R$ 180,00
        </p>
        <p className="flex items-center gap-2">
          <span className="text-lg">📱</span> PIX: escoladoesporte.napoa@gmail.com
        </p>
        <p className="flex items-center gap-2">
          <span className="text-lg">⏰</span> Deadline: 10/03/2025
        </p>
        <Button
          variant="link"
          className="text-olimpics-orange-primary hover:text-olimpics-orange-secondary flex items-center gap-2 p-0"
          onClick={handleWhatsAppClick}
        >
          <span className="text-lg">📞</span> Contact: Felipe Navarro - (51) 99503-3119
        </Button>
      </div>

      <div className="flex justify-center">
        <img 
          src="/lovable-uploads/2a16c3db-40ff-4888-9796-799bf80f6748.png" 
          alt="PIX QR Code"
          className="w-48 h-48 object-contain"
        />
      </div>
    </div>
  );
};

export default PaymentInfo;