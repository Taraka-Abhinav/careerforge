import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'security',
  title: 'Cybersecurity Engineer Roadmap',
  summary: 'A cybersecurity engineer roadmap focused on secure design, AppSec, and threat modeling.',
  metadata: {
    careerTrack: 'security',
    relatedSkills: ['Cybersecurity', 'Network Security', 'OWASP', 'Secure Coding', 'SIEM', 'Cryptography'],
    sections: [
      {
        title: 'What you do',
        body: 'Cybersecurity Engineer roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.',
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
