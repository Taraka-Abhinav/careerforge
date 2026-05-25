import type { ModuleType } from '../types';

export interface CodeExample {
  title: string;
  language: string;
  code: string;
  explanation: string;
}

export interface PracticeExercise {
  title: string;
  problem: string;
  starterCode: string;
  solutionOutline: string;
  realWorldContext: string;
}

export interface RichLessonContent {
  overview: string;
  theory: string;
  theorySections: { title: string; body: string }[];
  codeExamples: CodeExample[];
  resources: { title: string; type: string; url?: string; duration?: string }[];
  videos: { title: string; description: string }[];
  keyTakeaways: string[];
}

export type PracticeStep = string | { heading: string; body: string };

export interface RichPracticeContent extends PracticeExercise {
  steps: PracticeStep[];
  hints: string[];
}

export interface RichProjectContent {
  title: string;
  overview: string;
  requirements: string[];
  milestones: string[];
  rubric: string[];
}

const SKILL_OVERRIDES: Record<string, Partial<{ intro: string; useCase: string }>> = {
  Python: { intro: 'Python powers data science, automation, backends, and AI.', useCase: 'Netflix, Instagram, and NASA use Python for scale and speed of development.' },
  JavaScript: { intro: 'JavaScript runs the interactive web and increasingly servers via Node.js.', useCase: 'Every browser and millions of SPAs depend on JS.' },
  React: { intro: 'React is a component-based UI library for building modern interfaces.', useCase: 'Meta, Airbnb, and Discord ship React at scale.' },
  'Machine Learning': { intro: 'ML learns patterns from data instead of hard-coded rules.', useCase: 'Recommendations, fraud detection, and medical imaging.' },
  SQL: { intro: 'SQL is the language of relational data — queries, joins, aggregations.', useCase: 'Every company with a database needs SQL.' },
  Docker: { intro: 'Docker packages apps with dependencies into portable containers.', useCase: 'CI/CD and cloud deploys standardize on containers.' },
};

function skillMeta(skill: string) {
  return SKILL_OVERRIDES[skill] || {
    intro: `${skill} is a core competency for modern engineers.`,
    useCase: `Teams hire for ${skill} because it solves real production problems.`,
  };
}

export function getLessonContent(skill: string, career: string): RichLessonContent {
  const meta = skillMeta(skill);
  return {
    overview: `${meta.intro} On your **${career}** path, mastering ${skill} unlocks the next phase of your roadmap. This lesson is designed like a university lab: concept → example → application.`,
    theory: `Understanding ${skill} means knowing **what problem it solves**, **when to use it**, and **what breaks at scale**. ${meta.useCase}`,
    theorySections: [
      {
        title: 'Core mental model',
        body: `Think of ${skill} as a tool in a pipeline: input → process → output. Draw the data flow before writing code. Ask: what are the edge cases (empty input, null, huge scale)?`,
      },
      {
        title: 'How professionals use it',
        body: `In industry, ${skill} appears in code review, system design, and on-call incidents. Senior engineers optimize for readability, testability, and observability — not clever one-liners.`,
      },
      {
        title: 'Common mistakes',
        body: `Beginners skip fundamentals and copy Stack Overflow without context. Avoid: no tests, no logging, mixing concerns, and ignoring official docs.`,
      },
      {
        title: 'Career connection',
        body: `For **${career}** roles, interviewers expect you to explain ${skill} trade-offs in 2-3 minutes and tie them to a project you built.`,
      },
    ],
    codeExamples: [
      {
        title: `Starter: Hello ${skill}`,
        language: 'javascript',
        code: skill.includes('Python')
          ? `# ${skill} starter\n\ndef main():\n    print("Building ${skill} skills for ${career}")\n\nif __name__ == "__main__":\n    main()`
          : `// ${skill} starter\nfunction main() {\n  console.log("Building ${skill} skills for ${career}");\n}\nmain();`,
        explanation: 'Run this locally. Change the message. You have executed your first artifact in this module.',
      },
      {
        title: 'Real-world pattern',
        language: 'javascript',
        code: `// Pattern: validate → process → respond\nfunction handleRequest(input) {\n  if (!input) throw new Error("Invalid input");\n  const result = process(input); // your ${skill} logic here\n  return { ok: true, data: result };\n}`,
        explanation: 'Most production code follows validate/process/respond. Your frameworks hide this, but interviews test if you know it.',
      },
    ],
    resources: [
      { title: `${skill} Official Documentation`, type: 'reading', url: 'https://developer.mozilla.org' },
      { title: `${skill} Crash Course (Video)`, type: 'video', duration: '45 min' },
      { title: `Practice ${skill} — Exercises`, type: 'interactive' },
      { title: `${career} Interview Questions for ${skill}`, type: 'reading' },
    ],
    videos: [
      { title: `${skill} in 100 Seconds`, description: 'Quick conceptual overview' },
      { title: `Build with ${skill} — Project Walkthrough`, description: 'End-to-end applied tutorial' },
    ],
    keyTakeaways: [
      `${skill} solves specific problems — know which ones.`,
      'Always connect theory to a small built artifact.',
      `Tie learning back to your ${career} goal.`,
    ],
  };
}

export function getPracticeContent(skill: string, career: string): RichPracticeContent {
  return {
    title: `${skill} Applied Challenge`,
    realWorldContext: `A startup hiring ${career} interns asks candidates to demonstrate ${skill} on a realistic ticket.`,
    problem: `Implement a utility that processes a list of records related to ${skill}. Requirements:\n1. Handle empty input\n2. Return structured result\n3. Include basic error handling\n\nSpend 30–45 minutes. Use your notes and docs — like a real job.`,
    starterCode: skill.includes('Python')
      ? `def solve(records):\n    """Process records using ${skill} concepts."""\n    pass`
      : `function solve(records) {\n  // Process records using ${skill} concepts\n}`,
    solutionOutline: 'Validate input → map/filter/reduce or loop → return { success, data, count }',
    steps: [
      { heading: 'Understand the ticket', body: 'Read the problem twice and write expected input/output examples on paper or in comments.' },
      { heading: 'Build the happy path', body: 'Implement the core logic first without edge cases — get something running.' },
      { heading: 'Harden edge cases', body: 'Add handling for empty input, invalid data, and boundary values.' },
      { heading: 'Test like production', body: 'Run at least 3 custom test cases including one failure scenario.' },
      { heading: 'Reflect & document', body: 'Note what you learned, what you would refactor, and how this maps to your career goal.' },
    ],
    hints: [
      `Break the problem into smaller ${skill} functions.`,
      'Console.log intermediate values while debugging.',
      'Compare your approach to the lesson code examples.',
    ],
  };
}

export function getProjectContent(skill: string, career: string): RichProjectContent {
  return {
    title: `${skill} Capstone Mini-Project`,
    overview: `Build a portfolio-worthy artifact demonstrating ${skill} for a ${career} role. This is what you can discuss in interviews.`,
    requirements: [
      `Use ${skill} as the primary technology`,
      'Include README with setup instructions',
      'Handle at least 3 edge cases',
      'Add one automated test or manual test checklist',
    ],
    milestones: [
      'Day 1: Design + scaffold repo',
      'Day 2: Core feature complete',
      'Day 3: Polish, document, deploy or demo video',
    ],
    rubric: [
      'Correctness (40%)',
      'Code clarity (30%)',
      'Documentation (20%)',
      'Creativity / real-world fit (10%)',
    ],
  };
}

export function getQuizContent(skill: string) {
  return {
    passThreshold: 70,
    questions: [
      { id: 'q1', prompt: `In production, why is ${skill} valuable?`, options: ['It solves real user/business problems', 'It is trendy only', 'It replaces all other tools', 'It needs no practice'], correctIndex: 0 },
      { id: 'q2', prompt: 'Best way to learn this module?', options: ['Only watch videos', 'Build + test + reflect', 'Memorize syntax', 'Skip practice'], correctIndex: 1 },
      { id: 'q3', prompt: 'What should you do after this lesson?', options: ['Move on immediately', 'Complete practice then project', 'Forget the theory', 'Only read docs'], correctIndex: 1 },
      { id: 'q4', prompt: `Senior engineers using ${skill} prioritize:`, options: ['Clever hacks', 'Maintainability and clarity', 'Longest code wins', 'No documentation'], correctIndex: 1 },
    ],
  };
}

export function getNoteSections(skill: string, career: string) {
  const lesson = getLessonContent(skill, career);
  return [
    {
      id: 'overview',
      title: 'Overview',
      content: lesson.overview,
      keyPoints: lesson.keyTakeaways,
      checkpoint: { question: `Why is ${skill} on your ${career} roadmap?`, answer: lesson.keyTakeaways[2] },
    },
    {
      id: 'theory',
      title: 'Deep Theory',
      content: lesson.theorySections.map((s) => `**${s.title}**\n${s.body}`).join('\n\n'),
      keyPoints: lesson.theorySections.map((s) => s.title),
    },
    {
      id: 'code',
      title: 'Code Walkthrough',
      content: lesson.codeExamples.map((e) => `### ${e.title}\n\`\`\`\n${e.code}\n\`\`\`\n${e.explanation}`).join('\n\n'),
      keyPoints: lesson.codeExamples.map((e) => e.title),
    },
    {
      id: 'career',
      title: `Interview & Career (${career})`,
      content: `Prepare a 2-minute spoken explanation of ${skill} using a project example. Cover: problem, your approach, trade-offs, result.`,
      keyPoints: ['STAR format stories', 'Trade-off vocabulary', 'Metrics if possible'],
      checkpoint: { question: 'What project will you mention in interviews?', answer: 'Your capstone mini-project from this skill module.' },
    },
    {
      id: 'practice',
      title: 'Practice Mindset',
      content: getPracticeContent(skill, career).problem,
      keyPoints: getPracticeContent(skill, career).steps.map((s, i) =>
        typeof s === 'string' ? s : `Step ${i + 1}: ${s.heading}`
      ),
    },
  ];
}

export function getModuleContent(skill: string, career: string, type: ModuleType): Record<string, unknown> {
  switch (type) {
    case 'lesson':
      return getLessonContent(skill, career) as unknown as Record<string, unknown>;
    case 'practice':
      return getPracticeContent(skill, career) as unknown as Record<string, unknown>;
    case 'quiz':
      return getQuizContent(skill);
    case 'project':
      return getProjectContent(skill, career) as unknown as Record<string, unknown>;
    case 'assessment':
      return {
        ...getProjectContent(skill, career),
        assessmentType: 'timed-review',
        tasks: [
          'Explain core concepts without notes (10 min)',
          'Complete practice challenge without hints (30 min)',
          'Peer-review checklist: readability + tests',
        ],
      };
    default:
      return { description: `${type} for ${skill}` };
  }
}
