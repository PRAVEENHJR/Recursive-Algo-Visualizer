import React, { useRef, useState, useEffect } from 'react';
import { TreeNode, TraceData } from '../types';
import { 
  ZoomIn, ZoomOut, Info, CheckCircle2, AlertCircle
} from 'lucide-react';

interface TreeCanvasProps {
  trace: TraceData;
  activeNodeId: number | null;
  visibleNodes: Set<number>;
  doneNodes: Set<number>;
  onSelectNode: (node: TreeNode | null) => void;
  selectedNode: TreeNode | null;
  onSeekStep?: (index: number) => void;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  trace,
  activeNodeId,
  visibleNodes,
  doneNodes,
  onSelectNode,
  selectedNode,
  onSeekStep
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [autoCenterActive, setAutoCenterActive] = useState(true);
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Track hovered node to show quick tooltip details
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);

  // Track dynamic canvas viewport resize dimensions
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const lastSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        
        setContainerSize({ width: newWidth, height: newHeight });

        if (lastSize.current.width > 0 && lastSize.current.height > 0) {
          const deltaX = (newWidth - lastSize.current.width) / 2;
          const deltaY = (newHeight - lastSize.current.height) / 2;
          // Dynamically offset pan with delta resizing so tree focus stays centered without forcing full reset
          setPan(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
        }
        lastSize.current = { width: newWidth, height: newHeight };
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Recenter and auto-fit the tree inside the canvas container
  const handleRecenter = () => {
    if (!containerRef.current || trace.nodes.length === 0) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Retrieve maximum tree dimensions
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    trace.nodes.forEach(n => {
      minX = Math.min(minX, n.x - n.width / 2);
      maxX = Math.max(maxX, n.x + n.width / 2);
      minY = Math.min(minY, n.y - n.height / 2);
      maxY = Math.max(maxY, n.y + n.height / 2);
    });

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    // Calculate fits
    const padding = 50;
    const fitZoomX = (containerWidth - padding * 2) / (treeWidth || 1);
    const fitZoomY = (containerHeight - padding * 2) / (treeHeight || 1);
    const newZoom = Math.min(Math.max(Math.min(fitZoomX, fitZoomY), 0.5), 1.25);

    // Center layout
    const centerX = (containerWidth - treeWidth * newZoom) / 2 - minX * newZoom;
    const centerY = (containerHeight - treeHeight * newZoom) / 2 - minY * newZoom;

    setZoom(newZoom);
    setPan({ x: centerX, y: centerY });
  };

  // Recenter automatically on trace change
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRecenter();
    }, 100);
    return () => clearTimeout(timer);
  }, [trace]);

  // Smoothly center the active node in the viewport if follow-mode is active
  useEffect(() => {
    if (!autoCenterActive || activeNodeId === null || !containerRef.current) return;
    const activeND = trace.nodes.find(n => n.id === activeNodeId);
    if (!activeND) return;

    const currentWidth = containerSize.width || containerRef.current.clientWidth;
    const currentHeight = containerSize.height || containerRef.current.clientHeight;

    const targetX = currentWidth / 2 - activeND.x * zoom;
    const targetY = currentHeight / 2 - activeND.y * zoom;

    setPan({ x: targetX, y: targetY });
  }, [activeNodeId, autoCenterActive, zoom, trace.nodes, containerSize]);

  // Support Mouse Dragging to Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-node')) return;

    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    // Deactivate auto-centering on manual pan/drag so user is not pulled back during play
    if (autoCenterActive) {
      setAutoCenterActive(false);
    }

    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handles Zoom limits centered on container's midpoint
  const handleZoom = (factor: number) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const nextZoom = Math.max(0.25, Math.min(2.5, zoom * factor));
    if (nextZoom !== zoom) {
      const actualFactor = nextZoom / zoom;
      setPan(p => ({
        x: centerX - (centerX - p.x) * actualFactor,
        y: centerY - (centerY - p.y) * actualFactor
      }));
      setZoom(nextZoom);
    }
  };

  // Wheel to Pan / Zoom centered on the cursor position
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    // Deactivate auto-centering on manual mouse-wheel interactions
    if (autoCenterActive) {
      setAutoCenterActive(false);
    }

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey) {
      // Zoom centered on mouse cursor position when holding Ctrl/Command/Pinch Zoom
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      const nextZoom = Math.max(0.25, Math.min(2.5, zoom * factor));

      if (nextZoom !== zoom) {
        const actualFactor = nextZoom / zoom;
        setPan(p => ({
          x: cursorX - (cursorX - p.x) * actualFactor,
          y: cursorY - (cursorY - p.y) * actualFactor
        }));
        setZoom(nextZoom);
      }
    } else {
      // Human-friendly natural panning with mouse wheel (vertical scroll) and dual axis (horizontal scroll)
      setPan(p => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY
      }));
    }
  };

  // Reconstruct exact traceback path of active call stack frames for beautiful premium glow lines
  const stackPathEdges = new Set<string>();
  if (activeNodeId !== null) {
    let currId: number | null = activeNodeId;
    while (currId !== null) {
      const nd = trace.nodes.find(n => n.id === currId);
      if (nd && nd.parent !== null) {
        stackPathEdges.add(`${nd.parent}->${nd.id}`);
        currId = nd.parent;
      } else {
        break;
      }
    }
  }

  // Build edge svg elements
  const renderEdges = () => {
    const list: React.ReactNode[] = [];
    trace.nodes.forEach(nd => {
      if (nd.parent === null) return;
      const parent = trace.nodes[nd.parent];
      if (!parent) return;

      const isChildVisible = visibleNodes.has(nd.id);
      const isParentVisible = visibleNodes.has(parent.id);
      
      let edgeClass = 'stroke-slate-200 border-dashed opacity-25 stroke-[1.5]';
      if (isChildVisible && isParentVisible) {
        const edgeKey = `${parent.id}->${nd.id}`;
        const isCallStackPath = stackPathEdges.has(edgeKey);

        if (isCallStackPath) {
          // Glorious glowing slate ribbon showing active pathway on the stack tree
          edgeClass = 'stroke-slate-700 opacity-100 stroke-[3.5] filter drop-shadow-[0_0_6px_rgba(51,65,85,0.35)]';
        } else if (doneNodes.has(nd.id)) {
          edgeClass = 'stroke-slate-400 opacity-90 stroke-[2]';
        } else if (activeNodeId === nd.id || activeNodeId === parent.id) {
          edgeClass = 'stroke-amber-400 opacity-100 animate-pulse stroke-[2.5]';
        } else {
          edgeClass = 'stroke-slate-300 opacity-60 stroke-[1.5]';
        }
      }

      // Bezier curve coordinate anchors
      const x1 = parent.x;
      const y1 = parent.y + parent.height / 2;
      const x2 = nd.x;
      const y2 = nd.y - nd.height / 2;
      const midY = (y1 + y2) / 2;
      const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

      list.push(
        <path
          key={`edge-${parent.id}-${nd.id}`}
          d={pathD}
          fill="none"
          className={`transition-all duration-300 ${edgeClass}`}
        />
      );
    });
    return list;
  };

  return (
    <div className="flex-1 bg-white architect-grid flex flex-col min-h-[420px] lg:h-full overflow-hidden border-b lg:border-b-0 border-slate-200 select-none relative">
      
      {/* Canvas viewport container */}
      <div className="flex-1 h-full relative overflow-hidden flex flex-col">
        
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleZoom(1.15)}
            title="Zoom In"
            className="bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.85)}
            title="Zoom Out"
            className="bg-white hover:bg-slate-50 text-slate-705 p-2.5 rounded-xl border border-slate-200 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            title="Reset viewport to center all nodes"
            className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer flex items-center text-xs font-bold"
          >
            <span>Reset Viewport</span>
          </button>

          <button
            onClick={() => setAutoCenterActive(prev => !prev)}
            title="Focus visualization viewport on the active execution node"
            className={`px-4 py-2.5 rounded-xl border transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer flex items-center text-xs font-bold ${
              autoCenterActive 
                ? 'bg-slate-800 border-slate-900 text-white hover:bg-slate-900 font-extrabold shadow-sm' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span>Auto-Focus</span>
          </button>
        </div>

        {/* Draggable Canvas Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`w-full h-full relative cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{ touchAction: 'none' }}
        >
          <svg
            className="w-full h-full transform-gpu"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.19, 1, 0.22, 1)'
            }}
          >
            {/* Custom SVG filters for glow shadows */}
            <defs>
              <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feColorMatrix type="matrix" values="1 0 0 0 0.98   0 1 0 0 0.7  0 0 1 0 0.2  0 0 0 0.25 0" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="slate-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feColorMatrix type="matrix" values="0.2 0 0 0 0   0 0.2 0 0 0   0 0 0.2 0 0   0 0 0 0.2 0" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Svg connection edges */}
            <g>{renderEdges()}</g>

            {/* Svg nodes */}
            <g>
              {trace.nodes.map(nd => {
                const isVisible = visibleNodes.has(nd.id);
                if (!isVisible) return null;

                const isDone = doneNodes.has(nd.id);
                const isActive = activeNodeId === nd.id;
                const isSelected = selectedNode?.id === nd.id;
                const isCallerOnStack = isVisible && !isDone && !isActive;

                // Node Box Styling overrides
                let fillStr = 'fill-white';
                let strokeStr = 'stroke-slate-200';
                let strokeWidth = 1.25;
                let filterGlow = '';
                
                // Color mapping for left vertical accent track and returning results Pill badges
                let accentColor = '#94a3b8'; // pending default (slate-400)
                let badgeBgClass = 'fill-slate-50 stroke-slate-200/50';
                let badgeTextClass = 'fill-slate-500 font-bold';

                if (isActive) {
                  fillStr = 'fill-amber-50/15';
                  strokeStr = 'stroke-amber-400';
                  strokeWidth = 1.75;
                  filterGlow = 'url(#amber-glow)';
                  accentColor = '#f59e0b'; // amber
                } else if (isCallerOnStack) {
                  // Active callers higher on recursion stack (LIFO frames)
                  fillStr = 'fill-sky-50/10';
                  strokeStr = 'stroke-sky-300';
                  strokeWidth = 1.5;
                  accentColor = '#0ea5e9'; // sky
                } else if (isDone) {
                  if (nd.result === false || nd.resultLabel.includes('Conflict') || nd.resultLabel.includes('Blocked')) {
                    // Fail/backtrack node styling
                    fillStr = 'fill-rose-50/10';
                    strokeStr = 'stroke-rose-200';
                    accentColor = '#f43f5e'; // rose
                    badgeBgClass = 'fill-rose-50 stroke-rose-100/60';
                    badgeTextClass = 'fill-rose-600 font-extrabold';
                  } else if (nd.resultLabel.includes('Solved') || nd.resultLabel.includes('Valid') || nd.resultLabel.includes('Found') || nd.resultLabel.includes('Success') || nd.resultLabel.includes('idx')) {
                    // Success node highlight
                    fillStr = 'fill-emerald-50/10';
                    strokeStr = 'stroke-emerald-300';
                    strokeWidth = 1.75;
                    filterGlow = 'url(#slate-glow)';
                    accentColor = '#10b981'; // emerald
                    badgeBgClass = 'fill-emerald-50 stroke-emerald-100/60';
                    badgeTextClass = 'fill-emerald-600 font-extrabold';
                  } else {
                    // Normal return output / visited
                    fillStr = 'fill-white';
                    strokeStr = 'stroke-indigo-200';
                    accentColor = '#6366f1'; // indigo
                    badgeBgClass = 'fill-indigo-50/80 stroke-indigo-100/50';
                    badgeTextClass = 'fill-indigo-600 font-extrabold';
                  }
                }

                if (isSelected) {
                  strokeStr = 'stroke-slate-800';
                  strokeWidth = 2.5;
                }

                return (
                  <g
                    key={`node-${nd.id}`}
                    className="interactive-node cursor-pointer group"
                    onClick={() => onSelectNode(nd)}
                    onMouseEnter={() => setHoveredNode(nd)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Render standard tree node card base */}
                    <rect
                       x={nd.x - nd.width / 2}
                       y={nd.y - nd.height / 2}
                       width={nd.width}
                       height={nd.height}
                       rx={8}
                       ry={8}
                       className={`transition-all duration-300 shadow-sm ${fillStr} ${strokeStr}`}
                       style={{ strokeWidth, filter: filterGlow }}
                    />

                    {/* Premium human-designed left-side status accent pill */}
                    <path
                      d={`M ${nd.x - nd.width / 2 + 3} ${nd.y - 13} L ${nd.x - nd.width / 2 + 3} ${nd.y + 13}`}
                      stroke={accentColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Standard text elements for function call label */}
                    <text
                      x={nd.x + 3} // subtle horizontal offset to keep it balanced with left vertical bar
                      y={isDone ? nd.y - 3 : nd.y + 3.5}
                      textAnchor="middle"
                      className={`font-mono text-[10px] select-none transition-all duration-200 ${
                        isActive ? 'fill-amber-950 font-extrabold' : 'fill-slate-700 font-bold'
                      }`}
                    >
                      {nd.label}
                    </text>

                    {/* Human styled return chip capsule under label for isDone */}
                    {isDone && (
                      <g>
                        <rect
                          x={nd.x - (nd.width - 28) / 2 + 1.5}
                          y={nd.y + 3}
                          width={nd.width - 28}
                          height={12}
                          rx={3}
                          className={`${badgeBgClass} stroke-[0.5]`}
                        />
                        <text
                          x={nd.x + 1.5}
                          y={nd.y + 12}
                          textAnchor="middle"
                          className={`font-mono text-[8px] select-none truncate ${badgeTextClass}`}
                        >
                          {nd.resultLabel}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Absolute floating mini-cards for active hover helper alerts */}
          {hoveredNode && (
            <div id="hover-tooltip" className="absolute top-4 right-4 z-20 bg-white/95 border border-slate-200 p-3.5 rounded-xl shadow-lg max-w-xs animate-fade-in pointer-events-none">
              <div className="flex flex-col gap-1.5 text-[11px] text-slate-500">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-0.5">
                  <span className="font-mono font-bold text-slate-900">{hoveredNode.label}</span>
                  <span className="font-mono text-slate-855 font-semibold">{hoveredNode.depth}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>Passed Variables:</span>
                  <span className="font-mono bg-slate-50/90 text-slate-700 p-1.5 rounded-lg text-[9px] truncate border border-slate-100">
                    {JSON.stringify(hoveredNode.args)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 mt-0.5">
                  <span>Status/Return:</span>
                  <span className={`font-mono font-bold ${doneNodes.has(hoveredNode.id) ? 'text-slate-755 font-extrabold' : 'text-amber-500'}`}>
                    {doneNodes.has(hoveredNode.id) ? hoveredNode.resultLabel : 'Evaluating...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Bottom Node Detail Inspector Panel */}
        {selectedNode && (() => {
          const callStepIdx = trace.events.findIndex(e => e.nodeId === selectedNode.id && e.type === 'call');
          const returnStepIdx = trace.events.findIndex(e => e.nodeId === selectedNode.id && e.type === 'return');

          // Parse selectedNode args into elegant key-value badges
          const argsList = Object.entries(selectedNode.args);

          return (
            <div id="node-inspector-panel" className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/80 p-4.5 rounded-2xl shadow-[0_12px_38px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] flex flex-col lg:flex-row lg:items-center justify-between gap-5 animate-fade-in select-none">
              <div className="flex items-center gap-4.5">
                <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-mono shrink-0 shadow-md">
                  <span className="text-[8px] font-bold text-slate-400 leading-none">NODE</span>
                  <span className="text-sm font-extrabold leading-tight">#{selectedNode.id}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-mono text-[14px] font-extrabold text-slate-900 flex items-center gap-2 leading-none">
                    {selectedNode.label} 
                    <span className="text-[10px] font-extrabold bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-md text-indigo-600">
                      Depth {selectedNode.depth}
                    </span>
                  </h4>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Args:</span>
                      <div className="flex items-center gap-1">
                        {argsList.length === 0 ? (
                          <span className="font-mono text-slate-400 italic text-[11px]">none</span>
                        ) : (
                          argsList.map(([key, val]) => (
                            <code key={key} className="text-slate-800 font-mono bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              <span className="text-indigo-500 mr-0.5">{key}:</span>
                              <span>{String(val)}</span>
                            </code>
                          ))
                        )}
                      </div>
                    </span>
                    {selectedNode.parent !== null && (
                      <span className="flex items-center gap-1 font-mono text-slate-500 text-[11px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Parent:</span>
                        <span className="font-bold bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">#{selectedNode.parent}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 border-slate-100 pt-3.5 lg:pt-0">
                {/* Quick Jump Controls */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-150/70 p-1 rounded-xl shrink-0">
                  {onSeekStep && callStepIdx !== -1 && (
                    <button
                      onClick={() => onSeekStep(callStepIdx)}
                      title="Jump execution to when this call was invoked"
                      className="bg-white hover:bg-slate-50 border border-slate-250/60 text-slate-700 py-1.5 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Jump to Call
                    </button>
                  )}
                  {onSeekStep && returnStepIdx !== -1 && (
                    <button
                      onClick={() => onSeekStep(returnStepIdx)}
                      title="Jump execution to when this call returned its value"
                      className="bg-white hover:bg-slate-50 border border-slate-250/60 text-slate-700 py-1.5 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Jump to Return
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:items-end gap-1 shrink-0">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">EVALUATION RETURN</span>
                  <span className="font-mono text-slate-700 font-extrabold text-[13px]">
                    {doneNodes.has(selectedNode.id) ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-extrabold tracking-tight bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {selectedNode.resultLabel || 'void'}
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1.5 text-xs font-bold leading-none bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Evaluating...
                      </span>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => onSelectNode(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3.5 rounded-xl text-xs font-bold cursor-pointer transition-all hover:text-slate-800 active:scale-95 shadow-sm border border-slate-200/50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
};
