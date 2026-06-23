/**
 * Multi-language code template dictionary mapped to corresponding
 * step-by-step algorithms in the Trace Visualizer.
 */

export interface LanguageTemplates {
  pseudo: string[];
  cpp: string[];
  java: string[];
  python: string[];
  js: string[];
  ts: string[];
}

export const LANGUAGE_TRANSLATIONS: Record<string, LanguageTemplates> = {
  fibonacci: {
    pseudo: [
      'function fib(n):',
      '  if n < 2:',
      '    return n',
      '  return fib(n - 1) + fib(n - 2)'
    ],
    cpp: [
      'int fib(int n) {',
      '  if (n < 2) {',
      '    return n;',
      '  } return fib(n-1) + fib(n-2); }'
    ],
    java: [
      'int fib(int n) {',
      '  if (n < 2) {',
      '    return n;',
      '  } return fib(n-1) + fib(n-2); }'
    ],
    python: [
      'def fib(n):',
      '    if n < 2:',
      '        return n',
      '    return fib(n - 1) + fib(n - 2)'
    ],
    js: [
      'function fib(n) {',
      '  if (n < 2) {',
      '    return n;',
      '  } return fib(n - 1) + fib(n - 2); }'
    ],
    ts: [
      'function fib(n: number): number {',
      '  if (n < 2) {',
      '    return n;',
      '  } return fib(n - 1) + fib(n - 2); }'
    ]
  },

  fibonacciMemoized: {
    pseudo: [
      'function fibMemo(n, cache):',
      '  if n < 2: return n',
      '  if cache contains n:',
      '    return cache[n]   // Cache hit!',
      '  cache[n] = fibMemo(n-1) + fibMemo(n-2)',
      '  return cache[n]'
    ],
    cpp: [
      'int fibMemo(int n, unordered_map<int, int>& cache) {',
      '  if (n < 2) return n;',
      '  if (cache.count(n)) {',
      '    return cache[n]; // Cache hit!',
      '  } cache[n] = fibMemo(n-1, cache) + fibMemo(n-2, cache);',
      '  return cache[n]; }'
    ],
    java: [
      'int fibMemo(int n, Map<Integer, Integer> cache) {',
      '  if (n < 2) return n;',
      '  if (cache.containsKey(n)) {',
      '    return cache.get(n); // Cache hit!',
      '  } cache.put(n, fibMemo(n-1, cache) + fibMemo(n-2, cache));',
      '  return cache.get(n); }'
    ],
    python: [
      'def fib_memo(n, cache):',
      '    if n < 2: return n',
      '    if n in cache:',
      '        return cache[n] # Cache hit!',
      '    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)',
      '    return cache[n]'
    ],
    js: [
      'function fibMemo(n, cache) {',
      '  if (n < 2) return n;',
      '  if (cache.has(n)) {',
      '    return cache.get(n); // Cache hit!',
      '  } cache.set(n, fibMemo(n-1, cache) + fibMemo(n-2, cache));',
      '  return cache.get(n); }'
    ],
    ts: [
      'function fibMemo(n: number, cache: Map<number, number>): number {',
      '  if (n < 2) return n;',
      '  if (cache.has(n)) {',
      '    return cache.get(n)!; // Cache hit!',
      '  } cache.set(n, fibMemo(n-1, cache) + fibMemo(n-2, cache));',
      '  return cache.get(n)!; }'
    ]
  },

  factorial: {
    pseudo: [
      'function fact(n):',
      '  if n <= 1:',
      '    return 1',
      '  return n * fact(n - 1)'
    ],
    cpp: [
      'int fact(int n) {',
      '  if (n <= 1) {',
      '    return 1;',
      '  }',
      '  return n * fact(n - 1); }'
    ],
    java: [
      'int fact(int n) {',
      '  if (n <= 1) {',
      '    return 1;',
      '  }',
      '  return n * fact(n - 1); }'
    ],
    python: [
      'def fact(n):',
      '    if n <= 1:',
      '        return 1',
      '    return n * fact(n - 1)'
    ],
    js: [
      'function fact(n) {',
      '  if (n <= 1) {',
      '    return 1;',
      '  }',
      '  return n * fact(n - 1); }'
    ],
    ts: [
      'function fact(n: number): number {',
      '  if (n <= 1) {',
      '    return 1;',
      '  }',
      '  return n * fact(n - 1); }'
    ]
  },

  hanoi: {
    pseudo: [
      'function hanoi(n, from, to, buffer):',
      '  if n == 0:',
      '    return',
      '  hanoi(n-1, from, buffer, to)',
      '  move disk n from "from" -> "to"',
      '  hanoi(n-1, buffer, to, from)'
    ],
    cpp: [
      'void hanoi(int n, char from, char to, char buf) {',
      '  if (n == 0) {',
      '    return;',
      '  }',
      '  hanoi(n - 1, from, buf, to);',
      '  cout << "Move " << n << " from " << from << " to " << to;',
      '  hanoi(n - 1, buf, to, from); }'
    ],
    java: [
      'void hanoi(int n, char from, char to, char buf) {',
      '  if (n == 0) {',
      '    return;',
      '  }',
      '  hanoi(n - 1, from, buf, to);',
      '  System.out.println("Move " + n + " from " + from + " to " + to);',
      '  hanoi(n - 1, buf, to, from); }'
    ],
    python: [
      'def hanoi(n, from_peg, to_peg, buf_peg):',
      '    if n == 0:',
      '        return',
      '    hanoi(n - 1, from_peg, buf_peg, to_peg)',
      '    print(f"Move {n} from {from_peg} to {to_peg}")',
      '    hanoi(n - 1, buf_peg, to_peg, from_peg)'
    ],
    js: [
      'function hanoi(n, from, to, buffer) {',
      '  if (n === 0) {',
      '    return;',
      '  }',
      '  hanoi(n - 1, from, buffer, to);',
      '  console.log(`Move disk ${n} from ${from} to ${to}`);',
      '  hanoi(n - 1, buffer, to, from); }'
    ],
    ts: [
      'function hanoi(n: number, from: string, to: string, buffer: string): void {',
      '  if (n === 0) {',
      '    return;',
      '  }',
      '  hanoi(n - 1, from, buffer, to);',
      '  console.log(`Move disk ${n} from ${from} to ${to}`);',
      '  hanoi(n - 1, buffer, to, from); }'
    ]
  },

  subsets: {
    pseudo: [
      'function subsets(index, currentSet):',
      '  if index == elements.length:',
      '    record(currentSet); return',
      '  subsets(index + 1, currentSet)                 // Exclude',
      '  subsets(index + 1, currentSet + elements[idx]) // Include'
    ],
    cpp: [
      'void subsets(int idx, vector<string> currentSet) {',
      '  if (idx == elements.size()) {',
      '    record(currentSet); return;',
      '  } subsets(idx + 1, currentSet); // Exclude',
      '  currentSet.push_back(elements[idx]); subsets(idx + 1, currentSet); }'
    ],
    java: [
      'void subsets(int idx, List<String> currentSet) {',
      '  if (idx == elements.length) {',
      '    record(currentSet); return;',
      '  } subsets(idx + 1, new ArrayList<>(currentSet)); // Exclude',
      '  currentSet.add(elements[idx]); subsets(idx + 1, currentSet); }'
    ],
    python: [
      'def subsets(index, current_set):',
      '    if index == len(elements):',
      '        record(current_set); return',
      '    subsets(index + 1, current_set) # Exclude',
      '    subsets(index + 1, current_set + [elements[index]]) # Include'
    ],
    js: [
      'function subsets(index, currentSet) {',
      '  if (index === elements.length) {',
      '    record(currentSet); return;',
      '  } subsets(index + 1, currentSet); // Exclude',
      '  subsets(index + 1, [...currentSet, elements[index]]); // Include }'
    ],
    ts: [
      'function subsets(index: number, currentSet: string[]): void {',
      '  if (index === elements.length) {',
      '    record(currentSet); return;',
      '  } subsets(index + 1, currentSet); // Exclude',
      '  subsets(index + 1, [...currentSet, elements[index]]); // Include }'
    ]
  },

  permutations: {
    pseudo: [
      'function permute(curr, leftover):',
      '  if leftover is empty:',
      '    record(curr); return',
      '  for check in leftover:',
      '    permute(curr + check, leftover - check)'
    ],
    cpp: [
      'void permute(vector<char> curr, vector<char> leftover) {',
      '  if (leftover.empty()) {',
      '    record(curr); return;',
      '  } for (char check : leftover) {',
      '    permute(extend(curr, check), exclude(leftover, check)); } }'
    ],
    java: [
      'void permute(List<Character> curr, List<Character> leftover) {',
      '  if (leftover.isEmpty()) {',
      '    record(curr); return;',
      '  } for (char check : leftover) {',
      '    permute(extend(curr, check), exclude(leftover, check)); } }'
    ],
    python: [
      'def permute(curr, leftover):',
      '    if not leftover:',
      '        record(curr); return',
      '    for check in leftover:',
      '        permute(curr + [check], [x for x in leftover if x != check])'
    ],
    js: [
      'function permute(curr, leftover) {',
      '  if (leftover.length === 0) {',
      '    record(curr); return;',
      '  } for (let check of leftover) {',
      '    permute([...curr, check], leftover.filter(x => x !== check)); } }'
    ],
    ts: [
      'function permute(curr: string[], leftover: string[]): void {',
      '  if (leftover.length === 0) {',
      '    record(curr); return;',
      '  } for (let check of leftover) {',
      '    permute([...curr, check], leftover.filter(x => x !== check)); } }'
    ]
  },

  binarySearch: {
    pseudo: [
      'function search(lo, hi):',
      '  if lo > hi: return -1',
      '  mid = Math.floor((lo + hi) / 2)',
      '  if arr[mid] == target: return mid',
      '  if arr[mid] < target:',
      '    return search(mid + 1, hi)',
      '  return search(lo, mid - 1)'
    ],
    cpp: [
      'int search(int lo, int hi) {',
      '  if (lo > hi) return -1;',
      '  int mid = lo + (hi - lo) / 2;',
      '  if (arr[mid] == target) return mid;',
      '  if (arr[mid] < target) {',
      '    return search(mid + 1, hi); }',
      '  return search(lo, mid - 1); }'
    ],
    java: [
      'int search(int lo, int hi) {',
      '  if (lo > hi) return -1;',
      '  int mid = lo + (hi - lo) / 2;',
      '  if (arr[mid] == target) return mid;',
      '  if (arr[mid] < target) {',
      '    return search(mid + 1, hi); }',
      '  return search(lo, mid - 1); }'
    ],
    python: [
      'def search(lo, hi):',
      '    if lo > hi: return -1',
      '    mid = (lo + hi) // 2',
      '    if arr[mid] == target: return mid',
      '    if arr[mid] < target:',
      '        return search(mid + 1, hi)',
      '    return search(lo, mid - 1)'
    ],
    js: [
      'function search(lo, hi) {',
      '  if (lo > hi) return -1;',
      '  let mid = Math.floor((lo + hi) / 2);',
      '  if (arr[mid] === target) return mid;',
      '  if (arr[mid] < target) {',
      '    return search(mid + 1, hi); }',
      '  return search(lo, mid - 1); }'
    ],
    ts: [
      'function search(lo: number, hi: number): number {',
      '  if (lo > hi) return -1;',
      '  const mid = Math.floor((lo + hi) / 2);',
      '  if (arr[mid] === target) return mid;',
      '  if (arr[mid] < target) {',
      '    return search(mid + 1, hi); }',
      '  return search(lo, mid - 1); }'
    ]
  },

  mergeSort: {
    pseudo: [
      'function mergeSort(arr):',
      '  if arr.length < 2: return arr',
      '  mid = Math.floor(arr.length / 2)',
      '  left = mergeSort(arr[0...mid])',
      '  right = mergeSort(arr[mid...end])',
      '  return merge(left, right)'
    ],
    cpp: [
      'vector<int> mergeSort(vector<int> arr) {',
      '  if (arr.size() < 2) return arr;',
      '  int mid = arr.size() / 2;',
      '  vector<int> left = mergeSort(slice(arr, 0, mid));',
      '  vector<int> right = mergeSort(slice(arr, mid, arr.size()));',
      '  return merge(left, right); }'
    ],
    java: [
      'int[] mergeSort(int[] arr) {',
      '  if (arr.length < 2) return arr;',
      '  int mid = arr.length / 2;',
      '  int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));',
      '  int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));',
      '  return merge(left, right); }'
    ],
    python: [
      'def merge_sort(arr):',
      '    if len(arr) < 2: return arr',
      '    mid = len(arr) // 2',
      '    left = merge_sort(arr[:mid])',
      '    right = merge_sort(arr[mid:])',
      '    return merge(left, right)'
    ],
    js: [
      'function mergeSort(arr) {',
      '  if (arr.length < 2) return arr;',
      '  let mid = Math.floor(arr.length / 2);',
      '  let left = mergeSort(arr.slice(0, mid));',
      '  let right = mergeSort(arr.slice(mid));',
      '  return merge(left, right); }'
    ],
    ts: [
      'function mergeSort(arr: number[]): number[] {',
      '  if (arr.length < 2) return arr;',
      '  const mid = Math.floor(arr.length / 2);',
      '  const left = mergeSort(arr.slice(0, mid));',
      '  const right = mergeSort(arr.slice(mid));',
      '  return merge(left, right); }'
    ]
  },

  quickSort: {
    pseudo: [
      'function quickSort(arr, low, high):',
      '  if low >= high: return',
      '  pIdx = partition(arr, low, high)   // Pivot alignment',
      '  quickSort(arr, low, pIdx - 1)      // Left partition',
      '  quickSort(arr, pIdx + 1, high)     // Right partition'
    ],
    cpp: [
      'void quickSort(vector<int>& arr, int low, int high) {',
      '  if (low >= high) return;',
      '  int pIdx = partition(arr, low, high); // Pivot alignment',
      '  quickSort(arr, low, pIdx - 1);       // Left partition',
      '  quickSort(arr, pIdx + 1, high); }    // Right partition'
    ],
    java: [
      'void quickSort(int[] arr, int low, int high) {',
      '  if (low >= high) return;',
      '  int pIdx = partition(arr, low, high); // Pivot alignment',
      '  quickSort(arr, low, pIdx - 1);       // Left partition',
      '  quickSort(arr, pIdx + 1, high); }    // Right partition'
    ],
    python: [
      'def quick_sort(arr, low, high):',
      '    if low >= high: return',
      '    p_idx = partition(arr, low, high)  # Pivot alignment',
      '    quick_sort(arr, low, p_idx - 1)    # Left partition',
      '    quick_sort(arr, p_idx + 1, high)   # Right partition'
    ],
    js: [
      'function quickSort(arr, low, high) {',
      '  if (low >= high) return;',
      '  let pIdx = partition(arr, low, high); // Pivot alignment',
      '  quickSort(arr, low, pIdx - 1);       // Left partition',
      '  quickSort(arr, pIdx + 1, high); }    // Right partition'
    ],
    ts: [
      'function quickSort(arr: number[], low: number, high: number): void {',
      '  if (low >= high) return;',
      '  const pIdx = partition(arr, low, high); // Pivot alignment',
      '  quickSort(arr, low, pIdx - 1);       // Left partition',
      '  quickSort(arr, pIdx + 1, high); }    // Right partition'
    ]
  },

  nQueensBacktracking: {
    pseudo: [
      'function placeQueens(row, board):',
      '  if row == N: return true   // Success!',
      '  for each col in 0...N-1:',
      '    if isValid(row, col):',
      '      placeQueen(row, col)',
      '      if placeQueens(row + 1): return true',
      '      removeQueen(row, col)  // Backtrack!'
    ],
    cpp: [
      'bool placeQueens(int row, vector<vector<int>>& dev) {',
      '  if (row == N) return true; // Success!',
      '  for (int col = 0; col < N; col++) {',
      '    if (isValid(row, col)) {',
      '      placeQueen(row, col);',
      '      if (placeQueens(row + 1, dev)) return true;',
      '      removeQueen(row, col); } } // Backtrack!'
    ],
    java: [
      'boolean placeQueens(int row, int[][] board) {',
      '  if (row == N) return true; // Success!',
      '  for (int col = 0; col < N; col++) {',
      '    if (isValid(row, col)) {',
      '      placeQueen(row, col);',
      '      if (placeQueens(row + 1, board)) return true;',
      '      removeQueen(row, col); } } // Backtrack!'
    ],
    python: [
      'def place_queens(row, board):',
      '    if row == N: return True # Success!',
      '    for col in range(N):',
      '        if is_valid(row, col):',
      '            place_queen(row, col)',
      '            if place_queens(row + 1): return True',
      '            remove_queen(row, col) # Backtrack!'
    ],
    js: [
      'function placeQueens(row, board) {',
      '  if (row === N) return true; // Success!',
      '  for (let col = 0; col < N; col++) {',
      '    if (isValid(row, col)) {',
      '      placeQueen(row, col);',
      '      if (placeQueens(row + 1)) return true;',
      '      removeQueen(row, col); } } // Backtrack!'
    ],
    ts: [
      'function placeQueens(row: number, board: number[][]): boolean {',
      '  if (row === N) return true; // Success!',
      '  for (let col = 0; col < N; col++) {',
      '    if (isValid(row, col)) {',
      '      placeQueen(row, col);',
      '      if (placeQueens(row + 1, board)) return true;',
      '      removeQueen(row, col); } } // Backtrack!'
    ]
  },

  knapsackMemoized: {
    pseudo: [
      'function knapsack(i, w):',
      '  if i < 0 or w == 0: return 0',
      '  if cache[i][w] exists: return cache[i][w]',
      '  if wt[i] > w: return knapsack(i-1, w)',
      '  skip = knapsack(i-1, w)',
      '  take = val[i] + knapsack(i-1, w-wt[i])',
      '  cache[i][w] = max(skip, take)',
      '  return cache[i][w]'
    ],
    cpp: [
      'int knapsack(int i, int w) {',
      '  if (i < 0 || w == 0) return 0;',
      '  if (cache[i][w] != -1) return cache[i][w];',
      '  if (wt[i] > w) return knapsack(i - 1, w);',
      '  int skip = knapsack(i - 1, w);',
      '  int take = val[i] + knapsack(i - 1, w - wt[i]);',
      '  cache[i][w] = max(skip, take);',
      '  return cache[i][w]; }'
    ],
    java: [
      'int knapsack(int i, int w) {',
      '  if (i < 0 || w == 0) return 0;',
      '  if (cache[i][w] != -1) return cache[i][w];',
      '  if (wt[i] > w) return knapsack(i - 1, w);',
      '  int skip = knapsack(i - 1, w);',
      '  int take = val[i] + knapsack(i - 1, w - wt[i]);',
      '  cache[i][w] = Math.max(skip, take);',
      '  return cache[i][w]; }'
    ],
    python: [
      'def knapsack(i, w):',
      '    if i < 0 or w == 0: return 0',
      '    if (i, w) in cache: return cache[(i, w)]',
      '    if wt[i] > w: return knapsack(i - 1, w)',
      '    skip = knapsack(i - 1, w)',
      '    take = val[i] + knapsack(i - 1, w - wt[i])',
      '    cache[(i, w)] = max(skip, take)',
      '    return cache[(i, w)]'
    ],
    js: [
      'function knapsack(i, w) {',
      '  if (i < 0 || w === 0) return 0;',
      '  if (cache[i][w] !== undefined) return cache[i][w];',
      '  if (wt[i] > w) return knapsack(i - 1, w);',
      '  let skip = knapsack(i - 1, w);',
      '  let take = val[i] + knapsack(i - 1, w - wt[i]);',
      '  cache[i][w] = Math.max(skip, take);',
      '  return cache[i][w]; }'
    ],
    ts: [
      'function knapsack(i: number, w: number): number {',
      '  if (i < 0 || w === 0) return 0;',
      '  if (cache[i][w] !== undefined) return cache[i][w];',
      '  if (wt[i] > w) return knapsack(i - 1, w);',
      '  const skip = knapsack(i - 1, w);',
      '  const take = val[i] + knapsack(i - 1, w - wt[i]);',
      '  cache[i][w] = Math.max(skip, take);',
      '  return cache[i][w]; }'
    ]
  },

  coinChangeMemoized: {
    pseudo: [
      'function minCoins(amount):',
      '  if amount == 0: return 0',
      '  if amount < 0: return infinity',
      '  if cache[amount] cached: return cache[amount]',
      '  best = infinity',
      '  for coin in coins:',
      '    best = min(best, minCoins(amount - coin) + 1)',
      '  cache[amount] = best; return best'
    ],
    cpp: [
      'int minCoins(int amount) {',
      '  if (amount == 0) return 0;',
      '  if (amount < 0) return 999999;',
      '  if (cache[amount] != -1) return cache[amount];',
      '  int best = 999999;',
      '  for (int coin : coins) {',
      '    best = min(best, minCoins(amount - coin) + 1); }',
      '  cache[amount] = best; return best; }'
    ],
    java: [
      'int minCoins(int amount) {',
      '  if (amount == 0) return 0;',
      '  if (amount < 0) return 999999;',
      '  if (cache[amount] != -1) return cache[amount];',
      '  int best = 999999;',
      '  for (int coin : coins) {',
      '    best = Math.min(best, minCoins(amount - coin) + 1); }',
      '  cache[amount] = best; return best; }'
    ],
    python: [
      'def min_coins(amount):',
      '    if amount == 0: return 0',
      '    if amount < 0: return float(\'inf\')',
      '    if amount in cache: return cache[amount]',
      '    best = float(\'inf\')',
      '    for coin in coins:',
      '        best = min(best, min_coins(amount - coin) + 1)',
      '    cache[amount] = best; return best'
    ],
    js: [
      'function minCoins(amount) {',
      '  if (amount === 0) return 0;',
      '  if (amount < 0) return Infinity;',
      '  if (cache[amount] !== undefined) return cache[amount];',
      '  let best = Infinity;',
      '  for (let coin of coins) {',
      '    best = Math.min(best, minCoins(amount - coin) + 1); }',
      '  cache[amount] = best; return best; }'
    ],
    ts: [
      'function minCoins(amount: number): number {',
      '  if (amount === 0) return 0;',
      '  if (amount < 0) return Infinity;',
      '  if (cache[amount] !== undefined) return cache[amount];',
      '  let best = Infinity;',
      '  for (const coin of coins) {',
      '    best = Math.min(best, minCoins(amount - coin) + 1); }',
      '  cache[amount] = best; return best; }'
    ]
  },

  houseRobber: {
    pseudo: [
      'function rob(i):',
      '  if i < 0: return 0',
      '  if cache[i] cached: return cache[i]',
      '  rob_this = loot[i] + rob(i - 2)',
      '  skip_this = rob(i - 1)',
      '  cache[i] = max(rob_this, skip_this)',
      '  return cache[i]'
    ],
    cpp: [
      'int rob(int i) {',
      '  if (i < 0) return 0;',
      '  if (cache[i] != -1) return cache[i];',
      '  int rob_this = loot[i] + rob(i - 2);',
      '  int skip_this = rob(i - 1);',
      '  cache[i] = max(rob_this, skip_this);',
      '  return cache[i]; }'
    ],
    java: [
      'int rob(int i) {',
      '  if (i < 0) return 0;',
      '  if (cache[i] != -1) return cache[i];',
      '  int rob_this = loot[i] + rob(i - 2);',
      '  int skip_this = rob(i - 1);',
      '  cache[i] = Math.max(rob_this, skip_this);',
      '  return cache[i]; }'
    ],
    python: [
      'def rob(i):',
      '    if i < 0: return 0',
      '    if i in cache: return cache[i]',
      '    rob_this = loot[i] + rob(i - 2)',
      '    skip_this = rob(i - 1)',
      '    cache[i] = max(rob_this, skip_this)',
      '    return cache[i]'
    ],
    js: [
      'function rob(i) {',
      '  if (i < 0) return 0;',
      '  if (cache[i] !== undefined) return cache[i];',
      '  let rob_this = loot[i] + rob(i - 2);',
      '  let skip_this = rob(i - 1);',
      '  cache[i] = Math.max(rob_this, skip_this);',
      '  return cache[i]; }'
    ],
    ts: [
      'function rob(i: number): number {',
      '  if (i < 0) return 0;',
      '  if (cache[i] !== undefined) return cache[i];',
      '  const rob_this = loot[i] + rob(i - 2);',
      '  const skip_this = rob(i - 1);',
      '  cache[i] = Math.max(rob_this, skip_this);',
      '  return cache[i]; }'
    ]
  }
};
