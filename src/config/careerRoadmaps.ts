import type { CareerOption } from './careers';
import { toSkillSlug } from '../utils/slug';
import type { RoadmapPhase, RoadmapNode } from '../types';
import {
  allocateWeeksAcrossPhases,
  formatPhaseStudyLoad,
  parseTimelineToWeeks,
} from '../utils/roadmapSchedule';

type Track = CareerOption['track'];

export interface RoadmapScheduleInput {
  timeline: string;
  hoursPerWeek: number;
}

interface TrackBlueprint {
  phases: { name: string; skills: string[] }[];
  capstone: string;
}

const BLUEPRINTS: Record<Track, TrackBlueprint> = {
  ai: {
    phases: [
      { name: 'Math & Python Foundations', skills: ['Python', 'Statistics', 'Probability', 'NumPy'] },
      { name: 'Data & ML Core', skills: ['Pandas', 'NumPy', 'Machine Learning', 'Scikit-Learn'] },
      { name: 'Deep Learning', skills: ['PyTorch', 'TensorFlow', 'NLP', 'Computer Vision'] },
      { name: 'Production AI', skills: ['MLOps', 'Docker', 'AWS', 'LLMs'] },
    ],
    capstone: 'Deploy an End-to-End ML Product',
  },
  data: {
    phases: [
      { name: 'SQL & Python Basics', skills: ['SQL', 'Python', 'Statistics', 'Data Visualization'] },
      { name: 'Analytics Engineering', skills: ['Pandas', 'PostgreSQL', 'ETL', 'dbt'] },
      { name: 'Machine Learning', skills: ['Scikit-Learn', 'Feature Engineering', 'Machine Learning'] },
      { name: 'Data Platforms', skills: ['Apache Spark', 'Airflow', 'Snowflake'] },
    ],
    capstone: 'Build a Production Analytics Pipeline',
  },
  web: {
    phases: [
      { name: 'Web Fundamentals', skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript'] },
      { name: 'Frontend Mastery', skills: ['React', 'Next.js', 'TailwindCSS', 'GraphQL'] },
      { name: 'Backend & Data', skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Redis'] },
      { name: 'Ship & Scale', skills: ['System Design', 'Docker', 'Testing', 'CI/CD'] },
    ],
    capstone: 'Launch a Full-Stack SaaS MVP',
  },
  backend: {
    phases: [
      { name: 'Language & APIs', skills: ['Python', 'JavaScript', 'REST APIs', 'PostgreSQL'] },
      { name: 'Service Design', skills: ['Node.js', 'MongoDB', 'Redis', 'GraphQL'] },
      { name: 'Distributed Systems', skills: ['Microservices', 'Kafka', 'System Design', 'Docker'] },
      { name: 'Reliability', skills: ['Kubernetes', 'AWS', 'Monitoring', 'Testing'] },
    ],
    capstone: 'Design a Scalable API Platform',
  },
  devops: {
    phases: [
      { name: 'Linux & Scripting', skills: ['Linux', 'Bash', 'Git', 'Docker'] },
      { name: 'Containers & CI/CD', skills: ['Docker', 'Docker Compose', 'CI/CD', 'GitHub Actions'] },
      { name: 'Orchestration', skills: ['Kubernetes', 'Helm', 'Terraform', 'AWS'] },
      { name: 'Observability', skills: ['Prometheus', 'Grafana', 'Linux', 'Security'] },
    ],
    capstone: 'Production CI/CD Platform',
  },
  security: {
    phases: [
      { name: 'Security Foundations', skills: ['Linux', 'Networking', 'Python', 'Cybersecurity'] },
      { name: 'App Security', skills: ['OWASP', 'Secure Coding', 'Cryptography', 'REST APIs'] },
      { name: 'Offense & Defense', skills: ['Penetration Testing', 'Burp Suite', 'SIEM'] },
      { name: 'Enterprise Security', skills: ['Zero Trust', 'Docker', 'AWS', 'System Design'] },
    ],
    capstone: 'Security Audit & Hardening Lab',
  },
  mobile: {
    phases: [
      { name: 'Mobile Foundations', skills: ['JavaScript', 'TypeScript', 'React', 'Git'] },
      { name: 'Cross-Platform', skills: ['React Native', 'Flutter', 'Mobile Development'] },
      { name: 'Backend Integration', skills: ['REST APIs', 'PostgreSQL', 'Node.js', 'Testing'] },
      { name: 'Publish Ready', skills: ['CI/CD', 'Docker', 'System Design'] },
    ],
    capstone: 'Ship a Cross-Platform App',
  },
  embedded: {
    phases: [
      { name: 'C & Systems', skills: ['C', 'C++', 'Operating Systems', 'Computer Architecture'] },
      { name: 'Embedded Core', skills: ['Embedded C', 'RTOS', 'Assembly'] },
      { name: 'Connectivity', skills: ['Python', 'Linux', 'REST APIs'] },
      { name: 'IoT Product', skills: ['Docker', 'Git', 'Testing'] },
    ],
    capstone: 'IoT Firmware + Cloud Dashboard',
  },
  game: {
    phases: [
      { name: 'Programming Base', skills: ['C++', 'C', 'Statistics', 'Game Design'] },
      { name: 'Engines', skills: ['Unity', 'Unreal Engine', 'C++'] },
      { name: 'Graphics', skills: ['Shader Programming', 'OpenGL', 'Blender'] },
      { name: 'Polish & Ship', skills: ['Testing', 'Git', 'Agile'] },
    ],
    capstone: 'Playable Game Demo',
  },
  blockchain: {
    phases: [
      { name: 'Web3 Foundations', skills: ['JavaScript', 'TypeScript', 'Cryptography', 'Solidity'] },
      { name: 'Smart Contracts', skills: ['Ethereum', 'Smart Contracts', 'Hardhat', 'Web3.js'] },
      { name: 'dApp Development', skills: ['React', 'Node.js', 'REST APIs', 'Security'] },
      { name: 'DeFi Patterns', skills: ['DeFi', 'System Design', 'Testing'] },
    ],
    capstone: 'Deploy a dApp to Testnet',
  },
  product: {
    phases: [
      { name: 'Tech Literacy', skills: ['SQL', 'JavaScript', 'Agile', 'Technical Writing'] },
      { name: 'Data for PMs', skills: ['Data Visualization', 'Statistics', 'PostgreSQL', 'REST APIs'] },
      { name: 'Systems Thinking', skills: ['System Design', 'React', 'Machine Learning'] },
      { name: 'Launch Skills', skills: ['Scrum', 'Git', 'Testing'] },
    ],
    capstone: 'Product Case Study Portfolio',
  },
};

function node(skill: string, format = 'Interactive'): RoadmapNode {
  return { id: toSkillSlug(skill), type: 'skill', title: skill, format };
}

export function getTrackPhases(
  track: Track,
  known: string[],
  learning: string[],
  schedule: RoadmapScheduleInput
): RoadmapPhase[] {
  const blueprint = BLUEPRINTS[track];
  const totalWeeks = parseTimelineToWeeks(schedule.timeline);
  const weekSlots = allocateWeeksAcrossPhases(totalWeeks, blueprint.phases.length);
  const knownSet = new Set(known);
  const learningSet = new Set(learning);
  const placedLearning = new Set<string>();

  const phases: RoadmapPhase[] = blueprint.phases.map((p, idx) => {
    const slot = weekSlots[idx];
    const items: RoadmapNode[] = [];

    for (const skill of p.skills) {
      if (knownSet.has(skill)) {
        items.push(node(skill, 'Mastered'));
      } else {
        items.push(node(skill));
        if (learningSet.has(skill)) placedLearning.add(skill);
      }
    }

    return {
      phase: `Phase ${idx + 1}: ${p.name}`,
      duration: slot.durationLabel,
      weekStart: slot.weekStart,
      weekEnd: slot.weekEnd,
      studyNote: formatPhaseStudyLoad(schedule.hoursPerWeek, slot.weekStart, slot.weekEnd),
      items,
      locked: idx > 0,
    };
  });

  const extraLearning = learning.filter((s) => !knownSet.has(s) && !placedLearning.has(s));
  if (extraLearning.length > 0 && phases[0]) {
    for (const skill of extraLearning) {
      if (!phases[0].items.some((i) => i.id === toSkillSlug(skill))) {
        phases[0].items.push(node(skill));
      }
    }
  }

  const capSlot = weekSlots[weekSlots.length - 1];
  phases.push({
    phase: `Capstone: ${blueprint.capstone}`,
    duration: capSlot.durationLabel,
    weekStart: capSlot.weekStart,
    weekEnd: capSlot.weekEnd,
    studyNote: formatPhaseStudyLoad(schedule.hoursPerWeek, capSlot.weekStart, capSlot.weekEnd),
    items: [{ id: `capstone-${track}`, type: 'project', title: blueprint.capstone, format: 'Project' }],
    locked: true,
  });

  phases[0].locked = false;
  return phases;
}

/** @deprecated */
export function getTrackSkillNodes(track: Track, known: string[], learning: string[]) {
  const phases = getTrackPhases(track, known, learning, { timeline: '6 Months', hoursPerWeek: 10 });
  return {
    phase1: phases[0]?.items || [],
    phase2: phases[1]?.items || [],
  };
}
