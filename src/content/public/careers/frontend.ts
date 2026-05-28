import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'frontend',
  title: 'Frontend Engineer Roadmap',
  summary: 'A focused frontend engineer roadmap for UI architecture, performance, and product-ready interfaces.',
  metadata: {
    careerTrack: 'web',
    relatedSkills: ['React', 'TypeScript', 'Web Accessibility', 'CSS', 'Vite', 'Testing'],
    sections: [
      {
        title: 'What you do',
        body: 'Frontend Engineer roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
