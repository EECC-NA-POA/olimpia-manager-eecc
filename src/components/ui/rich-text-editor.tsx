
import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '@/styles/rich-text-editor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link'],
    ['clean'],
  ],
};

const FORMATS = ['header', 'bold', 'italic', 'underline', 'list', 'align', 'link'];

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Digite o conteúdo...',
  className = '',
}: RichTextEditorProps) {
  // wrapperRef é o elemento que vai conter TUDO que o Quill criar
  // (toolbar + container). Limpando innerHTML dele, eliminamos tudo de uma vez.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!wrapperRef.current || quillRef.current) return;

    // Cria um div filho limpo para o Quill montar. Assim o Quill insere
    // a toolbar antes desse div, mas ainda dentro de wrapperRef.
    const mountTarget = document.createElement('div');
    wrapperRef.current.appendChild(mountTarget);

    const quill = new Quill(mountTarget, {
      theme: 'snow',
      placeholder,
      modules: MODULES,
      formats: FORMATS,
    });

    quillRef.current = quill;

    if (value) {
      const delta = quill.clipboard.convert({ html: value });
      quill.setContents(delta, 'silent');
    }

    quill.on('text-change', () => {
      onChangeRef.current(quill.getSemanticHTML());
    });

    return () => {
      quill.off('text-change');
      quillRef.current = null;
      // Limpa toolbar + container de uma vez
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
    };
  }, []);

  // Sincroniza valor externo (ex: reset do form)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const current = quill.getSemanticHTML();
    if (current !== value) {
      const delta = quill.clipboard.convert({ html: value || '' });
      quill.setContents(delta, 'silent');
    }
  }, [value]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <div ref={wrapperRef} />
    </div>
  );
}
