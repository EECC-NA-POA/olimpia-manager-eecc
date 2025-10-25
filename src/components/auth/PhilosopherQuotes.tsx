
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const PhilosopherQuotes = () => {
  return (
    <div className="mt-8 space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="quote-item">
              <h4 className="font-semibold text-olimpics-green-primary dark:text-success">Platão (428–348 a.C.)</h4>
              <p className="text-foreground mt-2 italic">
                "O homem pode aprender virtudes e disciplina tanto na música quanto na ginástica, pois ambas moldam a alma e o corpo."
              </p>
              <p className="text-sm text-muted-foreground mt-1">— Platão, A República (Livro III)</p>
            </div>

            <div className="quote-item">
              <h4 className="font-semibold text-olimpics-green-primary dark:text-success">Aristóteles (384–322 a.C.)</h4>
              <p className="text-foreground mt-2 italic">
                "Somos o que repetidamente fazemos. A excelência, portanto, não é um feito, mas um hábito."
              </p>
              <p className="text-sm text-muted-foreground mt-1">— Aristóteles, Ética a Nicômaco</p>
            </div>

            <div className="quote-item">
              <h4 className="font-semibold text-olimpics-green-primary dark:text-success">Epicteto (50–135 d.C.)</h4>
              <p className="text-foreground mt-2 italic">
                "Se você quer vencer nos Jogos Olímpicos, deve se preparar, exercitar-se, comer moderadamente, suportar a fadiga e obedecer ao treinador."
              </p>
              <p className="text-sm text-muted-foreground mt-1">— Enchirídion" (ou "Manual")</p>
            </div>

            <div className="quote-item">
              <h4 className="font-semibold text-olimpics-green-primary dark:text-success">Sêneca (4 a.C.–65 d.C.)</h4>
              <p className="text-foreground mt-2 italic">
                "A vida é como um gladiador nos jogos: não se trata apenas de sobreviver, mas de lutar bem."
              </p>
              <p className="text-sm text-muted-foreground mt-1">— Sêneca, Cartas a Lucílio</p>
            </div>

            <div className="quote-item">
              <h4 className="font-semibold text-olimpics-green-primary dark:text-success">Diógenes de Sinope (412–323 a.C.)</h4>
              <p className="text-foreground mt-2 italic">
                "Os vencedores dos Jogos Olímpicos recebem apenas uma coroa de louros; mas os que vivem com virtude recebem a verdadeira glória."
              </p>
              <p className="text-sm text-muted-foreground mt-1">— Diógenes, citado por Diógenes Laércio</p>
            </div>

            <div className="quote-item">
              <h4 className="font-semibold text-olimpics-green-primary dark:text-success">Cícero (106–43 a.C.)</h4>
              <p className="text-foreground mt-2 italic">
                "O esforço e a perseverança sempre superam o talento que não se disciplina."
              </p>
              <p className="text-sm text-muted-foreground mt-1">— Cícero, De Officiis</p>
            </div>

            <div className="quote-item">
              <h4 className="font-semibold text-olimpics-green-primary dark:text-success">Píndaro (518–438 a.C.)</h4>
              <p className="text-foreground mt-2 italic">
                "Ó minha alma, não aspire à vida imortal, mas esgote o campo do possível."
              </p>
              <p className="text-sm text-muted-foreground mt-1">(Não filósofo, mas poeta dos Jogos Olímpicos)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
