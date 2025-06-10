import React, { useState } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from 'react-hook-form';
import { ModalityRule } from '../../tabs/scores/hooks/useModeloConfiguration';

interface SetsScoreFieldsProps {
  form: UseFormReturn<any>;
  rule: ModalityRule;
}

export function SetsScoreFields({ form, rule }: SetsScoreFieldsProps) {
  const melhorDe = rule.parametros.melhor_de || rule.parametros.num_sets || 3;
  const vencerSetsPara = rule.parametros.vencer_sets_para_seguir || Math.ceil(melhorDe / 2);
  const pontuaPorSet = rule.parametros.pontua_por_set !== false;
  const isVolleyball = rule.parametros.pontos_por_set !== undefined;
  const isTableTennis = rule.parametros.unidade === 'vitórias';
  
  const [setsAtivos, setSetsAtivos] = useState(1);
  const [matchFinalizado, setMatchFinalizado] = useState(false);
  
  // Watch for form changes to determine match status
  const watchedSets = form.watch('sets') || [];
  
  React.useEffect(() => {
    if (isTableTennis || isVolleyball) {
      let vitoriasEquipe1 = 0;
      let vitoriasEquipe2 = 0;
      
      for (let i = 0; i < setsAtivos; i++) {
        const set = watchedSets[i];
        if (set?.vencedor === 'vitoria') vitoriasEquipe1++;
        else if (set?.vencedor === 'derrota') vitoriasEquipe2++;
      }
      
      const matchFinalizado = vitoriasEquipe1 >= vencerSetsPara || vitoriasEquipe2 >= vencerSetsPara;
      setMatchFinalizado(matchFinalizado);
      
      // Auto-advance to next set if current set is complete and match not finished
      if (!matchFinalizado && setsAtivos < melhorDe) {
        const setAtual = watchedSets[setsAtivos - 1];
        if (setAtual?.vencedor && (setAtual.vencedor === 'vitoria' || setAtual.vencedor === 'derrota')) {
          setSetsAtivos(prev => Math.min(prev + 1, melhorDe));
        }
      }
    }
  }, [watchedSets, setsAtivos, melhorDe, vencerSetsPara, isTableTennis, isVolleyball]);

  const validateVolleyballSet = (setIndex: number, pontosEquipe1: number, pontosEquipe2: number) => {
    const isSetFinal = setIndex === 4; // 5th set (index 4)
    const limitePontos = isSetFinal ? (rule.parametros.pontos_set_final || 15) : (rule.parametros.pontos_por_set || 25);
    const vantagem = rule.parametros.vantagem || 2;
    
    const maxPontos = Math.max(pontosEquipe1, pontosEquipe2);
    const minPontos = Math.min(pontosEquipe1, pontosEquipe2);
    
    // Must reach minimum points and have required advantage
    return maxPontos >= limitePontos && (maxPontos - minPontos) >= vantagem;
  };

  if (!pontuaPorSet && (isTableTennis || isVolleyball)) {
    // Enhanced sets scoring for Table Tennis and Volleyball
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {isTableTennis && `Tênis de Mesa - Melhor de ${melhorDe} sets (primeiro a ${vencerSetsPara} sets vence)`}
          {isVolleyball && `Voleibol - Melhor de ${melhorDe} sets (primeiro a ${vencerSetsPara} sets vence)`}
        </div>
        
        {Array.from({ length: setsAtivos }, (_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Set {index + 1}</h4>
            
            {isVolleyball ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`sets.${index}.pontosEquipe1`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pontos Nossa Equipe</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const valor = parseInt(e.target.value) || 0;
                              field.onChange(valor);
                              
                              // Auto-determine winner based on volleyball rules
                              const pontosEquipe2 = form.getValues(`sets.${index}.pontosEquipe2`) || 0;
                              if (validateVolleyballSet(index, valor, pontosEquipe2)) {
                                if (valor > pontosEquipe2) {
                                  form.setValue(`sets.${index}.vencedor`, 'vitoria');
                                } else {
                                  form.setValue(`sets.${index}.vencedor`, 'derrota');
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`sets.${index}.pontosEquipe2`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pontos Equipe Adversária</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const valor = parseInt(e.target.value) || 0;
                              field.onChange(valor);
                              
                              // Auto-determine winner based on volleyball rules
                              const pontosEquipe1 = form.getValues(`sets.${index}.pontosEquipe1`) || 0;
                              if (validateVolleyballSet(index, pontosEquipe1, valor)) {
                                if (valor > pontosEquipe1) {
                                  form.setValue(`sets.${index}.vencedor`, 'derrota');
                                } else {
                                  form.setValue(`sets.${index}.vencedor`, 'vitoria');
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name={`sets.${index}.vencedor`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado do Set</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vitoria" id={`set-${index}-win`} />
                            <Label htmlFor={`set-${index}-win`}>Vitória</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="derrota" id={`set-${index}-loss`} />
                            <Label htmlFor={`set-${index}-loss`}>Derrota</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-xs text-muted-foreground">
                  {index < 4 ? `${rule.parametros.pontos_por_set || 25} pontos (vantagem de ${rule.parametros.vantagem || 2})` : `${rule.parametros.pontos_set_final || 15} pontos (vantagem de ${rule.parametros.vantagem || 2})`}
                </div>
              </div>
            ) : (
              // Table Tennis - simple win/loss per set
              <FormField
                control={form.control}
                name={`sets.${index}.vencedor`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado do Set</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="vitoria" id={`set-${index}-win`} />
                          <Label htmlFor={`set-${index}-win`}>Vitória</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="derrota" id={`set-${index}-loss`} />
                          <Label htmlFor={`set-${index}-loss`}>Derrota</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        ))}
        
        {matchFinalizado && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 font-medium">Partida finalizada!</p>
          </div>
        )}
        
        {!matchFinalizado && setsAtivos < melhorDe && (
          <div className="text-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSetsAtivos(prev => Math.min(prev + 1, melhorDe))}
            >
              Adicionar Set {setsAtivos + 1}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Legacy points per set scoring
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Pontuação por set ({melhorDe} sets)
      </div>
      
      {Array.from({ length: melhorDe }, (_, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`sets.${index}.pontos`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set {index + 1}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    pts
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
