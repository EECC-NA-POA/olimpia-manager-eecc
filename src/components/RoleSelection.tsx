import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2, Trophy, Users, ClipboardList, ShieldCheck, ChevronRight } from 'lucide-react';
import { LoadingImage } from '@/components/ui/loading-image';
import { cn } from '@/lib/utils';

interface RoleSelectionProps {
  roles: string[];
}

const ROLE_META: Record<string, { icon: React.ElementType; description: string; color: string; border: string }> = {
  atleta: {
    icon: Trophy,
    description: 'Acesse suas inscrições, cronograma e resultados',
    color: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-200 hover:border-emerald-400',
  },
  'representante de delegação': {
    icon: Users,
    description: 'Gerencie atletas e inscrições da sua delegação',
    color: 'bg-blue-50 text-blue-700',
    border: 'border-blue-200 hover:border-blue-400',
  },
  organizador: {
    icon: ShieldCheck,
    description: 'Administre o evento, modalidades e participantes',
    color: 'bg-purple-50 text-purple-700',
    border: 'border-purple-200 hover:border-purple-400',
  },
  monitor: {
    icon: ClipboardList,
    description: 'Registre presenças e acompanhe suas modalidades',
    color: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200 hover:border-amber-400',
  },
};

function getFallback(role: string) {
  return ROLE_META['atleta'];
}

function getRoleMeta(role: string) {
  return ROLE_META[role.toLowerCase()] ?? getFallback(role);
}

export default function RoleSelection({ roles: propRoles }: RoleSelectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const roles = location.state?.roles || propRoles || [];
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    if (roles.length === 0) {
      toast.error('Erro ao carregar perfis disponíveis');
      navigate('/login');
    }
  }, [roles, navigate]);

  const handleRoleSelect = async (role: string) => {
    try {
      setLoadingRole(role);
      let redirectPath: string;
      switch (role.toLowerCase()) {
        case 'atleta':
          redirectPath = '/athlete-profile';
          break;
        case 'organizador':
          redirectPath = '/organizer-dashboard';
          break;
        case 'representante de delegação':
          redirectPath = '/delegation-dashboard';
          break;
        default:
          toast.error('Perfil inválido selecionado');
          return;
      }
      toast.success(`Acessando painel de ${role.toLowerCase()}`);
      navigate(redirectPath);
    } catch {
      toast.error('Erro ao selecionar perfil');
    } finally {
      setLoadingRole(null);
    }
  };

  if (roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <LoadingImage size="sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-olimpics-green-primary/5 via-background to-background p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
            alt="EECC"
            className="w-16 h-16 object-contain mx-auto"
          />
          <h1 className="text-2xl font-bold text-foreground">Bem-vindo!</h1>
          <p className="text-sm text-muted-foreground">
            Você possui {roles.length > 1 ? 'múltiplos perfis' : 'um perfil'}. Selecione como deseja entrar.
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          {roles.map((role) => {
            const meta = getRoleMeta(role);
            const Icon = meta.icon;
            const isLoading = loadingRole === role;
            const isDisabled = loadingRole !== null;

            return (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center gap-4 rounded-xl border-2 bg-card px-4 py-4 text-left',
                  'transition-all duration-200 cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olimpics-green-primary',
                  meta.border,
                  isDisabled && !isLoading && 'opacity-50 cursor-not-allowed',
                  isLoading && 'opacity-80',
                )}
              >
                {/* Icon */}
                <div className={cn('rounded-lg p-2.5 flex-shrink-0', meta.color)}>
                  {isLoading
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : <Icon className="h-5 w-5" />
                  }
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground capitalize">{role}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{meta.description}</p>
                </div>

                {/* Arrow */}
                <ChevronRight className={cn(
                  'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                  isLoading ? 'text-muted-foreground' : 'text-muted-foreground group-hover:translate-x-0.5',
                )} />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground">
          Escola do Esporte com Caráter e Coragem
        </p>
      </div>
    </div>
  );
}
