import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { CareerOutcome } from '../types';

const localKey = (userId: string) => `career_outcomes_${userId}`;

function normalize(outcome?: Partial<CareerOutcome> | null): CareerOutcome {
  return {
    resumeUrl: outcome?.resumeUrl || '',
    portfolioUrl: outcome?.portfolioUrl || '',
    targetRoles: outcome?.targetRoles || [],
    interviewPracticeCount: outcome?.interviewPracticeCount || 0,
    applicationsCount: outcome?.applicationsCount || 0,
    offersCount: outcome?.offersCount || 0,
  };
}

function loadLocal(userId: string): CareerOutcome {
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? normalize(JSON.parse(raw) as CareerOutcome) : normalize(null);
  } catch {
    return normalize(null);
  }
}

function saveLocal(userId: string, outcome: CareerOutcome) {
  localStorage.setItem(localKey(userId), JSON.stringify(outcome));
}

export const CareerOutcomeService = {
  async getOutcome(userId: string): Promise<CareerOutcome> {
    if (!isSupabaseConfigured) return loadLocal(userId);

    const { data } = await supabase
      .from('career_outcomes')
      .select('resume_url, portfolio_url, target_roles, interview_practice_count, applications_count, offers_count')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) return loadLocal(userId);

    const outcome = normalize({
      resumeUrl: data.resume_url || '',
      portfolioUrl: data.portfolio_url || '',
      targetRoles: (data.target_roles as string[]) || [],
      interviewPracticeCount: data.interview_practice_count || 0,
      applicationsCount: data.applications_count || 0,
      offersCount: data.offers_count || 0,
    });
    saveLocal(userId, outcome);
    return outcome;
  },

  async saveOutcome(userId: string, outcome: CareerOutcome): Promise<CareerOutcome> {
    const normalized = normalize(outcome);
    saveLocal(userId, normalized);

    if (!isSupabaseConfigured) return normalized;

    await supabase.from('career_outcomes').upsert({
      user_id: userId,
      resume_url: normalized.resumeUrl,
      portfolio_url: normalized.portfolioUrl,
      target_roles: normalized.targetRoles,
      interview_practice_count: normalized.interviewPracticeCount,
      applications_count: normalized.applicationsCount,
      offers_count: normalized.offersCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return normalized;
  },
};
