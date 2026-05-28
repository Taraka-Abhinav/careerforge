import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'mobile',
  title: 'Mobile Developer Roadmap',
  summary: 'A mobile developer roadmap for iOS and Android apps, cross-platform frameworks, and production-grade delivery.',
    metadata: {
    careerTrack: 'mobile',
    relatedSkills: ['React Native', 'Flutter', 'iOS', 'Android', 'Kotlin', 'Swift'],
    sections: [
      {
        title: 'What you do',
        body: 'Mobile developers design, build, and maintain mobile applications, focusing on performance, UX, and platform integration.',
      },
      {
        title: 'Core skills to master',
        body: 'Platform SDKs, UI patterns, networking, offline-first design, performance profiling, and app store deployment.',
      },
      {
        title: 'Hiring signals',
        body: 'Published apps, crash-free metrics, polished UI/UX, platform-specific optimization, and end-to-end feature ownership.',
      },
    ],
  },
  isPublished: true,
} satisfies PublicContentSeed;

export default resource;
