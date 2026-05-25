import { runWithInvoke } from '../utils/challengeRunner';

export type SkillProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface SkillConceptProblem {
  id: string;
  skill: string;
  title: string;
  scenario: string;
  description: string;
  difficulty: SkillProblemDifficulty;
  starterCode: string;
  testCases: { input: Record<string, unknown>; expected: unknown }[];
  invoke: string;
  hints: string[];
  xpReward: number;
}

function p(
  skill: string,
  diff: SkillProblemDifficulty,
  idx: number,
  title: string,
  scenario: string,
  description: string,
  starterCode: string,
  invoke: string,
  testCases: SkillConceptProblem['testCases'],
  hints: string[]
): SkillConceptProblem {
  const diffKey = diff === 'Easy' ? 'e' : diff === 'Medium' ? 'm' : 'h';
  const xp = diff === 'Easy' ? 25 : diff === 'Medium' ? 45 : 70;
  return {
    id: `${diffKey}-${skill.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
    skill,
    title,
    scenario,
    description,
    difficulty: diff,
    starterCode,
    testCases,
    invoke,
    hints,
    xpReward: xp,
  };
}

/** Nine problems per skill: 3 Easy (rigorous), 3 Medium, 3 Hard */
export function getProblemsForSkill(skill: string): SkillConceptProblem[] {
  return [
    p(skill, 'Easy', 1, `${skill}: Parse & Validate`, `Ticket: incoming payload must be validated before ${skill} pipeline runs.`,
      'Return true if input is non-null and (string length > 0 OR number > 0).',
      'function validateInput(x) {\n}', 'validateInput(input.x)',
      [{ input: { x: 'data' }, expected: true }, { input: { x: '' }, expected: false }, { input: { x: 0 }, expected: false }],
      ['Check typeof', 'Empty string is invalid']),
    p(skill, 'Easy', 2, `${skill}: Transform Collection`, `Batch job: normalize records for ${skill} worker.`,
      'Double each number in array; return new array.',
      'function doubleNums(arr) {\n}', 'doubleNums(input.arr)',
      [{ input: { arr: [1, 2, 3] }, expected: [2, 4, 6] }, { input: { arr: [] }, expected: [] }],
      ['Use map', 'Do not mutate input']),
    p(skill, 'Easy', 3, `${skill}: Aggregate Metric`, `Dashboard needs count of active ${skill} jobs.`,
      'Count objects where active === true.',
      'function countActive(rows) {\n}', 'countActive(input.rows)',
      [{ input: { rows: [{ active: true }, { active: false }, { active: true }] }, expected: 2 }],
      ['Filter or reduce', 'Strict boolean check']),
    p(skill, 'Medium', 1, `${skill}: Group By Key`, `Analytics API: group events by type.`,
      'Return object mapping type → count.',
      'function groupCount(events) {\n}', 'groupCount(input.events)',
      [{ input: { events: [{ type: 'a' }, { type: 'b' }, { type: 'a' }] }, expected: { a: 2, b: 1 } }],
      ['Hash map', 'Initialize missing keys']),
    p(skill, 'Medium', 2, `${skill}: Sliding Window Max`, `Stream processor for ${skill} metrics.`,
      'Given array and window k, return max in each window (array of maxes).',
      'function windowMax(arr, k) {\n}', 'windowMax(input.arr, input.k)',
      [{ input: { arr: [1, 3, -1, -3, 5, 3], k: 3 }, expected: [3, 3, 5, 5] }],
      ['Deque or brute force for small k', 'Handle k > length']),
    p(skill, 'Medium', 3, `${skill}: Safe Get Path`, `Config service stores nested ${skill} settings.`,
      'Return value at dot path like "a.b.c" or undefined if missing.',
      'function getPath(obj, path) {\n}', 'getPath(input.obj, input.path)',
      [{ input: { obj: { a: { b: { c: 42 } } }, path: 'a.b.c' }, expected: 42 }, { input: { obj: {}, path: 'x' }, expected: undefined }],
      ['Split path by dot', 'Guard undefined']),
    p(skill, 'Hard', 1, `${skill}: Top K Frequent`, `Hot keys in ${skill} cache layer.`,
      'Return top k strings by frequency from string array.',
      'function topKFrequent(words, k) {\n}', 'topKFrequent(input.words, input.k)',
      [{ input: { words: ['a', 'b', 'a', 'c', 'b', 'a'], k: 2 }, expected: ['a', 'b'] }],
      ['Count frequencies', 'Sort by count desc']),
    p(skill, 'Hard', 2, `${skill}: Merge Ranges`, `Scheduler merging ${skill} maintenance windows.`,
      'Merge overlapping [start,end] intervals.',
      'function mergeRanges(ranges) {\n}', 'mergeRanges(input.ranges)',
      [{ input: { ranges: [[1, 3], [2, 6], [8, 10]] }, expected: [[1, 6], [8, 10]] }],
      ['Sort by start', 'Compare with last merged']),
    p(skill, 'Hard', 3, `${skill}: Shortest Path Steps`, `Grid navigation in ${skill} simulation.`,
      'On 0/1 grid return shortest steps from top-left to bottom-right (4-dir), or -1.',
      'function shortestPath(grid) {\n}', 'shortestPath(input.grid)',
      [{ input: { grid: [[0, 0], [1, 0]] }, expected: 3 }],
      ['BFS', 'Track visited']),
  ];
}

export function runSkillProblemTest(code: string, problem: SkillConceptProblem): boolean {
  for (const tc of problem.testCases) {
    try {
      const result = runWithInvoke(code, problem.invoke, tc.input);
      if (JSON.stringify(result) !== JSON.stringify(tc.expected)) return false;
    } catch {
      return false;
    }
  }
  return true;
}
