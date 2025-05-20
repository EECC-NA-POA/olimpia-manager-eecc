
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { TopNavigation } from './navigation/TopNavigation';

export function GlobalHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleClick = () => {
    // Only navigate to home page if not logged in
    if (!user) {
      navigate('/');
    }
    // If user is logged in, don't navigate away to prevent sidebar from disappearing
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full">
      <header className="w-full h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container flex h-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleClick}
              className="text-olimpics-green-primary hover:text-olimpics-green-secondary"
            >
              Olimpíadas Estaduais - Escola do Esporte com Coração - EECC
            </Button>
          </div>
        </div>
      </header>
      
      {user && <TopNavigation user={user} roles={useAuth().roles} />}
    </div>
  );
}
