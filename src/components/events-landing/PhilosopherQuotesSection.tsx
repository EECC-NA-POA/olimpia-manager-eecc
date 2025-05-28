
import React from 'react';

export function PhilosopherQuotesSection() {
  return (
    <div className="py-16 bg-olimpics-green-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sabedoria dos Filósofos
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Reflexões sobre excelência, disciplina e virtude
          </p>
        </div>
        
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
              <p className="text-xs text-gray-600">— Enchirídion (ou "Manual")</p>
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

            <div className="bg-olimpics-orange-primary/5 p-6 rounded-lg border-l-4 border-olimpics-orange-primary">
              <h4 className="font-bold text-olimpics-orange-primary mb-3">Cícero (106–43 a.C.)</h4>
              <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                "O esforço e a perseverança sempre superam o talento que não se disciplina."
              </p>
              <p className="text-xs text-gray-600">— Cícero, De Officiis</p>
            </div>

            <div className="bg-olimpics-green-primary/5 p-6 rounded-lg border-l-4 border-olimpics-green-primary lg:col-start-2">
              <h4 className="font-bold text-olimpics-green-primary mb-3">Píndaro (518–438 a.C.)</h4>
              <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                "Ó minha alma, não aspire à vida imortal, mas esgote o campo do possível."
              </p>
              <p className="text-xs text-gray-600">(Não filósofo, mas poeta dos Jogos Olímpicos)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
