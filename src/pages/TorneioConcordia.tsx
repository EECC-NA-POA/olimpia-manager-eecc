import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ConcordiaHeaderTitle } from '@/components/concordia/ConcordiaHeaderTitle';
import { ConcordiaEventInfo } from '@/components/concordia/ConcordiaEventInfo';
import { ConcordiaModalities } from '@/components/concordia/ConcordiaModalities';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import concordiaBanner from '@/assets/concordia-banner.jpg';

const TorneioConcordia = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');

  // Redirect authenticated users to main page
  if (user) {
    return <Navigate to="/" replace />;
  }

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
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      <div className="container relative mx-auto p-6 pt-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Event Information */}
          <div className="space-y-8">
            <ConcordiaHeaderTitle />
            <ConcordiaEventInfo />
            <ConcordiaModalities />
            
            {/* Call to Action */}
            <div className="text-center p-6 bg-gradient-to-r from-[#7CB342]/10 to-[#7E57C2]/10 rounded-lg border border-[#7CB342]/20">
              <p className="text-lg text-gray-700 font-medium">
                Faça seu cadastro ou login para se inscrever no Torneio Concórdia! →
              </p>
            </div>
          </div>

          {/* Right Column - Login/Register */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border border-gray-200">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7CB342] data-[state=active]:to-[#7CB342]/80 data-[state=active]:text-white text-gray-700 hover:bg-gray-100"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7E57C2] data-[state=active]:to-[#7E57C2]/80 data-[state=active]:text-white text-gray-700 hover:bg-gray-100"
                >
                  Cadastre-se
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardContent className="pt-6">
                    <LoginForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register" className="mt-4">
                <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardContent className="pt-6">
                    <SignUpForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorneioConcordia;
