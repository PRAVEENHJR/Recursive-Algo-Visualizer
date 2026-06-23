import React, { useRef, useState, useEffect } from 'react';
import { StepEvent, TreeNode } from '../types';
import { 
  Terminal, ShieldCheck, Database, History, HelpCircle, Activity,
  ChevronUp, ChevronDown, Target, ChevronLeft, ChevronRight, RotateCcw,
  Play, Pause, FileCode2, FileJson, ScrollText, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LANGUAGE_TRANSLATIONS } from '../translations';

interface RightPanelsProps {
  currentAlgoKey: string;
  pseudocode: string[];
  activeLine: number | null;
  stackSnapshot: number[];
  nodesList: TreeNode[];
  currentEvent: StepEvent | null;
  doneNodesCount: number;
  eventsList: StepEvent[];
  stepIndex: number;
  onSeekStep: (idx: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  setSpeed: (val: number) => void;
}

type TabType = 'code' | 'stack' | 'history';
type CodeLanguage = 'pseudo' | 'cpp' | 'java' | 'python' | 'js' | 'ts';

const renderHighlightedLine = (line: string, isHighlighted: boolean) => {
  // Regex identifying code elements: comments, strings, comparisons/operators, keywords, numbers, types
  const regex = /(\/\/.*|#.*|"[^"]*"|'[^']*'|===|!==|==|!=|<=|>=|=|\+|-|\*|\/|<|>|\b(?:function|return|if|else|def|const|let|int|void|char|bool|boolean|for|in|each|of)\b|\b\d+\b|\b(?:number|string|char|vector|Map|unordered_map|Integer|List|ArrayList)\b)/g;

  const parts = line.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Determine token type and styling
        if (part.startsWith('//') || part.startsWith('#')) {
          return (
            <span key={index} className={isHighlighted ? 'text-amber-950/70 italic' : 'text-slate-400 italic'}>
              {part}
            </span>
          );
        }
        if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
          return (
            <span key={index} className={isHighlighted ? 'text-amber-950 font-medium' : 'text-rose-600 font-medium'}>
              {part}
            </span>
          );
        }
        if (['===', '!==', '==', '!=', '<=', '>=', '=', '+', '-', '*', '/', '<', '>'].includes(part)) {
          return (
            <span 
              key={index} 
              className={`font-mono ${
                isHighlighted 
                  ? 'text-amber-950 font-bold' 
                  : 'text-slate-600'
              }`}
            >
              {part}
            </span>
          );
        }
        if (/^(?:function|return|if|else|def|const|let|int|void|char|bool|boolean|for|in|each|of)$/.test(part)) {
          return (
            <span key={index} className={isHighlighted ? 'text-amber-950 font-bold' : 'text-blue-600 font-semibold'}>
              {part}
            </span>
          );
        }
        if (/^\d+$/.test(part)) {
          return (
            <span key={index} className={isHighlighted ? 'text-amber-950 font-semibold' : 'text-violet-600 font-medium'}>
              {part}
            </span>
          );
        }
        if (/^(?:number|string|char|vector|Map|unordered_map|Integer|List|ArrayList)$/.test(part)) {
          return (
            <span key={index} className={isHighlighted ? 'text-amber-950 font-bold' : 'text-slate-600 font-medium'}>
              {part}
            </span>
          );
        }

        // Default layout text
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export const RightPanels: React.FC<RightPanelsProps> = ({
  currentAlgoKey,
  pseudocode,
  activeLine,
  stackSnapshot,
  nodesList,
  currentEvent,
  doneNodesCount,
  eventsList,
  stepIndex,
  onSeekStep,
  isPlaying,
  onTogglePlay,
  speed,
  setSpeed
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('pseudo');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Auto-scroll the active trace event into view
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      const activeElement = logContainerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [stepIndex, autoScroll, activeTab]);

  const handleScrollUp = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollBy({ top: -140, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollBy({ top: 140, behavior: 'smooth' });
    }
  };

  const handleScrollToActive = () => {
    if (logContainerRef.current) {
      const activeElement = logContainerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const [width, setWidth] = useState<number>(420);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(true);
  const isResizingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = window.innerWidth - e.clientX;
    // Keep width bounded securely between 280px and 850px for premium layout spacing
    if (newWidth > 280 && newWidth < 850) {
      setWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className="bg-white border-l border-slate-200 h-full flex flex-col relative select-none shrink-0"
      style={{
        width: isCollapsed ? '64px' : (isLargeScreen ? `${width}px` : '100%'),
        transition: isResizingRef.current ? 'none' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Interactive Drag Resizer Bar Split handle */}
      {!isCollapsed && isLargeScreen && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 bottom-0 -left-1 w-2 cursor-ew-resize hover:bg-slate-400/30 transition-colors z-[60] group flex items-center justify-center"
          title="Drag to resize options panel"
        >
          <div className="w-[1.5px] h-14 bg-slate-200 group-hover:bg-slate-500 rounded transition-colors group-active:bg-slate-600 shadow-sm" />
        </div>
      )}

      {/* Collapse/Expand Toggle Tab in the middle of left side edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
        className="absolute top-1/2 -translate-y-1/2 -left-3.5 z-50 h-24 w-3.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center rounded-l-lg shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.09)] transition-all active:scale-95 cursor-pointer group hover:bg-slate-50"
      >
        <div className="flex flex-col items-center gap-1.5">
          {/* Subtle dots representing a grip handle */}
          <div className="flex flex-col gap-0.5 pointer-events-none">
            <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
            <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
          </div>
          {isCollapsed ? (
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          )}
          <div className="flex flex-col gap-0.5 pointer-events-none">
            <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
            <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
          </div>
        </div>
      </button>

      {/* Code Editor Style File Tabstrip */}
      <div className={`flex border-b border-slate-200 bg-white shrink-0 overflow-x-auto ${isCollapsed ? 'flex-col py-4 gap-4 items-center' : 'flex-row items-center'}`}>
        {!isCollapsed ? (
          <>
            {/* Tab: Code */}
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'code' 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Code</span>
              {activeTab === 'code' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
  
            {/* Tab: Call Stack */}
            <button
              onClick={() => setActiveTab('stack')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'stack' 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Call Stack</span>
              {stackSnapshot.length > 0 && (
                <span className="text-[10px] text-slate-500 font-mono">
                  ({stackSnapshot.length})
                </span>
              )}
              {activeTab === 'stack' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
  
            {/* Tab: Trace History */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'history' 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Trace Log</span>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          </>
        ) : (
          /* Vertical Iconized Column when minimized */
          <>
            <button
              onClick={() => { setIsCollapsed(false); setActiveTab('code'); }}
              title="Code Template"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                activeTab === 'code' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Terminal className="w-4.5 h-4.5" />
              {activeLine !== null && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={() => { setIsCollapsed(false); setActiveTab('stack'); }}
              title={`Active Call Stack (${stackSnapshot.length})`}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                activeTab === 'stack' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Database className="w-4.5 h-4.5" />
              {stackSnapshot.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 rounded-full font-sans font-bold">
                  {stackSnapshot.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setIsCollapsed(false); setActiveTab('history'); }}
              title="Execution History"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                activeTab === 'history' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <History className="w-4.5 h-4.5" />
              {eventsList.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-slate-700 text-white px-1 rounded-full font-sans font-bold">
                  {stepIndex + 1}
                </span>
              )}
            </button>
          </>
        )}
      </div>



      {/* Pane Contents Container (Hidden when collapsed) */}
      <div className={`flex-1 min-h-0 overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'code' && (
            <motion.div
              key="pane-code"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full flex flex-col p-4 overflow-hidden"
            >
              {/* Language selection pills placed beautifully above code block */}
              <div className="pb-3 border-b border-slate-105 mb-2 shrink-0 flex items-center justify-between select-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</span>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 p-0.5 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  {[
                    { key: 'pseudo', name: 'Pseudo' },
                    { key: 'cpp', name: 'C++' },
                    { key: 'java', name: 'Java' },
                    { key: 'python', name: 'Python' },
                    { key: 'js', name: 'JS' },
                    { key: 'ts', name: 'TS' }
                  ].map((lang) => (
                    <button
                      key={lang.key}
                      onClick={() => setSelectedLanguage(lang.key as CodeLanguage)}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all active:scale-95 cursor-pointer ${
                        selectedLanguage === lang.key
                          ? 'bg-white text-indigo-600 border border-slate-200/50 shadow-xs'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <pre className="text-xs font-mono leading-relaxed text-slate-550 whitespace-pre-wrap">
                  {(LANGUAGE_TRANSLATIONS[currentAlgoKey]?.[selectedLanguage] || pseudocode).map((line, i) => {
                    const isHighlighted = activeLine === i;
                    return (
                      <div
                        key={`line-${i}`}
                        className={`py-1 px-2.5 rounded-lg transition-all duration-150 flex items-start gap-2.5 ${
                          isHighlighted 
                            ? 'bg-amber-50 border-l-4 border-amber-500 text-amber-900 font-black shadow-xs' 
                            : 'hover:text-slate-800 text-slate-600'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 select-none w-5 text-right font-mono mt-0.5">
                          {i + 1}
                        </span>
                        <span className="flex-1 break-all">
                          {renderHighlightedLine(line, isHighlighted)}
                        </span>
                      </div>
                    );
                  })}
                </pre>
              </div>
            </motion.div>
          )}

          {activeTab === 'stack' && (
            <motion.div
              key="pane-stack"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full flex flex-col p-4 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 shrink-0">
                <span className="text-[11px] font-bold text-slate-700">Active Call Stack</span>
                <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  {stackSnapshot.length} Active {stackSnapshot.length === 1 ? 'Frame' : 'Frames'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2 pr-1 py-1">
                <AnimatePresence initial={false}>
                  {stackSnapshot.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-slate-400 italic text-center py-20 flex flex-col items-center gap-2 justify-center"
                    >
                      <Activity className="w-6 h-6 text-slate-300 animate-pulse" />
                      <span>Call stack is currently empty. Run flow or step forward.</span>
                    </motion.div>
                  ) : (
                    stackSnapshot.map((nodeId, idx) => {
                      const node = nodesList.find(n => n.id === nodeId);
                      const isTopFrame = idx === stackSnapshot.length - 1;

                      if (!node) return null;

                      return (
                        <motion.div
                          key={`frame-${node.id}-${idx}`}
                          initial={{ opacity: 0, scale: 0.94, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className={`font-mono text-xs px-3.5 py-2.5 rounded-xl border flex items-center justify-between shadow-xs transition-all ${
                            isTopFrame
                              ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs'
                              : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isTopFrame ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                            )}
                            <span className="font-semibold">{node.label}</span>
                          </div>
                          <span className="text-[9.5px] text-slate-400 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                            depth {node.depth}
                          </span>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="pane-history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full flex flex-col p-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2 pb-2 border-b border-slate-100 mb-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Execution Steps Log</span>
                  
                  <button
                    onClick={() => setAutoScroll(prev => !prev)}
                    className={`px-2 py-0.5 rounded border text-[10px] font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs ${
                      autoScroll 
                        ? 'bg-indigo-50 border-indigo-150 text-indigo-600 font-bold' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${autoScroll ? 'bg-indigo-505 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{autoScroll ? 'Auto-Scroll' : 'Manual'}</span>
                  </button>
                </div>
              </div>

              <div ref={logContainerRef} className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 py-1">
                {eventsList.map((ev, index) => {
                  const isActive = index === stepIndex;
                  const isPast = index < stepIndex;

                  let typeBadgeClass = 'bg-slate-100 text-slate-500';
                  if (ev.type === 'call') {
                    typeBadgeClass = 'bg-amber-50 text-amber-600 border border-amber-100/60';
                  } else if (ev.type === 'return') {
                    typeBadgeClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100/60';
                  } else if (ev.type === 'line') {
                    typeBadgeClass = 'bg-indigo-50 text-indigo-600 border border-indigo-100/60';
                  }

                  return (
                    <div
                      key={`trace-log-${index}`}
                      data-active={isActive ? "true" : "false"}
                      onClick={() => onSeekStep(index)}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border select-none ${
                        isActive 
                          ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-md border-l-4 border-l-indigo-500 scale-[0.995]' 
                          : isPast 
                          ? 'bg-white hover:bg-slate-50 border-slate-100 text-slate-705 font-medium'
                          : 'opacity-55 hover:opacity-90 border-transparent text-slate-400 bg-transparent'
                      }`}
                    >
                      <div className="flex flex-col items-center shrink-0">
                        <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-md font-extrabold tracking-wide ${isActive ? 'bg-indigo-550 text-white' : typeBadgeClass}`}>
                          {ev.type.toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono mt-1 text-slate-400 select-none">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <p className={`text-xs leading-relaxed font-mono break-words ${isActive ? 'text-white' : 'text-slate-600'}`}>
                          {ev.desc}
                        </p>
                        {ev.type === 'return' && !isActive && (
                          <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 mt-1 font-medium">
                            <span>Returned:</span>
                            <span className="opacity-80">Stack frame resolved</span>
                          </span>
                        )}
                        {ev.type === 'call' && !isActive && (
                          <span className="text-[10px] text-indigo-600 font-mono flex items-center gap-1 mt-1 font-medium">
                            <span>Called:</span>
                            <span className="opacity-80">Sub-problem invoked</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {eventsList.length === 0 && (
                  <div className="text-xs text-slate-400 italic text-center py-10 flex flex-col items-center gap-1.5">
                    <HelpCircle className="w-6 h-6 text-slate-300 animate-bounce" />
                    <span>Trace is empty. Click Build Call Tree first.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
};
