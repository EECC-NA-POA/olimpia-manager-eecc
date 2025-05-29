
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Trophy, 
  Calendar, 
  BarChart3, 
  Shield, 
  FileText,
  ChevronRight,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Gestão de Atletas",
    description: "Cadastro completo de atletas, delegações e dependentes com controle de dados pessoais e documentação.",
    gradient: "from-blue-500/20 to-purple-500/20",
    iconBg: "from-blue-500/20 to-purple-500/20",
    borderGlow: "shadow-blue-500/20"
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "Modalidades Esportivas", 
    description: "Gerenciamento de diferentes modalidades olímpicas com regras específicas e categorias de competição.",
    gradient: "from-yellow-500/20 to-orange-500/20",
    iconBg: "from-yellow-500/20 to-orange-500/20",
    borderGlow: "shadow-yellow-500/20"
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Eventos e Cronogramas",
    description: "Criação e gestão de eventos esportivos com cronogramas detalhados e controle de inscrições.",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconBg: "from-green-500/20 to-emerald-500/20",
    borderGlow: "shadow-green-500/20"
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Sistema de Pontuação",
    description: "Controle completo de pontuações, rankings e resultados das competições em tempo real.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconBg: "from-pink-500/20 to-rose-500/20",
    borderGlow: "shadow-pink-500/20"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Controle de Acesso",
    description: "Sistema robusto de permissões com diferentes níveis de acesso para atletas, juízes e organizadores.",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconBg: "from-indigo-500/20 to-blue-500/20",
    borderGlow: "shadow-indigo-500/20"
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Relatórios e Análises",
    description: "Geração de relatórios detalhados sobre participações, resultados e estatísticas dos eventos.",
    gradient: "from-cyan-500/20 to-teal-500/20",
    iconBg: "from-cyan-500/20 to-teal-500/20",
    borderGlow: "shadow-cyan-500/20"
  }
];

export const FeaturesSection = () => {
  return (
    <div className="relative py-32 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-olimpics-orange-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-olimpics-green-primary/5 to-olimpics-orange-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Enhanced header with floating elements */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full blur-sm"></div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl">
              <Target className="h-10 w-10 text-white" />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-olimpics-orange-primary" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Funcionalidades
            </span>
            <br />
            <span className="bg-gradient-to-r from-olimpics-orange-primary to-yellow-400 bg-clip-text text-transparent">
              do Sistema
            </span>
          </h2>
          
          <div className="relative max-w-4xl mx-auto">
            <p className="text-2xl text-white/90 leading-relaxed font-light">
              Uma plataforma completa desenvolvida especialmente para a gestão de eventos esportivos olímpicos
            </p>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-olimpics-orange-primary to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Enhanced grid with staggered animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200`}></div>
              
              <Card className="relative bg-white/95 backdrop-blur-xl border-0 rounded-2xl shadow-2xl hover:shadow-4xl transition-all duration-700 hover:-translate-y-4 group-hover:bg-white overflow-hidden">
                {/* Card background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,114,182,0.3),transparent_50%)]"></div>
                </div>
                
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                <CardHeader className="relative pb-6 pt-8">
                  {/* Enhanced icon container */}
                  <div className="relative mb-6">
                    <div className={`flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.iconBg} backdrop-blur-sm text-olimpics-orange-primary mb-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl ${feature.borderGlow}`}>
                      {feature.icon}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
                    </div>
                    {/* Floating particles */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-olimpics-orange-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-olimpics-green-primary group-hover:text-white transition-colors duration-500 leading-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative pb-8">
                  <p className="text-gray-600 group-hover:text-white/90 leading-relaxed text-lg transition-colors duration-500">
                    {feature.description}
                  </p>
                  
                  {/* Subtle arrow indicator */}
                  <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ChevronRight className="h-6 w-6 text-olimpics-orange-primary group-hover:text-white transition-colors duration-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced Call to Action */}
        <div className="text-center relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-gradient-to-r from-olimpics-orange-primary/10 to-white/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative inline-flex flex-col items-center space-y-8 p-12 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            {/* Icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-olimpics-orange-primary/30 rounded-2xl blur-xl"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-olimpics-orange-primary to-yellow-500 rounded-2xl shadow-2xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-white">
                Pronto para começar?
              </h3>
              <p className="text-white/80 text-lg max-w-md">
                Junte-se a centenas de organizadores que já transformaram seus eventos esportivos
              </p>
            </div>
            
            <Link to="/login">
              <Button 
                size="lg"
                className="group relative bg-gradient-to-r from-olimpics-orange-primary to-yellow-500 hover:from-yellow-500 hover:to-olimpics-orange-primary text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border-0 overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-olimpics-orange-primary to-yellow-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                
                <span className="relative flex items-center gap-3">
                  Acessar Sistema
                  <ChevronRight className="h-7 w-7 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-pulse"></div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
