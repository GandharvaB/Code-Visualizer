import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type VisMode = 'flowchart' | 'deps' | 'ast' | 'ir';
export type Theme = 'monokai' | 'github-dark' | 'catppuccin' | 'nord' | 'dracula' | 'tokyo-night';

interface VisualizerState {
  code: string;
  files: { name: string; content: string }[];
  language: string;
  activeMode: VisMode;

  mermaidOutput: string;
  irOutput: any;
  astOutput: any;
  astRaw: string;
  depsOutput: any;
  isProcessing: boolean;
  selectedNodeId: string | null;

  theme: Theme;
  autoRefresh: boolean;
  refreshDelay: number;
  flowDirection: 'TD' | 'LR' | 'BT' | 'RL';
  aiEnabled: boolean;
  aiProvider: string;
  aiApiKey: string;
  aiStyle: 'Concise' | 'Explanatory' | 'Technical';
  aiLanguage: string;
  
  // Actions
  setCode: (code: string) => void;
  setFiles: (files: { name: string; content: string }[]) => void;
  setLanguage: (lang: string) => void;
  setActiveMode: (mode: VisMode) => void;
  setOutputs: (outputs: Partial<Pick<VisualizerState, 'mermaidOutput' | 'irOutput' | 'astOutput' | 'astRaw' | 'depsOutput'>>) => void;
  setIsProcessing: (loading: boolean) => void;
  setSelectedNodeId: (id: string | null) => void;
  
  // Settings Actions
  setTheme: (theme: Theme) => void;
  setAutoRefresh: (val: boolean) => void;
  setRefreshDelay: (delay: number) => void;
  setFlowDirection: (dir: 'TD' | 'LR' | 'BT' | 'RL') => void;
  setAiEnabled: (val: boolean) => void;
  setAiApiKey: (key: string) => void;
  setAiStyle: (style: VisualizerState['aiStyle']) => void;
}

export const useVisualizerStore = create<VisualizerState>()(
  persist(
    (set) => ({
      code: '',
      files: [],
      language: 'javascript',
      activeMode: 'flowchart',

      mermaidOutput: '',
      irOutput: null,
      astOutput: null,
      astRaw: '',
      depsOutput: null,
      isProcessing: false,
      selectedNodeId: null,

      theme: 'github-dark',
      autoRefresh: true,
      refreshDelay: 800,
      flowDirection: 'TD',
      aiEnabled: false,
      aiProvider: 'Anthropic',
      aiApiKey: '',
      aiStyle: 'Concise',
      aiLanguage: 'English',

      setCode: (code) => set({ code }),
      setFiles: (files) => set({ files }),
      setLanguage: (language) => set({ language }),
      setActiveMode: (activeMode) => set({ activeMode }),
      setOutputs: (outputs) => set((state) => ({ ...state, ...outputs })),
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

      setTheme: (theme) => set({ theme }),
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshDelay: (refreshDelay) => set({ refreshDelay }),
      setFlowDirection: (flowDirection) => set({ flowDirection }),
      setAiEnabled: (aiEnabled) => set({ aiEnabled }),
      setAiApiKey: (aiApiKey) => set({ aiApiKey }),
      setAiStyle: (aiStyle) => set({ aiStyle }),
    }),
    {
      name: 'visualizer-storage',
      // Only persist settings
      partialize: (state) => ({
        theme: state.theme,
        autoRefresh: state.autoRefresh,
        refreshDelay: state.refreshDelay,
        flowDirection: state.flowDirection,
        aiEnabled: state.aiEnabled,
        aiApiKey: state.aiApiKey,
        aiStyle: state.aiStyle,
      }),
    }
  )
);
