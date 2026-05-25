export interface DailyCodingProblemTemplate {
  id: string;
  skills: string[];
  title: string;
  scenario: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starterCode: string;
  testCases: { input: Record<string, unknown>; expected: unknown }[];
  hints: string[];
  xpReward: number;
}

export const DAILY_PROBLEM_BANK: DailyCodingProblemTemplate[] = [
  {
    id: 'cart-total',
    skills: ['JavaScript', 'Python', 'TypeScript'],
    title: 'E-commerce Cart Total',
    scenario: 'You work at an online store. The checkout service receives cart items with price and quantity.',
    description: 'Write a function that takes an array of items `{price, qty}` and returns the total bill rounded to 2 decimals.',
    difficulty: 'Easy',
    starterCode: 'function cartTotal(items) {\n  // items: { price: number, qty: number }[]\n}',
    testCases: [
      { input: { items: [{ price: 10, qty: 2 }, { price: 5.5, qty: 1 }] }, expected: 25.5 },
      { input: { items: [] }, expected: 0 },
    ],
    hints: ['Use reduce to sum price * qty', 'Handle empty cart'],
    xpReward: 40,
  },
  {
    id: 'rate-limiter',
    skills: ['JavaScript', 'Python', 'System Design'],
    title: 'API Rate Limiter',
    scenario: 'Your API allows max N requests per user per minute. Implement a simple in-memory check.',
    description: 'Given `userId`, `timestamp` (seconds), and `limit`, return true if the request is allowed (count requests in last 60s).',
    difficulty: 'Hard',
    starterCode: 'const requests = {};\nfunction allowRequest(userId, timestamp, limit) {\n}',
    testCases: [
      { input: { userId: 'a', timestamp: 1, limit: 2 }, expected: true },
    ],
    hints: ['Store timestamps per userId', 'Filter timestamps older than 60s'],
    xpReward: 60,
  },
  {
    id: 'csv-parse',
    skills: ['Python', 'Pandas', 'Data Engineering'],
    title: 'Parse Sales CSV',
    scenario: 'Marketing exports daily sales as rows: `{region, amount}`.',
    description: 'Return total sales per region as an object `{ region: total }`.',
    difficulty: 'Medium',
    starterCode: 'function salesByRegion(rows) {\n  // rows: { region: string, amount: number }[]\n}',
    testCases: [
      { input: { rows: [{ region: 'US', amount: 100 }, { region: 'US', amount: 50 }, { region: 'EU', amount: 30 }] }, expected: { US: 150, EU: 30 } },
    ],
    hints: ['Loop and accumulate into a map/object'],
    xpReward: 45,
  },
  {
    id: 'password-strength',
    skills: ['JavaScript', 'Cybersecurity', 'Secure Coding'],
    title: 'Password Strength Checker',
    scenario: 'Your auth team needs a client-side strength validator before signup.',
    description: 'Return "weak", "medium", or "strong": strong = 8+ chars with upper, lower, digit; medium = 6+ with 2 types; else weak.',
    difficulty: 'Medium',
    starterCode: 'function passwordStrength(pw) {\n}',
    testCases: [
      { input: { pw: 'Abcdef1!' }, expected: 'strong' },
      { input: { pw: 'abc' }, expected: 'weak' },
    ],
    hints: ['Use regex for character classes'],
    xpReward: 50,
  },
  {
    id: 'binary-search',
    skills: ['Python', 'Java', 'C++', 'JavaScript'],
    title: 'Find Product SKU',
    scenario: 'Warehouse inventory SKUs are sorted. Find index of target SKU or -1.',
    description: 'Implement binary search on sorted string array.',
    difficulty: 'Medium',
    starterCode: 'function findSku(sorted, target) {\n}',
    testCases: [
      { input: { sorted: ['A', 'B', 'D', 'E'], target: 'D' }, expected: 2 },
      { input: { sorted: ['A', 'B'], target: 'Z' }, expected: -1 },
    ],
    hints: ['Classic binary search with left/right pointers'],
    xpReward: 55,
  },
  {
    id: 'react-filter',
    skills: ['React', 'JavaScript', 'TypeScript'],
    title: 'Filter Job Listings',
    scenario: 'Students search internships by keyword in title or company.',
    description: 'Filter jobs array where title OR company includes keyword (case-insensitive).',
    difficulty: 'Easy',
    starterCode: 'function filterJobs(jobs, keyword) {\n  // jobs: { title, company }[]\n}',
    testCases: [
      { input: { jobs: [{ title: 'Frontend Dev', company: 'Stripe' }, { title: 'Data', company: 'Meta' }], keyword: 'front' }, expected: [{ title: 'Frontend Dev', company: 'Stripe' }] },
    ],
    hints: ['toLowerCase on both fields'],
    xpReward: 35,
  },
  {
    id: 'sql-injection-safe',
    skills: ['SQL', 'PostgreSQL', 'Cybersecurity'],
    title: 'Safe Query Builder',
    scenario: 'Never concatenate user input into SQL. Build a parameterized WHERE clause.',
    description: 'Given allowed columns and filters object, return `{ clause: "col = ?", values: [] }` for single equality filters only.',
    difficulty: 'Hard',
    starterCode: 'function buildWhere(allowed, filters) {\n}',
    testCases: [
      { input: { allowed: ['id', 'name'], filters: { id: 5 } }, expected: { clause: 'id = ?', values: [5] } },
    ],
    hints: ['Reject keys not in allowed list'],
    xpReward: 65,
  },
  {
    id: 'ml-accuracy',
    skills: ['Python', 'Machine Learning', 'Scikit-Learn'],
    title: 'Classification Accuracy',
    scenario: 'You evaluated a model on labeled test data.',
    description: 'Given parallel arrays `yTrue` and `yPred`, return accuracy as float 0-1.',
    difficulty: 'Easy',
    starterCode: 'function accuracy(yTrue, yPred) {\n}',
    testCases: [
      { input: { yTrue: [1, 0, 1, 1], yPred: [1, 0, 0, 1] }, expected: 0.75 },
    ],
    hints: ['Count matches / length'],
    xpReward: 40,
  },
  {
    id: 'docker-health',
    skills: ['Docker', 'DevOps', 'Node.js'],
    title: 'Health Check Aggregator',
    scenario: 'Load balancer needs all services healthy before routing traffic.',
    description: 'Given `{name, ok}[]` services, return true only if every service has ok === true.',
    difficulty: 'Easy',
    starterCode: 'function allHealthy(services) {\n}',
    testCases: [
      { input: { services: [{ name: 'api', ok: true }, { name: 'db', ok: true }] }, expected: true },
      { input: { services: [{ name: 'api', ok: false }] }, expected: false },
    ],
    hints: ['Use every()'],
    xpReward: 30,
  },
  {
    id: 'flatten-json',
    skills: ['JavaScript', 'TypeScript', 'Python'],
    title: 'Flatten Nested Config',
    scenario: 'DevOps configs nest environment variables. Flatten for .env export.',
    description: 'Flatten `{ a: { b: 1 }, c: 2 }` to `{ "a.b": 1, "c": 2 }` (one level nesting only).',
    difficulty: 'Medium',
    starterCode: 'function flatten(obj) {\n}',
    testCases: [
      { input: { obj: { a: { b: 1 }, c: 2 } }, expected: { 'a.b': 1, c: 2 } },
    ],
    hints: ['Iterate keys, prefix nested keys'],
    xpReward: 45,
  },
  {
    id: 'leetcode-two-sum',
    skills: ['Python', 'JavaScript', 'Java'],
    title: 'Pair Discount Codes',
    scenario: 'Two discount codes must sum to target percent off.',
    description: 'Return indices of two numbers in nums that add to target (classic two sum).',
    difficulty: 'Easy',
    starterCode: 'function twoSum(nums, target) {\n}',
    testCases: [{ input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] }],
    hints: ['Use a hash map of value -> index'],
    xpReward: 40,
  },
  {
    id: 'git-merge',
    skills: ['Git', 'JavaScript'],
    title: 'Merge Sorted Commits',
    scenario: 'Two feature branches have sorted commit timestamps. Merge them.',
    description: 'Merge two sorted number arrays into one sorted array.',
    difficulty: 'Medium',
    starterCode: 'function mergeSorted(a, b) {\n}',
    testCases: [{ input: { a: [1, 3, 5], b: [2, 4, 6] }, expected: [1, 2, 3, 4, 5, 6] }],
    hints: ['Two pointer technique'],
    xpReward: 50,
  },
];
