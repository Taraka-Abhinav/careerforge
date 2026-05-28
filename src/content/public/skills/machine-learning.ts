import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'skill',
  slug: 'machine-learning',
  title: 'Machine Learning',
  summary: 'Machine learning enables predictive systems, recommendations, and automation. It is core for AI roles.',
  metadata: {
    relatedSkills: ['Python', 'Statistics', 'PyTorch', 'TensorFlow', 'MLOps', 'Data Engineering'],
    sections: [
      {
        title: 'Why it matters',
        body: 'Machine Learning appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.',
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
