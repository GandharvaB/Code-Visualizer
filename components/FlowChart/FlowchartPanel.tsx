"use client"
import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';
import { useVisualizerStore } from '@/store/visualizer';
import { Download, Minimize, Maximize, RefreshCw } from 'lucide-react';
import { motion, useMotionValue } from 'framer-motion';

export default function FlowchartPanel() {
  const { mermaidOutput, isProcessing, theme } = useVisualizerStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [loadingMermaid, setLoadingMermaid] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'monokai' || theme === 'github-dark' || theme === 'catppuccin' || theme === 'nord' || theme === 'dracula' || theme === 'tokyo-night' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'var(--font-spacemono)',
    });
  }, [theme]);

  useEffect(() => {
    let active = true;
    const renderChart = async () => {
      if (!mermaidOutput) return;
      setLoadingMermaid(true);
      try {
        const { svg } = await mermaid.render('mermaid-chart', mermaidOutput);
        if (active) setSvgContent(svg);
      } catch (error) {
        console.error("Mermaid parsing error:", error);
      } finally {
        if (active) setLoadingMermaid(false);
      }
    };

    if (mermaidOutput) {
      void renderChart();
    } else {
      setSvgContent('');
    }
    return () => { active = false; };
  }, [mermaidOutput, theme]);

  return (
    <div className="flex flex-col h-full w-full relative bg-[var(--bg-main)]">
      <div className="absolute top-4 right-4 z-40 bg-[var(--bg-panel)] border border-[var(--border-panel)] p-1 rounded-md shadow flex gap-2">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-1 hover:bg-[var(--bg-main)] rounded" title="Zoom In"><Maximize size={16} /></button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.4))} className="p-1 hover:bg-[var(--bg-main)] rounded" title="Zoom Out"><Minimize size={16} /></button>
        <button onClick={() => setScale(1)} className="p-1 hover:bg-[var(--bg-main)] rounded" title="Reset Zoom"><RefreshCw size={16} /></button>
        <button onClick={() => window.open(`data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`)} className="p-1 hover:bg-[var(--bg-main)] rounded" title="Export SVG"><Download size={16} /></button>
      </div>

      <div className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center p-10" ref={containerRef}>
        {(isProcessing || loadingMermaid) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
            <RefreshCw className="animate-spin text-[var(--accent)]" size={48} />
          </div>
        )}
        
        {!mermaidOutput && !isProcessing && (
          <div className="text-[var(--text-muted)] opacity-50 flex flex-col items-center">
             <WorkflowIcon />
             <p className="mt-4 font-spacemono">Enter code to generate flowchart</p>
          </div>
        )}
        
        {svgContent && (
          <motion.div 
            drag 
            dragConstraints={containerRef}
            className="will-change-transform"
            style={{ scale }}
            animate={{ scale }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}

function WorkflowIcon() {
  return (
     <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="3" width="6" height="6" rx="1" />
        <rect x="9" y="15" width="6" height="6" rx="1" />
        <path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
        <path d="M12 13v2" />
     </svg>
  );
}
