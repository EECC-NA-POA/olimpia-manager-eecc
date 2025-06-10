
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

export function NavLink({ to, icon, label, isActive }: NavLinkProps) {
  return (
    <Link 
      to={to}
      className={`${
        isActive 
          ? 'bg-olimpics-green-secondary text-white' 
          : 'text-white/80 hover:bg-olimpics-green-secondary/40 hover:text-white'
      } flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-sm`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
