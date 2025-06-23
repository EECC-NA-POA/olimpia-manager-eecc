
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { TeamFormValues } from '../schemas/teamFormSchema';

interface TeamFormFieldsProps {
  form: UseFormReturn<TeamFormValues>;
  teamModalities: any[];
  editingTeam: any | null;
}

export function TeamFormFields({ form, teamModalities, editingTeam }: TeamFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Equipe</FormLabel>
            <FormControl>
              <Input placeholder="Nome da equipe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="modalidade_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modalidade</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              disabled={!!editingTeam}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {teamModalities?.map((modality: any) => (
                  <SelectItem key={modality.id} value={String(modality.id)}>
                    {modality.nome} - {modality.categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
