
import React from 'react';
import { Calendar, Users, Trophy, Globe } from 'lucide-react';

export function EventsHeader() {
  return (
    <div className="relative min-h-screen bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary">
      <div className="absolute inset-0 bg-black/40" />
      <div className="container relative z-10 mx-auto px-4 py-8">
        <div className="text-center mb-16">
          {/* Event Logos */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4 w-full">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <img 
                  src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
                  alt="EECC Logo"
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <img 
                  src="/lovable-uploads/nova_acropole_logo_redondo_verde.png"
                  alt="Nova Acrópole Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <img 
                  src="/lovable-uploads/LOGO_COMITE_PIERRE_COUBERTIN.png"
                  alt="Comitê Pierre de Coubertin Logo"
                  className="w-full h-full object-contain animate-pulse"
                />
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
          
          {/* About EECC Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-6xl mx-auto shadow-lg mb-8">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Globe className="h-8 w-8 text-olimpics-orange-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-olimpics-orange-primary">
                Escola do Esporte com Coração
              </h2>
            </div>
            
            <div className="text-gray-700 text-lg leading-relaxed space-y-4">
              <p>
                A Escola do Esporte com o Coração de Nova Acrópole é uma <strong>entidade internacional sem fins lucrativos</strong>, 
                presente em mais de <strong>20 países há 14 anos</strong>, com o objetivo de promover o desenvolvimento humano 
                através do desenvolvimento de valores morais no esporte.
              </p>
              
              <p>
                No Brasil, há <strong>10 anos</strong>, tem oferecido a oportunidade de praticar atividades esportivas em mais de 
                <strong> 30 unidades da Nova Acrópole</strong> pelas principais cidades do país, pois acreditamos que o Esporte, 
                através de uma abordagem pedagógica e filosófica, é capaz de construir um mundo melhor.
              </p>
              
              <p className="text-olimpics-green-primary font-medium">
                O esporte fortalece os praticantes por meio das virtudes e valores, ensinando-os a se conhecerem e 
                superarem a si mesmos, conviverem melhor com os demais e a vivenciarem o verdadeiro espírito da vitória.
              </p>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 bg-olimpics-green-primary/10 rounded-lg">
                <Users className="h-8 w-8 text-olimpics-green-primary mx-auto mb-3" />
                <h3 className="font-bold text-olimpics-green-primary mb-2">20+ Países</h3>
                <p className="text-sm text-gray-600">Presença internacional consolidada</p>
              </div>
              
              <div className="text-center p-4 bg-olimpics-orange-primary/10 rounded-lg">
                <Calendar className="h-8 w-8 text-olimpics-orange-primary mx-auto mb-3" />
                <h3 className="font-bold text-olimpics-orange-primary mb-2">14 Anos</h3>
                <p className="text-sm text-gray-600">De experiência mundial</p>
              </div>
              
              <div className="text-center p-4 bg-olimpics-green-primary/10 rounded-lg">
                <Trophy className="h-8 w-8 text-olimpics-green-primary mx-auto mb-3" />
                <h3 className="font-bold text-olimpics-green-primary mb-2">30+ Unidades</h3>
                <p className="text-sm text-gray-600">No Brasil</p>
              </div>
            </div>
          </div>

          {/* Philosopher Quotes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-6xl mx-auto shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-olimpics-green-primary mb-8 text-center">
              Sabedoria dos Filósofos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="quote-item">
                  <h4 className="font-semibold text-olimpics-green-primary">Platão (428–348 a.C.)</h4>
                  <p className="text-gray-700 mt-2 italic text-sm">
                    "O homem pode aprender virtudes e disciplina tanto na música quanto na ginástica, pois ambas moldam a alma e o corpo."
                  </p>
                </div>

                <div className="quote-item">
                  <h4 className="font-semibold text-olimpics-green-primary">Aristóteles (384–322 a.C.)</h4>
                  <p className="text-gray-700 mt-2 italic text-sm">
                    "Somos o que repetidamente fazemos. A excelência, portanto, não é um feito, mas um hábito."
                  </p>
                </div>

                <div className="quote-item">
                  <h4 className="font-semibold text-olimpics-green-primary">Epicteto (50–135 d.C.)</h4>
                  <p className="text-gray-700 mt-2 italic text-sm">
                    "Se você quer vencer nos Jogos Olímpicos, deve se preparar, exercitar-se, comer moderadamente, suportar a fadiga e obedecer ao treinador."
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="quote-item">
                  <h4 className="font-semibold text-olimpics-green-primary">Sêneca (4 a.C.–65 d.C.)</h4>
                  <p className="text-gray-700 mt-2 italic text-sm">
                    "A vida é como um gladiador nos jogos: não se trata apenas de sobreviver, mas de lutar bem."
                  </p>
                </div>

                <div className="quote-item">
                  <h4 className="font-semibold text-olimpics-green-primary">Diógenes de Sinope (412–323 a.C.)</h4>
                  <p className="text-gray-700 mt-2 italic text-sm">
                    "Os vencedores dos Jogos Olímpicos recebem apenas uma coroa de louros; mas os que vivem com virtude recebem a verdadeira glória."
                  </p>
                </div>

                <div className="quote-item">
                  <h4 className="font-semibold text-olimpics-green-primary">Cícero (106–43 a.C.)</h4>
                  <p className="text-gray-700 mt-2 italic text-sm">
                    "O esforço e a perseverança sempre superam o talento que não se disciplina."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
