
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ScoresTab } from '@/components/judge/tabs/ScoresTab';
import { TeamsTab } from '@/components/judge/tabs/TeamsTab';
import { useIsMobile } from '@/hooks/use-mobile';

export default function JudgeDashboard() {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scores');
  const isMobile = useIsMobile();

  // Check if the user has judge privileges
  const { data: isJudge, isLoading: isCheckingRole } = useQuery({
    queryKey: ['isJudge', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Check if user has the judge role (JUZ)
      const hasJudgeRole = user.papeis?.some(role => role.codigo === 'JUZ') || false;
      
      if (!hasJudgeRole) {
        return false;
      }
      
      return true;
    },
    enabled: !!user?.id,
  });

  // Redirect if not a judge
  React.useEffect(() => {
    if (!isCheckingRole && !isJudge && user) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/');
    }
  }, [isJudge, isCheckingRole, user, navigate]);

  if (isCheckingRole) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold">Painel do Juiz</h1>
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-12 w-full" />
          <Skeleton className="h-48 sm:h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isJudge || !user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold">Painel do Juiz</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid grid-cols-2 w-full ${isMobile ? 'h-12' : 'max-w-md h-10'}`}>
          <TabsTrigger 
            value="scores" 
            className={`${isMobile ? 'text-xs px-2' : 'text-sm px-4'}`}
          >
            {isMobile ? 'Pontuações' : 'Pontuações Individuais'}
          </TabsTrigger>
          <TabsTrigger 
            value="teams"
            className={`${isMobile ? 'text-xs px-2' : 'text-sm px-4'}`}
          >
            Equipes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="mt-4 sm:mt-6">
          <ScoresTab userId={user.id} eventId={currentEventId} />
        </TabsContent>
        
        <TabsContent value="teams" className="mt-4 sm:mt-6">
          <TeamsTab userId={user.id} eventId={currentEventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
