import type { QuizQuestion } from '../types';
import { toSkillSlug } from '../utils/slug';

export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestionMeta extends QuizQuestion {
  difficulty: QuizDifficulty;
  skill: string;
}

type QuizTemplate = {
  prompt: (skill: string, career?: string) => string;
  options: (skill: string, career?: string) => string[];
  correctIndex: number;
};

const EASY_TEMPLATES: QuizTemplate[] = [
  {
    prompt: (skill) => `What is ${skill} primarily used for?`,
    options: () => [
      'Building and improving software systems',
      'Cooking recipes in a kitchen',
      'Designing clothes for fashion shows',
      'Fixing hardware with a soldering iron',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `Which statement best fits ${skill}?`,
    options: () => [
      'A tool or skill used in modern engineering work',
      'A social media trend',
      'A type of sports equipment',
      'A music genre',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `Where would you most likely see ${skill} in practice?`,
    options: () => [
      'In product code, data pipelines, or infrastructure',
      'In a grocery store aisle',
      'In a movie script format',
      'In a cooking recipe',
    ],
    correctIndex: 0,
  },
];

const MEDIUM_TEMPLATES: QuizTemplate[] = [
  {
    prompt: (skill) => `When working with ${skill}, which habit prevents most bugs?`,
    options: () => [
      'Validate inputs and test edge cases',
      'Skip tests to move faster',
      'Avoid code reviews',
      'Ship without logging',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `You are adopting ${skill} at work. What is the best first step?`,
    options: () => [
      'Define clear inputs, outputs, and success criteria',
      'Ignore requirements until later',
      'Copy random snippets without understanding',
      'Over-optimize before it works',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `Which choice best reflects good ${skill} practice?`,
    options: () => [
      'Readable code with tests and small iterations',
      'One giant function with no checks',
      'No documentation or comments ever',
      'Optimize before correctness',
    ],
    correctIndex: 0,
  },
];

const HARD_TEMPLATES: QuizTemplate[] = [
  {
    prompt: (skill) => `At scale, which trade-off matters most when using ${skill}?`,
    options: () => [
      'Performance versus reliability',
      'Font size versus color theme',
      'Keyboard layout versus mouse speed',
      'Tab width versus line endings',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `For production ${skill} systems, what risk should you mitigate early?`,
    options: () => [
      'Silent failures and unhandled edge cases',
      'Having too many comments',
      'Naming variables too clearly',
      'Writing tests first',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill, career) => `Which signal best indicates mature ${skill} usage for a ${career || 'career'} team?`,
    options: () => [
      'Monitoring, tests, and clear ownership',
      'Only local experiments',
      'No staging environment',
      'Avoiding automation',
    ],
    correctIndex: 0,
  },
];

const TEMPLATE_MAP: Record<QuizDifficulty, QuizTemplate[]> = {
  Easy: EASY_TEMPLATES,
  Medium: MEDIUM_TEMPLATES,
  Hard: HARD_TEMPLATES,
};

export function buildSkillQuestion(skill: string, difficulty: QuizDifficulty, variant: number, career?: string): QuizQuestionMeta {
  const templates = TEMPLATE_MAP[difficulty];
  const idx = Math.abs(variant) % templates.length;
  const template = templates[idx];
  const slug = toSkillSlug(skill);

  return {
    id: `${difficulty.toLowerCase()}-${slug}-${idx}`,
    prompt: template.prompt(skill, career),
    options: template.options(skill, career),
    correctIndex: template.correctIndex,
    difficulty,
    skill,
  };
}
