
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
  Globe2
} from 'lucide-react';

export function SystemFeaturesSection() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Gestão de Eventos',
      description: 'Criação e administração completa de eventos esportivos e atividades da EECC',
      color: 'text-olimpics-green-primary'
    },
    {
      icon: Users,
      title: 'Cadastro de Atletas',
      description: 'Sistema completo de registro e gerenciamento de participantes',
      color: 'text-olimpics-orange-primary'
    },
    {
      icon: Trophy,
      title: 'Gestão de Modalidades',
      description: 'Organização de diferentes modalidades esportivas e suas regras',
      color: 'text-olimpics-green-primary'
    },
    {
      icon: BarChart3,
      title: 'Relatórios e Análises',
      description: 'Dashboards completos com métricas e estatísticas dos eventos',
      color: 'text-olimpics-orange-primary'
    },
    {
      icon: UserCheck,
      title: 'Controle de Acesso',
      description: 'Sistema de permissões para organizadores, árbitros e atletas',
      color: 'text-olimpics-green-primary'
    },
    {
      icon: FileText,
      title: 'Documentação',
      description: 'Gestão de regulamentos, termos e documentos dos eventos',
      color: 'text-olimpics-orange-primary'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Eficiência',
      description: 'Automatização de processos manuais e redução de tempo administrativo'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Proteção de dados e controle de acesso rigoroso'
    },
    {
      icon: Globe2,
      title: 'Escalabilidade',
      description: 'Suporte para eventos de pequeno a grande porte'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Main Features */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-olimpics-orange-primary mb-4">
          Funcionalidades do Sistema
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
          O Olímpia Manager oferece todas as ferramentas necessárias para a gestão completa 
          de eventos esportivos, desde o cadastro até a análise de resultados.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8">
        <h3 className="text-2xl md:text-3xl font-bold text-olimpics-green-primary text-center mb-8">
          Por que escolher o Olímpia Manager?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-4">
              <benefit.icon className="h-10 w-10 text-olimpics-orange-primary mx-auto mb-3" />
              <h4 className="font-bold text-gray-800 mb-2">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-olimpics-green-primary hover:bg-olimpics-green-primary/90 text-white px-8 py-3 text-lg"
              size="lg"
            >
              <Users className="h-5 w-5 mr-2" />
              Acessar Sistema
            </Button>
            <p className="text-sm text-gray-500">
              Faça login para acessar eventos específicos ou cadastrar-se como participante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
