
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface EventVisibilityToggleProps {
  isVisible: boolean;
  onToggle: (checked: boolean) => void;
}

export function EventVisibilityToggle({ isVisible, onToggle }: EventVisibilityToggleProps) {
  return (
    <div className="flex items-center space-x-2 pt-6">
      <Switch 
        id="visibilidade_publica" 
        checked={isVisible}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="visibilidade_publica">Visibilidade Pública</Label>
    </div>
  );
}
