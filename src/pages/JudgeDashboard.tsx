
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

export default function JudgeDashboard() {
  const { user, currentEventId } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scores');

  // Check if the user has judge or delegation privileges
  const { data: userAccess, isLoading: isCheckingRole } = useQuery({
    queryKey: ['userAccess', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isJudge: false, isDelegation: false };
      
      // Check if user has the judge role (JUZ) or delegation role (RDD)
      const hasJudgeRole = user.papeis?.some(role => role.codigo === 'JUZ') || false;
      const hasDelegationRole = user.papeis?.some(role => role.codigo === 'RDD') || false;
      
      if (!hasJudgeRole && !hasDelegationRole) {
        return { isJudge: false, isDelegation: false };
      }
      
      return { isJudge: hasJudgeRole, isDelegation: hasDelegationRole };
    },
    enabled: !!user?.id,
  });

  // Redirect if not a judge or delegation user
  React.useEffect(() => {
    if (!isCheckingRole && !userAccess?.isJudge && !userAccess?.isDelegation && user) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/');
    }
  }, [userAccess, isCheckingRole, user, navigate]);

  // Set default tab based on user role
  React.useEffect(() => {
    if (userAccess?.isJudge && !userAccess?.isDelegation) {
      setActiveTab('scores');
    } else if (userAccess?.isDelegation) {
      setActiveTab('teams');
    }
  }, [userAccess]);

  if (isCheckingRole) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Painel do Juiz</h1>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!userAccess?.isJudge && !userAccess?.isDelegation || !user) {
    return null; // Will redirect in the useEffect
  }

  // For delegation users, only show teams tab (no scoring)
  if (userAccess.isDelegation && !userAccess.isJudge) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Painel da Delegação</h1>
        <TeamsTab userId={user.id} eventId={currentEventId} />
      </div>
    );
  }

  // For judges, show both tabs but with proper restrictions
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel do Juiz</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="scores">Pontuações Individuais</TabsTrigger>
          <TabsTrigger value="teams">Pontuar Equipes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="mt-6">
          <ScoresTab userId={user.id} eventId={currentEventId} />
        </TabsContent>
        
        <TabsContent value="teams" className="mt-6">
          <TeamsTab userId={user.id} eventId={currentEventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
