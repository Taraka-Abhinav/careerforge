import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'skill',
  slug: 'react',
  title: 'React',
  summary: 'React is the dominant UI library for modern product engineering. It is essential for frontend and full stack roles.',
  metadata: {
    relatedSkills: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux', 'Vite'],
    sections: [
      {
        title: 'Why it matters',
        body: 'React appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.',
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
