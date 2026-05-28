import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'data-scientist',
  title: 'Data Scientist Roadmap',
  summary: 'A data scientist roadmap focused on statistics, experimentation, and storytelling with data.',
  metadata: {
    careerTrack: 'data',
    relatedSkills: ['Python', 'Statistics', 'Pandas', 'Data Visualization', 'SQL', 'Machine Learning'],
    sections: [
      {
        title: 'What you do',
        body: 'Data Scientist roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
