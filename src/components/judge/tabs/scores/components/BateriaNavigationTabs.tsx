
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Trophy, Target, Edit2, Check, X } from 'lucide-react';
import { DynamicBateria } from '../hooks/useDynamicBaterias';

interface BateriaNavigationTabsProps {
  regularBaterias: DynamicBateria[];
  finalBateria?: DynamicBateria;
  selectedBateriaId: number | null;
  onSelectBateria: (id: number) => void;
  onCreateNewBateria: () => void;
  onCreateFinalBateria: () => void;
  onEditBateria: (bateriaId: number, novoNumero: number) => void;
  hasFinalBateria: boolean;
  isCreating: boolean;
  isEditing: boolean;
  usesBaterias: boolean;
}

export function BateriaNavigationTabs({
  regularBaterias,
  finalBateria,
  selectedBateriaId,
  onSelectBateria,
  onCreateNewBateria,
  onCreateFinalBateria,
  onEditBateria,
  hasFinalBateria,
  isCreating,
  isEditing,
  usesBaterias
}: BateriaNavigationTabsProps) {
  const [editingBateriaId, setEditingBateriaId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (!usesBaterias) return null;

  const handleStartEdit = (bateria: DynamicBateria) => {
    setEditingBateriaId(bateria.id);
    setEditValue(bateria.numero.toString());
  };

  const handleSaveEdit = () => {
    if (editingBateriaId && editValue) {
      const novoNumero = parseInt(editValue);
      if (novoNumero > 0) {
        onEditBateria(editingBateriaId, novoNumero);
        setEditingBateriaId(null);
        setEditValue('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBateriaId(null);
    setEditValue('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Gerenciamento de Baterias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Regular Baterias */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Baterias Regulares</div>
            <div className="flex flex-wrap gap-2">
              {regularBaterias.map((bateria) => (
                <div key={bateria.id} className="flex items-center gap-1">
                  {editingBateriaId === bateria.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 h-8"
                        min="1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveEdit}
                        disabled={isEditing}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant={selectedBateriaId === bateria.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelectBateria(bateria.id)}
                      >
                        Bateria {bateria.numero}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(bateria)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateNewBateria}
                disabled={isCreating}
                className="border-dashed"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Bateria
              </Button>
            </div>
          </div>

          {/* Final Bateria */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Bateria Final</div>
            <div className="flex gap-2">
              {finalBateria ? (
                <Button
                  variant={selectedBateriaId === finalBateria.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectBateria(finalBateria.id)}
                  className="bg-gold/10 border-gold text-gold-foreground"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Bateria Final
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateFinalBateria}
                  disabled={isCreating || regularBaterias.length === 0}
                  className="border-dashed border-gold text-gold"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Criar Bateria Final
                </Button>
              )}
            </div>
            {regularBaterias.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Crie pelo menos uma bateria regular antes da final
              </p>
            )}
          </div>

          {/* Current Selection Info */}
          {selectedBateriaId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {regularBaterias.find(b => b.id === selectedBateriaId) 
                    ? `Bateria ${regularBaterias.find(b => b.id === selectedBateriaId)?.numero}`
                    : finalBateria?.id === selectedBateriaId 
                    ? 'Bateria Final'
                    : 'Bateria Selecionada'
                  }
                </Badge>
                <span className="text-sm text-blue-700">
                  {finalBateria?.id === selectedBateriaId 
                    ? 'Determine os ganhadores finais'
                    : 'Registre as pontuações desta bateria'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
