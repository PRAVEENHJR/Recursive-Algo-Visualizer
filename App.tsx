import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TreeCanvas } from './components/TreeCanvas';
import { RightPanels } from './components/RightPanels';
import { ALGORITHMS } from './algorithms';
import { TraceData, TreeNode } from './types';
import { 
  GitPullRequest, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Layers, Activity
} from 'lucide-react';

export default function App() {
  const [currentAlgoKey, setCurrentAlgoKey] = useState<string>('fibonacci');
  const [parameters, setParameters] = useState<Record<string, any>>({ n: 5 });
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(600);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Default initial trace pre-built from Fib(5)
  const [trace, setTrace] = useState<TraceData>(() => {
    return ALGORITHMS.fibonacci.build({ n: 5 });
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync parameters with newly selected algorithm defaults
  const handleAlgoChange = (key: string) => {
    setCurrentAlgoKey(key);
    setIsPlaying(false);
    setSelectedNode(null);

    const algo = ALGORITHMS[key];
    const newParams: Record<string, any> = {};
    algo.params.forEach(p => {
      newParams[p.key] = p.default;
    });

    setParameters(newParams);

    // Auto-generate the trace for the new algorithm's defaults right away
    const newTrace = algo.build(newParams);
    setTrace(newTrace);
    setStepIndex(0);
  };

  const handleParamChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Re-generate the full recursive trace tree on user command
  const handleBuildTree = () => {
    setSelectedNode(null);
    const algo = ALGORITHMS[currentAlgoKey];
    
    const sanitizedParams = { ...parameters };
    if ('array' in sanitizedParams) {
      // Clean letters/extra symbols and ensure maximum size to prevent browser hangs
      const cleanList = String(sanitizedParams.array)
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0)
        .slice(0, 8)
        .join(', ');
      sanitizedParams.array = cleanList;
      setParameters(sanitizedParams);
    }

    try {
      const newTrace = algo.build(sanitizedParams);
      setTrace(newTrace);
      setStepIndex(0);
      setIsPlaying(true); // Auto-start the visualization playback
    } catch (err) {
      console.error("Failed building recursion tree trace: ", err);
    }
  };

  const handleStepChange = (index: number) => {
    setIsPlaying(false);
    setStepIndex(index);
  };

  const handleTogglePlay = () => {
    if (stepIndex >= trace.events.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  // Step progression tick handler
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIndex(curr => {
          if (curr >= trace.events.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return curr;
          }
          return curr + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, trace.events.length]);

  // Keyboard shortcut listener to ease user traversal of steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setStepIndex(curr => Math.max(0, curr - 1));
        setIsPlaying(false);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setStepIndex(curr => Math.min(trace.events.length - 1, curr + 1));
        setIsPlaying(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, trace.events.length]);

  // Compute active nodes vs returned nodes at the current step point
  const currentEvent = stepIndex >= 0 && stepIndex < trace.events.length ? trace.events[stepIndex] : null;
  
  const visibleNodes = new Set<number>();
  const doneNodes = new Set<number>();
  const stackSnapshot: number[] = [];

  for (let i = 0; i <= stepIndex && i < trace.events.length; i++) {
    const ev = trace.events[i];
    if (ev.type === 'call') {
      stackSnapshot.push(ev.nodeId);
      visibleNodes.add(ev.nodeId);
    } else if (ev.type === 'return') {
      doneNodes.add(ev.nodeId);
      const index = stackSnapshot.lastIndexOf(ev.nodeId);
      if (index !== -1) {
        stackSnapshot.splice(index, 1);
      }
    }
  }

  const activeNodeId = stackSnapshot.length > 0 ? stackSnapshot[stackSnapshot.length - 1] : null;
  const activeLine = currentEvent ? currentEvent.line : null;
  const algo = ALGORITHMS[currentAlgoKey] || ALGORITHMS.fibonacci;

  return (
    <div id="app-root" className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* 1. Configuration & controls sidebar */}
      <Sidebar
        currentAlgoKey={currentAlgoKey}
        onAlgoChange={handleAlgoChange}
        parameters={parameters}
        onParamChange={handleParamChange}
        onBuildTree={handleBuildTree}
      />

      {/* 2. Visual Canvas and Bottom Panels (Main Area) */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Upper Canvas Header */}
        <header id="app-header" className="bg-white border-b border-slate-200 px-5 py-2 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none shadow-sm">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>{algo.name}</span>
            </h2>
            <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-x-3 items-center">
              <span>Category: <span className="text-slate-705 font-bold">{algo.category}</span></span>
              <span>•</span>
              <span>Visitations: <span className="text-slate-705 font-bold">{trace.nodes.length} calls</span></span>
              <span>•</span>
              <span>Time: <span className="text-slate-705 font-bold">{algo.complexity.time}</span></span>
              <span>•</span>
              <span>Space: <span className="text-slate-705 font-bold">{algo.complexity.space}</span></span>
            </div>
          </div>

          {/* Statistics panel in header */}
          <div id="header-stats" className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-xl select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div>
              Peak Depth: <span className="text-slate-900 font-bold font-mono pl-0.5">{Math.max(...trace.nodes.map(n => n.depth), 0) + 1}</span>
            </div>
            <div className="text-slate-300 pointer-events-none">•</div>
            <div>
              Steps: <span className="text-slate-900 font-bold font-mono pl-0.5">{trace.events.length}</span>
            </div>
            <div className="text-slate-300 pointer-events-none">•</div>
            <div>
              Active Calls: <span className="text-amber-600 font-bold font-mono pl-0.5">{stackSnapshot.length}</span>
            </div>
          </div>
        </header>        {/* Responsive Dual-Pane Main View (Canvas area on left, Options tabs panel on right) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* Main Visualizer Canvas & Flow Control Section */}
          <div className="flex-1 flex flex-col min-h-0 relative bg-white border-r border-slate-100">
            {/* Dynamic Zoomable Visual Tree Canvas */}
            <TreeCanvas
              trace={trace}
              activeNodeId={activeNodeId}
              visibleNodes={visibleNodes}
              doneNodes={doneNodes}
              onSelectNode={setSelectedNode}
              selectedNode={selectedNode}
              onSeekStep={handleStepChange}
            />

            {/* Playback & Flow Controls Docked Bar */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 shrink-0 flex flex-col md:flex-row items-center gap-3 select-none">
              
              {/* Playback Buttons Group */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleStepChange(Math.max(0, stepIndex - 1))}
                  disabled={stepIndex <= 0}
                  title="Step Backward (Left Arrow)"
                  className="p-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  title={isPlaying ? "Pause Flow" : "Play Flow (Spacebar)"}
                  className="p-2 bg-slate-950 hover:bg-black text-white rounded-lg transition-all active:scale-95 hover:shadow-xs cursor-pointer flex items-center justify-center border border-slate-900"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white animate-pulse" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                </button>

                <button
                  onClick={() => handleStepChange(Math.min(trace.events.length - 1, stepIndex + 1))}
                  disabled={stepIndex >= trace.events.length - 1}
                  title="Step Forward (Right Arrow)"
                  className="p-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleStepChange(0)}
                  title="Reset to Beginning"
                  className="p-1.5 border border-slate-200 hover:border-slate-300 text-slate-505 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg transition-all active:scale-95 cursor-pointer ml-0.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Slider Track */}
              <div className="flex-1 w-full flex items-center gap-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 select-none w-10 text-right">
                  {stepIndex + 1} / {trace.events.length}
                </span>
                
                <input
                  type="range"
                  min={0}
                  max={trace.events.length - 1}
                  value={stepIndex}
                  onChange={(e) => handleStepChange(Number(e.target.value))}
                  className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 focus:outline-none opacity-85 hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(to right, #1e293b 0%, #1e293b ${((stepIndex + 1) / trace.events.length) * 100}%, #e2e8f0 ${((stepIndex + 1) / trace.events.length) * 100}%, #e2e8f0 100%)`
                  }}
                />
              </div>

              {/* Speed Controller Divider Segment */}
              <div className="h-3 w-px bg-slate-200 hidden md:block" />

              {/* Speed Settings Slider */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
                  Speed
                </span>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={2100 - speed} 
                  onChange={(e) => setSpeed(2100 - Number(e.target.value))}
                  className="w-16 md:w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 focus:outline-none"
                />
                <span className="text-[10px] font-mono font-extrabold text-slate-700 min-w-[38px]">
                  {speed}ms
                </span>
              </div>
              
            </div>

          </div>

          {/* Right tabbed details panel containing Code, Call Stack, Execution History, Guide */}
          <RightPanels
            currentAlgoKey={currentAlgoKey}
            pseudocode={algo.pseudocode}
            activeLine={activeLine}
            stackSnapshot={stackSnapshot}
            nodesList={trace.nodes}
            currentEvent={currentEvent}
            doneNodesCount={doneNodes.size}
            eventsList={trace.events}
            stepIndex={stepIndex}
            onSeekStep={handleStepChange}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            speed={speed}
            setSpeed={setSpeed}
          />
        </div>

      </main>

    </div>
  );
}
