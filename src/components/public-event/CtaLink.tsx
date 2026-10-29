import React from 'react';
import { Link } from 'react-router-dom';

interface CtaLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** Link de chamada para ação: rota interna via react-router, URL absoluta (app principal, a partir do subdomínio) via <a>. */
export function CtaLink({ href, className, children }: CtaLinkProps) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}
