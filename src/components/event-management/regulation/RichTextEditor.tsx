
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }], // Text alignment buttons
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'align', // Add alignment format
    'list', 'bullet',
    'header',
    'color', 'background',
    'link',
  ];

  return (
    <div className={`${className || ''} rich-text-editor`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
