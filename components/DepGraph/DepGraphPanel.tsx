"use client"
import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useVisualizerStore } from '@/store/visualizer';
import { Network } from 'lucide-react';

const initialNodes: any[] = [];
const initialEdges: any[] = [];

export default function DepGraphPanel() {
  const { depsOutput, isProcessing, theme } = useVisualizerStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
     if (depsOutput) {
       // set nodes/edges layout here logically. for now just set
       const layoutedNodes = depsOutput.nodes.map((n: any, idx: number) => ({
           ...n,
           position: { x: (idx % 3) * 200, y: Math.floor(idx / 3) * 150 }
       }));
       setNodes(layoutedNodes);
       setEdges(depsOutput.edges);
     } else {
       setNodes([]);
       setEdges([]);
     }
  }, [depsOutput, setNodes, setEdges]);
  
  const rtBg = theme === 'monokai' || theme === 'github-dark' || theme === 'catppuccin' || theme === 'nord' || theme === 'dracula' || theme === 'tokyo-night' ? '#1f2428' : '#fff';

  return (
    <div className="flex flex-col h-full w-full relative bg-[var(--bg-main)]">
      {(isProcessing) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
            <Network className="animate-pulse text-[var(--accent)]" size={48} />
          </div>
      )}
        
      {!depsOutput && !isProcessing && (
         <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] opacity-50 z-10 pointer-events-none flex-col">
            <Network size={64}/>
            <p className="mt-4 font-spacemono">Upload a multi-file project to extract dependencies</p>
         </div>
      )}
      
      <ReactFlow
         nodes={nodes}
         edges={edges}
         onNodesChange={onNodesChange}
         onEdgesChange={onEdgesChange}
         onConnect={onConnect}
         fitView
         className="w-full h-full"
      >
        <Controls className="bg-[var(--bg-panel)] fill-[var(--text-primary)]" />
        <MiniMap zoomable pannable nodeColor={"var(--accent)"} maskColor={"var(--bg-panel)"} style={{ backgroundColor: rtBg }} />
        <Background color="var(--border-panel)" gap={16} />
      </ReactFlow>
    </div>
  );
}
