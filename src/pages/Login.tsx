
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PhilosopherQuotes } from '@/components/auth/PhilosopherQuotes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
      <div className="container relative mx-auto p-6 pt-8">
        {/* Header with back button and logos */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-6">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="relative z-[60] text-white hover:bg-white/20 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à página inicial
            </Button>
          </div>
          
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
            <h2 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary">
              Areté
            </h2>
          </div>
        </div>

        <Tabs defaultValue="register" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-olimpics-green-primary/90 backdrop-blur-sm border border-white/20">
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-white data-[state=active]:text-olimpics-green-primary text-white hover:bg-white/10"
            >
              Inscreva-se
            </TabsTrigger>
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-white data-[state=active]:text-olimpics-green-primary text-white hover:bg-white/10"
            >
              Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="pt-6">
                <SignUpForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="pt-6">
                <LoginForm />
              </CardContent>
            </Card>
            <PhilosopherQuotes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
