
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, Plus, Minus } from 'lucide-react';
import { ModalityRule } from '../../tabs/scores/hooks/useModalityRules';

interface ArcheryScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function ArcheryScoreFields({ form, rule }: ArcheryScoreFieldsProps) {
  const [activePhase, setActivePhase] = useState<'classification' | 'elimination'>('classification');
  const [bulkInput, setBulkInput] = useState('');
  
  const faseClassificacao = rule.parametros?.fase_classificacao || false;
  const faseEliminacao = rule.parametros?.fase_eliminacao || false;
  const numFlechasClassificacao = rule.parametros?.num_flechas_classificacao || 72;
  const setsPorCombate = rule.parametros?.sets_por_combate || 5;
  const flechasPorSet = rule.parametros?.flechas_por_set || 3;
  const pontosVitoriaSet = rule.parametros?.pontos_vitoria_set || 2;
  const pontosEmpateSet = rule.parametros?.pontos_empate_set || 1;
  const pontosParaVencer = rule.parametros?.pontos_para_vencer || 6;
  const shootOff = rule.parametros?.shoot_off || false;

  // Initialize form values based on phase
  useEffect(() => {
    if (faseClassificacao && (!form.getValues('classificationArrows') || form.getValues('classificationArrows').length === 0)) {
      const arrows = Array.from({ length: numFlechasClassificacao }, () => ({ score: 0 }));
      form.setValue('classificationArrows', arrows);
    }
    
    if (faseEliminacao && (!form.getValues('eliminationSets') || form.getValues('eliminationSets').length === 0)) {
      const sets = Array.from({ length: setsPorCombate }, () => ({
        arrows: Array.from({ length: flechasPorSet }, () => ({ score: 0 })),
        total: 0,
        matchPoints: 0
      }));
      form.setValue('eliminationSets', sets);
      form.setValue('totalMatchPoints', 0);
      form.setValue('combatFinished', false);
    }
  }, [form, faseClassificacao, faseEliminacao, numFlechasClassificacao, setsPorCombate, flechasPorSet]);

  const validateArrowScore = (score: number): boolean => {
    return score >= 0 && score <= 10 && Number.isInteger(score);
  };

  const handleBulkArrowInput = () => {
    const scores = bulkInput.split(/[,\s\n]+/).map(s => s.trim()).filter(s => s !== '');
    const arrows = scores.slice(0, numFlechasClassificacao).map(scoreStr => {
      const score = scoreStr.toLowerCase() === 'miss' ? 0 : parseInt(scoreStr) || 0;
      return { score: validateArrowScore(score) ? score : 0 };
    });
    
    // Fill remaining with zeros if needed
    while (arrows.length < numFlechasClassificacao) {
      arrows.push({ score: 0 });
    }
    
    form.setValue('classificationArrows', arrows);
    setBulkInput('');
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const scores = csv.split(/[,\n]+/).map(s => s.trim()).filter(s => s !== '');
      const arrows = scores.slice(0, numFlechasClassificacao).map(scoreStr => {
        const score = scoreStr.toLowerCase() === 'miss' ? 0 : parseInt(scoreStr) || 0;
        return { score: validateArrowScore(score) ? score : 0 };
      });
      
      while (arrows.length < numFlechasClassificacao) {
        arrows.push({ score: 0 });
      }
      
      form.setValue('classificationArrows', arrows);
    };
    reader.readAsText(file);
  };

  const calculateSetTotal = (setIndex: number) => {
    const sets = form.getValues('eliminationSets') || [];
    const currentSet = sets[setIndex];
    if (!currentSet) return 0;
    
    return currentSet.arrows.reduce((total: number, arrow: any) => total + (arrow.score || 0), 0);
  };

  const updateMatchPoints = () => {
    const sets = form.getValues('eliminationSets') || [];
    let totalMatchPoints = 0;
    let opponentMatchPoints = 0; // This would come from opponent's form in real implementation
    
    sets.forEach((set: any, index: number) => {
      const setTotal = calculateSetTotal(index);
      const opponentTotal = 0; // Would be calculated from opponent's scores
      
      if (setTotal > opponentTotal) {
        set.matchPoints = pontosVitoriaSet;
        totalMatchPoints += pontosVitoriaSet;
      } else if (setTotal === opponentTotal) {
        set.matchPoints = pontosEmpateSet;
        totalMatchPoints += pontosEmpateSet;
        opponentMatchPoints += pontosEmpateSet;
      } else {
        set.matchPoints = 0;
        opponentMatchPoints += pontosVitoriaSet;
      }
      
      set.total = setTotal;
    });
    
    form.setValue('totalMatchPoints', totalMatchPoints);
    form.setValue('combatFinished', totalMatchPoints >= pontosParaVencer || opponentMatchPoints >= pontosParaVencer);
    
    // Check for shoot-off situation
    if (totalMatchPoints === 5 && opponentMatchPoints === 5 && shootOff) {
      form.setValue('needsShootOff', true);
    }
  };

  const renderClassificationPhase = () => {
    const classificationArrows = form.watch('classificationArrows') || [];
    const totalScore = classificationArrows.reduce((total: number, arrow: any) => total + (arrow.score || 0), 0);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Fase de Classificação</h3>
          <Badge variant="outline">{totalScore} pontos</Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Cole os 72 valores separados por vírgula ou espaço (ex: 10,9,8,miss,10...)"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
              />
            </div>
            <Button onClick={handleBulkArrowInput} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Aplicar
            </Button>
          </div>
          
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleCSVImport}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Importar CSV
                </span>
              </Button>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-2 max-h-60 overflow-y-auto">
          {Array.from({ length: numFlechasClassificacao }, (_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`classificationArrows.${index}.score`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">{index + 1}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      className="h-8 text-xs"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        field.onChange(validateArrowScore(value) ? value : 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Total de {numFlechasClassificacao} flechas. Valores permitidos: 0-10 (0 = miss).
        </div>
      </div>
    );
  };

  const renderEliminationPhase = () => {
    const sets = form.watch('eliminationSets') || [];
    const totalMatchPoints = form.watch('totalMatchPoints') || 0;
    const combatFinished = form.watch('combatFinished') || false;
    const needsShootOff = form.watch('needsShootOff') || false;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Fase de Eliminação</h3>
          <Badge variant={totalMatchPoints >= pontosParaVencer ? "default" : "outline"}>
            {totalMatchPoints} pontos de match
          </Badge>
        </div>
        
        <div className="space-y-4">
          {sets.map((set: any, setIndex: number) => {
            const isDisabled = combatFinished && setIndex > sets.findIndex((s: any) => s.matchPoints > 0);
            
            return (
              <Card key={setIndex} className={isDisabled ? "opacity-50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex justify-between">
                    <span>Set {setIndex + 1}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">Total: {set.total || 0}</Badge>
                      <Badge variant={set.matchPoints > 0 ? "default" : "outline"}>
                        {set.matchPoints || 0} pts
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: flechasPorSet }, (_, arrowIndex) => (
                      <FormField
                        key={arrowIndex}
                        control={form.control}
                        name={`eliminationSets.${setIndex}.arrows.${arrowIndex}.score`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Flecha {arrowIndex + 1}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                disabled={isDisabled}
                                className="h-8"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  field.onChange(validateArrowScore(value) ? value : 0);
                                  // Recalculate after a short delay
                                  setTimeout(updateMatchPoints, 100);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {needsShootOff && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-sm text-orange-800">Shoot-off (Desempate)</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="shootOffScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontuação da Flecha de Desempate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        placeholder="0-10"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(validateArrowScore(value) ? value : 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}
        
        <div className="text-sm text-muted-foreground">
          Melhor de {setsPorCombate} sets. Primeiro a {pontosParaVencer} pontos de match vence.
          Vitória: {pontosVitoriaSet} pts, Empate: {pontosEmpateSet} pt cada.
        </div>
      </div>
    );
  };

  if (!faseClassificacao && !faseEliminacao) {
    // Fallback to simple arrows input
    const numFlechas = rule.parametros?.num_flechas || 6;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Flechas</h3>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: numFlechas }, (_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`flechas.${index}.zona`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flecha {index + 1}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      placeholder="0-10"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (faseClassificacao && faseEliminacao) {
    return (
      <Tabs value={activePhase} onValueChange={(value) => setActivePhase(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classification">Classificação</TabsTrigger>
          <TabsTrigger value="elimination">Eliminação</TabsTrigger>
        </TabsList>
        <TabsContent value="classification" className="mt-4">
          {renderClassificationPhase()}
        </TabsContent>
        <TabsContent value="elimination" className="mt-4">
          {renderEliminationPhase()}
        </TabsContent>
      </Tabs>
    );
  }

  if (faseClassificacao) {
    return renderClassificationPhase();
  }

  if (faseEliminacao) {
    return renderEliminationPhase();
  }

  return null;
}
