import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { UserProfile, RoadmapPhase } from '../types';
import { toSkillSlug } from '../utils/slug';
import { getCareerTrack } from '../config/careers';
import { getTrackPhases } from '../config/careerRoadmaps';
import { getModuleContent } from '../content/skillContent';
import { ProfileService } from './profileService';

const MODULE_TEMPLATES = [
  { type: 'lesson', title: 'Core Concepts & Theory', xp: 15 },
  { type: 'practice', title: 'Practice Sandbox', xp: 0 },
  { type: 'quiz', title: 'Contextual Quiz', xp: 40 },
  { type: 'assessment', title: 'Mastery Evaluation', xp: 60 },
  { type: 'project', title: 'Mini Project', xp: 100 },
] as const;

export const RoadmapEngine = {
  generatePhases(profile: UserProfile): RoadmapPhase[] {
    const known = profile.skills.known.map((s) => s.name);
    const learning = profile.skills.learning.map((s) => s.name);
    const track = getCareerTrack(profile.goals.career);
    return getTrackPhases(track, known, learning, {
      timeline: profile.commitment.timeline,
      hoursPerWeek: profile.time.hoursPerWeek,
    });
  },

  async resolvePhaseLocks(userId: string, phases: RoadmapPhase[]): Promise<RoadmapPhase[]> {
    if (!phases.length) return phases;
    const result = phases.map((p) => ({ ...p }));

    if (!isSupabaseConfigured) {
      result[0].locked = false;
      for (let i = 1; i < result.length; i++) {
        const prevSkills = result[i - 1].items.filter((it) => it.type === 'skill');
        const allDone = prevSkills.every((it) => it.format === 'Mastered');
        result[i].locked = prevSkills.length > 0 && !allDone;
      }
      return result;
    }

    const { data: skills } = await supabase
      .from('skills')
      .select('skill_slug, status')
      .eq('user_id', userId);
    const statusMap = new Map((skills || []).map((s) => [s.skill_slug, s.status]));

    result[0].locked = false;
    for (let i = 1; i < result.length; i++) {
      const prevSkills = result[i - 1].items.filter((it) => it.type === 'skill');
      if (prevSkills.length === 0) {
        result[i].locked = false;
        continue;
      }
      const allMastered = prevSkills.every(
        (it) => statusMap.get(it.id) === 'Mastered' || it.format === 'Mastered'
      );
      result[i].locked = !allMastered;
    }
    return result;
  },

  async generateAndPersist(userId: string, profile: UserProfile): Promise<RoadmapPhase[]> {
    const phases = this.generatePhases(profile);

    if (!isSupabaseConfigured) {
      localStorage.setItem(`roadmap_${userId}`, JSON.stringify(phases));
      return phases;
    }

    const { data: existing } = await supabase.from('roadmaps').select('id').eq('user_id', userId).maybeSingle();
    const payload = {
      user_id: userId,
      career_goal: profile.goals.career,
      target_salary: profile.goals.salary,
      dream_company: profile.goals.dreamCompany,
      hours_per_week: profile.time.hoursPerWeek,
      hours_per_day: profile.time.hoursPerDay,
      timeline: profile.commitment.timeline,
      current_phase: phases[0]?.phase || 'Phase 1',
      phases,
      status: 'active',
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (existing) {
      await supabase.from('roadmaps').update(payload).eq('user_id', userId);
    } else {
      await supabase.from('roadmaps').insert(payload);
    }

    const skillNodes = phases.flatMap((p) => p.items.filter((i) => i.type === 'skill'));
    const existingSkills = await supabase.from('skills').select('id, skill_slug, skill_name').eq('user_id', userId);
    const existingMap = new Map((existingSkills.data || []).map((s) => [s.skill_slug || toSkillSlug(s.skill_name), s.id]));

    for (const node of skillNodes) {
      const slug = node.id;
      let skillId = existingMap.get(slug);
      if (!skillId) {
        const { data: inserted } = await supabase
          .from('skills')
          .insert({
            user_id: userId,
            skill_name: node.title,
            skill_slug: slug,
            skill_type: 'learning',
            status: 'Learning',
            level_or_priority: 'Must Learn',
          })
          .select('id')
          .single();
        skillId = inserted?.id;
      }
      if (!skillId) continue;

      const { data: mods } = await supabase.from('learning_modules').select('id').eq('skill_id', skillId);
      if (mods && mods.length > 0) continue;

      const modules = MODULE_TEMPLATES.map((t, idx) => ({
        skill_id: skillId,
        title: t.title,
        type: t.type,
        sort_order: idx,
        xp_reward: t.xp,
        content: getModuleContent(node.title, profile.goals.career, t.type),
      }));
      await supabase.from('learning_modules').insert(modules);
    }

    return phases;
  },

  async refreshModuleContent(userId: string, profile: UserProfile): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { data: skills } = await supabase.from('skills').select('id, skill_name').eq('user_id', userId);
    for (const skill of skills || []) {
      const { data: modules } = await supabase.from('learning_modules').select('id, type').eq('skill_id', skill.id);
      for (const mod of modules || []) {
        await supabase
          .from('learning_modules')
          .update({ content: getModuleContent(skill.skill_name, profile.goals.career, mod.type as (typeof MODULE_TEMPLATES)[number]['type']) })
          .eq('id', mod.id);
      }
    }
  },

  async regenerate(userId: string, profile: UserProfile): Promise<RoadmapPhase[]> {
    const phases = await this.generateAndPersist(userId, profile);
    await this.refreshModuleContent(userId, profile);
    return phases;
  },

  async getPhases(userId: string): Promise<RoadmapPhase[]> {
    let phases: RoadmapPhase[] = [];
    if (!isSupabaseConfigured) {
      const cached = localStorage.getItem(`roadmap_${userId}`);
      phases = cached ? JSON.parse(cached) : [];
    } else {
      const { data } = await supabase.from('roadmaps').select('phases, timeline, hours_per_week').eq('user_id', userId).single();
      phases = (data?.phases as RoadmapPhase[]) || [];
      if (data?.timeline && phases.length > 0 && !phases[0].weekStart) {
        const profile = await ProfileService.getProfile(userId);
        if (profile) phases = this.generatePhases(profile);
      }
    }
    return this.resolvePhaseLocks(userId, phases);
  },

  async getCurrentFocus(userId: string): Promise<{ skillSlug: string; skillName: string; phase: string } | null> {
    const phases = await this.getPhases(userId);
    for (const phase of phases) {
      if (phase.locked) continue;
      for (const item of phase.items) {
        if (item.type !== 'skill') continue;
        const { data: skill } = await supabase
          .from('skills')
          .select('status, skill_slug, skill_name')
          .eq('user_id', userId)
          .eq('skill_slug', item.id)
          .maybeSingle();
        if (!isSupabaseConfigured) {
          return { skillSlug: item.id, skillName: item.title, phase: phase.phase };
        }
        if (skill && skill.status !== 'Mastered') {
          return { skillSlug: skill.skill_slug || item.id, skillName: skill.skill_name, phase: phase.phase };
        }
      }
    }
    const first = phases[0]?.items.find((i) => i.type === 'skill');
    return first ? { skillSlug: first.id, skillName: first.title, phase: phases[0]?.phase || '' } : null;
  },
};
