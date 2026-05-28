import type { PublicContentSeed } from '../../publicContentSeed';

const resource = {
  resourceType: 'career',
  slug: 'embedded',
  title: 'Embedded Systems Engineer Roadmap',
  summary: 'An embedded systems engineer roadmap for firmware, low-level software, and reliable hardware-software integration.',
    metadata: {
    careerTrack: 'embedded',
    relatedSkills: ['C', 'Embedded C', 'RTOS', 'Firmware', 'Hardware Debugging'],
    sections: [
      {
        title: 'What you do',
        body: 'Embedded engineers build firmware and integrations that run on constrained devices, focusing on determinism and hardware interfaces.',
      },
      {
        title: 'Core skills to master',
        body: 'C/C++, hardware protocols (I2C, SPI, UART), RTOS concepts, low-level debugging and power optimization.',
      },
      {
        title: 'Hiring signals',
        body: 'Working firmware projects, hardware prototypes, clear documentation of trade-offs, and demonstration of debugging on real devices.',
      },
    ],
  },
  isPublished: true,
} satisfies PublicContentSeed;

export default resource;
