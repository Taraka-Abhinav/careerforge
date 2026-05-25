export type ArenaDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface ArenaChallengeTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  difficulty: ArenaDifficulty;
  xpReward: number;
  starterCode: string;
  testCases: { input: Record<string, unknown>; expected: unknown }[];
  invoke: string;
}

function c(
  id: string,
  category: string,
  title: string,
  description: string,
  difficulty: ArenaDifficulty,
  xpReward: number,
  starterCode: string,
  invoke: string,
  testCases: ArenaChallengeTemplate['testCases']
): ArenaChallengeTemplate {
  return { id, category, title, description, difficulty, xpReward, starterCode, invoke, testCases };
}

/** 50 Code Arena challenges: 10 Easy (rigorous), 20 Medium, 20 Hard */
export const ARENA_CHALLENGE_BANK: ArenaChallengeTemplate[] = [
  // —— Easy (10) — still interview-grade ——
  c('e01', 'Coding', 'Two Sum Indices', 'Return indices of two numbers that add to target. O(n) expected.', 'Easy', 55,
    'function twoSum(nums, target) {\n}', 'twoSum(input.nums, input.target)',
    [{ input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] }, { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }]),
  c('e02', 'Logic', 'Valid Parentheses', 'Given a string of brackets, return if it is valid.', 'Easy', 50,
    'function isValid(s) {\n}', 'isValid(input.s)',
    [{ input: { s: '()[]{}' }, expected: true }, { input: { s: '(]' }, expected: false }]),
  c('e03', 'Coding', 'Merge Sorted Arrays', 'Merge two sorted arrays into one sorted array.', 'Easy', 55,
    'function mergeSorted(a, b) {\n}', 'mergeSorted(input.a, input.b)',
    [{ input: { a: [1, 3, 5], b: [2, 4, 6] }, expected: [1, 2, 3, 4, 5, 6] }]),
  c('e04', 'Database', 'Filter Active Records', 'Count rows where status equals "active".', 'Easy', 45,
    'function countActive(rows) {\n}', 'countActive(input.rows)',
    [{ input: { rows: [{ status: 'active' }, { status: 'inactive' }, { status: 'active' }] }, expected: 2 }]),
  c('e05', 'Logic', 'FizzBuzz Label', 'Return Fizz/Buzz/FizzBuzz or number as string.', 'Easy', 45,
    'function fizzBuzz(n) {\n}', 'fizzBuzz(input.n)',
    [{ input: { n: 15 }, expected: 'FizzBuzz' }, { input: { n: 9 }, expected: 'Fizz' }, { input: { n: 7 }, expected: '7' }]),
  c('e06', 'Coding', 'Max Subarray Sum', 'Find maximum sum of contiguous subarray (Kadane).', 'Easy', 60,
    'function maxSubArray(nums) {\n}', 'maxSubArray(input.nums)',
    [{ input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 }]),
  c('e07', 'Debugging', 'Fix Sum 1 to N', 'Fix off-by-one; return sum 1..n.', 'Easy', 50,
    'function sumToN(n) {\n  let s = 0;\n  for (let i = 1; i <= n; i++) s += i;\n  return s;\n}', 'sumToN(input.n)',
    [{ input: { n: 5 }, expected: 15 }, { input: { n: 10 }, expected: 55 }]),
  c('e08', 'Frontend', 'Deep Clone JSON', 'Deep clone a JSON-serializable object.', 'Easy', 55,
    'function deepClone(obj) {\n}', 'deepClone(input.obj)',
    [{ input: { obj: { a: 1, b: { c: 2 } } }, expected: { a: 1, b: { c: 2 } } }]),
  c('e09', 'Coding', 'Anagram Check', 'Return true if two strings are anagrams (case-insensitive).', 'Easy', 50,
    'function isAnagram(a, b) {\n}', 'isAnagram(input.a, input.b)',
    [{ input: { a: 'Listen', b: 'Silent' }, expected: true }, { input: { a: 'hello', b: 'bello' }, expected: false }]),
  c('e10', 'Backend', 'Paginate Array', 'Return slice for page (1-based) and page size.', 'Easy', 55,
    'function pageSlice(arr, page, size) {\n}', 'pageSlice(input.arr, input.page, input.size)',
    [{ input: { arr: [1, 2, 3, 4, 5], page: 2, size: 2 }, expected: [3, 4] }]),

  // —— Medium (20) ——
  c('m01', 'Coding', 'Longest Substring Without Repeat', 'Length of longest substring without repeating chars.', 'Medium', 75,
    'function lengthOfLongestSubstring(s) {\n}', 'lengthOfLongestSubstring(input.s)',
    [{ input: { s: 'abcabcbb' }, expected: 3 }, { input: { s: 'bbbbb' }, expected: 1 }]),
  c('m02', 'Coding', 'Product Except Self', 'Return array where output[i] is product of all except i. No division.', 'Medium', 80,
    'function productExceptSelf(nums) {\n}', 'productExceptSelf(input.nums)',
    [{ input: { nums: [1, 2, 3, 4] }, expected: [24, 12, 8, 6] }]),
  c('m03', 'Coding', 'Rotate Matrix 90°', 'Rotate NxN matrix clockwise in-place logic (return new matrix).', 'Medium', 85,
    'function rotate(matrix) {\n}', 'rotate(input.matrix)',
    [{ input: { matrix: [[1, 2], [3, 4]] }, expected: [[3, 1], [4, 2]] }]),
  c('m04', 'Database', 'Group By Category', 'Sum amounts per category.', 'Medium', 70,
    'function sumByCategory(rows) {\n}', 'sumByCategory(input.rows)',
    [{ input: { rows: [{ cat: 'A', amt: 10 }, { cat: 'B', amt: 5 }, { cat: 'A', amt: 3 }] }, expected: { A: 13, B: 5 } }]),
  c('m05', 'Logic', 'Decode Ways', 'Count ways to decode digit string (1-26 mapping).', 'Medium', 90,
    'function numDecodings(s) {\n}', 'numDecodings(input.s)',
    [{ input: { s: '12' }, expected: 2 }, { input: { s: '226' }, expected: 3 }]),
  c('m06', 'Frontend', 'Flatten Tree IDs', 'DFS flatten node ids from nested children.', 'Medium', 75,
    'function flattenIds(node) {\n}', 'flattenIds(input.node)',
    [{ input: { node: { id: 'a', children: [{ id: 'b' }, { id: 'c', children: [{ id: 'd' }] }] } }, expected: ['a', 'b', 'c', 'd'] }]),
  c('m07', 'Coding', 'Binary Search', 'Return index of target in sorted array or -1.', 'Medium', 65,
    'function binarySearch(arr, target) {\n}', 'binarySearch(input.arr, input.target)',
    [{ input: { arr: [1, 3, 5, 7, 9], target: 5 }, expected: 2 }, { input: { arr: [1, 3, 5], target: 6 }, expected: -1 }]),
  c('m08', 'Backend', 'Stack Push Pop', 'Simulate stack: ops are "push x" or "pop"; return array of pop results.', 'Medium', 75,
    'function runStack(ops) {\n}', 'runStack(input.ops)',
    [{ input: { ops: ['push 1', 'push 2', 'pop', 'pop'] }, expected: [2, 1] }]),
  c('m09', 'Debugging', 'Fix Async Order', 'Return array of doubled values in order.', 'Medium', 70,
    'function doubleAll(nums) {\n  return nums.map(n => n * 2);\n}', 'doubleAll(input.nums)',
    [{ input: { nums: [1, 2, 3] }, expected: [2, 4, 6] }]),
  c('m10', 'AI', 'Tokenize Words', 'Split text into lowercase words; strip punctuation.', 'Medium', 65,
    'function tokenize(text) {\n}', 'tokenize(input.text)',
    [{ input: { text: 'Hello, World!' }, expected: ['hello', 'world'] }]),
  c('m11', 'Coding', 'Coin Change Min', 'Minimum coins to make amount or -1.', 'Medium', 90,
    'function coinChange(coins, amount) {\n}', 'coinChange(input.coins, input.amount)',
    [{ input: { coins: [1, 2, 5], amount: 11 }, expected: 3 }]),
  c('m12', 'System Design', 'Consistent Hash Slot', 'Given keys and 3 nodes, return node index via simple hash mod.', 'Medium', 80,
    'function routeKey(key, nodes) {\n}', 'routeKey(input.key, input.nodes)',
    [{ input: { key: 'user:42', nodes: 3 }, expected: 0 }]),
  c('m13', 'Cybersecurity', 'Sanitize HTML', 'Strip script tags from string.', 'Medium', 75,
    'function stripScripts(html) {\n}', 'stripScripts(input.html)',
    [{ input: { html: '<p>ok</p><script>x</script>' }, expected: '<p>ok</p>' }]),
  c('m14', 'Coding', 'Merge Intervals', 'Merge overlapping intervals.', 'Medium', 85,
    'function mergeIntervals(intervals) {\n}', 'mergeIntervals(input.intervals)',
    [{ input: { intervals: [[1, 3], [2, 6], [8, 10]] }, expected: [[1, 6], [8, 10]] }]),
  c('m15', 'Database', 'Second Highest Salary', 'Return second distinct salary from rows.', 'Medium', 70,
    'function secondSalary(rows) {\n}', 'secondSalary(input.rows)',
    [{ input: { rows: [{ sal: 100 }, { sal: 200 }, { sal: 200 }] }, expected: 100 }]),
  c('m16', 'Logic', 'Spiral Order', 'Return matrix elements in spiral order.', 'Medium', 85,
    'function spiralOrder(matrix) {\n}', 'spiralOrder(input.matrix)',
    [{ input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] }]),
  c('m17', 'Frontend', 'Debounce Result', 'Return last call result after applying debounce logic on calls array.', 'Medium', 75,
    'function lastCall(calls) {\n}', 'lastCall(input.calls)',
    [{ input: { calls: [1, 2, 3] }, expected: 3 }]),
  c('m18', 'Backend', 'Parse Query String', 'Parse a=b&c=d into object.', 'Medium', 60,
    'function parseQuery(qs) {\n}', 'parseQuery(input.qs)',
    [{ input: { qs: 'a=1&b=2' }, expected: { a: '1', b: '2' } }]),
  c('m19', 'Coding', 'Word Break', 'Return true if string can be segmented by dictionary words.', 'Medium', 90,
    'function wordBreak(s, dict) {\n}', 'wordBreak(input.s, input.dict)',
    [{ input: { s: 'leetcode', dict: ['leet', 'code'] }, expected: true }]),
  c('m20', 'Debugging', 'Fix Immutable Push', 'Return new array with item appended without mutating input.', 'Medium', 65,
    'function append(arr, item) {\n  return [...arr, item];\n}', 'append(input.arr, input.item)',
    [{ input: { arr: [1, 2], item: 3 }, expected: [1, 2, 3] }]),

  // —— Hard (20) ——
  c('h01', 'Coding', 'Trapping Rain Water', 'Compute trapped water units given elevation map.', 'Hard', 120,
    'function trap(height) {\n}', 'trap(input.height)',
    [{ input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: 6 }]),
  c('h02', 'Coding', 'Median of Two Sorted Arrays', 'Find median of two sorted arrays.', 'Hard', 150,
    'function findMedianSortedArrays(a, b) {\n}', 'findMedianSortedArrays(input.a, input.b)',
    [{ input: { a: [1, 3], b: [2] }, expected: 2 }]),
  c('h03', 'System Design', 'Tree Max Depth', 'Return max depth of nested object (each key counts as level).', 'Hard', 100,
    'function maxDepth(obj) {\n}', 'maxDepth(input.obj)',
    [{ input: { obj: { a: { b: { c: 1 } } } }, expected: 3 }]),
  c('h04', 'Coding', 'N-Queens Count', 'Return number of distinct N-Queens solutions.', 'Hard', 130,
    'function totalNQueens(n) {\n}', 'totalNQueens(input.n)',
    [{ input: { n: 4 }, expected: 2 }, { input: { n: 8 }, expected: 92 }]),
  c('h05', 'AI', 'Gradient Step', 'One step of gradient descent on quadratic f(x)=x^2.', 'Hard', 100,
    'function gradStep(x, lr) {\n}', 'gradStep(input.x, input.lr)',
    [{ input: { x: 3, lr: 0.1 }, expected: 2.4 }]),
  c('h06', 'Database', 'Design URL Shortener Hash', 'Return base62 code for integer id.', 'Hard', 95,
    'function encodeId(id) {\n}', 'encodeId(input.id)',
    [{ input: { id: 0 }, expected: 'a' }, { input: { id: 61 }, expected: 'Z' }]),
  c('h07', 'Coding', 'Regular Expression Match', 'Implement isMatch with . and * (simplified: only .* at end).', 'Hard', 140,
    'function isMatch(s, p) {\n}', 'isMatch(input.s, input.p)',
    [{ input: { s: 'aa', p: 'a*' }, expected: true }, { input: { s: 'ab', p: '.*' }, expected: true }]),
  c('h08', 'Backend', 'Consistent Snapshot', 'Apply ops get/put on map; return final get value.', 'Hard', 105,
    'function runOps(ops) {\n}', 'runOps(input.ops)',
    [{ input: { ops: [{ op: 'put', k: 'a', v: 1 }, { op: 'get', k: 'a' }] }, expected: 1 }]),
  c('h09', 'Cybersecurity', 'Detect SQL Injection', 'Return true if input contains dangerous SQL fragments.', 'Hard', 90,
    'function hasSqlInjection(q) {\n}', 'hasSqlInjection(input.q)',
    [{ input: { q: "SELECT * FROM users" }, expected: true }, { input: { q: 'hello' }, expected: false }]),
  c('h10', 'Coding', 'Alien Dictionary Order', 'Return valid character order or empty if cycle.', 'Hard', 130,
    'function alienOrder(words) {\n}', 'alienOrder(input.words)',
    [{ input: { words: ['wrt', 'wrf', 'er', 'ett', 'rftt'] }, expected: 'wertf' }]),
  c('h11', 'Frontend', 'Virtual List Range', 'Given scrollTop, itemHeight, containerHeight, return visible index range.', 'Hard', 100,
    'function visibleRange(scrollTop, itemHeight, containerHeight, total) {\n}', 'visibleRange(input.scrollTop, input.itemHeight, input.containerHeight, input.total)',
    [{ input: { scrollTop: 250, itemHeight: 50, containerHeight: 200, total: 100 }, expected: [5, 9] }]),
  c('h12', 'Logic', 'Sudoku Valid', 'Return if 9x9 partial grid is valid so far.', 'Hard', 115,
    'function isValidSudoku(board) {\n}', 'isValidSudoku(input.board)',
    [{ input: { board: [['5', '3', '.', '.', '7', '.', '.', '.', '.']] }, expected: true }]),
  c('h13', 'Coding', 'Max Path Sum in Grid', 'Find max path sum top-left to bottom-right moving right/down.', 'Hard', 110,
    'function minPathSum(grid) {\n}', 'minPathSum(input.grid)',
    [{ input: { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] }, expected: 7 }]),
  c('h14', 'System Design', 'Circuit Breaker', 'Simulate breaker: open after 3 failures, return "open" on call.', 'Hard', 120,
    'function breakerState(failures) {\n}', 'breakerState(input.failures)',
    [{ input: { failures: [true, true, true] }, expected: 'open' }]),
  c('h15', 'Database', 'Transaction Isolation', 'Given read/write log, return if dirty read occurred.', 'Hard', 105,
    'function hasDirtyRead(log) {\n}', 'hasDirtyRead(input.log)',
    [{ input: { log: [{ t: 'w', v: 1 }, { t: 'r', v: 1 }] }, expected: false }]),
  c('h16', 'Coding', 'Substring with Concatenation', 'Find starting indices of concatenated words.', 'Hard', 125,
    'function findSubstring(s, words) {\n}', 'findSubstring(input.s, input.words)',
    [{ input: { s: 'barfoothefoobarman', words: ['foo', 'bar'] }, expected: [0, 9] }]),
  c('h17', 'Backend', 'Implement Promise.all', 'Return results array for settled promises array (sync mock).', 'Hard', 115,
    'function promiseAll(tasks) {\n}', 'promiseAll(input.tasks)',
    [{ input: { tasks: [1, 2, 3] }, expected: [1, 2, 3] }]),
  c('h18', 'AI', 'Count Vowels', 'Count a,e,i,o,u (case-insensitive) in string.', 'Hard', 85,
    'function countVowels(s) {\n}', 'countVowels(input.s)',
    [{ input: { s: 'CareerForge' }, expected: 4 }, { input: { s: 'xyz' }, expected: 0 }]),
  c('h19', 'Coding', 'Serialize Graph Clone', 'Clone adjacency list node with val and neighbors ids.', 'Hard', 130,
    'function cloneGraph(node) {\n}', 'cloneGraph(input.node)',
    [{ input: { node: { val: 1, neighbors: [2] } }, expected: { val: 1, neighbors: [2] } }]),
  c('h20', 'Debugging', 'Race-Safe Counter', 'Return final count after concurrent increment simulation.', 'Hard', 110,
    'function finalCount(ops) {\n}', 'finalCount(input.ops)',
    [{ input: { ops: ['inc', 'inc', 'inc'] }, expected: 3 }]),
];

export const ARENA_BANK_PREFIX = 'arena-';

export function arenaChallengeId(id: string): string {
  return `${ARENA_BANK_PREFIX}${id}`;
}

export function getArenaChallengeById(fullId: string): ArenaChallengeTemplate | undefined {
  const raw = fullId.startsWith(ARENA_BANK_PREFIX) ? fullId.slice(ARENA_BANK_PREFIX.length) : fullId;
  return ARENA_CHALLENGE_BANK.find((c) => c.id === raw);
}
