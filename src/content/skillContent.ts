import type { ModuleType } from '../types';
import { buildSkillQuestion } from './quizBank';

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
  learningObjectives: string[];
  theory: string;
  theorySections: { title: string; body: string }[];
  codeExamples: CodeExample[];
  resources: { title: string; type: string; url?: string; duration?: string }[];
  videos: { title: string; description: string }[];
  checkpoints: { title: string; prompt: string }[];
  keyTakeaways: string[];
}

export type PracticeStep = string | { heading: string; body: string };

export interface RichPracticeContent extends PracticeExercise {
  steps: PracticeStep[];
  hints: string[];
  checkpoints: string[];
}

export interface RichProjectContent {
  title: string;
  overview: string;
  requirements: string[];
  milestones: string[];
  checkpoints: string[];
  rubric: string[];
}

const SKILL_OVERRIDES: Record<string, Partial<{ intro: string; useCase: string }>> = {
  Python: { intro: 'Python powers data science, automation, backends, and AI.', useCase: 'Netflix, Instagram, and NASA use Python for scale and speed of development.' },
  JavaScript: { intro: 'JavaScript runs the interactive web and increasingly servers via Node.js.', useCase: 'Every browser and millions of SPAs depend on JS.' },
  React: { intro: 'React is a component-based UI library for building modern interfaces.', useCase: 'Meta, Airbnb, and Discord ship React at scale.' },
  'Machine Learning': { intro: 'ML learns patterns from data instead of hard-coded rules.', useCase: 'Recommendations, fraud detection, and medical imaging.' },
  SQL: { intro: 'SQL is the language of relational data: queries, joins, aggregations.', useCase: 'Every company with a database needs SQL.' },
  Docker: { intro: 'Docker packages apps with dependencies into portable containers.', useCase: 'CI/CD and cloud deploys standardize on containers.' },
  CAD: { intro: 'CAD (Computer-Aided Design) is essential for creating precise 3D mechanical models and technical drawings.', useCase: 'Tesla and Boeing engineers use CAD to design and simulate mechanical components.' },
  MATLAB: { intro: 'MATLAB is a programming environment designed for algorithm development, data analysis, and numerical computation.', useCase: 'Automotive and aerospace teams use MATLAB for control system design and simulations.' },
  Robotics: { intro: 'Robotics integrates kinematics, control systems, sensors, and actuators to build autonomous physical systems.', useCase: 'Boston Dynamics and Amazon Robotics use robotics engineering to design smart mobile machines.' },
  VHDL: { intro: 'VHDL is a hardware description language used to model and simulate digital electronic systems.', useCase: 'FPGA and ASIC design engineers use VHDL for space, military, and telecom hardware.' },
  Verilog: { intro: 'Verilog is a hardware description language used to design and verify digital logic circuits.', useCase: 'Intel, AMD, and NVIDIA use Verilog to implement and test microprocessors.' },
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
    overview: `${meta.intro} On your **${career}** path, mastering ${skill} unlocks the next phase of your roadmap. This lesson moves from concept to example to application.`,
    learningObjectives: [
      `Explain what ${skill} solves in a ${career} workflow`,
      `Identify when ${skill} is the right tool and when it is not`,
      `Apply ${skill} to a small production-style task`,
    ],
    theory: `Understanding ${skill} means knowing **what problem it solves**, **when to use it**, and **what breaks at scale**. ${meta.useCase}`,
    theorySections: [
      {
        title: 'Core mental model',
        body: `Think of ${skill} as a tool in a pipeline: input to process to output. Draw the data flow before writing code. Ask: what are the edge cases such as empty input, null values, and huge scale?`,
      },
      {
        title: 'How professionals use it',
        body: `In industry, ${skill} appears in code review, system design, and incident response. Senior engineers optimize for readability, testability, and observability.`,
      },
      {
        title: 'Common mistakes',
        body: 'Beginners often skip fundamentals and copy snippets without context. Avoid missing tests, missing logging, mixed concerns, and ignored docs.',
      },
      {
        title: 'Career connection',
        body: `For **${career}** roles, interviewers expect you to explain ${skill} trade-offs in 2-3 minutes and tie them to a project you built.`,
      },
    ],
    codeExamples: [
      {
        title: `Starter: Hello ${skill}`,
        language: skill.includes('Python') ? 'python' : 'javascript',
        code: skill.includes('Python')
          ? `# ${skill} starter\n\ndef main():\n    print("Building ${skill} skills for ${career}")\n\nif __name__ == "__main__":\n    main()`
          : `// ${skill} starter\nfunction main() {\n  console.log("Building ${skill} skills for ${career}");\n}\nmain();`,
        explanation: 'Run this locally. Change the message. You have executed your first artifact in this module.',
      },
      {
        title: 'Real-world pattern',
        language: 'javascript',
        code: `// Pattern: validate -> process -> respond\nfunction handleRequest(input) {\n  if (!input) throw new Error("Invalid input");\n  const result = process(input); // your ${skill} logic here\n  return { ok: true, data: result };\n}`,
        explanation: 'Most production code follows validate/process/respond. Frameworks hide this, but interviews test if you know it.',
      },
    ],
    resources: [
      { title: `${skill} Official Documentation`, type: 'reading', url: 'https://developer.mozilla.org' },
      { title: `${skill} Crash Course`, type: 'video', duration: '45 min' },
      { title: `Practice ${skill} Exercises`, type: 'interactive' },
      { title: `${career} Interview Questions for ${skill}`, type: 'reading' },
    ],
    videos: [
      { title: `${skill} in 100 Seconds`, description: 'Quick conceptual overview' },
      { title: `Build with ${skill}`, description: 'End-to-end applied tutorial' },
    ],
    checkpoints: [
      { title: 'Concept check', prompt: `Describe ${skill} in one practical sentence.` },
      { title: 'Trade-off check', prompt: `Name one limitation or risk when using ${skill}.` },
      { title: 'Career check', prompt: `Connect ${skill} to one responsibility in a ${career} role.` },
    ],
    keyTakeaways: [
      `${skill} solves specific problems. Know which ones.`,
      'Always connect theory to a small built artifact.',
      `Tie learning back to your ${career} goal.`,
    ],
  };
}

export function getPracticeContent(skill: string, career: string): RichPracticeContent {
  return {
    title: `${skill} Applied Challenge`,
    realWorldContext: `A startup hiring ${career} interns asks candidates to demonstrate ${skill} on a realistic ticket.`,
    problem: `Implement a utility that processes a list of records related to ${skill}. Requirements:\n1. Handle empty input\n2. Return structured result\n3. Include basic error handling\n\nSpend 30-45 minutes. Use your notes and docs like a real job.`,
    starterCode: skill.includes('Python')
      ? `def solve(records):\n    """Process records using ${skill} concepts."""\n    pass`
      : `function solve(records) {\n  // Process records using ${skill} concepts\n}`,
    solutionOutline: 'Validate input -> transform records -> return { success, data, count }',
    steps: [
      { heading: 'Understand the ticket', body: 'Read the problem twice and write expected input/output examples in comments.' },
      { heading: 'Build the happy path', body: 'Implement the core logic first without edge cases so something runs.' },
      { heading: 'Harden edge cases', body: 'Add handling for empty input, invalid data, and boundary values.' },
      { heading: 'Test like production', body: 'Run at least 3 custom test cases including one failure scenario.' },
      { heading: 'Reflect and document', body: 'Note what you learned, what you would refactor, and how this maps to your career goal.' },
    ],
    hints: [
      `Break the problem into smaller ${skill} functions.`,
      'Log intermediate values while debugging.',
      'Compare your approach to the lesson code examples.',
    ],
    checkpoints: [
      'Your solution handles empty input.',
      'Your solution includes at least 3 manual test cases.',
      'You can explain one production improvement.',
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
      'Day 1: Design and scaffold repo',
      'Day 2: Core feature complete',
      'Day 3: Polish, document, deploy or record a demo',
    ],
    checkpoints: [
      'The project has a clear README.',
      'The main feature works for the happy path and edge cases.',
      'You can demo the project in under 3 minutes.',
    ],
    rubric: [
      'Correctness (40%)',
      'Code clarity (30%)',
      'Documentation (20%)',
      'Creativity / real-world fit (10%)',
    ],
  };
}

export function getQuizContent(skill: string, career?: string) {
  return {
    passThreshold: 75,
    questions: [
      buildSkillQuestion(skill, 'Easy', 0, career),
      buildSkillQuestion(skill, 'Easy', 1, career),
      buildSkillQuestion(skill, 'Medium', 0, career),
      buildSkillQuestion(skill, 'Hard', 0, career),
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
      id: 'objectives',
      title: 'Learning Objectives',
      content: lesson.learningObjectives.join('\n'),
      keyPoints: lesson.learningObjectives,
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
      return getQuizContent(skill, career);
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
