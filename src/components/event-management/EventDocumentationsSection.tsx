import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DOCS, type DocCategory } from '@/lib/docs/registry';
import { Library } from 'lucide-react';

const CATEGORY_STYLE: Record<DocCategory, string> = {
  'Referência': 'bg-sky-50 text-sky-700 border-sky-200',
  'Atualização': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Melhoria': 'bg-violet-50 text-violet-700 border-violet-200',
  'Correção': 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function EventDocumentationsSection() {
  const docs = [...DOCS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const [selectedSlug, setSelectedSlug] = useState(docs[0]?.slug);

  if (docs.length === 0) {
    return (
      <p className="text-center py-16 text-sm text-muted-foreground">
        Nenhuma documentação disponível no momento.
      </p>
    );
  }

  const selected = docs.find(d => d.slug === selectedSlug) ?? docs[0];

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      {/* Lista de documentos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground px-1">
          <Library className="h-4 w-4 text-olimpics-green-primary" />
          Documentos
        </div>
        {docs.map(doc => (
          <button
            key={doc.slug}
            type="button"
            onClick={() => setSelectedSlug(doc.slug)}
            className={cn(
              'w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50',
              doc.slug === selected.slug
                ? 'border-olimpics-green-primary bg-olimpics-green-primary/5'
                : 'border-border'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{doc.title}</span>
              <Badge variant="outline" className={cn('text-[10px] font-medium', CATEGORY_STYLE[doc.category])}>
                {doc.category}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Atualizado em {formatDate(doc.updatedAt)}</p>
          </button>
        ))}
      </div>

      {/* Conteúdo do documento selecionado */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
