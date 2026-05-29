export interface CareerOption {
  id: string;
  label: string;
  track: 'ai' | 'data' | 'web' | 'backend' | 'devops' | 'security' | 'mobile' | 'embedded' | 'game' | 'blockchain' | 'product' | 'mechanical';
  description: string;
}

export const CAREER_OPTIONS: CareerOption[] = [
  { id: 'ai-engineer', label: 'AI Engineer', track: 'ai', description: 'ML systems, LLMs, and production AI pipelines' },
  { id: 'ml-engineer', label: 'Machine Learning Engineer', track: 'ai', description: 'Model training, deployment, and MLOps' },
  { id: 'data-scientist', label: 'Data Scientist', track: 'data', description: 'Statistics, experimentation, and insights' },
  { id: 'data-engineer', label: 'Data Engineer', track: 'data', description: 'Pipelines, warehouses, and data platforms' },
  { id: 'software-engineer', label: 'Software Engineer', track: 'web', description: 'Full software lifecycle and architecture' },
  { id: 'fullstack', label: 'Full Stack Developer', track: 'web', description: 'Frontend + backend product delivery' },
  { id: 'frontend', label: 'Frontend Engineer', track: 'web', description: 'UI engineering, React, and UX performance' },
  { id: 'backend', label: 'Backend Engineer', track: 'backend', description: 'APIs, databases, and scalable services' },
  { id: 'devops', label: 'DevOps Engineer', track: 'devops', description: 'CI/CD, infrastructure, and reliability' },
  { id: 'cloud', label: 'Cloud Engineer', track: 'devops', description: 'AWS/GCP/Azure architecture and cost' },
  { id: 'security', label: 'Cybersecurity Engineer', track: 'security', description: 'AppSec, pentesting, and secure design' },
  { id: 'mobile', label: 'Mobile Developer', track: 'mobile', description: 'iOS/Android and cross-platform apps' },
  { id: 'game', label: 'Game Developer', track: 'game', description: 'Engines, graphics, and gameplay systems' },
  { id: 'embedded', label: 'Embedded Systems Engineer', track: 'embedded', description: 'Firmware, IoT, and hardware-software' },
  { id: 'blockchain', label: 'Blockchain Developer', track: 'blockchain', description: 'Smart contracts and Web3 systems' },
  { id: 'product', label: 'Product Manager (Tech)', track: 'product', description: 'Roadmaps, metrics, and technical product' },
  { id: 'mechanical-engineer', label: 'Mechanical Engineer', track: 'mechanical', description: 'CAD, robotics, and hardware systems' },
];

export function getCareerTrack(careerLabel: string): CareerOption['track'] {
  const found = CAREER_OPTIONS.find((c) => c.label === careerLabel);
  if (found) return found.track;
  if (/AI|ML|Machine Learning/i.test(careerLabel)) return 'ai';
  if (/Data/i.test(careerLabel)) return 'data';
  if (/Security|Cyber/i.test(careerLabel)) return 'security';
  if (/DevOps|Cloud|SRE/i.test(careerLabel)) return 'devops';
  if (/Mobile/i.test(careerLabel)) return 'mobile';
  if (/Game/i.test(careerLabel)) return 'game';
  if (/Embedded|IoT/i.test(careerLabel)) return 'embedded';
  if (/Blockchain|Web3/i.test(careerLabel)) return 'blockchain';
  if (/Product/i.test(careerLabel)) return 'product';
  if (/Frontend/i.test(careerLabel)) return 'web';
  if (/Backend/i.test(careerLabel)) return 'backend';
  if (/Mechanical/i.test(careerLabel)) return 'mechanical';
  return 'web';
}
