import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'backend',
  title: 'Backend Engineer Roadmap',
  summary: 'A backend engineer roadmap centered on APIs, databases, infrastructure, and scalability.',
  metadata: {
    careerTrack: 'backend',
    relatedSkills: ['Node.js', 'PostgreSQL', 'Redis', 'System Design', 'OAuth', 'Docker'],
    sections: [
      {
        title: 'What you do',
        body: 'Backend Engineer roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
