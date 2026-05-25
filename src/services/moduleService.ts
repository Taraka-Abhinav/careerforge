import { supabase, isSupabaseConfigured } from '../supabase/client';
import { XPService } from './xpService';
import type { LearningModule, ModuleType } from '../types';
import { toSkillSlug } from '../utils/slug';
import { getModuleContent } from '../content/skillContent';

export interface SkillWithModules {
  skillId: string;
  skillName: string;
  skillSlug: string;
  status: string;
  modules: LearningModule[];
  progressMap: Record<string, 'not_started' | 'in_progress' | 'completed'>;
}

const localProgressKey = (userId: string) => `module_progress_${userId}`;

const MODULE_TEMPLATES = [
  { type: 'lesson' as const, title: 'Core Concepts & Theory', xp: 15 },
  { type: 'practice' as const, title: 'Practice Sandbox', xp: 25 },
  { type: 'quiz' as const, title: 'Contextual Quiz', xp: 40 },
  { type: 'assessment' as const, title: 'Mastery Evaluation', xp: 60 },
  { type: 'project' as const, title: 'Mini Project', xp: 100 },
];

function titleFromSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ModuleService = {
  async ensureAndGetSkill(userId: string, skillSlug: string): Promise<SkillWithModules | null> {
    const existing = await this.getSkillBySlug(userId, skillSlug);
    if (existing) return existing;
    if (!isSupabaseConfigured) return this.getLocalSkill(skillSlug);
    return this.provisionSkillFromSlug(userId, skillSlug);
  },

  async provisionSkillFromSlug(userId: string, skillSlug: string, skillTitle?: string): Promise<SkillWithModules | null> {
    const skillName = skillTitle || titleFromSlug(skillSlug);
    const { data: roadmapRow } = await supabase.from('roadmaps').select('career_goal').eq('user_id', userId).maybeSingle();
    const career = roadmapRow?.career_goal || 'Software Engineer';

    const { data: inserted, error } = await supabase
      .from('skills')
      .insert({
        user_id: userId,
        skill_name: skillName,
        skill_slug: skillSlug,
        skill_type: 'learning',
        status: 'Learning',
        level_or_priority: 'Must Learn',
      })
      .select('*')
      .single();

    if (error || !inserted) return null;

    const modules = MODULE_TEMPLATES.map((t, idx) => ({
      skill_id: inserted.id,
      title: t.title,
      type: t.type,
      sort_order: idx,
      xp_reward: t.xp,
      content: getModuleContent(skillName, career, t.type),
    }));
    await supabase.from('learning_modules').insert(modules);
    return this.loadModulesForSkill(userId, inserted);
  },

  async getSkillBySlug(userId: string, skillSlug: string): Promise<SkillWithModules | null> {
    if (!isSupabaseConfigured) {
      return this.getLocalSkill(skillSlug);
    }

    const { data: skill } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_slug', skillSlug)
      .maybeSingle();

    if (!skill) {
      const { data: byName } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', userId)
        .ilike('skill_name', skillSlug.replace(/-/g, ' '))
        .maybeSingle();
      if (!byName) return null;
      return this.loadModulesForSkill(userId, byName);
    }
    return this.loadModulesForSkill(userId, skill);
  },

  async loadModulesForSkill(userId: string, skill: { id: string; skill_name: string; skill_slug?: string; status: string }): Promise<SkillWithModules> {
    const { data: modules } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('skill_id', skill.id)
      .order('sort_order', { ascending: true });

    const { data: progressRows } = await supabase
      .from('user_module_progress')
      .select('module_id, status')
      .eq('user_id', userId);

    const progressMap: Record<string, 'not_started' | 'in_progress' | 'completed'> = {};
    (progressRows || []).forEach((p) => {
      progressMap[p.module_id] = p.status as 'not_started' | 'in_progress' | 'completed';
    });

    const { data: roadmapRow } = await supabase.from('roadmaps').select('career_goal').eq('user_id', userId).maybeSingle();
    const career = roadmapRow?.career_goal || 'Software Engineer';

    const mapped: LearningModule[] = (modules || []).map((m, idx) => {
      const prog = progressMap[m.id] || 'not_started';
      const prev = modules?.[idx - 1];
      const prevDone = idx === 0 || (prev && progressMap[prev.id] === 'completed');
      const raw = m.content as Record<string, unknown>;
      const needsEnrich = !raw?.theorySections && !raw?.problem && !raw?.requirements && !raw?.questions;
      const content = needsEnrich ? getModuleContent(skill.skill_name, career, m.type as ModuleType) : raw;
      return {
        id: m.id,
        skillId: skill.id,
        title: m.title,
        type: m.type as ModuleType,
        content,
        xpReward: m.xp_reward,
        status: prog === 'completed' ? 'completed' : prog === 'in_progress' ? 'in_progress' : prevDone ? 'not_started' : 'locked',
        sortOrder: m.sort_order,
      };
    });

    return {
      skillId: skill.id,
      skillName: skill.skill_name,
      skillSlug: skill.skill_slug || toSkillSlug(skill.skill_name),
      status: skill.status,
      modules: mapped,
      progressMap,
    };
  },

  getLocalSkill(skillSlug: string): SkillWithModules {
    const name = skillSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const career = 'Software Engineer';
    const modules: LearningModule[] = [
      { id: 'l1', skillId: 'local', title: 'Core Concepts & Theory', type: 'lesson', content: getModuleContent(name, career, 'lesson'), xpReward: 15, status: 'not_started', sortOrder: 0 },
      { id: 'p1', skillId: 'local', title: 'Practice Sandbox', type: 'practice', content: getModuleContent(name, career, 'practice'), xpReward: 25, status: 'locked', sortOrder: 1 },
      { id: 'q1', skillId: 'local', title: 'Contextual Quiz', type: 'quiz', content: getModuleContent(name, career, 'quiz'), xpReward: 40, status: 'locked', sortOrder: 2 },
      { id: 'a1', skillId: 'local', title: 'Mastery Evaluation', type: 'assessment', content: getModuleContent(name, career, 'assessment'), xpReward: 60, status: 'locked', sortOrder: 3 },
      { id: 'pr1', skillId: 'local', title: 'Mini Project', type: 'project', content: getModuleContent(name, career, 'project'), xpReward: 100, status: 'locked', sortOrder: 4 },
    ];
    return { skillId: 'local', skillName: name, skillSlug, status: 'Learning', modules, progressMap: {} };
  },

  async completeModule(userId: string, moduleId: string, xpReward: number, sourceType: 'lesson' | 'practice' | 'assessment' | 'project' | 'module' = 'module') {
    if (isSupabaseConfigured) {
      await supabase.from('user_module_progress').upsert({
        user_id: userId,
        module_id: moduleId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    } else {
      const key = localProgressKey(userId);
      const map = JSON.parse(localStorage.getItem(key) || '{}');
      map[moduleId] = 'completed';
      localStorage.setItem(key, JSON.stringify(map));
    }
    return XPService.awardOnce(userId, sourceType, moduleId, xpReward);
  },

  async checkAndMasterSkill(userId: string, skillId: string) {
    if (!isSupabaseConfigured) return;
    const { data: modules } = await supabase.from('learning_modules').select('id').eq('skill_id', skillId);
    if (!modules?.length) return;
    const { data: done } = await supabase
      .from('user_module_progress')
      .select('module_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('module_id', modules.map((m) => m.id));
    if (done && done.length >= modules.length) {
      await supabase.from('skills').update({ status: 'Mastered' }).eq('id', skillId);
    }
  },
};
