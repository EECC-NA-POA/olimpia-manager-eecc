import { Github, Instagram, Linkedin, Mail, MessageCircle, User, Settings, LogOut, ClipboardList, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Footer = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const socialLinks = [
    {
      icon: <Linkedin className="w-4 h-4" />,
      href: "https://www.linkedin.com/in/olimarteixeiraborges/",
      label: "LinkedIn",
    },
    {
      icon: <Github className="w-4 h-4" />,
      href: "https://github.com/olimarborges",
      label: "GitHub",
    },
    {
      icon: <Instagram className="w-4 h-4" />,
      href: "https://www.instagram.com/olimarbjunior/",
      label: "Instagram",
    },
    {
      icon: <Mail className="w-4 h-4" />,
      href: "mailto:olimarbjunior@gmail.com",
      label: "Email",
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      href: "https://wa.me/5551984294328",
      label: "WhatsApp",
    },
  ];

  const userRoles = user?.papeis || [];
  const navigationItems = [
    {
      icon: User,
      label: "Perfil",
      path: "/athlete-profile",
      roles: ["ATL"],
    },
    {
      icon: ClipboardList,
      label: "Inscrições",
      path: "/athlete-registrations",
      roles: ["ATL"],
    },
    {
      icon: Settings,
      label: "Organizador(a)",
      path: "/organizer-dashboard",
      roles: ["ORE"],
    },
    {
      icon: Users,
      label: "Delegação",
      path: "/delegation-dashboard",
      roles: ["RDD"],
    }
  ];

  const handleLogout = async () => {
    try {
      console.log('Initiating logout process...');
      await signOut();
      console.log('User signed out successfully');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.some(roleCode => userRoles.some(userRole => userRole.codigo === roleCode))
  );

  const showMobileNav = user && (!isMobile || (isMobile && location.pathname !== '/'));

  const showFooter = !isMobile || (isMobile && location.pathname === '/');

  return (
    <>
      {showMobileNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {filteredNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 text-xs rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "text-olimpics-green-primary bg-olimpics-green-primary/10"
                    : "text-gray-500 hover:text-olimpics-green-primary hover:bg-olimpics-green-primary/5"
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center p-2 text-xs text-red-500 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mb-1" />
              <span>Sair</span>
            </button>
          </div>
        </nav>
      )}
      {showFooter && (
        <footer className="hidden md:block w-full bg-white/80 backdrop-blur-sm border-t py-4 px-4 mt-auto">
          <div className="container mx-auto flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Desenvolvido por: Olimar Teixeira Borges
            </span>
            <div className="flex gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-olimpics-green-primary transition-colors"
                  title={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;
