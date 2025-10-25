import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
interface EnrollmentHeaderProps {
  isOpen: boolean;
  registeredModalitiesCount: number;
}
export const EnrollmentHeader = ({
  isOpen,
  registeredModalitiesCount
}: EnrollmentHeaderProps) => <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
    <div className="flex items-center gap-3">
      <UserPlus className="h-6 w-6 text-olimpics-green-primary animate-pulse" />
      <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
        Área de Inscrições
        <span className="text-sm font-normal text-muted-foreground">
          ({registeredModalitiesCount} modalidades)
        </span>
      </CardTitle>
    </div>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm" className="absolute top-2 right-2 gap-2 bg-olimpics-green-primary text-white hover:bg-olimpics-green-secondary transition-colors font-medium">
        {isOpen ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
      </Button>
    </CollapsibleTrigger>
  </CardHeader>;