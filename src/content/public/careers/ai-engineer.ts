import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'ai-engineer',
  title: 'AI Engineer Roadmap',
  summary: 'An AI engineer roadmap for ML systems, LLM workflows, and production-grade AI delivery.',
  metadata: {
    careerTrack: 'ai',
    relatedSkills: ['Python', 'Machine Learning', 'MLOps', 'SQL', 'Docker', 'System Design'],
    sections: [
      {
        title: 'What you do',
        body: 'AI Engineer roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
      },
      {
        title: 'Core skills to master',
        body: 'Data structures, system design, clean coding, testing, and real project delivery. Employers want evidence of impact, not just certificates.',
      },
      {
        title: 'Hiring signals',
        body: 'Portfolio projects, measurable outcomes, strong fundamentals, and consistent learning streaks. Show real-world decisions and trade-offs.',
      },
    ],
  },
  isPublished: true,
} satisfies PublicContentSeed;

export default resource;
