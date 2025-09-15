import { useState, useEffect } from 'react';
import { X, Save, LogOut } from 'lucide-react';

interface AdminPanelProps {
  content: any;
  onContentUpdate: (content: any) => void;
  onClose: () => void;
  onLogout: () => void;
}

export function AdminPanel({ content: initialContent, onContentUpdate, onClose, onLogout }: AdminPanelProps) {
  // State to hold the string content of the editor
  const [jsonText, setJsonText] = useState('');
  // State to hold any JSON parsing errors
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // When the component loads, format the initial content object into a readable JSON string
  useEffect(() => {
    setJsonText(JSON.stringify(initialContent, null, 2));
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      console.error("Admin token not found. Logging out.");
      onLogout();
    }
  }, [initialContent, onLogout]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    
    // Validate the JSON in real-time
    try {
      JSON.parse(newText);
      setJsonError(null); // If it parses, there's no error
    } catch (error) {
      setJsonError('Invalid JSON format. Please correct the syntax.');
    }
  };

  const saveContent = async () => {
    // Prevent saving if JSON is invalid or if there's no token
    if (jsonError) {
      alert(`Cannot save: ${jsonError}`);
      return;
    }
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }

    setSaving(true);
    try {
      const parsedContent = JSON.parse(jsonText);
      const apiUrl = `${import.meta.env.VITE_API_URL}/portfolio`;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parsedContent) // Send the validated content
      });

      if (response.ok) {
        onContentUpdate(parsedContent); // Update the main app's state
        alert('Content saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error saving content: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden">
      <div className="bg-background h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl">Portfolio JSON Editor</h2>
          <div className="flex gap-4">
            <button
              onClick={saveContent}
              disabled={saving || !!jsonError} // Disable button if saving or if JSON is invalid
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* JSON Editor */}
        <div className="flex-1 overflow-auto p-4 relative">
          <textarea
            value={jsonText}
            onChange={handleTextChange}
            className={`w-full h-full p-4 border rounded-lg bg-input-background font-mono text-sm resize-none focus:outline-none focus:ring-2
              ${jsonError 
                ? 'border-destructive focus:ring-destructive/40' 
                : 'border-border focus:ring-primary/20'
              }`
            }
            placeholder="Enter your portfolio content in JSON format..."
            spellCheck="false"
          />
        </div>
        
        {/* Error Footer */}
        {jsonError && (
          <div className="p-2 bg-destructive text-destructive-foreground text-center text-sm flex-shrink-0">
            {jsonError}
          </div>
        )}
      </div>
    </div>
  );
}