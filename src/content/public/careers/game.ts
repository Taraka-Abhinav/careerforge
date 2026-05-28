import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'game',
  title: 'Game Developer Roadmap',
  summary: 'A game developer roadmap for engine work, gameplay systems, graphics, and real-time performance engineering.',
    metadata: {
    careerTrack: 'game',
    relatedSkills: ['Unity', 'Unreal Engine', 'Graphics', 'C++', 'Math'],
    sections: [
      {
        title: 'What you do',
        body: 'Game developers design interactive experiences, implement gameplay systems, and optimize performance across platforms.',
      },
      {
        title: 'Core skills to master',
        body: 'Real-time graphics, engine architecture, physics, tooling, asset pipelines, and multiplayer systems.',
      },
      {
        title: 'Hiring signals',
        body: 'Playable demos, published titles or prototypes, strong C++/engine knowledge, and demonstrated performance engineering.',
      },
    ],
  },
  isPublished: true,
} satisfies PublicContentSeed;

export default resource;
