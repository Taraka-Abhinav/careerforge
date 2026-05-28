import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'skill',
  slug: 'javascript',
  title: 'JavaScript',
  summary: 'JavaScript powers the web. Learn it for frontend, backend, and full stack engineering roles.',
  metadata: {
    relatedSkills: ['TypeScript', 'React', 'Node.js', 'HTML', 'CSS', 'REST APIs'],
    sections: [
      {
        title: 'Why it matters',
        body: 'JavaScript appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.',
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
