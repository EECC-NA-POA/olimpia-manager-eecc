
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PhilosopherQuotes } from '@/components/auth/PhilosopherQuotes';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-green-primary to-olimpics-green-secondary relative overflow-hidden">
      {/* Global overlay for entire page */}
      <div className="absolute inset-0 bg-black/20 z-0" />
      
      {/* Decorative background elements for entire page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-olimpics-orange-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-olimpics-orange-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container relative z-10 mx-auto p-6 pt-24">
        {/* Header with logos */}
        <div className="text-center mb-12">
          {/* Enhanced Logos Section */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 group">
                {/* Glow effect for first logo */}
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <a 
                  href="https://www.instagram.com/escola.esporte.coracao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img 
                    src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
                    alt="EECC Logo"
                    className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  />
                </a>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-olimpics-orange-primary/60 rounded-full blur-sm animate-pulse"></div>
              </div>
              <div className="relative w-24 h-24 md:w-32 md:h-32 group">
                {/* Glow effect for second logo */}
                <div className="absolute inset-0 bg-olimpics-orange-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <a 
                  href="https://www.instagram.com/novaacropolebrasilsul"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img 
                    src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
                    alt="Nova Acrópole Logo"
                    className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  />
                </a>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white/40 rounded-full blur-sm animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Title */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-32 bg-gradient-to-r from-olimpics-orange-primary/20 to-white/10 rounded-full blur-3xl"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 relative">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                Areté
              </span>
            </h2>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="group relative">
            {/* Card glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-olimpics-orange-primary/30 to-white/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <Tabs defaultValue="register" className="relative bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl overflow-hidden">
              {/* Tabs background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(238,126,1,0.3),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,155,64,0.3),transparent_50%)]"></div>
              </div>

              <TabsList className="relative grid w-full grid-cols-2 bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary backdrop-blur-sm border-0 rounded-t-3xl">
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-white/95 data-[state=active]:text-olimpics-green-primary text-white hover:bg-white/10 rounded-tl-3xl font-semibold"
                >
                  Cadastre-se
                </TabsTrigger>
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-white/95 data-[state=active]:text-olimpics-green-primary text-white hover:bg-white/10 rounded-tr-3xl font-semibold"
                >
                  Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="register" className="relative space-y-4 p-8">
                <SignUpForm />
              </TabsContent>

              <TabsContent value="login" className="relative space-y-4 p-8">
                <LoginForm />
                <div className="mt-8">
                  <PhilosopherQuotes />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
