import { supabase, isSupabaseConfigured } from '../supabase/client';
import type { UserProfile, SkillStatus } from '../types';

export const ProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const cached = localStorage.getItem(`profile_${userId}`);
    if (!isSupabaseConfigured) {
      return cached ? JSON.parse(cached) : null;
    }

    try {
      const { data: profileRow, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (pError || !profileRow) {
        return cached ? JSON.parse(cached) : null;
      }

      const { data: roadmapRow } = await supabase.from('roadmaps').select('*').eq('user_id', userId).single();

      const { data: skillsRows } = await supabase.from('skills').select('*').eq('user_id', userId);

      const knownSkills =
        skillsRows
          ?.filter((s) => s.skill_type === 'known')
          .map((s) => ({
            id: s.id,
            name: s.skill_name,
            level: s.level_or_priority,
            status: s.status as SkillStatus,
          })) || [];

      const learningSkills =
        skillsRows
          ?.filter((s) => s.skill_type === 'learning')
          .map((s) => ({
            id: s.id,
            name: s.skill_name,
            priority: s.level_or_priority,
            status: s.status as SkillStatus,
          })) || [];

      const personality = (profileRow.personality as Record<string, string>) || {};

      return {
        isComplete: profileRow.is_complete ?? false,
        basic: {
          name: profileRow.name || '',
          age: profileRow.age || 24,
          location: profileRow.location || profileRow.country || '',
          education: profileRow.education || '',
          school: profileRow.school || '',
          gradYear: profileRow.grad_year || '',
          occupation: profileRow.occupation || '',
        },
        goals: {
          career: roadmapRow?.career_goal || 'AI Engineer',
          salary: roadmapRow?.target_salary || '$120,000',
          dreamCompany: roadmapRow?.dream_company || '',
          workType: profileRow.work_type || 'Remote',
        },
        skills: { known: knownSkills, learning: learningSkills },
        learningStyle: profileRow.learning_style || [],
        time: {
          hoursPerDay: roadmapRow?.hours_per_day || 4,
          hoursPerWeek: roadmapRow?.hours_per_week || 20,
          schedule: 'Flexible',
          weekend: true,
        },
        personality: {
          learningSpeed: (personality.learningSpeed as 'Fast' | 'Normal' | 'Steady') || 'Fast',
          preference: (profileRow.preference as 'Practical' | 'Theoretical') || 'Practical',
          team: (personality.team as 'Solo' | 'Team') || 'Solo',
          discipline: (personality.discipline as 'High' | 'Medium' | 'Flexible') || 'High',
        },
        commitment: {
          timeline: roadmapRow?.timeline || '6 Months',
          urgency: profileRow.urgency || profileRow.commitment_level || 'Very Serious',
        },
        experience: {
          projects: profileRow.projects_count ?? 0,
          hackathons: profileRow.hackathons_count ?? 0,
          github: profileRow.github_url || '',
          internship: profileRow.internship || 'None',
        },
        analysis: (profileRow.analysis as UserProfile['analysis']) ||
          (cached ? JSON.parse(cached).analysis : { readinessScore: 35, learningSpeedScore: 85, confidenceScore: 70 }),
      };
    } catch (e) {
      console.error('Supabase profile retrieval failed', e);
      return cached ? JSON.parse(cached) : null;
    }
  },

  async saveProfile(userId: string, profile: UserProfile): Promise<boolean> {
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));

    if (!isSupabaseConfigured) return true;

    try {
      const { error: pError } = await supabase.from('profiles').upsert({
        id: userId,
        name: profile.basic.name,
        age: profile.basic.age,
        location: profile.basic.location,
        country: profile.basic.location,
        education: profile.basic.education,
        school: profile.basic.school,
        grad_year: profile.basic.gradYear,
        occupation: profile.basic.occupation,
        learning_style: profile.learningStyle,
        preference: profile.personality.preference,
        work_type: profile.goals.workType,
        personality: profile.personality,
        projects_count: profile.experience.projects,
        hackathons_count: profile.experience.hackathons,
        github_url: profile.experience.github,
        internship: profile.experience.internship,
        commitment_level: profile.commitment.urgency,
        urgency: profile.commitment.urgency,
        analysis: profile.analysis,
        is_complete: profile.isComplete,
        updated_at: new Date().toISOString(),
      });

      if (pError) throw pError;

      const { data: existingRoadmap } = await supabase.from('roadmaps').select('id').eq('user_id', userId).single();

      const roadmapPayload = {
        career_goal: profile.goals.career,
        target_salary: profile.goals.salary,
        dream_company: profile.goals.dreamCompany,
        hours_per_week: profile.time.hoursPerWeek,
        hours_per_day: profile.time.hoursPerDay,
        timeline: profile.commitment.timeline,
        updated_at: new Date().toISOString(),
      };

      if (existingRoadmap) {
        await supabase.from('roadmaps').update(roadmapPayload).eq('user_id', userId);
      } else {
        await supabase.from('roadmaps').insert({ user_id: userId, ...roadmapPayload });
      }

      await supabase.from('skills').delete().eq('user_id', userId);

      const skillInserts = [
        ...profile.skills.known.map((s) => ({
          user_id: userId,
          skill_name: s.name,
          skill_type: 'known',
          status: 'Mastered',
          level_or_priority: s.level || 'Intermediate',
        })),
        ...profile.skills.learning.map((s) => ({
          user_id: userId,
          skill_name: s.name,
          skill_type: 'learning',
          status: s.status || 'Learning',
          level_or_priority: s.priority || 'Must Learn',
        })),
      ];

      if (skillInserts.length > 0) {
        await supabase.from('skills').insert(skillInserts);
      }

      return true;
    } catch (e) {
      console.error('Supabase profile saving error', e);
      return false;
    }
  },
};
