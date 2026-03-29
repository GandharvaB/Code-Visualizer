"use client"
import { sampleCodes } from '@/lib/samples';
import { useVisualizerStore } from '@/store/visualizer';
import { Code2, Settings, Download, Upload, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import UrlImportModal from './UrlImportModal';

const languages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 'go'
];

export default function Header() {
  const { setCode, language, setLanguage, setIsProcessing, setOutputs, setFiles, activeMode, setActiveMode } = useVisualizerStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showUrlImport, setShowUrlImport] = useState(false);

  const loadSample = (key: string) => {
    const code = sampleCodes[key];
    if (code) {
      if (key.includes('python')) setLanguage('python');
      else if (key.includes('javascript')) setLanguage('javascript');
      else if (key.includes('typescript')) setLanguage('typescript');
      setCode(code);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.zip')) {
        // Here we'd typically use JSZip to read the zip.
        // For now, we mock it or show alert since JSZip isn't in scope.
        alert('Zip upload currently unsupported in this demo without jszip!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCode(text);
      setFiles([{ name: file.name, content: text }]);
      // Determine language
      const ext = file.name.split('.').pop() || '';
      const extMap: Record<string, string> = {
         'js': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
         'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'cpp', 'rs': 'rust', 'go': 'go'
      };
      if (extMap[ext]) setLanguage(extMap[ext]);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className="h-14 bg-[var(--bg-panel)] border-b border-[var(--border-panel)] flex items-center justify-between px-6 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <Code2 className="text-[var(--accent)]" size={24} />
          <h1 className="font-spacemono text-xl font-bold tracking-tight">CodeTutor</h1>
          <span className="text-xs text-[var(--accent)] px-2 py-0.5 border border-[var(--accent)] rounded-full hidden sm:block">Visualizer</span>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[var(--bg-main)] border border-[var(--border-panel)] text-[var(--text-primary)] rounded px-3 py-1.5 text-sm font-spacemono outline-none focus:border-[var(--accent)]"
          >
            {languages.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>

          <select 
            onChange={(e) => loadSample(e.target.value)}
            defaultValue=""
            className="bg-[var(--bg-main)] border border-[var(--border-panel)] text-[var(--text-primary)] rounded px-3 py-1.5 text-sm font-spacemono outline-none focus:border-[var(--accent)]"
          >
            <option value="" disabled>Load Sample</option>
            <option value="python_bfs">Python BFS</option>
            <option value="javascript_event">JS Fetch</option>
            <option value="typescript_auth">TS Auth JWT</option>
          </select>

          <label className="cursor-pointer flex items-center gap-2 hover:text-[var(--text-primary)] text-[var(--text-muted)] transition-colors px-2">
             <Upload size={18} />
             <input type="file" className="hidden" accept=".js,.ts,.py,.java,.cpp,.rs,.go,.zip" onChange={handleFileUpload} />
          </label>

          <button 
             onClick={() => setShowUrlImport(true)}
             className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-2"
             title="Import GitHub Link"
          >
             <LinkIcon size={18} />
          </button>

          <button 
             onClick={() => setShowSettings(true)}
             className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-2"
          >
             <Settings size={20} />
          </button>
        </div>
      </header>
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showUrlImport && <UrlImportModal onClose={() => setShowUrlImport(false)} />}
    </>
  );
}
