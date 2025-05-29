
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
  Medal,
  Target,
  Globe
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
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                <Medal className="h-16 w-16 text-olimpics-orange-primary" />
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
              <Link to="/olimpiadas-nacionais">
                <Button 
                  size="lg" 
                  className="bg-olimpics-orange-primary hover:bg-olimpics-orange-primary/90 text-white px-8 py-3 text-lg"
                >
                  Olimpíadas Nacionais 2025
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/events">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-olimpics-green-primary px-8 py-3 text-lg"
                >
                  Ver Todos os Eventos
                  <Globe className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olimpics-green-primary mb-4">
              Funcionalidades do Sistema
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa desenvolvida especialmente para a gestão de eventos esportivos olímpicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="p-3 rounded-lg bg-olimpics-green-primary/10 text-olimpics-green-primary w-fit mb-4">
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
      <div className="py-20 bg-olimpics-background">
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
