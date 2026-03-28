"use client"
import Editor from '@monaco-editor/react';
import { useVisualizerStore } from '@/store/visualizer';
import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

export default function EditorPanel() {
  const { code, setCode, language, theme, autoRefresh, refreshDelay, setOutputs, setIsProcessing } = useVisualizerStore();
  const [localCode, setLocalCode] = useState(code);
  const debounceTimer = useRef<NodeJS.Timeout>(null);

  const monacoTheme = theme === 'github-dark' || theme === 'nord' || theme === 'tokyo-night' 
        ? 'vs-dark' : (theme === 'catppuccin' || theme === 'dracula' || theme === 'monokai') ? 'hc-black' : 'light';

  useEffect(() => {
    if (code !== localCode) {
      setLocalCode(code);
    }
  }, [code]);

  useEffect(() => {
    if (autoRefresh) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        handleVisualize(localCode);
      }, refreshDelay);
    }
    
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }
  }, [localCode, autoRefresh, refreshDelay]);

  const handleVisualize = async (codeToRun: string = localCode) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToRun, language, direction: useVisualizerStore.getState().flowDirection })
      });
      
      if (res.ok) {
        const data = await res.json();
        setOutputs({ mermaidOutput: data.mermaid, irOutput: data.ir, astRaw: data.astRaw });
      } else {
        console.error("Failed to parse");
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="h-10 border-b border-[var(--border-panel)] flex items-center justify-between px-4 bg-[var(--bg-main)]">
         <span className="font-spacemono text-sm text-[var(--accent)] shrink-0">CODE EDITOR</span>
         
         <div className="flex items-center gap-2">
           {!autoRefresh && (
             <button 
                onClick={() => handleVisualize()}
                className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs flex items-center gap-1 hover:opacity-90"
             >
                <Play size={14} /> Visualize
             </button>
           )}
         </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme={monacoTheme}
          value={localCode}
          onChange={(val) => {
             setLocalCode(val || "");
             setCode(val || "");
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'var(--font-jbmono), monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
