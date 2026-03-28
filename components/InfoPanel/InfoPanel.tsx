"use client"
import { useVisualizerStore } from '@/store/visualizer';
import { Bot, Info, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function InfoPanel() {
  const { selectedNodeId, irOutput, aiEnabled, aiApiKey, aiProvider } = useVisualizerStore();
  const [aiLabel, setAiLabel] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // find node in IR
  const activeNode = irOutput?.nodes?.find((n: any) => n.id === selectedNodeId);

  const fetchAiExplanation = async () => {
    if (!activeNode || !aiEnabled || !aiApiKey) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           label: activeNode.label,
           style: useVisualizerStore.getState().aiStyle,
           model: aiProvider,
           language: useVisualizerStore.getState().aiLanguage,
           apiKey: aiApiKey
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiLabel(data.label);
      } else {
        setAiLabel("Failed to fetch AI explanation. Check API Key.");
      }
    } catch {
      setAiLabel("Network Error");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] overflow-y-auto">
      <div className="sticky top-0 bg-[var(--bg-panel)] border-b border-[var(--border-panel)] p-4 shadow-sm z-10 flex items-center justify-between">
         <div className="flex items-center gap-2 text-[var(--text-muted)]">
           <Info size={16} />
           <span className="font-spacemono text-sm">INFO PANEL</span>
         </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {!activeNode ? (
          <div className="flex flex-col items-center justify-center text-center mt-10 opacity-60">
            <Bot size={48} className="text-[var(--text-muted)] mb-4" />
            <p className="text-sm">Click on any node in the visualization to see details here.</p>
          </div>
        ) : (
          <>
            <div className="bg-[var(--bg-main)] p-3 rounded border border-[var(--border-panel)]">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Node Selection</h3>
              <p className="font-spacemono text-[var(--text-primary)] break-words">
                <span className="text-[var(--accent)]">Id:</span> {activeNode.id}
              </p>
              <p className="font-spacemono text-[var(--text-primary)] break-words">
                <span className="text-[var(--accent)]">Type:</span> {activeNode.type}
              </p>
              {activeNode.lineStart !== undefined && (
                <p className="font-spacemono text-[var(--text-primary)]">
                  <span className="text-[var(--accent)]">Lines:</span> {activeNode.lineStart} - {activeNode.lineEnd}
                </p>
              )}
            </div>

            <div className="bg-[var(--bg-main)] p-3 rounded border border-[var(--border-panel)]">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Original Label</h3>
              <p className="font-spacemono text-[var(--text-primary)] break-words">{activeNode.label}</p>
            </div>

            {aiEnabled && (
              <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={fetchAiExplanation}
                  disabled={loadingAi || !aiApiKey}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2 font-bold text-sm transition-all shadow disabled:opacity-50 disabled:grayscale"
                >
                  {loadingAi ? (
                    <span className="animate-pulse">Analyzing...</span>
                  ) : (
                    <>
                      <Sparkles size={14} /> Explain with AI
                    </>
                  )}
                </button>
                
                {!aiApiKey && (
                  <p className="text-xs text-red-400 text-center">Missing Anthropic API Key in Settings.</p>
                )}
                
                {aiLabel && (
                  <div className="bg-purple-900/30 border border-purple-500/50 p-3 rounded shadow-inner mt-2">
                    <h3 className="text-xs font-bold text-purple-300 uppercase mb-2">AI Interpretation</h3>
                    <p className="text-sm text-purple-100">{aiLabel}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
