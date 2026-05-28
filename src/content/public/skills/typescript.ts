import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'skill',
  slug: 'typescript',
  title: 'TypeScript',
  summary: 'TypeScript adds safety and scale to JavaScript codebases. It is a hiring filter for modern web teams.',
  metadata: {
    relatedSkills: ['JavaScript', 'React', 'Node.js', 'Testing', 'Design Patterns', 'System Design'],
    sections: [
      {
        title: 'Why it matters',
        body: 'TypeScript appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.',
      },
      {
        title: 'Key concepts',
        body: 'Learn the core mental models, failure modes, and trade-offs. Strong fundamentals beat copy-paste coding every time.',
      },
      {
        title: 'Projects to build',
        body: 'Ship a focused project that proves mastery: a real workflow, deployed demo, or measurable outcome you can explain in interviews.',
      },
    ],
  },
  isPublished: true,
} satisfies PublicContentSeed;

export default resource;
