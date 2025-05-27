
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';
import { BateriaScore } from './types';

interface BateriaScoreItemProps {
  bateria: { id: number; numero: number };
  score?: BateriaScore;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  onSave: (scoreId: number, values: any) => void;
  isPending: boolean;
}

export function BateriaScoreItem({ bateria, score, scoreType, onSave, isPending }: BateriaScoreItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});

  const formatScoreDisplay = (score: BateriaScore) => {
    if (scoreType === 'tempo') {
      // Convert milliseconds back to readable format
      const totalMs = score.valor_pontuacao || 0;
      const minutes = Math.floor(totalMs / 60000);
      const seconds = Math.floor((totalMs % 60000) / 1000);
      const ms = totalMs % 1000;
      
      if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
      } else {
        return `${seconds}.${ms.toString().padStart(3, '0')}s`;
      }
    } else if (scoreType === 'distancia') {
      const value = score.valor_pontuacao || 0;
      return `${value.toFixed(2)}m`;
    } else {
      return score.valor_pontuacao ? `${score.valor_pontuacao} ${score.unidade}` : 'Não registrado';
    }
  };

  const getScoreInputField = (score: BateriaScore) => {
    if (scoreType === 'tempo') {
      // For time, show the raw milliseconds value for editing
      return (
        <Input
          type="number"
          placeholder="Milissegundos"
          value={editValues.valor_pontuacao}
          onChange={(e) => setEditValues(prev => ({ ...prev, valor_pontuacao: Number(e.target.value) }))}
          className="w-24 h-8"
        />
      );
    } else {
      return (
        <Input
          type="number"
          step="0.01"
          placeholder="Valor"
          value={editValues.valor_pontuacao}
          onChange={(e) => setEditValues(prev => ({ ...prev, valor_pontuacao: Number(e.target.value) }))}
          className="w-20 h-8"
        />
      );
    }
  };

  const handleEdit = (currentScore: BateriaScore) => {
    setIsEditing(true);
    setEditValues({
      valor_pontuacao: currentScore.valor_pontuacao || '',
      observacoes: currentScore.observacoes || ''
    });
  };

  const handleSave = () => {
    if (!score) return;
    
    const cleanedValues = { ...editValues };
    
    // Convert empty strings to null for numeric fields
    if (cleanedValues.valor_pontuacao === '') cleanedValues.valor_pontuacao = null;
    if (cleanedValues.observacoes === '') cleanedValues.observacoes = null;
    
    onSave(score.id, cleanedValues);
    setIsEditing(false);
    setEditValues({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  if (!score) {
    return (
      <div className="flex items-center justify-between p-2 border rounded bg-gray-50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">Bateria {bateria.numero}</Badge>
          <span className="text-sm text-gray-500">Não registrado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 border rounded bg-white">
      <div className="flex items-center gap-2 flex-1">
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Bateria {bateria.numero}
        </Badge>
        {!isEditing ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{formatScoreDisplay(score)}</span>
            {score.observacoes && (
              <span className="text-xs text-gray-500">{score.observacoes}</span>
            )}
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {getScoreInputField(score)}
            <Input
              placeholder="Observações"
              value={editValues.observacoes}
              onChange={(e) => setEditValues(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-24 h-8 text-xs"
            />
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        {!isEditing ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(score)}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isPending}
              className="h-6 w-6 p-0"
            >
              <Save className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
