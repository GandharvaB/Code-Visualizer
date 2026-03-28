"use client"
import { useVisualizerStore, Theme } from '@/store/visualizer';
import { X, Check } from 'lucide-react';
import React from 'react';

const THEMES: { id: Theme; label: string }[] = [
  { id: 'monokai', label: 'Monokai' },
  { id: 'github-dark', label: 'GitHub Dark' },
  { id: 'catppuccin', label: 'Catppuccin Mocha' },
  { id: 'nord', label: 'Nord' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'tokyo-night', label: 'Tokyo Night' }
];

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { 
    theme, setTheme,
    autoRefresh, setAutoRefresh,
    refreshDelay, setRefreshDelay,
    flowDirection, setFlowDirection,
    aiEnabled, setAiEnabled,
    aiApiKey, setAiApiKey,
    aiStyle, setAiStyle,
    aiProvider
  } = useVisualizerStore();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[var(--bg-main)] border border-[var(--border-panel)] w-full max-w-2xl rounded-lg shadow-2xl flex flex-col font-jbmono overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-panel)] bg-[var(--bg-panel)]">
          <h2 className="text-lg font-bold">Preferences</h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--bg-main)] rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-8">
          
          <section>
            <h3 className="text-[var(--accent)] font-bold mb-3 font-spacemono uppercase text-sm">Appearance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`px-4 py-2 rounded border flex flex-col items-start gap-1 ${
                    theme === t.id ? 'border-[var(--accent)] bg-[var(--bg-panel)]' : 'border-[var(--border-panel)] opacity-70 hover:opacity-100'
                  }`}
                >
                   <span className="text-sm">{t.label}</span>
                   {theme === t.id && <Check size={14} className="text-[var(--accent)] absolute right-2 top-2" />}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[var(--accent)] font-bold mb-3 font-spacemono uppercase text-sm">Visualization Options</h3>
            <div className="space-y-4">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[var(--accent)]" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
                  <span className="text-sm">Auto Refresh on Code Change</span>
               </label>

               <div className="flex flex-col gap-1 max-w-sm">
                  <span className="text-sm text-[var(--text-muted)]">Refresh Delay ({refreshDelay}ms)</span>
                  <input 
                     type="range" min="300" max="2000" step="100" 
                     value={refreshDelay} onChange={e => setRefreshDelay(parseInt(e.target.value))}
                     className="w-full accent-[var(--accent)]"
                  />
               </div>

               <div className="flex flex-col gap-1 max-w-sm pt-2">
                  <span className="text-sm text-[var(--text-muted)]">Flowchart Direction</span>
                  <select 
                     value={flowDirection} 
                     onChange={e => setFlowDirection(e.target.value as any)}
                     className="bg-[var(--bg-panel)] border border-[var(--border-panel)] text-[var(--text-primary)] rounded px-3 py-1.5 text-sm w-full"
                  >
                     <option value="TD">Top Down (TD)</option>
                     <option value="LR">Left to Right (LR)</option>
                     <option value="BT">Bottom Top (BT)</option>
                     <option value="RL">Right to Left (RL)</option>
                  </select>
               </div>
            </div>
          </section>

          <section>
            <h3 className="text-purple-400 font-bold mb-3 font-spacemono uppercase text-sm flex items-center gap-2">
              AI Labels 
              <span className="text-[0.6rem] px-2 py-0.5 rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-300">Beta</span>
            </h3>
            
            <div className="space-y-4 bg-purple-900/10 p-4 border border-purple-500/20 rounded">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-purple-500" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} />
                  <span className="text-sm text-purple-100">Enable AI enhanced labels via {aiProvider}</span>
               </label>
               
               {aiEnabled && (
                  <div className="space-y-3 pt-2">
                     <div className="flex flex-col gap-1">
                        <span className="text-sm text-purple-300">API Key (Stored locally only)</span>
                        <input 
                           type="password" 
                           value={aiApiKey} 
                           onChange={e => setAiApiKey(e.target.value)}
                           placeholder="sk-ant-api03..."
                           className="bg-[var(--bg-main)] border border-purple-500/50 text-[var(--text-primary)] rounded px-3 py-2 text-sm w-full outline-none focus:border-purple-400"
                        />
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-sm text-purple-300">Label Style</span>
                        <select 
                           value={aiStyle} 
                           onChange={e => setAiStyle(e.target.value as any)}
                           className="bg-[var(--bg-main)] border border-purple-500/50 text-[var(--text-primary)] rounded px-3 py-2 text-sm w-full outline-none"
                        >
                           <option value="Concise">Concise (1-3 words)</option>
                           <option value="Explanatory">Explanatory (Sentence)</option>
                           <option value="Technical">Technical (Algorithm focus)</option>
                        </select>
                     </div>
                  </div>
               )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
