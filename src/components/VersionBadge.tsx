import { useState } from 'react';
import { Info } from 'lucide-react';
import { getFullVersionInfo } from '@/lib/version';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const VersionBadge = () => {
  const versionInfo = getFullVersionInfo();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={showDetails} onOpenChange={setShowDetails}>
        <TooltipTrigger asChild>
          <button 
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="w-3 h-3" />
            {versionInfo.displayVersion}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs space-y-1">
            <p><strong>Versão:</strong> {versionInfo.version}</p>
            <p><strong>Commit:</strong> {versionInfo.commitHash}</p>
            <p><strong>Build:</strong> {new Date(versionInfo.buildTime).toLocaleString('pt-BR')}</p>
            <p><strong>Ambiente:</strong> {versionInfo.environment}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
