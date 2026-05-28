import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'skill',
  slug: 'python',
  title: 'Python',
  summary: 'Python is the default language for automation, data, and backend systems. Master it to unlock high-demand roles.',
  metadata: {
    relatedSkills: ['SQL', 'Pandas', 'Machine Learning', 'FastAPI', 'Docker', 'Git'],
    sections: [
      {
        title: 'Why it matters',
        body: 'Python appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.',
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
