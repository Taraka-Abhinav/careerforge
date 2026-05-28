export type SeedResourceType = 'career' | 'skill';

export interface PublicContentSeed {
  resourceType: SeedResourceType;
  slug: string;
  title: string;
  summary: string;
  metadata: {
    sections?: { title: string; body: string }[];
    relatedSkills?: string[];
    careerTrack?: string;
  };
  isPublished: boolean;
}

type SeedModule = { default: PublicContentSeed };

function loadSeedModules(globResult: Record<string, unknown>): PublicContentSeed[] {
  return Object.values(globResult)
    .map((mod) => (mod as SeedModule).default)
    .filter(Boolean);
}

const careerSeeds = loadSeedModules(import.meta.glob('./public/careers/*.ts', { eager: true }));
const skillSeeds = loadSeedModules(import.meta.glob('./public/skills/*.ts', { eager: true }));

export const PUBLIC_CONTENT_SEED: PublicContentSeed[] = [...careerSeeds, ...skillSeeds];

export function getSeedResource(type: SeedResourceType, slug: string): PublicContentSeed | null {
  return PUBLIC_CONTENT_SEED.find((item) => item.resourceType === type && item.slug === slug) || null;
}
