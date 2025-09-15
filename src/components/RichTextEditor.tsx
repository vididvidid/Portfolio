import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Image, Link, Palette } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowImages?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...", 
  className = "",
  allowImages = false,
  onImageUpload
}: RichTextEditorProps) {
  const [_showToolbar, setShowToolbar] = useState(false);
  const [_selectedText, setSelectedText] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
      setSelectedText('');
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyTextColor = (color: string) => {
    formatText('foreColor', color);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      try {
        const imageUrl = await onImageUpload(file);
        formatText('insertImage', imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
      }
    }
  };

  const insertLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      alert('Please select some text first to create a link.');
      return;
    }
    
    const url = prompt('Enter URL (include http:// or https://):');
    if (url) {
      // Ensure the URL has a protocol
      const validUrl = url.startsWith('http') ? url : `https://${url}`;
      
      // Create link with target="_blank" and rel attributes for security
      const linkHtml = `<a href="${validUrl}" target="_blank" rel="noopener noreferrer">${selection.toString()}</a>`;
      
      // Replace selection with link
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = linkHtml;
        const fragment = document.createDocumentFragment();
        while (div.firstChild) {
          fragment.appendChild(div.firstChild);
        }
        range.insertNode(fragment);
        
        // Clear selection
        selection.removeAllRanges();
        
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <div className="border border-border rounded-t-lg p-2 bg-muted/30 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Colors */}
        <div className="flex items-center gap-1">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <button
            type="button"
            onClick={() => applyTextColor('#2d2d2d')}
            className="w-6 h-6 rounded border border-border bg-[#2d2d2d] hover:scale-110 transition-transform"
            title="Dark Grey"
          />
          <button
            type="button"
            onClick={() => applyTextColor('#6b6b6b')}
            className="w-6 h-6 rounded border border-border bg-[#6b6b6b] hover:scale-110 transition-transform"
            title="Light Grey"
          />
          <button
            type="button"
            onClick={() => applyTextColor('#4a4a4a')}
            className="w-6 h-6 rounded border border-border bg-[#4a4a4a] hover:scale-110 transition-transform"
            title="Medium Grey"
          />
          <button
            type="button"
            onClick={() => applyTextColor('#8b7355')}
            className="w-6 h-6 rounded border border-border bg-[#8b7355] hover:scale-110 transition-transform"
            title="Brown"
          />
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Insert Link"
        >
          <Link className="w-4 h-4" />
        </button>

        {allowImages && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title="Insert Image"
            >
              <Image className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        className="min-h-[120px] p-3 border border-t-0 border-border rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
        style={{ 
          whiteSpace: 'pre-wrap',
          fontFamily: 'Source Serif Pro, Georgia, Times New Roman, serif',
          lineHeight: '1.7',
          letterSpacing: '0.01em'
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b6b6b;
          pointer-events: none;
          font-style: italic;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }
        
        [contenteditable] a {
          color: #4a4a4a;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
        }
        
        [contenteditable] a:hover {
          text-decoration-thickness: 2px;
        }
      `}</style>
    </div>
  );
}