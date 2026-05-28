import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'skill',
  slug: 'aws',
  title: 'AWS',
  summary: 'AWS skills unlock cloud engineering and DevOps roles. Learn architecture, cost, and reliability.',
  metadata: {
    relatedSkills: ['Docker', 'Kubernetes', 'Terraform', 'Linux', 'Monitoring', 'Security'],
    sections: [
      {
        title: 'Why it matters',
        body: 'AWS appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.',
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
