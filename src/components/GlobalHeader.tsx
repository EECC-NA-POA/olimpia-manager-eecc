
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';

export function GlobalHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const handleClick = () => {
    // Only navigate to home page if not logged in
    if (!user) {
      navigate('/');
    }
    // If user is logged in, don't navigate away to prevent sidebar from disappearing
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleClick}
            className="text-olimpics-green-primary hover:text-olimpics-green-secondary"
          >
            Olímpia Manager
          </Button>
        </div>
      </div>
    </header>
  );
}
