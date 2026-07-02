import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DOCS, type DocCategory } from '@/lib/docs/registry';
import { markdownComponents } from '@/lib/docs/markdownComponents';
import { Library, Search } from 'lucide-react';

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

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function EventDocumentationsSection() {
  const allDocs = useMemo(
    () => [...DOCS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    []
  );
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState(allDocs[0]?.slug);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return allDocs;
    return allDocs.filter(d => norm(`${d.title} ${d.description}`).includes(q));
  }, [allDocs, query]);

  if (allDocs.length === 0) {
    return (
      <p className="text-center py-16 text-sm text-muted-foreground">
        Nenhuma documentação disponível no momento.
      </p>
    );
  }

  // Documento exibido: o selecionado se ainda está no filtro, senão o 1º resultado.
  const selected =
    filtered.find(d => d.slug === selectedSlug) ?? filtered[0];

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      {/* Lista de documentos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground px-1">
          <Library className="h-4 w-4 text-olimpics-green-primary" />
          Documentos
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar documento..."
            className="pl-8"
          />
        </div>

        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 text-center space-y-2">
              <p>Nenhum documento encontrado para “{query}”.</p>
              <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                Limpar busca
              </Button>
            </div>
          ) : (
            filtered.map(doc => (
              <button
                key={doc.slug}
                type="button"
                onClick={() => setSelectedSlug(doc.slug)}
                className={cn(
                  'w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50',
                  selected && doc.slug === selected.slug
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
            ))
          )}
        </div>
      </div>

      {/* Conteúdo do documento selecionado */}
      {selected && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">{selected.title}</h2>
              <Badge variant="outline" className={cn('text-[10px] font-medium', CATEGORY_STYLE[selected.category])}>
                {selected.category}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                Atualizado em {formatDate(selected.updatedAt)}
              </span>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {selected.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
