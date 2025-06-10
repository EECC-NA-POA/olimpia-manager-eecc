
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Trophy, ChevronRight } from 'lucide-react';

export const ActiveEventsSection = () => {
  return (
    <div className="relative py-20">
      {/* Section background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-olimpics-orange-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-12">
          {/* Enhanced section header */}
          <div className="relative inline-block mb-8">
            <div className="absolute -top-4 -right-4 w-6 h-6 bg-olimpics-orange-primary/40 rounded-full blur-sm animate-pulse"></div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
              <Calendar className="h-8 w-8 text-olimpics-orange-primary" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
              Eventos com Inscrições Abertas
            </span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="group relative">
            {/* Card glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-olimpics-orange-primary/30 to-white/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <Card className="relative bg-white/95 backdrop-blur-xl border-0 rounded-3xl shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden">
              {/* Card background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(238,126,1,0.3),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,155,64,0.3),transparent_50%)]"></div>
              </div>

              <CardHeader className="relative bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary text-white rounded-t-3xl">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-olimpics-orange-primary/30 rounded-2xl blur-xl"></div>
                    <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-olimpics-orange-primary to-yellow-500 rounded-2xl shadow-2xl">
                      <Trophy className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-center text-3xl font-bold">
                  Olimpíadas Nacionais 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-olimpics-green-primary/5 to-transparent hover:from-olimpics-green-primary/10 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-olimpics-green-primary/20 to-olimpics-green-primary/10 rounded-xl">
                      <Calendar className="h-6 w-6 text-olimpics-green-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Data do Evento</p>
                      <p className="text-gray-600">08 a 13 de Julho de 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-olimpics-orange-primary/5 to-transparent hover:from-olimpics-orange-primary/10 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-olimpics-orange-primary/20 to-olimpics-orange-primary/10 rounded-xl">
                      <MapPin className="h-6 w-6 text-olimpics-orange-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Local</p>
                      <p className="text-gray-600">São Francisco Xavier, SP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent hover:from-blue-500/10 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Inscrições</p>
                      <p className="text-gray-600">Abertas até 30 de Junho</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent hover:from-purple-500/10 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Modalidades</p>
                      <p className="text-gray-600">15+ modalidades disponíveis</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                    Junte-se aos atletas Acropolitanos de todo o Brasil na maior celebração do esporte educacional. 
                    Venha viver a experiência única das Olimpíadas Nacionais 2025 da EECC.
                  </p>
                  
                  <Link to="/olimpiadas-nacionais">
                    <Button 
                      size="lg"
                      className="group relative bg-gradient-to-r from-olimpics-orange-primary to-yellow-500 hover:from-yellow-500 hover:to-olimpics-orange-primary text-white px-10 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0"
                    >
                      <span className="relative flex items-center gap-3">
                        Mais informações
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
