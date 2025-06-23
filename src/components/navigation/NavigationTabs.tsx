
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MainTabContent } from './tabs/MainTabContent';
import { RolesTabContent } from './tabs/RolesTabContent';
import { AdminTabContent } from './tabs/AdminTabContent';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  isAdmin: boolean;
  isOrganizer: boolean;
  isDelegationRep: boolean;
  isJudge: boolean;
  isAthlete: boolean;
  canManageEvents: boolean;
}

export function NavigationTabs({
  activeTab,
  setActiveTab,
  isAdmin,
  isOrganizer,
  isDelegationRep,
  isJudge,
  isAthlete,
  canManageEvents
}: NavigationTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-olimpics-green-secondary/30 p-0.5 h-auto">
        <TabsTrigger 
          value="main" 
          className="data-[state=active]:bg-olimpics-green-secondary h-9 px-4 text-white data-[state=active]:text-white"
        >
          Principal
        </TabsTrigger>
        
        {(isOrganizer || isDelegationRep || isJudge) && (
          <TabsTrigger 
            value="roles" 
            className="data-[state=active]:bg-olimpics-green-secondary h-9 px-4 text-white data-[state=active]:text-white"
          >
            Funções
          </TabsTrigger>
        )}
        
        {isAdmin && (
          <TabsTrigger 
            value="admin" 
            className="data-[state=active]:bg-olimpics-green-secondary h-9 px-4 text-white data-[state=active]:text-white"
          >
            Admin
          </TabsTrigger>
        )}
      </TabsList>

      <div className="mt-2 mx-1">
        <TabsContent value="main" className="flex flex-wrap gap-1 mt-0">
          <MainTabContent isAthlete={isAthlete} />
        </TabsContent>

        <TabsContent value="roles" className="flex flex-wrap gap-1 mt-0">
          <RolesTabContent 
            isOrganizer={isOrganizer} 
            isDelegationRep={isDelegationRep} 
            isJudge={isJudge} 
          />
        </TabsContent>

        <TabsContent value="admin" className="flex flex-wrap gap-1 mt-0">
          <AdminTabContent isAdmin={isAdmin} canManageEvents={canManageEvents} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
