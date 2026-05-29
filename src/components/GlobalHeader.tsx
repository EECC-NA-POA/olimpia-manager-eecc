
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';

const PUBLIC_ROUTES = ['/', '/login', '/olimpiadas-nacionais', '/torneio-concordia',
  '/events', '/forgot-password', '/esqueci-senha', '/reset-password', '/redefinir-senha',
  '/verify-email', '/verificar-email', '/acesso-negado', '/event-selection'];

export function GlobalHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Não mostrar header nas rotas protegidas (têm sidebar própria)
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)
    || location.pathname.startsWith('/events/')
    || location.pathname.startsWith('/event/');

  const handleClick = () => {
    navigate('/');
  };

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down & past threshold
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [lastScrollY]);

  if (!isPublicRoute) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full h-14 border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container flex h-full items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleClick}
          className="text-sm font-semibold text-[hsl(142,72%,22%)] hover:text-[hsl(142,100%,30%)] hover:bg-[hsl(142,40%,93%)] gap-2 px-3"
        >
          <img
            src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
            alt="Logo"
            className="h-6 w-6 object-contain"
          />
          Olímpia Manager
        </Button>
      </div>
    </header>
  );
}
