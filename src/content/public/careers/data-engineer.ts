import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'data-engineer',
  title: 'Data Engineer Roadmap',
  summary: 'A data engineer roadmap for pipelines, warehouses, and reliable analytics infrastructure.',
  metadata: {
    careerTrack: 'data',
    relatedSkills: ['SQL', 'Apache Spark', 'Airflow', 'Data Modeling', 'Python', 'Data Warehousing'],
    sections: [
      {
        title: 'What you do',
        body: 'Data Engineer roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
