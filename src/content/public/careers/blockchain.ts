import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'blockchain',
  title: 'Blockchain Developer Roadmap',
  summary: 'A blockchain developer roadmap for smart contracts, decentralized systems, and secure on-chain engineering.',
    metadata: {
    careerTrack: 'blockchain',
    relatedSkills: ['Solidity', 'Smart Contracts', 'Cryptography', 'Ethereum', 'Web3'],
    sections: [
      {
        title: 'What you do',
        body: 'Blockchain developers design and implement smart contracts and decentralized applications with strong emphasis on security and correctness.',
      },
      {
        title: 'Core skills to master',
        body: 'Smart contract languages, formal verification basics, cryptographic primitives, security auditing, and on-chain data modeling.',
      },
      {
        title: 'Hiring signals',
        body: 'Audited contracts, contributions to open-source protocols, exploit post-mortems, and clear understanding of gas and L1/L2 trade-offs.',
      },
    ],
  },
  isPublished: true,
} satisfies PublicContentSeed;

export default resource;
