import { Card, CardContent } from '@/components/ui/card';

export const ConcordiaModalities = () => {
  const modalities = [
    {
      name: 'Vôlei de Praia',
      emoji: '🏐',
      description: 'Competição de vôlei de praia em trios',
      gradient: 'from-[#7CB342] to-[#7CB342]/80'
    },
    {
      name: 'Tiro com Arco',
      emoji: '🎯',
      description: 'Competição de tiro com arco',
      gradient: 'from-[#7E57C2] to-[#7E57C2]/80'
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
        Modalidades
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modalities.map((modality, index) => (
          <div
            key={modality.name}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${500 + index * 100}ms` }}
          >
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:scale-105">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`bg-gradient-to-br ${modality.gradient} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-4xl">{modality.emoji}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {modality.name}
                  </h3>
                  <p className="text-gray-600">
                    {modality.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
