
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PhilosopherQuotes } from '@/components/auth/PhilosopherQuotes';
import { useSearchParams } from 'react-router-dom';

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = React.useState<string>(initialTab);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'register' || t === 'login') setActiveTab(t);
  }, [searchParams]);

  return (
    <div 
      className="min-h-screen relative light"
      style={{
        backgroundImage: 'url(/lovable-uploads/0e072ceb-03f9-4f0f-a6d1-7fbea0938c7a.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay para melhor legibilidade */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="container relative mx-auto p-6 pt-24 z-10">
        {/* Header with logos */}
        <div className="text-center mb-8">
          {/* Login page specific logos - only 2 logos */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4 w-full">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <img 
                  src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
                  alt="EECC Logo"
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <img 
                  src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
                  alt="Nova Acrópole Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Areté
            </h2>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border border-white/20">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white text-olimpics-green-primary hover:bg-olimpics-green-primary/10"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-olimpics-green-primary data-[state=active]:text-white text-olimpics-green-primary hover:bg-olimpics-green-primary/10"
            >
              Cadastre-se
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardContent className="pt-6">
                <LoginForm />
              </CardContent>
            </Card>
            <PhilosopherQuotes />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardContent className="pt-6">
                <SignUpForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
