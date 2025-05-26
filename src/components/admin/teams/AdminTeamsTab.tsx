
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JudgeTeamsTab } from '../../judge/scoring/JudgeTeamsTab';
import { ManagementTeamsTab } from '../../management/teams/ManagementTeamsTab';

interface AdminTeamsTabProps {
  userId: string;
  eventId: string | null;
}

export function AdminTeamsTab({ userId, eventId }: AdminTeamsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-olimpics-green-primary">
            Administração de Equipes
          </h2>
          <p className="text-muted-foreground">
            Acesso completo para gerenciamento e pontuação de equipes
          </p>
        </div>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">
            Gerenciar Equipes
          </TabsTrigger>
          <TabsTrigger value="score">
            Pontuar Equipes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage">
          <ManagementTeamsTab
            userId={userId}
            eventId={eventId}
            isOrganizer={true}
          />
        </TabsContent>
        
        <TabsContent value="score">
          <JudgeTeamsTab
            userId={userId}
            eventId={eventId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
