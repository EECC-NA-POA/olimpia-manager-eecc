
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PhilosopherQuotes } from '@/components/auth/PhilosopherQuotes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventLogos } from '@/components/landing/EventLogos';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
      <div className="absolute inset-0 bg-black/40" />
      <div className="container relative z-10 mx-auto p-6 pt-8">
        {/* Header with back button and logos */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-6">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-white/20 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à página inicial
            </Button>
          </div>
          
          <EventLogos />
        </div>

        <Tabs defaultValue="register" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-white data-[state=active]:text-olimpics-green-primary text-white"
            >
              Inscreva-se
            </TabsTrigger>
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-white data-[state=active]:text-olimpics-green-primary text-white"
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
