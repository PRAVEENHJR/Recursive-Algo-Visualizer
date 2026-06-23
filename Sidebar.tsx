import React from 'react';
import { ALGORITHMS } from '../algorithms';
import { AlgorithmDefinition } from '../types';
import { 
  Layers, LayoutGrid, Clock, ListOrdered, ArrowRight, Cpu, Settings, HelpCircle
} from 'lucide-react';

interface SidebarProps {
  currentAlgoKey: string;
  onAlgoChange: (key: string) => void;
  parameters: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  onBuildTree: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentAlgoKey,
  onAlgoChange,
  parameters,
  onParamChange,
  onBuildTree
}) => {
  const algo = ALGORITHMS[currentAlgoKey] || ALGORITHMS.fibonacci;

  // Group algorithms by category for a professional grouped select dropdown
  const categories: Record<string, AlgorithmDefinition[]> = {};
  Object.values(ALGORITHMS).forEach(def => {
    if (!categories[def.category]) {
      categories[def.category] = [];
    }
    categories[def.category].push(def);
  });

  return (
    <aside className="w-full lg:w-85 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen lg:h-screen lg:sticky lg:top-0 scrollbar-thin select-none">
      
      {/* Premium Recursive Algo Visualizer Site Logo & Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 text-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="font-sans text-lg font-black text-slate-950 tracking-tight uppercase leading-snug text-center">
            Recursive Algo Visualizer
          </h1>
        </div>
      </div>

      {/* Algorithm Picker Section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="algorithm-select" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          CHOOSE ALGORITHM
        </label>
        <select
          id="algorithm-select"
          value={currentAlgoKey}
          onChange={(e) => onAlgoChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 py-2.5 px-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 cursor-pointer font-semibold shadow-sm"
        >
          {Object.entries(categories).map(([cat, list]) => (
            <optgroup key={cat} label={cat} className="bg-white text-slate-500 font-sans font-semibold">
              {list.map(def => (
                <option key={def.key} value={def.key}>
                  {def.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Algorithm Config Card */}
      <div id="algorithm-complexity-card" className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-mono font-extrabold text-slate-950">
          <span className="flex items-center justify-between w-full gap-1 text-slate-950 font-black">
            <span>TIME COMPLEXITY:</span>
            <code className="bg-slate-300 text-slate-950 px-2 py-0.5 rounded border border-slate-400 font-extrabold shadow-sm">{algo.complexity.time}</code>
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono font-extrabold text-slate-950">
          <span className="flex items-center justify-between w-full gap-1 text-slate-950 font-black">
            <span>SPACE COMPLEXITY:</span>
            <code className="bg-slate-300 text-slate-950 px-2 py-0.5 rounded border border-slate-400 font-extrabold shadow-sm">{algo.complexity.space}</code>
          </span>
        </div>
      </div>

      {/* Dynamically Generated Parameters Form */}
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          CONFIGURE INPUTS
        </h3>
        
        {algo.params.map(p => (
          <div key={p.key} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor={`input-${p.key}`} className="text-xs font-bold text-slate-700 flex items-center gap-1">
                {p.label}
                {p.tooltip && (
                  <span className="group relative cursor-help">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-500" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-[10px] text-white p-2 rounded-lg w-48 shadow-xl leading-relaxed z-50">
                      {p.tooltip}
                    </span>
                  </span>
                )}
              </label>
              
              {/* If it is numeric, show a micro badge of the value */}
              {p.type === 'number' && (
                <span className="text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                  {parameters[p.key] !== undefined ? parameters[p.key] : p.default}
                </span>
              )}
            </div>

            {p.type === 'number' ? (
              <input
                id={`input-${p.key}`}
                type="number"
                min={p.min}
                max={p.max}
                step={p.step}
                value={parameters[p.key] !== undefined ? parameters[p.key] : p.default}
                onChange={(e) => onParamChange(p.key, e.target.value)}
                className="bg-slate-50 border border-slate-205 text-slate-800 py-2 px-3 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-slate-150 focus:border-slate-500 font-mono"
              />
            ) : (
              <input
                id={`input-${p.key}`}
                type="text"
                placeholder={p.placeholder}
                value={parameters[p.key] !== undefined ? parameters[p.key] : p.default}
                onChange={(e) => onParamChange(p.key, e.target.value)}
                className="bg-slate-50 border border-slate-205 text-slate-800 py-2 px-3 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-slate-150 focus:border-slate-500 font-mono placeholder:text-slate-400"
              />
            )}
          </div>
        ))}

        {/* Generate Preset Quick-Links based on algorithm key */}
        <div id="presets-panel" className="flex flex-wrap gap-1.5 mt-0.5">
          {currentAlgoKey === 'binarySearch' && (
            <>
              <button 
                id="btn-preset-binsearch-1"
                onClick={() => { onParamChange('target', 8); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                Target = 8
              </button>
              <button 
                id="btn-preset-binsearch-2"
                onClick={() => { onParamChange('target', 91); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                Target = 91
              </button>
              <button 
                id="btn-preset-binsearch-3"
                onClick={() => { onParamChange('target', 44); }}
                className="text-[10px] text-rose-650 bg-slate-50 hover:bg-rose-50 hover:text-rose-800 border border-slate-200 hover:border-rose-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                Target = 44 (Not Found)
              </button>
            </>
          )}

          {currentAlgoKey === 'mergeSort' && (
            <>
              <button 
                id="btn-preset-mergesort-1"
                onClick={() => { onParamChange('array', '12, 3, 91, 5, 23'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                Random Set
              </button>
              <button 
                id="btn-preset-mergesort-2"
                onClick={() => { onParamChange('array', '9, 8, 7, 6, 5'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                Descending
              </button>
            </>
          )}

          {currentAlgoKey === 'quickSort' && (
            <>
              <button 
                id="btn-preset-quicksort-1"
                onClick={() => { onParamChange('array', '8, 1, 6, 4, 9'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                Mixed Set
              </button>
              <button 
                id="btn-preset-quicksort-2"
                onClick={() => { onParamChange('array', '1, 2, 3, 4, 5, 6'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                Already Sorted
              </button>
            </>
          )}

          {currentAlgoKey === 'subsets' && (
            <>
              <button 
                id="btn-preset-subsets-1"
                onClick={() => { onParamChange('elements', '1,2'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                2 Elements
              </button>
              <button 
                id="btn-preset-subsets-2"
                onClick={() => { onParamChange('elements', 'X,Y,Z'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                XYZ Combo
              </button>
            </>
          )}

          {currentAlgoKey === 'permutations' && (
            <>
              <button 
                id="btn-preset-perms-1"
                onClick={() => { onParamChange('elements', 'A,B'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                2 Letters
              </button>
              <button 
                id="btn-preset-perms-2"
                onClick={() => { onParamChange('elements', '1,2,3'); }}
                className="text-[10px] text-slate-650 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all font-mono font-medium cursor-pointer"
              >
                1-2-3 Pairs
              </button>
            </>
          )}
        </div>

        <button
          id="btn-build-tree"
          onClick={onBuildTree}
          className="w-full bg-slate-950 hover:bg-black text-slate-100 font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 border border-slate-900"
        >
          <span>Build Call Tree</span>
        </button>
      </div>

    </aside>
  );
};
