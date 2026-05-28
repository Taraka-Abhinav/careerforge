import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'product',
  title: 'Product Manager (Tech) Roadmap',
  summary: 'A technical product manager roadmap covering strategy, metrics, and execution with engineering teams.',
  metadata: {
    careerTrack: 'product',
    relatedSkills: ['System Design', 'Agile', 'Technical Writing', 'SQL', 'Design Patterns', 'Git'],
    sections: [
      {
        title: 'What you do',
        body: 'Product Manager (Tech) roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
