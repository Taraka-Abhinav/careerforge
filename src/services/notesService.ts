import { supabase, isSupabaseConfigured } from '../supabase/client';
import { getPremiumNoteSections } from '../content/premiumNotes';
import type { NoteSection } from '../services/starmService';
import type { UserProfile } from '../types';
import { toSkillSlug } from '../utils/slug';

const localNotesKey = (userId: string, slug: string) => `notes_${userId}_${slug}`;

export const NotesService = {
  async getOrGenerate(userId: string, skillName: string, profile: UserProfile): Promise<NoteSection[]> {
    const slug = toSkillSlug(skillName);
    const career = profile.goals.career;
    const sections = getPremiumNoteSections(skillName, career);

    if (!isSupabaseConfigured) {
      localStorage.setItem(localNotesKey(userId, slug), JSON.stringify(sections));
      return sections;
    }

    const { data: row } = await supabase
      .from('skill_notes')
      .select('sections')
      .eq('user_id', userId)
      .eq('skill_slug', slug)
      .maybeSingle();

    const stored = row?.sections as NoteSection[] | undefined;
    const stale = !stored?.length || (stored[0]?.content?.length ?? 0) < 400 || stored.length < 8;
    if (stored && !stale) return stored;

    await supabase.from('skill_notes').upsert({
      user_id: userId,
      skill_slug: slug,
      skill_name: skillName,
      career_goal: career,
      sections,
      updated_at: new Date().toISOString(),
    });

    localStorage.setItem(localNotesKey(userId, slug), JSON.stringify(sections));
    return sections;
  },
};
