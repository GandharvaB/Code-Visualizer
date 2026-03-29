"use client"
import { useState } from 'react';
import { useVisualizerStore } from '@/store/visualizer';
import { X, Link as LinkIcon, Download } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
}

export default function UrlImportModal({ onClose }: ModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCode, setLanguage, setFiles } = useVisualizerStore();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fetch-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch from URL");
      }

      setCode(data.code);
      setFiles([{ name: url.split('/').pop() || 'imported_file', content: data.code }]);
      
      const ext = url.split('.').pop()?.toLowerCase() || '';
      const extMap: Record<string, string> = {
         'js': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
         'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'cpp', 'rs': 'rust', 'go': 'go'
      };
      
      if (extMap[ext]) {
          setLanguage(extMap[ext]);
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-panel)]">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)] font-spacemono tracking-tight">
            <LinkIcon className="text-[var(--accent)]" size={20} />
            Import from URL
          </h2>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleImport} className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Paste a public GitHub file URL (e.g. <code className="text-xs bg-[var(--bg-main)] px-1 py-0.5 rounded text-[var(--accent)] text-nowrap">github.com/.../file.js</code>) to load its code.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Resource URL
              </label>
              <input 
                type="url"
                value={url}
                required
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-panel)] text-[var(--text-primary)] rounded-md px-3 py-2 text-sm font-spacemono outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md border border-red-400/20">
                {error}
              </div>
            )}
            
            <button
               type="submit"
               disabled={loading || !url.trim()}
               className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-medium py-2.5 px-4 rounded-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
               {loading ? (
                   <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                   <>
                       <Download size={18} />
                       Import Code
                   </>
               )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
