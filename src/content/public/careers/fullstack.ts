import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'fullstack',
  title: 'Full Stack Developer Roadmap',
  summary: 'Become a full stack developer with a roadmap for frontend, backend, databases, and scalable delivery.',
  metadata: {
    careerTrack: 'web',
    relatedSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs', 'Docker'],
    sections: [
      {
        title: 'What you do',
        body: 'Full Stack Developer roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
