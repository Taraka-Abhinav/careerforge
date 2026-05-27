import { CAREER_OPTIONS } from '../config/careers';
import { ALL_SKILLS } from '../config/skillTaxonomy';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { fromSkillSlug, toSkillSlug } from '../utils/slug';
import { getSeedResource } from '../content/publicContentSeed';

export type PublicResourceType = 'career' | 'skill';

export interface PublicContentResource {
  resourceType: PublicResourceType;
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

function titleCase(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fallbackCareer(slug: string): PublicContentResource {
  const career = CAREER_OPTIONS.find((item) => item.id === slug || toSkillSlug(item.label) === slug);
  const title = career?.label || titleCase(slug);
  return {
    resourceType: 'career',
    slug,
    title,
    summary: career?.description || `CareerForge roadmap architecture for ${title}.`,
    metadata: {
      careerTrack: career?.track,
      sections: [
        {
          title: 'Roadmap Foundation',
          body: `CareerForge can map ${title} into skills, learning modules, quizzes, projects, and challenges.`,
        },
        {
          title: 'Future SEO Content',
          body: 'This page is powered by reusable public content architecture and can be expanded safely without changing protected app routes.',
        },
      ],
    },
    isPublished: false,
  };
}

function fallbackSkill(slug: string): PublicContentResource {
  const skill = ALL_SKILLS.find((item) => toSkillSlug(item) === slug) || titleCase(fromSkillSlug(slug));
  return {
    resourceType: 'skill',
    slug,
    title: skill,
    summary: `CareerForge learning architecture for ${skill}.`,
    metadata: {
      relatedSkills: ALL_SKILLS.filter((item) => item !== skill).slice(0, 6),
      sections: [
        {
          title: 'Learning Path',
          body: `${skill} can be delivered as objectives, lessons, quizzes, practice exercises, checkpoints, and mini projects.`,
        },
        {
          title: 'Future SEO Content',
          body: 'This dynamic page is ready for curated public content without generating hundreds of static routes today.',
        },
      ],
    },
    isPublished: false,
  };
}

function mapRow(row: Record<string, unknown>): PublicContentResource {
  return {
    resourceType: row.resource_type as PublicResourceType,
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string,
    metadata: (row.metadata as PublicContentResource['metadata']) || {},
    isPublished: Boolean(row.is_published),
  };
}

export const PublicContentService = {
  async getResource(type: PublicResourceType, slugValue: string): Promise<PublicContentResource> {
    const slug = toSkillSlug(slugValue);

    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('public_content_resources')
        .select('*')
        .eq('resource_type', type)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (data) return mapRow(data);
    }

    const seeded = getSeedResource(type, slug);
    if (seeded) return seeded as PublicContentResource;

    return type === 'career' ? fallbackCareer(slug) : fallbackSkill(slug);
  },
};
