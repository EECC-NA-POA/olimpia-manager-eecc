
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Trophy, 
  BarChart3, 
  UserCheck, 
  FileText,
  Clock,
  Shield,
  Globe2,
  Target,
  Award,
  Database
} from 'lucide-react';

export const SystemInfoSection = () => {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: Calendar,
      title: 'Gestão Completa de Eventos',
      description: 'Criação, administração e acompanhamento de eventos esportivos de pequeno a grande porte',
      color: 'text-olimpics-green-primary'
    },
    {
      icon: Users,
      title: 'Cadastro e Gestão de Atletas',
      description: 'Sistema completo de registro, validação e gerenciamento de participantes e delegações',
      color: 'text-olimpics-orange-primary'
    },
    {
      icon: Trophy,
      title: 'Modalidades Esportivas',
      description: 'Organização de diferentes modalidades, categorias, regras e competições',
      color: 'text-olimpics-green-primary'
    },
    {
      icon: BarChart3,
      title: 'Análises e Relatórios',
      description: 'Dashboards em tempo real com métricas, estatísticas e relatórios detalhados',
      color: 'text-olimpics-orange-primary'
    },
    {
      icon: UserCheck,
      title: 'Controle de Acesso',
      description: 'Sistema robusto de permissões para organizadores, árbitros, atletas e delegações',
      color: 'text-olimpics-green-primary'
    },
    {
      icon: FileText,
      title: 'Documentação Digital',
      description: 'Gestão centralizada de regulamentos, termos, documentos e políticas',
      color: 'text-olimpics-orange-primary'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Eficiência Operacional',
      description: 'Automatização de processos manuais, redução significativa do tempo administrativo e eliminação de retrabalho'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Proteção de dados pessoais (LGPD), controle de acesso rigoroso e backup automático'
    },
    {
      icon: Globe2,
      title: 'Escalabilidade',
      description: 'Suporte para eventos locais, regionais, nacionais e internacionais com milhares de participantes'
    },
    {
      icon: Target,
      title: 'Precisão',
      description: 'Sistema de pontuação automatizado, rankings em tempo real e relatórios precisos'
    },
    {
      icon: Award,
      title: 'Transparência',
      description: 'Acompanhamento público de resultados, classificações e premiações em tempo real'
    },
    {
      icon: Database,
      title: 'Centralização',
      description: 'Todas as informações em um só lugar, acessível de qualquer dispositivo e local'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-olimpics-orange-primary mb-6">
          Olímpia Manager
        </h2>
        <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
          A plataforma completa para gestão de eventos esportivos da <strong>Escola do Esporte com Coração (EECC)</strong>. 
          Uma solução moderna, segura e eficiente para organizar competições de qualquer porte.
        </p>
        <div className="bg-gradient-to-r from-olimpics-green-primary/10 to-olimpics-orange-primary/10 rounded-xl p-6 max-w-3xl mx-auto">
          <p className="text-lg text-gray-600 italic">
            "Desenvolvido especialmente para atender às necessidades dos organizadores esportivos, 
            atletas e delegações, proporcionando uma experiência única e profissional em cada evento."
          </p>
        </div>
      </div>

      {/* Main Features */}
      <div>
        <h3 className="text-3xl md:text-4xl font-bold text-olimpics-green-primary text-center mb-12">
          Funcionalidades Principais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-olimpics-green-primary/20">
              <CardContent className="p-8 text-center">
                <feature.icon className={`h-16 w-16 ${feature.color} mx-auto mb-6`} />
                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-white to-olimpics-background rounded-2xl p-8 md:p-12">
        <h3 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary text-center mb-12">
          Por que escolher o Olímpia Manager?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 bg-white/70 rounded-xl backdrop-blur-sm">
              <benefit.icon className="h-12 w-12 text-olimpics-green-primary mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-800 mb-3">{benefit.title}</h4>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto">
            <h4 className="text-2xl font-bold text-olimpics-green-primary mb-4">
              Pronto para começar?
            </h4>
            <p className="text-gray-600 mb-6 text-lg">
              Faça login para acessar eventos específicos ou cadastre-se como participante
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 text-white px-8 py-3 text-lg w-full sm:w-auto"
                size="lg"
              >
                <Users className="h-5 w-5 mr-2" />
                Acessar Sistema
              </Button>
              <p className="text-sm text-gray-500">
                Tenha acesso completo a eventos, inscrições, resultados e muito mais
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About EECC */}
      <div className="bg-gradient-to-r from-olimpics-green-primary to-olimpics-green-secondary rounded-2xl p-8 md:p-12 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Escola do Esporte com Coração
          </h3>
          <p className="text-xl mb-6 text-white/90">
            A EECC é uma iniciativa da Nova Acrópole que promove valores olímpicos através do esporte, 
            desenvolvendo não apenas habilidades físicas, mas também o caráter e os valores humanos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-olimpics-orange-primary" />
              <h4 className="font-bold text-lg mb-2">Excelência</h4>
              <p className="text-white/80">Busca constante pela melhoria e superação pessoal</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-olimpics-orange-primary" />
              <h4 className="font-bold text-lg mb-2">Fraternidade</h4>
              <p className="text-white/80">União e cooperação entre todos os participantes</p>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto mb-3 text-olimpics-orange-primary" />
              <h4 className="font-bold text-lg mb-2">Respeito</h4>
              <p className="text-white/80">Valorização das diferenças e fair play</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
