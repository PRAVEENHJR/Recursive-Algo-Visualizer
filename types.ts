/**
 * Types and interfaces for the Recursion Tree Visualizer.
 */

export interface AlgParamConfig {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select';
  min?: number;
  max?: number;
  step?: number;
  default: string | number;
  options?: { value: string; label: string }[];
  placeholder?: string;
  tooltip?: string;
}

export interface AlgorithmDefinition {
  key: string;
  name: string;
  category: 'Math' | 'Divide & Conquer' | 'Backtracking' | 'Searching' | 'Sorting' | 'Dynamic Programming';
  desc: string;
  complexity: {
    time: string;
    space: string;
  };
  spacingX: number;
  spacingY: number;
  params: AlgParamConfig[];
  pseudocode: string[];
  build: (params: Record<string, any>) => TraceData;
}

export interface TreeNode {
  id: number;
  parent: number | null;
  depth: number;
  label: string;      // Name of call e.g., fib(4)
  args: Record<string, any>; // Parameter key-values for this call
  result: any;       // Computed return value
  resultLabel: string; // Printable form of the result
  enterLine: number;  // Pseudocode line when called
  exitLine: number;   // Pseudocode line when returning
  // Coordinates assigned by tree layout
  x: number;
  y: number;
  width: number;
  height: number;
  xUnit: number;
}

export interface StepEvent {
  type: 'call' | 'return' | 'line';
  nodeId: number;
  line: number;
  desc: string;
  stackSnapshot: number[]; // Array of Node IDs currently on the stack
}

export interface TraceData {
  nodes: TreeNode[];
  events: StepEvent[];
  rootId: number;
}
