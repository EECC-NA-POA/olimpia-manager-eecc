
import React from "react";
import { MapPin } from "lucide-react";

interface BranchDisplaySectionProps {
  state?: string;
  branchName?: string;
}

export const BranchDisplaySection = ({ state, branchName }: BranchDisplaySectionProps) => {
  return (
    <div className="p-4 bg-muted/50 rounded-md">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-5 w-5 text-olimpics-green-primary" />
        <h3 className="font-medium">Sua sede</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Estado</p>
          <p className="px-3 py-2 border rounded-md bg-gray-50">{state}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Sede</p>
          <p className="px-3 py-2 border rounded-md bg-gray-50">{branchName}</p>
        </div>
      </div>
    </div>
  );
};
