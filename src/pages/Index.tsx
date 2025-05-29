
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
  MapPin,
  Clock
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestão de Atletas",
      description: "Cadastro completo de atletas, delegações e dependentes com controle de dados pessoais e documentação."
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Modalidades Esportivas", 
      description: "Gerenciamento de diferentes modalidades olímpicas com regras específicas e categorias de competição."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Eventos e Cronogramas",
      description: "Criação e gestão de eventos esportivos com cronogramas detalhados e controle de inscrições."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Sistema de Pontuação",
      description: "Controle completo de pontuações, rankings e resultados das competições em tempo real."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Controle de Acesso",
      description: "Sistema robusto de permissões com diferentes níveis de acesso para atletas, juízes e organizadores."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Relatórios e Análises",
      description: "Geração de relatórios detalhados sobre participações, resultados e estatísticas dos eventos."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-green-primary to-olimpics-green-secondary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 py-24">
          <div className="text-center text-white">
            {/* Logos Section */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
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
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Olímpia Manager
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Sistema completo de gestão para eventos esportivos olímpicos. 
              Gerencie atletas, modalidades, competições e resultados em uma plataforma integrada.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-olimpics-orange-primary hover:bg-olimpics-orange-primary/90 text-white px-8 py-3 text-lg"
                >
                  Acessar Sistema
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Events Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-olimpics-green-primary mb-4">
              Eventos com Inscrições Abertas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Participe do maior evento esportivo da Escola do Esporte com Coração
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary text-white">
                <div className="flex items-center justify-center mb-4">
                  <Trophy className="h-12 w-12 text-olimpics-orange-primary" />
                </div>
                <CardTitle className="text-center text-3xl font-bold">
                  Olimpíadas Nacionais 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-olimpics-green-primary" />
                    <div>
                      <p className="font-semibold text-gray-800">Data do Evento</p>
                      <p className="text-gray-600">08 a 13 de Julho de 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-olimpics-green-primary" />
                    <div>
                      <p className="font-semibold text-gray-800">Local</p>
                      <p className="text-gray-600">São Francisco Xavier, SP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-olimpics-green-primary" />
                    <div>
                      <p className="font-semibold text-gray-800">Inscrições</p>
                      <p className="text-gray-600">Abertas até 30 de Junho</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-olimpics-green-primary" />
                    <div>
                      <p className="font-semibold text-gray-800">Modalidades</p>
                      <p className="text-gray-600">15+ modalidades disponíveis</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Junte-se aos atletas de todo o Brasil na maior celebração do esporte educacional. 
                    Venha viver a experiência única das Olimpíadas Nacionais 2025 da EECC.
                  </p>
                  
                  <Link to="/olimpiadas-nacionais">
                    <Button 
                      size="lg"
                      className="bg-olimpics-orange-primary hover:bg-olimpics-orange-primary/90 text-white px-8 py-3 text-lg"
                    >
                      Mais informações
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-olimpics-green-primary to-olimpics-green-secondary">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Funcionalidades do Sistema
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Uma plataforma completa desenvolvida especialmente para a gestão de eventos esportivos olímpicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 rounded-lg bg-olimpics-orange-primary/20 text-olimpics-orange-primary w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-olimpics-green-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Target className="h-16 w-16 text-olimpics-green-primary" />
            </div>
            
            <h2 className="text-4xl font-bold text-olimpics-green-primary mb-8">
              Sobre o Olímpia Manager
            </h2>
            
            <div className="text-lg text-gray-700 leading-relaxed space-y-6">
              <p>
                O <strong>Olímpia Manager</strong> é uma plataforma digital desenvolvida especificamente 
                para atender às necessidades da <strong>Escola do Esporte com Coração</strong> e suas 
                olimpíadas nacionais.
              </p>
              
              <p>
                Nossa missão é proporcionar uma experiência completa de gestão esportiva, onde cada 
                atleta, juiz e organizador tem acesso às ferramentas necessárias para o sucesso 
                dos eventos olímpicos.
              </p>
              
              <p>
                Com foco na <strong>filosofia olímpica</strong> e nos valores do esporte educacional, 
                o sistema integra tecnologia moderna com os princípios fundamentais do olimpismo: 
                excelência, amizade e respeito.
              </p>
            </div>

            <div className="mt-12">
              <Link to="/login">
                <Button 
                  size="lg"
                  className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 text-white px-8 py-3 text-lg"
                >
                  Acessar Sistema
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
