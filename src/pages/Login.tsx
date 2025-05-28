
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PhilosopherQuotes } from '@/components/auth/PhilosopherQuotes';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
      <div className="container mx-auto p-6 pt-24">
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
