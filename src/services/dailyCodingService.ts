import { supabase, isSupabaseConfigured } from '../supabase/client';
import { DAILY_PROBLEM_BANK, type DailyCodingProblemTemplate } from '../content/dailyProblems';
import { XPService } from './xpService';
import type { UserProfile } from '../types';
import { ValidationService } from './validationService';

export interface DailyCodingProblem {
  id: string;
  slot: number;
  skillName: string;
  title: string;
  scenario: string;
  description: string;
  difficulty: string;
  starterCode: string;
  testCases: { input: Record<string, unknown>; expected: unknown }[];
  hints: string[];
  xpReward: number;
  completed?: boolean;
  passed?: boolean;
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededPick<T>(arr: T[], seed: number, count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  let s = seed;
  while (out.length < count && copy.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    out.push(copy.splice(s % copy.length, 1)[0]);
  }
  return out;
}

function problemsForProfile(profile: UserProfile, seed: number): DailyCodingProblemTemplate[] {
  const skills = [
    ...profile.skills.known.map((s) => s.name),
    ...profile.skills.learning.map((s) => s.name),
  ];
  const matched = DAILY_PROBLEM_BANK.filter((p) => p.skills.some((sk) => skills.includes(sk)));
  const pool = matched.length >= 3 ? matched : DAILY_PROBLEM_BANK;
  return seededPick(pool, seed, 3);
}

async function runDailyTest(code: string, template: DailyCodingProblemTemplate): Promise<boolean> {
  const id = template.id;
  const wrapped = `${code}
${id === 'cart-total' ? 'return cartTotal(items);' : ''}
${id === 'csv-parse' ? 'return salesByRegion(rows);' : ''}
${id === 'password-strength' ? 'return passwordStrength(pw);' : ''}
${id === 'binary-search' ? 'return findSku(sorted, target);' : ''}
${id === 'react-filter' ? 'return filterJobs(jobs, keyword);' : ''}
${id === 'ml-accuracy' ? 'return accuracy(yTrue, yPred);' : ''}
${id === 'docker-health' ? 'return allHealthy(services);' : ''}
${id === 'flatten-json' ? 'return flatten(obj);' : ''}
${id === 'leetcode-two-sum' ? 'return twoSum(nums, target);' : ''}
${id === 'git-merge' ? 'return mergeSorted(a, b);' : ''}
${id === 'rate-limiter' ? 'return allowRequest(userId, timestamp, limit);' : ''}
${id === 'sql-injection-safe' ? 'return buildWhere(allowed, filters);' : ''}
`;
  return ValidationService.validateChallenge('', '', wrapped, template.testCases);
}

export const DailyCodingService = {
  async ensureDailyProblems(userId: string, profile: UserProfile): Promise<DailyCodingProblem[]> {
    const today = new Date().toISOString().split('T')[0];
    const seed = hashSeed(`${userId}-${today}`);

    if (!isSupabaseConfigured) {
      return problemsForProfile(profile, seed).map((p, i) => ({
        id: `local-${i}`,
        slot: i + 1,
        skillName: p.skills[0],
        title: p.title,
        scenario: p.scenario,
        description: p.description,
        difficulty: p.difficulty,
        starterCode: p.starterCode,
        testCases: p.testCases,
        hints: p.hints,
        xpReward: p.xpReward,
      }));
    }

    const { data: existing } = await supabase
      .from('starm_daily_coding')
      .select('*')
      .eq('user_id', userId)
      .eq('question_date', today)
      .order('slot');

    if (existing && existing.length >= 3) {
      const { data: subs } = await supabase
        .from('starm_daily_coding_submissions')
        .select('problem_id, passed')
        .eq('user_id', userId);
      const subMap = new Map((subs || []).map((s) => [s.problem_id, s.passed]));
      return existing.map((row) => ({
        id: row.id,
        slot: row.slot,
        skillName: row.skill_name,
        title: row.title,
        scenario: row.scenario,
        description: row.description,
        difficulty: row.difficulty,
        starterCode: row.starter_code,
        testCases: row.test_cases as DailyCodingProblem['testCases'],
        hints: (row.hints as string[]) || [],
        xpReward: row.xp_reward,
        completed: subMap.has(row.id),
        passed: subMap.get(row.id),
      }));
    }

    const picks = problemsForProfile(profile, seed);
    await supabase.from('starm_daily_coding').delete().eq('user_id', userId).eq('question_date', today);

    const inserts = picks.map((p, i) => ({
      user_id: userId,
      question_date: today,
      slot: i + 1,
      skill_name: p.skills[0],
      title: p.title,
      scenario: p.scenario,
      description: p.description,
      difficulty: p.difficulty,
      starter_code: p.starterCode,
      test_cases: p.testCases,
      hints: p.hints,
      xp_reward: p.xpReward,
    }));

    const { data: created } = await supabase.from('starm_daily_coding').insert(inserts).select('*');
    return (created || []).map((row) => ({
      id: row.id,
      slot: row.slot,
      skillName: row.skill_name,
      title: row.title,
      scenario: row.scenario,
      description: row.description,
      difficulty: row.difficulty,
      starterCode: row.starter_code,
      testCases: row.test_cases as DailyCodingProblem['testCases'],
      hints: (row.hints as string[]) || [],
      xpReward: row.xp_reward,
    }));
  },

  async submit(userId: string, problemId: string, code: string, template: DailyCodingProblem): Promise<{ passed: boolean; awarded: boolean }> {
    const bankItem = DAILY_PROBLEM_BANK.find((b) => b.title === template.title) || {
      testCases: template.testCases,
      id: 'generic',
    } as DailyCodingProblemTemplate;

    const passed = await runDailyTest(code, bankItem);

    if (isSupabaseConfigured && !problemId.startsWith('local-')) {
      const { data: existing } = await supabase
        .from('starm_daily_coding_submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .maybeSingle();
      if (existing?.id && passed) return { passed: true, awarded: false };

      await supabase.from('starm_daily_coding_submissions').upsert({
        user_id: userId,
        problem_id: problemId,
        code,
        passed,
        xp_earned: passed ? template.xpReward : 0,
      });
    }

    if (!passed) return { passed: false, awarded: false };
    const { awarded } = await XPService.awardOnce(userId, 'challenge', `daily-code-${problemId}`, template.xpReward);
    return { passed: true, awarded };
  },
};
