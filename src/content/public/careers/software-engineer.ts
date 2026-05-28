import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'software-engineer',
  title: 'Software Engineer Roadmap',
  summary: 'A complete software engineer roadmap covering foundations, backend, frontend, and system design with real projects.',
  metadata: {
    careerTrack: 'web',
    relatedSkills: ['JavaScript', 'Python', 'System Design', 'SQL', 'Git', 'Testing'],
    sections: [
      {
        title: 'What you do',
        body: 'Software Engineer roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
