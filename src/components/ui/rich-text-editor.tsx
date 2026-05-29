
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
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
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
    };
  }, []);

  // Sync external value changes (e.g. form reset)
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
      <div ref={containerRef} />
    </div>
  );
}
