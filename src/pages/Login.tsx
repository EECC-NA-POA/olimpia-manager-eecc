
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PhilosopherQuotes } from '@/components/auth/PhilosopherQuotes';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-green-primary to-olimpics-green-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header with logos */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-6">
            <a 
              href="https://www.instagram.com/escola.esporte.coracao"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
                alt="EECC Logo"
                className="h-16 w-16 object-contain animate-pulse cursor-pointer"
              />
            </a>
            <a 
              href="https://www.instagram.com/novaacropolebrasilsul"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
                alt="Nova Acrópole Logo"
                className="h-16 w-16 object-contain cursor-pointer"
              />
            </a>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Areté
          </h2>
        </div>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Cadastre-se</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <SignUpForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <LoginForm />
                <div className="mt-6">
                  <PhilosopherQuotes />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
