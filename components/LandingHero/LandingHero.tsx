"use client"
import { useVisualizerStore } from '@/store/visualizer';
import { sampleCodes } from '@/lib/samples';
import { Network, Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function LandingHero() {
  const { setCode, setLanguage, theme } = useVisualizerStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const loadSample = () => {
    setLanguage('python');
    setCode(sampleCodes['python_bfs']);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-spacemono relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center text-center max-w-3xl px-6"
      >
        <div className="mb-6 inline-flex p-3 rounded-2xl bg-[var(--bg-panel)] shadow-xl ring-1 ring-[var(--border-panel)]">
           <Network size={48} className="text-[var(--accent)]" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)]">
          Understand Any Code, <span className="text-[var(--accent)]">Instantly</span>
        </h1>
        
        <p className="text-xl text-[var(--text-muted)] mb-12 max-w-xl font-jbmono font-light leading-relaxed">
          Paste code &rarr; See the flow. Debug faster. Learn deeper.
        </p>
        
        <button 
           onClick={loadSample}
           className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent)] text-[var(--bg-main)] font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent)]/20"
        >
           <span className="relative z-10 flex items-center gap-2">Try with Sample Code <Play size={18} fill="currentColor" /></span>
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        </button>
        
        <p className="mt-8 text-sm text-[var(--text-muted)] flex items-center gap-2">
           <Sparkles size={14} className="text-purple-400" />
           Enhanced with optional AI labels processing securely.
        </p>
      </motion.div>
    </div>
  );
}
