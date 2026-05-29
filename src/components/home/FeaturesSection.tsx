import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Users, Trophy, Calendar, BarChart3, Shield, FileText, ChevronRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Users,
    title: 'Gestão de Atletas',
    description: 'Cadastro completo de atletas, delegações e dependentes com controle de dados pessoais e documentação.',
    accent: 'bg-blue-500/15 text-blue-200',
  },
  {
    icon: Trophy,
    title: 'Modalidades Esportivas',
    description: 'Gerenciamento de modalidades olímpicas com regras específicas e categorias de competição.',
    accent: 'bg-amber-500/15 text-amber-200',
  },
  {
    icon: Calendar,
    title: 'Eventos e Cronogramas',
    description: 'Criação e gestão de eventos esportivos com cronogramas detalhados e controle de inscrições.',
    accent: 'bg-emerald-500/15 text-emerald-200',
  },
  {
    icon: BarChart3,
    title: 'Sistema de Pontuação',
    description: 'Controle de pontuações, rankings e resultados das competições em tempo real.',
    accent: 'bg-rose-500/15 text-rose-200',
  },
  {
    icon: Shield,
    title: 'Controle de Acesso',
    description: 'Permissões com diferentes níveis de acesso para atletas, juízes e organizadores.',
    accent: 'bg-indigo-500/15 text-indigo-200',
  },
  {
    icon: FileText,
    title: 'Relatórios e Análises',
    description: 'Geração de relatórios detalhados sobre participações, resultados e estatísticas dos eventos.',
    accent: 'bg-cyan-500/15 text-cyan-200',
  },
];

export const FeaturesSection = () => {
  return (
    <div className="relative py-24 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 space-y-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Funcionalidades <span className="text-olimpics-orange-primary">do Sistema</span>
          </h2>
          <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Uma plataforma completa desenvolvida especialmente para a gestão de eventos esportivos olímpicos
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
            >
              <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-xl', accent)}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Pronto para começar?</h3>
            <p className="text-white/70 max-w-md">
              Junte-se aos organizadores que já gerenciam seus eventos na plataforma
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-olimpics-orange-primary hover:bg-olimpics-orange-primary/90 text-white px-10 py-5 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 border-0"
          >
            <Link to="/login" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Acessar Sistema
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
};
