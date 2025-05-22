
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Athlete } from './tabs/scores/hooks/useAthletes';

interface AthleteCardProps {
  athlete: Athlete;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AthleteCard({ athlete, isSelected, onClick }: AthleteCardProps) {
  // Generate a fake score for display purposes
  const score = Math.floor(Math.random() * 50 + 130);
  
  return (
    <Card 
      className={`
        cursor-pointer hover:border-primary/50 transition-colors overflow-hidden
        ${isSelected ? 'border-primary' : ''}
      `}
      onClick={onClick}
    >
      <div className="bg-red-500 h-1 w-full"></div>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <CardTitle className="text-base">Paciente {athlete.atleta_id.slice(-5)}</CardTitle>
        <div className="text-xs flex flex-col items-end">
          <span className="text-gray-500">Escore global</span>
          <span className="font-semibold">{score}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div>
            <p className="text-gray-500">Idade</p>
            <p>{Math.floor(Math.random() * 30 + 50)}a</p>
          </div>
          <div>
            <p className="text-gray-500">Data de nasc.</p>
            <p>{`${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/19${Math.floor(Math.random() * 50 + 30)}`}</p>
          </div>
          <div>
            <p className="text-gray-500">Sexo</p>
            <p>{Math.random() > 0.5 ? 'Feminino' : 'Masculino'}</p>
          </div>

          <div>
            <p className="text-gray-500">Atendimento</p>
            <p>{Math.floor(Math.random() * 10000 + 680000)}</p>
          </div>
          <div>
            <p className="text-gray-500">Setor</p>
            <p>UTI ADULTO III (ANEXO)</p>
          </div>
          <div>
            <p className="text-gray-500">Leito</p>
            <p>UTI ADULTO III - {Math.floor(Math.random() * 15 + 1)}</p>
          </div>

          <div>
            <p className="text-gray-500">Convênio</p>
            <p></p>
          </div>
          <div>
            <p className="text-gray-500">Data da prescrição</p>
            <p>21/05/2025</p>
          </div>
          <div>
            <p className="text-gray-500">Situação</p>
            <p>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 font-normal border-yellow-200">
                Pendente
              </Badge>
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-500 text-xs mb-1">Alertas</p>
          <div className="flex gap-2">
            {[...Array(Math.floor(Math.random() * 3 + 1))].map((_, i) => (
              <Badge key={i} variant="outline" className="bg-red-50 text-red-800 border-red-200">
                {i + 1} {["A", "B", "C", "D"][i]}
              </Badge>
            ))}
            {Math.random() > 0.5 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                ⚠️ {Math.floor(Math.random() * 10 + 1)}
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              🏥 18
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
