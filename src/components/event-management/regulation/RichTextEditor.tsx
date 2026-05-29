
import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    ['link'],
    ['blockquote', 'code-block'],
    ['clean'],
  ],
};

const FORMATS = [
  'bold', 'italic', 'underline', 'strike',
  'align', 'list',
  'header',
  'color', 'background',
  'link',
  'blockquote', 'code-block',
];

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
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
    <div className={`${className || ''} rich-text-editor`}>
      <div ref={containerRef} />
    </div>
  );
}
