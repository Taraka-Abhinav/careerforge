import { supabase, isSupabaseConfigured } from '../supabase/client';
import { EngagementService } from './engagementService';
import { MissionService } from './missionService';
import { XPService } from './xpService';
import type { QuizQuestion } from '../types';

export interface QuizAttemptResult {
  score: number;
  passed: boolean;
  xpEarned: number;
  awarded: boolean;
}

export const QuizService = {
  async getDailyQuizModules(userId: string): Promise<{ moduleId: string; skillName: string; questions: QuizQuestion[]; passThreshold: number; xpReward: number }[]> {
    if (!isSupabaseConfigured) return [];

    const { data: skills } = await supabase
      .from('skills')
      .select('id, skill_name')
      .eq('user_id', userId)
      .in('status', ['Learning', 'Practicing', 'Assessing']);

    if (!skills?.length) return [];

    const out: { moduleId: string; skillName: string; questions: QuizQuestion[]; passThreshold: number; xpReward: number }[] = [];
    for (const skill of skills.slice(0, 3)) {
      const { data: mod } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('skill_id', skill.id)
        .eq('type', 'quiz')
        .limit(1)
        .maybeSingle();
      if (mod?.content?.questions) {
        out.push({
          moduleId: mod.id,
          skillName: skill.skill_name,
          questions: mod.content.questions,
          passThreshold: mod.content.passThreshold || 70,
          xpReward: mod.xp_reward,
        });
      }
    }
    return out;
  },

  scoreAnswers(questions: QuizQuestion[], answers: Record<string, number>): number {
    if (!questions.length) return 0;
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  },

  async submitAttempt(
    userId: string,
    moduleId: string,
    questions: QuizQuestion[],
    answers: Record<string, number>,
    passThreshold: number,
    xpReward: number
  ): Promise<QuizAttemptResult> {
    const score = this.scoreAnswers(questions, answers);
    const passed = score >= passThreshold;
    let xpEarned = 0;
    let awarded = false;

    if (passed) {
      const result = await XPService.awardOnce(userId, 'quiz', moduleId, xpReward);
      xpEarned = result.awarded ? xpReward : 0;
      awarded = result.awarded;
    }

    if (isSupabaseConfigured) {
      await supabase.from('quiz_attempts').insert({
        user_id: userId,
        module_id: moduleId,
        score,
        passed,
        answers,
        questions,
        xp_earned: xpEarned,
      });
    }

    await EngagementService.trackEvent(userId, 'quiz_completed', {
      moduleId,
      score,
      passed,
      xpEarned,
    });
    if (passed) await MissionService.completeByTarget(userId, 'quiz');

    return { score, passed, xpEarned, awarded };
  },

  async getAttemptHistory(userId: string) {
    if (!isSupabaseConfigured) return [];
    const { data } = await supabase
      .from('quiz_attempts')
      .select('*, learning_modules(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return data || [];
  },
};
