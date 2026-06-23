/**
 * Implementations of various recursive algorithms with trace recording
 * for step-by-step rendering in the tree visualizer.
 */

import { TreeNode, StepEvent, TraceData, AlgorithmDefinition } from './types';

class TraceBuilder {
  private nextId = 0;
  public nodes: TreeNode[] = [];
  public events: StepEvent[] = [];
  private activeStack: number[] = [];

  public createNode(parent: number | null, depth: number, label: string, args: Record<string, any>, enterLine: number): number {
    const id = this.nextId++;
    const node: TreeNode = {
      id,
      parent,
      depth,
      label,
      args,
      result: null,
      resultLabel: '',
      enterLine,
      exitLine: enterLine,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      xUnit: 0
    };
    this.nodes.push(node);
    
    this.activeStack.push(id);
    this.events.push({
      type: 'call',
      nodeId: id,
      line: enterLine,
      desc: `Calling ${label}`,
      stackSnapshot: [...this.activeStack]
    });

    return id;
  }

  public recordLine(nodeId: number, line: number, desc: string) {
    this.events.push({
      type: 'line',
      nodeId,
      line,
      desc,
      stackSnapshot: [...this.activeStack]
    });
  }

  public finishNode(id: number, result: any, resultLabel: string, exitLine: number, desc: string) {
    this.nodes[id].result = result;
    this.nodes[id].resultLabel = resultLabel;
    this.nodes[id].exitLine = exitLine;

    this.events.push({
      type: 'return',
      nodeId: id,
      line: exitLine,
      desc,
      stackSnapshot: [...this.activeStack]
    });

    // Pop the active node from stack
    const index = this.activeStack.lastIndexOf(id);
    if (index !== -1) {
      this.activeStack.splice(index, 1);
    }
  }

  public finalize(rootId: number, spacingX: number = 90, spacingY: number = 90): TraceData {
    // 1. Group children by parent ID for fast children lookup
    const children: Record<number, number[]> = {};
    this.nodes.forEach(nd => {
      if (nd.parent !== null) {
        if (!children[nd.parent]) {
          children[nd.parent] = [];
        }
        children[nd.parent].push(nd.id);
      }
    });

    // 2. Assign horizontal xUnit offsets via DFS bottom-up layout
    let leafCounter = 0;
    const assignCol = (id: number) => {
      const kids = children[id] || [];
      if (kids.length === 0) {
        this.nodes[id].xUnit = leafCounter++;
      } else {
        kids.forEach(assignCol);
        const xs = kids.map(k => this.nodes[k].xUnit);
        this.nodes[id].xUnit = (Math.min(...xs) + Math.max(...xs)) / 2;
      }
    };

    if (this.nodes.length > 0) {
      assignCol(rootId);
    }

    // 3. Assign final pixel coordinates (X and Y canvas alignments)
    const padX = spacingX / 2 + 15;
    const padY = 32;

    this.nodes.forEach(nd => {
      nd.x = nd.xUnit * spacingX + padX;
      nd.y = nd.depth * spacingY + padY;
      nd.width = Math.max(nd.label.length * 8 + 24, 76);
      nd.height = 38;
    });

    return {
      nodes: this.nodes,
      events: this.events,
      rootId
    };
  }
}

// Global algorithm registry
export const ALGORITHMS: Record<string, AlgorithmDefinition> = {
  
  fibonacci: {
    key: 'fibonacci',
    name: 'Fibonacci (Naive)',
    category: 'Math',
    desc: 'Naive exponential recursion to find the matching Fibonacci number. Generates full, highly redundant sibling trees.',
    complexity: { time: 'O(2^n)', space: 'O(n)' },
    spacingX: 85,
    spacingY: 90,
    params: [
      { key: 'n', label: 'Term (n)', type: 'number', min: 0, max: 7, step: 1, default: 5, tooltip: 'Warning: Higher numbers grow exponentially!' }
    ],
    pseudocode: [
      'function fib(n):',
      '  if n < 2:',
      '    return n',
      '  return fib(n - 1) + fib(n - 2)'
    ],
    build(params) {
      const n = Math.max(0, Math.min(7, Number(params.n) || 0));
      const tb = new TraceBuilder();

      function solve(val: number, parentId: number | null, depth: number): number {
        const id = tb.createNode(parentId, depth, `fib(${val})`, { n: val }, 0);
        
        tb.recordLine(id, 1, `Check if n (${val}) is basecase (n < 2)`);
        if (val < 2) {
          tb.recordLine(id, 2, `Basecase hit! Returning ${val}`);
          tb.finishNode(id, val, String(val), 2, `fib(${val}) bases and returns ${val}`);
          return id;
        }

        tb.recordLine(id, 3, `Not a basecase. Calculating fib(${val - 1}) and fib(${val - 2})`);
        const leftId = solve(val - 1, id, depth + 1);
        const rightId = solve(val - 2, id, depth + 1);

        const leftResult = tb.nodes[leftId].result;
        const rightResult = tb.nodes[rightId].result;
        const sum = leftResult + rightResult;

        tb.recordLine(id, 3, `Summing child calls: fib(${val - 1}) + fib(${val - 2}) = ${leftResult} + ${rightResult} = ${sum}`);
        tb.finishNode(id, sum, String(sum), 3, `fib(${val}) resolves to ${sum}`);
        return id;
      }

      const rootId = solve(n, null, 0);
      return tb.finalize(rootId);
    }
  },

  fibonacciMemoized: {
    key: 'fibonacciMemoized',
    name: 'Fibonacci (Memoized)',
    category: 'Math',
    desc: 'Optimized recursion with linear visual depth. Uses a lookup cache to immediately return cached subproblems, skipping repeated node expansion!',
    complexity: { time: 'O(n)', space: 'O(n)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'n', label: 'Term (n)', type: 'number', min: 0, max: 12, step: 1, default: 8, tooltip: 'Safe to calculate higher numbers thanks to cache lookup!' }
    ],
    pseudocode: [
      'function fibMemo(n, cache):',
      '  if n < 2: return n',
      '  if cache contains n:',
      '    return cache[n]   // Cache hit!',
      '  cache[n] = fibMemo(n-1) + fibMemo(n-2)',
      '  return cache[n]'
    ],
    build(params) {
      const n = Math.max(0, Math.min(12, Number(params.n) || 0));
      const tb = new TraceBuilder();
      const cache: Record<number, number> = {};

      function solve(val: number, parentId: number | null, depth: number): number {
        const id = tb.createNode(parentId, depth, `fib(${val})`, { n: val }, 0);

        tb.recordLine(id, 1, `Checking basecase for n = ${val}`);
        if (val < 2) {
          tb.finishNode(id, val, String(val), 1, `Basecase hit: returning ${val}`);
          return id;
        }

        tb.recordLine(id, 2, `Checking cache lookup for key: ${val}`);
        if (val in cache) {
          const cachedVal = cache[val];
          tb.recordLine(id, 3, `Cache HIT! Reusing previously computed value for fib(${val}) = ${cachedVal}`);
          tb.finishNode(id, cachedVal, `${cachedVal} (Cached)`, 3, `Instantly returned ${cachedVal} from cache for fib(${val})`);
          return id;
        }

        tb.recordLine(id, 4, `Cache miss! Computing subproblems fib(${val - 1}) and fib(${val - 2})`);
        const leftId = solve(val - 1, id, depth + 1);
        const rightId = solve(val - 2, id, depth + 1);

        const leftResult = tb.nodes[leftId].result;
        const rightResult = tb.nodes[rightId].result;
        const sum = leftResult + rightResult;

        cache[val] = sum;
        tb.recordLine(id, 4, `Saving computed result fib(${val}) = ${sum} to cache`);
        tb.finishNode(id, sum, String(sum), 5, `Recursion complete. fib(${val}) memoized as ${sum}`);
        return id;
      }

      const rootId = solve(n, null, 0);
      return tb.finalize(rootId);
    }
  },

  factorial: {
    key: 'factorial',
    name: 'Factorial',
    category: 'Math',
    desc: 'Calculates n! = n * (n-1) * ... * 1. Single linear recursive thread cascading up results.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    spacingX: 95,
    spacingY: 85,
    params: [
      { key: 'n', label: 'Factorial (n)', type: 'number', min: 1, max: 8, step: 1, default: 5 }
    ],
    pseudocode: [
      'function fact(n):',
      '  if n <= 1:',
      '    return 1',
      '  return n * fact(n - 1)'
    ],
    build(params) {
      const n = Math.max(1, Math.min(8, Number(params.n) || 1));
      const tb = new TraceBuilder();

      function solve(val: number, parentId: number | null, depth: number): number {
        const id = tb.createNode(parentId, depth, `fact(${val})`, { n: val }, 0);

        tb.recordLine(id, 1, `Is fact(${val}) basecase (val <= 1)?`);
        if (val <= 1) {
          tb.recordLine(id, 2, `Basecase hit! returning 1`);
          tb.finishNode(id, 1, '1', 2, `fact(${val}) bases and returns 1`);
          return id;
        }

        tb.recordLine(id, 3, `Recursively computing fact(${val - 1}) to calculate ${val} * fact(${val - 1})`);
        const childId = solve(val - 1, id, depth + 1);

        const childResult = tb.nodes[childId].result;
        const result = val * childResult;

        tb.recordLine(id, 3, `Multiplying ${val} * fact(${val - 1}) (${childResult}) = ${result}`);
        tb.finishNode(id, result, String(result), 3, `fact(${val}) returns ${result}`);
        return id;
      }

      const rootId = solve(n, null, 0);
      return tb.finalize(rootId);
    }
  },

  hanoi: {
    key: 'hanoi',
    name: 'Tower of Hanoi',
    category: 'Math',
    desc: 'Classical recursive stack puzzle moving disks from Peg A to Peg C using Peg B as buffer. Follows binary division pattern.',
    complexity: { time: 'O(2^n)', space: 'O(n)' },
    spacingX: 80,
    spacingY: 95,
    params: [
      { key: 'n', label: 'Disks', type: 'number', min: 1, max: 4, step: 1, default: 3 }
    ],
    pseudocode: [
      'function hanoi(n, from, to, buffer):',
      '  if n == 0:',
      '    return',
      '  hanoi(n-1, from, buffer, to)',
      '  move disk n from "from" -> "to"',
      '  hanoi(n-1, buffer, to, from)'
    ],
    build(params) {
      const n = Math.max(1, Math.min(4, Number(params.n) || 1));
      const tb = new TraceBuilder();

      function solve(disks: number, from: string, to: string, buffer: string, parentId: number | null, depth: number): number {
        const label = disks === 0 ? 'empty' : `H(${disks}:${from}→${to})`;
        const id = tb.createNode(parentId, depth, label, { disks, from, to, buffer }, 0);

        tb.recordLine(id, 1, `Check if number of disks (${disks}) is 0`);
        if (disks === 0) {
          tb.recordLine(id, 2, 'No disks remaining. Return basecase.');
          tb.finishNode(id, 'done', 'Ø', 2, `H(0) does nothing and returns`);
          return id;
        }

        tb.recordLine(id, 3, `Recursive Step 1: Move top ${disks - 1} disks from ${from} to buffer ${buffer}`);
        solve(disks - 1, from, buffer, to, id, depth + 1);

        tb.recordLine(id, 4, `Action: Move disk ${disks} directly from peg ${from} to peg ${to}`);

        tb.recordLine(id, 5, `Recursive Step 2: Move the ${disks - 1} disks from buffer ${buffer} to target ${to}`);
        solve(disks - 1, buffer, to, from, id, depth + 1);

        const mv = `${from}→${to}`;
        tb.finishNode(id, mv, mv, 5, `Done transferring ${disks} disks from ${from} to ${to}`);
        return id;
      }

      const rootId = solve(n, 'A', 'C', 'B', null, 0);
      return tb.finalize(rootId);
    }
  },

  subsets: {
    key: 'subsets',
    name: 'Subsets (Power Set)',
    category: 'Backtracking',
    desc: 'Find all possible subsets. At each element, branches into dual decisions: include or exclude from the running subset.',
    complexity: { time: 'O(2^n)', space: 'O(n)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'elements', label: 'Initial Set (comma list)', type: 'text', default: 'A,B,C', placeholder: 'A,B,C' }
    ],
    pseudocode: [
      'function subsets(index, currentSet):',
      '  if index == elements.length:',
      '    record(currentSet); return',
      '  subsets(index + 1, currentSet)                 // Exclude',
      '  subsets(index + 1, currentSet + elements[idx]) // Include'
    ],
    build(params) {
      const rawInput = String(params.elements || 'A,B,C');
      const items = rawInput.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 4);
      if (items.length === 0) items.push('A', 'B', 'C');
      
      const tb = new TraceBuilder();

      function solve(idx: number, current: string[], parentId: number | null, depth: number): number {
        const setStr = current.length > 0 ? `{${current.join(',')}}` : '∅';
        const label = idx === items.length ? `End: ${setStr}` : `sub(idx=${idx}, ${setStr})`;
        const id = tb.createNode(parentId, depth, label, { idx, current: [...current] }, 0);

        tb.recordLine(id, 1, `At index ${idx}. Is it equal to set size ${items.length}?`);
        if (idx === items.length) {
          tb.recordLine(id, 2, `EndOfChoices! Recording final subset: ${setStr}`);
          tb.finishNode(id, [current], setStr, 2, `Saves subset: ${setStr}`);
          return id;
        }

        const activeElem = items[idx];
        tb.recordLine(id, 3, `Branch 1: Exclude "${activeElem}" and recurse`);
        const excludeId = solve(idx + 1, current, id, depth + 1);

        tb.recordLine(id, 4, `Branch 2: Include "${activeElem}" and recurse with ${JSON.stringify([...current, activeElem])}`);
        const includeId = solve(idx + 1, [...current, activeElem], id, depth + 1);

        const finalSubsets = [...tb.nodes[excludeId].result, ...tb.nodes[includeId].result];
        tb.finishNode(id, finalSubsets, `${finalSubsets.length} sets`, 4, `Subsets branched under ${activeElem} returned`);
        return id;
      }

      const rootId = solve(0, [], null, 0);
      return tb.finalize(rootId);
    }
  },

  permutations: {
    key: 'permutations',
    name: 'Permutations',
    category: 'Backtracking',
    desc: 'Generates all orders of elements. Loops over each remaining character and spawns a branch for every choice.',
    complexity: { time: 'O(n!)', space: 'O(n)' },
    spacingX: 130,
    spacingY: 95,
    params: [
      { key: 'elements', label: 'Elements (comma list)', type: 'text', default: 'A,B,C', placeholder: 'A,B,C' }
    ],
    pseudocode: [
      'function permute(curr, leftover):',
      '  if leftover is empty:',
      '    record(curr); return',
      '  for check in leftover:',
      '    permute(curr + check, leftover - check)'
    ],
    build(params) {
      const rawInput = String(params.elements || 'A,B,C');
      let items = rawInput.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
      if (items.length === 0) items.push('A', 'B', 'C');

      const tb = new TraceBuilder();

      function solve(curr: string[], leftover: string[], parentId: number | null, depth: number): number {
        const currStr = curr.join('');
        const label = leftover.length === 0 ? `Result: [${currStr}]` : `perm(${currStr || '∅'})`;
        const id = tb.createNode(parentId, depth, label, { curr: [...curr], leftover: [...leftover] }, 0);

        tb.recordLine(id, 1, `Is remainder empty? Remaining choices: ${leftover.length}`);
        if (leftover.length === 0) {
          tb.recordLine(id, 2, `Permutation finished: [${currStr}]`);
          tb.finishNode(id, [currStr], currStr, 2, `Found valid arrangement: ${currStr}`);
          return id;
        }

        const permutationsCollected: string[] = [];
        tb.recordLine(id, 3, `Iterating through remaining candidates: [${leftover.join(', ')}]`);
        
        for (let i = 0; i < leftover.length; i++) {
          const char = leftover[i];
          const nextLeftover = leftover.filter((_, idx) => idx !== i);
          
          tb.recordLine(id, 4, `Option chosen: "${char}". Subproblem path: perm(${[...curr, char].join('')})`);
          
          const childId = solve([...curr, char], nextLeftover, id, depth + 1);
          permutationsCollected.push(...tb.nodes[childId].result);
        }

        tb.finishNode(id, permutationsCollected, `${permutationsCollected.length} formats`, 4, `Finished recursive options for perm(${currStr || '∅'})`);
        return id;
      }

      const rootId = solve([], items, null, 0);
      return tb.finalize(rootId);
    }
  },

  binarySearch: {
    key: 'binarySearch',
    name: 'Binary Search',
    category: 'Searching',
    desc: 'Find index of a number in a sorted array by looking at the middle element and narrowing the range by half.',
    complexity: { time: 'O(log n)', space: 'O(log n)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'array', label: 'Sorted Array (comma list)', type: 'text', default: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91', placeholder: 'comma sep numbers' },
      { key: 'target', label: 'Target Value', type: 'number', min: 1, max: 100, step: 1, default: 23 }
    ],
    pseudocode: [
      'function search(lo, hi):',
      '  if lo > hi: return -1',
      '  mid = Math.floor((lo + hi) / 2)',
      '  if arr[mid] == target: return mid',
      '  if arr[mid] < target:',
      '    return search(mid + 1, hi)',
      '  return search(lo, mid - 1)'
    ],
    build(params) {
      const rawArr = String(params.array || '2, 5, 8, 12, 16, 23, 38, 56, 72, 91');
      const arr = rawArr.split(',')
                        .map(n => Number(n.trim()))
                        .filter(n => !isNaN(n))
                        .sort((a, b) => a - b)
                        .slice(0, 12);
      const target = Number(params.target !== undefined ? params.target : 23);
      
      const tb = new TraceBuilder();

      function solve(lo: number, hi: number, parentId: number | null, depth: number): number {
        const label = `search(${lo}, ${hi})`;
        const id = tb.createNode(parentId, depth, label, { lo, hi }, 0);

        tb.recordLine(id, 1, `Checking boundaries: search low index ${lo} and high index ${hi}`);
        if (lo > hi) {
          tb.recordLine(id, 1, `Boundary crossed: lo > hi (${lo} > ${hi}). Target not in array.`);
          tb.finishNode(id, -1, '-1 (NotFound)', 1, `Value ${target} not found, return -1`);
          return id;
        }

        const mid = Math.floor((lo + hi) / 2);
        const midVal = arr[mid];
        tb.recordLine(id, 2, `Calculate midpoint: (lo+hi)/2 = (${lo}+${hi})/2 = index ${mid} [val: ${midVal}]`);

        tb.recordLine(id, 3, `Compare arr[${mid}] (${midVal}) with target (${target})`);
        if (midVal === target) {
          tb.recordLine(id, 3, `Found match! Index ${mid} matches key ${target}`);
          tb.finishNode(id, mid, `idx ${mid}`, 3, `Target found at original index ${mid}`);
          return id;
        }

        if (midVal < target) {
          tb.recordLine(id, 4, `Value ${midVal} < target ${target}. Target is in the right half. Recursing in search(${mid + 1}, ${hi})`);
          const childId = solve(mid + 1, hi, id, depth + 1);
          const valResult = tb.nodes[childId].result;
          const labelResult = tb.nodes[childId].resultLabel;
          tb.finishNode(id, valResult, labelResult, 5, `Right branch returned index ${valResult}`);
          return id;
        } else {
          tb.recordLine(id, 6, `Value ${midVal} > target ${target}. Target is in the left half. Recursing in search(${lo}, ${mid - 1})`);
          const childId = solve(lo, mid - 1, id, depth + 1);
          const valResult = tb.nodes[childId].result;
          const labelResult = tb.nodes[childId].resultLabel;
          tb.finishNode(id, valResult, labelResult, 6, `Left branch returned index ${valResult}`);
          return id;
        }
      }

      const rootId = solve(0, arr.length - 1, null, 0);
      return tb.finalize(rootId);
    }
  },

  mergeSort: {
    key: 'mergeSort',
    name: 'Merge Sort',
    category: 'Sorting',
    desc: 'Divide & Conquer sorting. Keeps splitting the array into halves, sorts them recursively, and merges sorted fragments back.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'array', label: 'Array to Sort', type: 'text', default: '38, 27, 43, 3, 9, 82', placeholder: 'e.g., 5,2,9,1,7' }
    ],
    pseudocode: [
      'function mergeSort(arr):',
      '  if arr.length < 2: return arr',
      '  mid = Math.floor(arr.length / 2)',
      '  left = mergeSort(arr[0...mid])',
      '  right = mergeSort(arr[mid...end])',
      '  return merge(left, right)'
    ],
    build(params) {
      const rawArr = String(params.array || '38, 27, 43, 3, 9, 82');
      const arr = rawArr.split(',')
                        .map(n => Number(n.trim()))
                        .filter(n => !isNaN(n))
                        .slice(0, 6);
      const activeArr = arr.length > 0 ? arr : [38, 27, 43, 3, 9, 82];
      
      const tb = new TraceBuilder();

      function solve(sub: number[], parentId: number | null, depth: number): number {
        const subStr = `[${sub.join(',')}]`;
        const id = tb.createNode(parentId, depth, `sort(${subStr})`, { arr: [...sub] }, 0);

        tb.recordLine(id, 1, `Is subarray ${subStr} of length < 2?`);
        if (sub.length < 2) {
          tb.recordLine(id, 1, `Basecase hit! Atomic array sorted trivially.`);
          tb.finishNode(id, sub, subStr, 1, `Array is already sorted: ${subStr}`);
          return id;
        }

        const mid = Math.floor(sub.length / 2);
        const leftHalf = sub.slice(0, mid);
        const rightHalf = sub.slice(mid);
        tb.recordLine(id, 2, `Split ${subStr} into halves around mid ${mid}: left [${leftHalf.join(',')}] and right [${rightHalf.join(',')}]`);

        tb.recordLine(id, 3, `Recursively sorting left half`);
        const leftId = solve(leftHalf, id, depth + 1);

        tb.recordLine(id, 4, `Recursively sorting right half`);
        const rightId = solve(rightHalf, id, depth + 1);

        const leftResult = tb.nodes[leftId].result as number[];
        const rightResult = tb.nodes[rightId].result as number[];

        // Combine
        const merged: number[] = [];
        let li = 0, ri = 0;
        while (li < leftResult.length && ri < rightResult.length) {
          if (leftResult[li] <= rightResult[ri]) {
            merged.push(leftResult[li++]);
          } else {
            merged.push(rightResult[ri++]);
          }
        }
        while (li < leftResult.length) merged.push(leftResult[li++]);
        while (ri < rightResult.length) merged.push(rightResult[ri++]);

        const mergedStr = `[${merged.join(',')}]`;
        tb.recordLine(id, 5, `Merge sorted halves [${leftResult.join(',')}] and [${rightResult.join(',')}] yielding ${mergedStr}`);
        tb.finishNode(id, merged, mergedStr, 5, `Merged sorting returned ${mergedStr}`);
        return id;
      }

      const rootId = solve(activeArr, null, 0);
      return tb.finalize(rootId);
    }
  },

  quickSort: {
    key: 'quickSort',
    name: 'Quick Sort (In Place)',
    category: 'Sorting',
    desc: 'Pivots and partition sort. Selects pivot, aligns smaller elements left, larger elements right, and recurses.',
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'array', label: 'Unsorted List', type: 'text', default: '5, 2, 9, 3, 7, 6', placeholder: 'e.g., 5, 2, 9, 3, 7, 6' }
    ],
    pseudocode: [
      'function quickSort(arr, low, high):',
      '  if low >= high: return',
      '  pIdx = partition(arr, low, high)   // Pivot alignment',
      '  quickSort(arr, low, pIdx - 1)      // Left partition',
      '  quickSort(arr, pIdx + 1, high)     // Right partition'
    ],
    build(params) {
      const rawArr = String(params.array || '5, 2, 9, 3, 7, 6');
      const arr = rawArr.split(',')
                        .map(n => Number(n.trim()))
                        .filter(n => !isNaN(n))
                        .slice(0, 6);
      const activeArr = arr.length > 0 ? arr : [5, 2, 9, 3, 7, 6];
      
      const tb = new TraceBuilder();
      const working = [...activeArr];

      function solve(low: number, high: number, parentId: number | null, depth: number): number {
        const subslice = working.slice(low, high + 1);
        const label = `sub(${low}, ${high}) : [${subslice.join(',')}]`;
        const id = tb.createNode(parentId, depth, label, { low, high, snapshot: [...working] }, 0);

        tb.recordLine(id, 1, `Is slice bounds valid? Low index ${low} >= High index ${high}?`);
        if (low >= high) {
          tb.recordLine(id, 1, `Basecase: partition empty or 1 item. Stop sorting this subsegment.`);
          tb.finishNode(id, [...working], `[${working.slice(low, high + 1).join(',')}]`, 1, `Partition basecase reached`);
          return id;
        }

        // Partition with pivot as high item
        const pivot = working[high];
        tb.recordLine(id, 2, `Picking pivot element from high boundary: pivot = ${pivot} (at index ${high})`);
        
        let i = low - 1;
        for (let j = low; j < high; j++) {
          if (working[j] < pivot) {
            i++;
            // swap
            const tmp = working[i];
            working[i] = working[j];
            working[j] = tmp;
          }
        }
        const partitionIndex = i + 1;
        const tmp = working[partitionIndex];
        working[partitionIndex] = working[high];
        working[high] = tmp;

        tb.recordLine(id, 2, `Partition complete! Pivot aligned at index ${partitionIndex}. Array partitioned as: [${working.slice(low, high + 1).join(',')}]`);

        tb.recordLine(id, 3, `Recursively sorting left partition [low: ${low} to ${partitionIndex - 1}]`);
        solve(low, partitionIndex - 1, id, depth + 1);

        tb.recordLine(id, 4, `Recursively sorting right partition [low: ${partitionIndex + 1} to ${high}]`);
        solve(partitionIndex + 1, high, id, depth + 1);

        const currentSegment = working.slice(low, high + 1);
        tb.finishNode(id, [...working], `[${currentSegment.join(',')}]`, 4, `Slice sorted complete: [${currentSegment.join(',')}]`);
        return id;
      }

      const rootId = solve(0, activeArr.length - 1, null, 0);
      return tb.finalize(rootId);
    }
  },

  nQueensBacktracking: {
    key: 'nQueensBacktracking',
    name: 'N-Queens Backtracking',
    category: 'Backtracking',
    desc: 'Iconic backtracking tree. Places queens row-by-row on N×N board. If conflicts occur, it unplaces the Queen (backtracks) and tries another column.',
    complexity: { time: 'O(N!)', space: 'O(N)' },
    spacingX: 85,
    spacingY: 95,
    params: [
      { key: 'n', label: 'Board Dimension (N×N)', type: 'number', min: 2, max: 4, step: 1, default: 4, tooltip: '4x4 board provides optimal structural exploration.' }
    ],
    pseudocode: [
      'function placeQueens(row, board):',
      '  if row == N: return true   // Success!',
      '  for each col in 0...N-1:',
      '    if isValid(row, col):',
      '      placeQueen(row, col)',
      '      if placeQueens(row + 1): return true',
      '      removeQueen(row, col)  // Backtrack!'
    ],
    build(params) {
      const n = Math.max(2, Math.min(4, Number(params.n) || 4));
      const tb = new TraceBuilder();

      // board tracks column indices for each row, or -1
      const initialBoard: number[] = Array(n).fill(-1);

      function isValid(row: number, col: number, board: number[]): boolean {
        for (let r = 0; r < row; r++) {
          const c = board[r];
          if (c === col) return false; // same column
          if (Math.abs(r - row) === Math.abs(c - col)) return false; // diagonal conflict
        }
        return true;
      }

      function solve(row: number, boardState: number[], parentId: number | null, depth: number): number {
        const positions = boardState.map((col, r) => r < row ? col : -1);
        const formatBoard = `[${positions.map(c => c === -1 ? '.' : String(c)).join(',')}]`;
        const label = row === n ? 'Solution!' : `row ${row}: ${formatBoard}`;
        
        const id = tb.createNode(parentId, depth, label, { row, board: [...positions] }, 0);

        tb.recordLine(id, 1, `At row ${row}. Is it equal to target board size N (${n})?`);
        if (row === n) {
          tb.recordLine(id, 1, `SUCCESS! All Queens placed safely. Basecase hit.`);
          tb.finishNode(id, true, 'Valid', 1, `Solved full arrangement: [${boardState.join(', ')}]`);
          return id;
        }

        let solved = false;
        tb.recordLine(id, 2, `Testing placement Columns in row ${row}`);
        
        for (let col = 0; col < n; col++) {
          tb.recordLine(id, 3, `Checking column position row: ${row}, col: ${col}`);
          
          if (isValid(row, col, boardState)) {
            const nextBoard = [...boardState];
            nextBoard[row] = col;
            
            tb.recordLine(id, 4, `Column check PASSED! Placing queen at (${row}, ${col}). Spawning next sub-arrangement.`);
            
            const childId = solve(row + 1, nextBoard, id, depth + 1);
            const childSolved = tb.nodes[childId].result;
            
            if (childSolved) {
              solved = true;
              tb.recordLine(id, 5, `Queen route solved successfully under path col: ${col}. Relaying success upward.`);
              break;
            } else {
              tb.recordLine(id, 6, `Path under (${row}, ${col}) failed to find solution. Backtracking: removing queen.`);
            }
          } else {
            tb.recordLine(id, 3, `Conflict detected placing queen at (${row}, ${col}). Skipping index.`);
          }
        }

        const resLabel = solved ? 'Solved' : 'Blocked';
        tb.finishNode(id, solved, resLabel, 6, `row ${row} complete. solved = ${solved}`);
        return id;
      }

      const rootId = solve(0, initialBoard, null, 0);
      return tb.finalize(rootId);
    }
  },

  knapsackMemoized: {
    key: 'knapsackMemoized',
    name: '0/1 Knapsack (Memoized)',
    category: 'Dynamic Programming',
    desc: 'Select items to maximize total value without exceeding capacity. Subproblems are indexed by (item index, remaining capacity). Memoization prunes redundant sub-trees.',
    complexity: { time: 'O(N * W)', space: 'O(N * W)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'capacity', label: 'Bag Capacity (W)', type: 'number', min: 1, max: 10, step: 1, default: 5, tooltip: 'Maximum weight the knapsack can hold.' },
      { key: 'values', label: 'Values (comma list)', type: 'text', default: '10, 15, 40', placeholder: '10, 15, 40' },
      { key: 'weights', label: 'Weights (comma list)', type: 'text', default: '1, 2, 3', placeholder: '1, 2, 3' }
    ],
    pseudocode: [
      'function knapsack(i, w):',
      '  if i < 0 or w == 0: return 0',
      '  if cache[i][w] exists: return cache[i][w]',
      '  if wt[i] > w: return knapsack(i-1, w)',
      '  skip = knapsack(i-1, w)',
      '  take = val[i] + knapsack(i-1, w-wt[i])',
      '  cache[i][w] = max(skip, take)',
      '  return cache[i][w]'
    ],
    build(params) {
      const W = Math.max(1, Math.min(10, Number(params.capacity) || 5));
      const valInput = String(params.values || '10, 15, 40');
      const wtInput = String(params.weights || '1, 2, 3');

      const values = valInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)).slice(0, 5);
      const weights = wtInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)).slice(0, 5);

      const len = Math.min(values.length, weights.length);
      const cleanValues = values.slice(0, len);
      const cleanWeights = weights.slice(0, len);

      const tb = new TraceBuilder();
      const memo: Record<string, number> = {};

      function solve(i: number, w: number, parentId: number | null, depth: number): number {
        const label = i < 0 ? `knap(i=-1, w=${w})` : `knap(i=${i}, w=${w})`;
        const id = tb.createNode(parentId, depth, label, { i, w }, 0);

        tb.recordLine(id, 1, `Is basecase reached? Check item index ${i} < 0 or remaining capacity: ${w}`);
        if (i < 0 || w === 0) {
          tb.recordLine(id, 1, `Basecase! Returning 0 because no items or capacity left.`);
          tb.finishNode(id, 0, '0', 1, `No items/capacity, recursive base returns 0`);
          return id;
        }

        const cacheKey = `${i},${w}`;
        tb.recordLine(id, 2, `Checking memo cache lookup for key: "${cacheKey}"`);
        if (cacheKey in memo) {
          const cachedVal = memo[cacheKey];
          tb.recordLine(id, 2, `Memo HIT! Reusing previously computed value for index ${i}, cap ${w} = ${cachedVal}`);
          tb.finishNode(id, cachedVal, `${cachedVal} (Cached)`, 2, `Returned $${cachedVal} directly from cache`);
          return id;
        }

        const cWt = cleanWeights[i];
        const cVal = cleanValues[i];

        tb.recordLine(id, 3, `Checking if weight of item #${i} (${cWt}kg) exceeds current capacity: ${w}kg`);
        if (cWt > w) {
          tb.recordLine(id, 3, `Weight is too heavy (${cWt} > ${w}). Skipping item #${i}`);
          const childId = solve(i - 1, w, id, depth + 1);
          const ans = tb.nodes[childId].result;
          memo[cacheKey] = ans;
          tb.finishNode(id, ans, String(ans), 3, `Skipping item returned optimal ${ans}`);
          return id;
        }

        tb.recordLine(id, 4, `Branch 1: Skip item #${i} and maintain remaining capacity ${w}`);
        const skipId = solve(i - 1, w, id, depth + 1);
        const skipVal = tb.nodes[skipId].result;

        tb.recordLine(id, 5, `Branch 2: Rob item #${i} (value: +$${cVal}, weight: ${cWt}kg) recursion on capacity ${w - cWt}`);
        const takeId = solve(i - 1, w - cWt, id, depth + 1);
        const takeVal = cVal + tb.nodes[takeId].result;

        const maxVal = Math.max(skipVal, takeVal);
        memo[cacheKey] = maxVal;
        
        tb.recordLine(id, 6, `Evaluate selection choices: Max(Skip: ${skipVal}, Take: ${takeVal}) = $${maxVal}. Memoizing.`);
        tb.finishNode(id, maxVal, `$${maxVal}`, 7, `Optimal selection completes at $${maxVal}`);
        return id;
      }

      const rootId = solve(len - 1, W, null, 0);
      return tb.finalize(rootId);
    }
  },

  coinChangeMemoized: {
    key: 'coinChangeMemoized',
    name: 'Coin Change (Memoized)',
    category: 'Dynamic Programming',
    desc: 'Find the minimum number of coins needed to sum to a target amount using given coin values. Memoization caches states to prevent combinatorial explosion.',
    complexity: { time: 'O(S * C)', space: 'O(S)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'amount', label: 'Target Amount', type: 'number', min: 0, max: 15, step: 1, default: 8, tooltip: 'Amount we want to change.' },
      { key: 'coins', label: 'Coins (comma list)', type: 'text', default: '1, 3, 4', placeholder: '1, 3, 4' }
    ],
    pseudocode: [
      'function minCoins(amount):',
      '  if amount == 0: return 0',
      '  if amount < 0: return infinity',
      '  if cache[amount] cached: return cache[amount]',
      '  best = infinity',
      '  for coin in coins:',
      '    best = min(best, minCoins(amount - coin) + 1)',
      '  cache[amount] = best; return best'
    ],
    build(params) {
      const amount = Math.max(0, Math.min(15, Number(params.amount) || 0));
      const coinsInput = String(params.coins || '1, 3, 4');
      const coins = coinsInput.split(',')
                             .map(s => Number(s.trim()))
                             .filter(n => !isNaN(n) && n > 0)
                             .sort((a, b) => a - b)
                             .slice(0, 4);
      const activeCoins = coins.length > 0 ? coins : [1, 3, 4];

      const tb = new TraceBuilder();
      const memo: Record<number, number> = {};

      function solve(amt: number, parentId: number | null, depth: number): number {
        const label = amt < 0 ? `coins(amt=${amt})` : `coins(amt=${amt})`;
        const id = tb.createNode(parentId, depth, label, { amt }, 0);

        tb.recordLine(id, 1, `Is basecase reached? Checking remaining amount: ${amt}`);
        if (amt === 0) {
          tb.recordLine(id, 1, `Basecase hit! Sum achieved with 0 extra coins.`);
          tb.finishNode(id, 0, '0', 1, `Target reached successfully with 0 extra coins`);
          return id;
        }
        if (amt < 0) {
          tb.recordLine(id, 2, `Underflow! sum is negative (${amt}), invalid choice path.`);
          tb.finishNode(id, Infinity, '∞', 2, `Target exceeded. Invalid path returned infinity`);
          return id;
        }

        tb.recordLine(id, 3, `Checking memo cache lookup for subproblem target: ${amt}`);
        if (amt in memo) {
          const cachedVal = memo[amt];
          const labelStr = cachedVal === Infinity ? '∞ (Cached)' : `${cachedVal} (Cached)`;
          tb.recordLine(id, 3, `Memo HIT! Returning cached min coins for value ${amt} = ${cachedVal}`);
          tb.finishNode(id, cachedVal, labelStr, 3, `Returned cached min-coins for target ${amt}: ${cachedVal}`);
          return id;
        }

        let best = Infinity;
        tb.recordLine(id, 4, `Cache miss! Exploring change possibilities with coins: [${activeCoins.join(', ')}]`);

        for (let j = 0; j < activeCoins.length; j++) {
          const coin = activeCoins[j];
          tb.recordLine(id, 6, `Try subtracting coin ${coin}. New subproblem: coins(amt=${amt - coin})`);
          
          const childId = solve(amt - coin, id, depth + 1);
          const childResult = tb.nodes[childId].result;

          if (childResult !== Infinity) {
            const pathCost = childResult + 1;
            best = Math.min(best, pathCost);
            tb.recordLine(id, 6, `Using coin of size ${coin}: pathCost = ${childResult} + 1 = ${pathCost} total. Current best = ${best}`);
          } else {
            tb.recordLine(id, 6, `Using coin ${coin} hit an invalid negative underflow branch.`);
          }
        }

        memo[amt] = best;
        const resultLabelStr = best === Infinity ? '∞' : String(best);
        tb.recordLine(id, 7, `Memoizing best outcome found for amount ${amt}: ${resultLabelStr}`);
        tb.finishNode(id, best, resultLabelStr, 7, `minCoins(${amt}) resolved to ${resultLabelStr}`);
        return id;
      }

      const rootId = solve(amount, null, 0);
      return tb.finalize(rootId);
    }
  },

  houseRobber: {
    key: 'houseRobber',
    name: 'House Robber (Memoized)',
    category: 'Dynamic Programming',
    desc: 'Perform optimal robbing without triggering alarm at adjacent houses. At each house, decide whether to Rob (skipping adjacent) or Skip. Prunes redundant subsets with 1D Memoization.',
    complexity: { time: 'O(N)', space: 'O(N)' },
    spacingX: 110,
    spacingY: 90,
    params: [
      { key: 'houses', label: 'House Loot Values', type: 'text', default: '2, 7, 9, 3, 1', placeholder: 'e.g., 2, 7, 9, 3, 1' }
    ],
    pseudocode: [
      'function rob(i):',
      '  if i < 0: return 0',
      '  if cache[i] cached: return cache[i]',
      '  rob_this = loot[i] + rob(i - 2)',
      '  skip_this = rob(i - 1)',
      '  cache[i] = max(rob_this, skip_this)',
      '  return cache[i]'
    ],
    build(params) {
      const housesInput = String(params.houses || '2, 7, 9, 3, 1');
      const loot = housesInput.split(',')
                             .map(s => Number(s.trim()))
                             .filter(n => !isNaN(n) && n >= 0)
                             .slice(0, 6);
      const activeLoot = loot.length > 0 ? loot : [2, 7, 9, 3, 1];

      const tb = new TraceBuilder();
      const memo: Record<number, number> = {};

      function solve(i: number, parentId: number | null, depth: number): number {
        const label = i < 0 ? `rob(i=-1)` : `rob(i=${i}: $${activeLoot[i]})`;
        const id = tb.createNode(parentId, depth, label, { idx: i }, 0);

        tb.recordLine(id, 1, `Is index basecase? Check if i = ${i} < 0`);
        if (i < 0) {
          tb.recordLine(id, 1, `Basecase! No houses remaining to scan. Return 0.`);
          tb.finishNode(id, 0, '0', 1, `Rob subproblem base returned 0`);
          return id;
        }

        tb.recordLine(id, 2, `Checking memo cache lookup for house index: ${i}`);
        if (i in memo) {
          const cachedVal = memo[i];
          tb.recordLine(id, 2, `Memo HIT! Loot from house index ${i} is pre-calculated: $${cachedVal}`);
          tb.finishNode(id, cachedVal, `$${cachedVal} (Cached)`, 2, `Returned $${cachedVal} directly from cache`);
          return id;
        }

        tb.recordLine(id, 3, `Branch 1: Rob house #${i} (+$${activeLoot[i]}) and skip house #${i-1} (recursing on i - 2)`);
        const robId = solve(i - 2, id, depth + 1);
        const robVal = activeLoot[i] + tb.nodes[robId].result;

        tb.recordLine(id, 4, `Branch 2: Skip house #${i} and rob subsequent (recursing on i - 1)`);
        const skipId = solve(i - 1, id, depth + 1);
        const skipVal = tb.nodes[skipId].result;

        const maxLoot = Math.max(robVal, skipVal);
        memo[i] = maxLoot;

        tb.recordLine(id, 5, `Find Max(Rob: $${robVal}, Skip: $${skipVal}) = $${maxLoot}. Memoizing cache[i=${i}].`);
        tb.finishNode(id, maxLoot, `$${maxLoot}`, 6, `Optimal choice of house ${i} returns max loot: $${maxLoot}`);
        return id;
      }

      const rootId = solve(activeLoot.length - 1, null, 0);
      return tb.finalize(rootId);
    }
  }

};
