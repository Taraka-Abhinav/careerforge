import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'skill',
  slug: 'sql',
  title: 'SQL',
  summary: 'SQL is the language of data. It powers analytics, backend systems, and product experimentation.',
  metadata: {
    relatedSkills: ['PostgreSQL', 'Data Modeling', 'Data Warehousing', 'Python', 'ETL', 'Data Visualization'],
    sections: [
      {
        title: 'Why it matters',
        body: 'SQL appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.',
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
