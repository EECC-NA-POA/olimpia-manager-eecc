
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function VideoSection() {
  const [isVideoVisible, setIsVideoVisible] = useState(true);

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ease-in-out ${isVideoVisible ? 'h-[500px] opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/OSHPBjTutP4?si=LKjz9U5obrt8f9ZI"
            title="Cronograma Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVideoVisible(!isVideoVisible)}
              className="absolute top-2 right-2 gap-2 bg-olimpics-green-primary text-white hover:bg-olimpics-green-secondary transition-colors font-medium"
            >
              {isVideoVisible ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ocultar vídeo
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Mostrar vídeo
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoVisible ? 'Clique para ocultar o vídeo' : 'Clique para mostrar o vídeo'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
