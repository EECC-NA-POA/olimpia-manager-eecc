
import React from 'react';
import { Calendar, Users, Trophy, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function EventsHeader() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
      <div className="absolute inset-0 bg-black/40" />
      <div className="container relative z-10 mx-auto px-4 py-8">
        <div className="text-center mb-16">
          {/* Event Logos */}
          <div className="flex flex-col items-center mb-8 pt-16">
            <div className="flex items-center justify-center gap-8 mb-6 w-full">
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <img src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png" alt="EECC Logo" className="w-full h-full object-contain animate-pulse" />
              </div>
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <img src="/lovable-uploads/nova_acropole_logo_redondo_verde.png" alt="Nova Acrópole Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary mb-6">
              Areté
            </h2>
          </div>

          <div className="flex justify-center items-center gap-3 mb-6">
            <Trophy className="h-12 w-12 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Olímpia Manager
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8">
            Sistema de gestão de eventos e atividades da Escola do Esporte com Coração
          </p>

          {/* Login/Cadastro Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-olimpics-green-primary mb-4">
              Acesse o Sistema
            </h3>
            <p className="text-gray-600 mb-6">
              Faça login ou cadastre-se para participar dos eventos
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/login')} className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 text-white py-3" size="lg">
                <Users className="h-5 w-5 mr-2" />
                Entrar / Cadastrar-se
              </Button>
              <p className="text-sm text-gray-500">
                Crie sua conta ou acesse eventos específicos
              </p>
            </div>
          </div>

          {/* Philosopher Quotes - Updated grid layout with centered last card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-6xl mx-auto shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary">
                <h4 className="font-bold text-olimpics-green-primary mb-3">Platão (428–348 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "O homem pode aprender virtudes e disciplina tanto na música quanto na ginástica, pois ambas moldam a alma e o corpo."
                </p>
                <p className="text-xs text-gray-600">— Platão, A República (Livro III)</p>
              </div>

              <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary">
                <h4 className="font-bold text-olimpics-orange-primary mb-3">Aristóteles (384–322 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Somos o que repetidamente fazemos. A excelência, portanto, não é um feito, mas um hábito."
                </p>
                <p className="text-xs text-gray-600">— Aristóteles, Ética a Nicômaco</p>
              </div>

              <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary">
                <h4 className="font-bold text-olimpics-green-primary mb-3">Epicteto (50–135 d.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Se você quer vencer nos Jogos Olímpicos, deve se preparar, exercitar-se, comer moderadamente, suportar a fadiga e obedecer ao treinador."
                </p>
                <p className="text-xs text-gray-600">— Enchirídion" (ou "Manual")</p>
              </div>

              <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary">
                <h4 className="font-bold text-olimpics-orange-primary mb-3">Sêneca (4 a.C.–65 d.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "A vida é como um gladiador nos jogos: não se trata apenas de sobreviver, mas de lutar bem."
                </p>
                <p className="text-xs text-gray-600">— Sêneca, Cartas a Lucílio</p>
              </div>

              <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary">
                <h4 className="font-bold text-olimpics-green-primary mb-3">Diógenes de Sinope (412–323 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Os vencedores dos Jogos Olímpicos recebem apenas uma coroa de louros; mas os que vivem com virtude recebem a verdadeira glória."
                </p>
                <p className="text-xs text-gray-600">— Diógenes, citado por Diógenes Laércio</p>
              </div>

              <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary lg:col-start-2">
                <h4 className="font-bold text-olimpics-orange-primary mb-3">Cícero (106–43 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "O esforço e a perseverança sempre superam o talento que não se disciplina."
                </p>
                <p className="text-xs text-gray-600">— Cícero, De Officiis</p>
              </div>

              <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary md:col-start-2 lg:col-start-2">
                <h4 className="font-bold text-olimpics-orange-primary mb-3">Píndaro (518–438 a.C.)</h4>
                <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                  "Ó minha alma, não aspire à vida imortal, mas esgote o campo do possível."
                </p>
                <p className="text-xs text-gray-600">(Não filósofo, mas poeta dos Jogos Olímpicos)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
