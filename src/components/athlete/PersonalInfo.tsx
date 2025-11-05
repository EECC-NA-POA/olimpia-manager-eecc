
import React from 'react';
import { User, FileText, Phone, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PersonalInfoProps {
  nome_completo: string;
  tipo_documento: string;
  numero_documento: string;
  telefone: string;
  email: string;
  data_nascimento?: string | null;
}

export default function PersonalInfo({ 
  nome_completo, 
  tipo_documento, 
  numero_documento, 
  telefone, 
  email,
  data_nascimento 
}: PersonalInfoProps) {
  const formatBirthDate = (date: string) => {
    try {
      // Parse the date as UTC to avoid timezone conversion issues
      const [year, month, day] = date.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting birth date:', error);
      return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-olimpics-green-primary">
        <User className="h-5 w-5" />
        Informações Pessoais
      </h3>
      <div className="space-y-3">
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-sm font-medium",
            !nome_completo && "text-muted-foreground italic"
          )}>
            {nome_completo || 'Nome não informado'}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-sm",
            !(tipo_documento && numero_documento) && "text-muted-foreground italic"
          )}>
            {tipo_documento && numero_documento ? `${tipo_documento}: ${numero_documento}` : 'Documento não informado'}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-sm",
            !telefone && "text-muted-foreground italic"
          )}>
            {telefone ? telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : 'Telefone não informado'}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-sm",
            !email && "text-muted-foreground italic"
          )}>
            {email || 'Email não informado'}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-sm",
            !data_nascimento && "text-muted-foreground italic"
          )}>
            {data_nascimento ? formatBirthDate(data_nascimento) : 'Data de nascimento não informada'}
          </span>
        </p>
      </div>
    </div>
  );
}
