import type { Components } from 'react-markdown';
import { ExternalLink } from 'lucide-react';

// Overrides do ReactMarkdown para renderizar documentação com formatação polida,
// sem depender só do `prose`: tabelas GFM responsivas, código, e links em nova aba.
// Reutilizável entre a aba Documentações e outros viewers de markdown.
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-olimpics-green-primary mt-8 mb-3 pb-2 border-b border-border first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-olimpics-green-primary mt-6 mb-2 pb-1 border-b border-border">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => <p className="my-3 leading-relaxed text-sm text-foreground">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 my-3 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 my-3 text-sm">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-olimpics-green-primary/40 pl-4 my-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-olimpics-green-primary underline hover:opacity-80 inline-flex items-center gap-0.5"
    >
      {children}
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-border">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  th: ({ children }) => <th className="text-left font-semibold px-4 py-2 whitespace-nowrap">{children}</th>,
  td: ({ children }) => <td className="px-4 py-2 align-top">{children}</td>,
  code: ({ className, children }) => {
    const isBlock = !!className && className.includes('language-');
    if (isBlock) {
      return <code className={`font-mono ${className ?? ''}`}>{children}</code>;
    }
    return (
      <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm">{children}</pre>
  ),
};
