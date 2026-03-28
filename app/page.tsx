"use client"
import { useEffect, useState } from 'react';
import { useVisualizerStore } from '@/store/visualizer';
import EditorPanel from '@/components/Editor/EditorPanel';
import FlowchartPanel from '@/components/FlowChart/FlowchartPanel';
import DepGraphPanel from '@/components/DepGraph/DepGraphPanel';
import InfoPanel from '@/components/InfoPanel/InfoPanel';
import Header from '@/components/Header/Header';
import LandingHero from '@/components/LandingHero/LandingHero';
import { Bot, Network, Workflow, Braces } from 'lucide-react';

export default function Home() {
  const { code, activeMode, setActiveMode, theme } = useVisualizerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!mounted) return null;

  if (!code) {
    return <LandingHero />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] font-jbmono">
      <Header />
      
      <main className="flex-1 flex flex-row overflow-hidden p-2 gap-2">
        {/* Left Panel: Code */}
        <div className="w-1/3 flex flex-col panel">
          <EditorPanel />
        </div>

        {/* Center Panel: Vis Canvas */}
        <div className="w-1/2 flex flex-col panel relative">
          {activeMode === 'flowchart' && <FlowchartPanel />}
          {activeMode === 'deps' && <DepGraphPanel />}
          {activeMode === 'ast' && <div className="p-4 flex-1 overflow-auto"><pre>{useVisualizerStore.getState().astRaw}</pre></div>}
          
          {/* Bottom Bar Controls for Mode Switch */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 p-1 bg-[var(--bg-panel)] border border-[var(--border-panel)] rounded-full shadow-lg backdrop-blur-md z-50">
            <ModeTab 
               icon={<Workflow size={16} />} 
               label="Flowchart" 
               active={activeMode === 'flowchart'} 
               onClick={() => setActiveMode('flowchart')} 
            />
            <ModeTab 
               icon={<Network size={16} />} 
               label="Deps" 
               active={activeMode === 'deps'} 
               onClick={() => setActiveMode('deps')} 
            />
            <ModeTab 
               icon={<Braces size={16} />} 
               label="AST" 
               active={activeMode === 'ast'} 
               onClick={() => setActiveMode('ast')} 
            />
          </div>
        </div>

        {/* Right Panel: Info */}
        <div className="w-[16.666%] flex flex-col panel">
          <InfoPanel />
        </div>
      </main>
    </div>
  );
}

function ModeTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
        active 
          ? 'bg-[var(--accent)] text-white shadow-md' 
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-panel)]'
      }`}
    >
      {icon}
      <span className="font-spacemono">{label}</span>
    </button>
  );
}
