import { supabase, isSupabaseConfigured } from '../supabase/client';
import { XPService } from './xpService';
import type { UserProfile } from '../types';
import { ALL_SKILLS } from '../config/skillTaxonomy';
import { enhanceWithLLM, STARM_SYSTEM_PROMPT } from './starmAI';

export interface StarMDailyQuestion {
  id: string;
  slot: number;
  skillName: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  answered?: boolean;
  isCorrect?: boolean;
}

export interface NoteSection {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  checkpoint?: { question: string; answer: string };
}

export interface CoachResponse {
  explanation: string;
  analogy: string;
  followUps: { question: string; answer: string }[];
  proTip: string;
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
  for (let i = 0; i < count && copy.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % copy.length;
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function buildQuestionForSkill(skill: string, seed: number): Omit<StarMDailyQuestion, 'id' | 'slot' | 'answered'> {
  const variants = [
    {
      prompt: `In ${skill}, what is the most important first principle to master?`,
      options: ['Memorizing syntax only', 'Understanding core concepts and trade-offs', 'Skipping documentation', 'Avoiding practice'],
      correctIndex: 1,
      explanation: `${skill} rewards conceptual clarity first — syntax follows once mental models are solid.`,
    },
    {
      prompt: `Which approach best accelerates learning ${skill} for your career?`,
      options: ['Passive video watching only', 'Building small projects with feedback', 'Random tutorials without goals', 'Copy-paste without reflection'],
      correctIndex: 1,
      explanation: `Deliberate practice with projects is how top engineers master ${skill}.`,
    },
    {
      prompt: `When debugging ${skill} issues, what should you do first?`,
      options: ['Rewrite everything', 'Reproduce the issue and isolate variables', 'Ignore logs', 'Ask AI to fix without context'],
      correctIndex: 1,
      explanation: `Reproduction and isolation are universal debugging skills — especially in ${skill}.`,
    },
  ];
  const q = variants[seed % variants.length];
  return { skillName: skill, difficulty: 'Medium', ...q };
}

function getSkillPool(profile: UserProfile): string[] {
  const known = profile.skills.known.map((s) => s.name);
  const learning = profile.skills.learning.map((s) => s.name);
  const pool = [...new Set([...known, ...learning])].filter(Boolean);
  if (pool.length >= 3) return pool;
  const extras = seededPick(ALL_SKILLS.filter((s) => !pool.includes(s)), hashSeed(profile.goals.career), 5 - pool.length);
  return [...pool, ...extras].slice(0, 8);
}

export const StarMService = {
  async ensureDailyQuestions(userId: string, profile: UserProfile): Promise<StarMDailyQuestion[]> {
    const today = new Date().toISOString().split('T')[0];
    const seed = hashSeed(`${userId}-${today}`);

    if (!isSupabaseConfigured) {
      const skills = seededPick(getSkillPool(profile), seed, 3);
      return skills.map((skill, i) => ({
        id: `local-${i}`,
        slot: i + 1,
        ...buildQuestionForSkill(skill, seed + i),
      }));
    }

    const { data: existing } = await supabase
      .from('starm_daily_questions')
      .select('*')
      .eq('user_id', userId)
      .eq('question_date', today)
      .order('slot');

    if (existing && existing.length >= 3) {
      const { data: responses } = await supabase
        .from('starm_daily_responses')
        .select('question_id, is_correct')
        .eq('user_id', userId)
        .in('question_id', existing.map((q) => q.id));

      const respMap = new Map((responses || []).map((r) => [r.question_id, r.is_correct]));
      return existing.map((q) => ({
        id: q.id,
        slot: q.slot,
        skillName: q.skill_name,
        prompt: q.prompt,
        options: q.options as string[],
        correctIndex: q.correct_index,
        explanation: q.explanation,
        difficulty: q.difficulty,
        answered: respMap.has(q.id),
        isCorrect: respMap.get(q.id),
      }));
    }

    const skills = seededPick(getSkillPool(profile), seed, 3);
    const inserts = skills.map((skill, i) => {
      const q = buildQuestionForSkill(skill, seed + i);
      return {
        user_id: userId,
        question_date: today,
        slot: i + 1,
        skill_name: skill,
        prompt: q.prompt,
        options: q.options,
        correct_index: q.correctIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
      };
    });

    await supabase.from('starm_daily_questions').delete().eq('user_id', userId).eq('question_date', today);
    const { data: created } = await supabase.from('starm_daily_questions').insert(inserts).select('*');

    return (created || []).map((q) => ({
      id: q.id,
      slot: q.slot,
      skillName: q.skill_name,
      prompt: q.prompt,
      options: q.options as string[],
      correctIndex: q.correct_index,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));
  },

  async submitDailyAnswer(userId: string, questionId: string, selectedIndex: number, correctIndex: number) {
    const isCorrect = selectedIndex === correctIndex;
    const xp = isCorrect ? 35 : 0;

    if (isSupabaseConfigured && !questionId.startsWith('local-')) {
      const { data: existing } = await supabase
        .from('starm_daily_responses')
        .select('id')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .maybeSingle();
      if (existing) return { isCorrect, awarded: false, xp: 0 };

      await supabase.from('starm_daily_responses').insert({
        user_id: userId,
        question_id: questionId,
        selected_index: selectedIndex,
        is_correct: isCorrect,
        xp_earned: xp,
      });
    }

    let awarded = false;
    if (isCorrect && xp > 0) {
      const r = await XPService.awardOnce(userId, 'quiz', `starm-${questionId}`, xp);
      awarded = r.awarded;
    }
    return { isCorrect, awarded, xp: awarded ? xp : 0 };
  },

  async generateNoteSections(skillName: string, careerGoal: string): Promise<NoteSection[]> {
    const llm = await enhanceWithLLM(
      STARM_SYSTEM_PROMPT,
      `Create study notes for skill "${skillName}" for a ${careerGoal}. Return JSON array with 4 sections: id, title, content (2-3 sentences), keyPoints (3 bullets), optional checkpoint {question, answer}. Plain text only in JSON.`
    );

    if (llm) {
      try {
        const parsed = JSON.parse(llm.replace(/```json|```/g, '').trim());
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* fall through */
      }
    }

    return [
      {
        id: 'overview',
        title: 'Overview',
        content: `${skillName} is a core capability on your ${careerGoal} path. StarM structured this module around how professionals actually use it in production — not generic trivia.`,
        keyPoints: [`Why ${skillName} matters for ${careerGoal}`, 'How it connects to your roadmap phases', 'What mastery looks like at each level'],
        checkpoint: {
          question: `Why is ${skillName} on your roadmap?`,
          answer: `It unlocks the next phase of your ${careerGoal} journey and compounds with your other skills.`,
        },
      },
      {
        id: 'concepts',
        title: 'Core Concepts',
        content: `Focus on mental models: inputs, outputs, constraints, and failure modes. In ${skillName}, experts spend 80% of time on edge cases and integration — not hello-world examples.`,
        keyPoints: ['Foundational definitions', 'Common patterns and anti-patterns', 'Trade-offs vs alternatives'],
      },
      {
        id: 'practice',
        title: 'Applied Practice',
        content: `Build one micro-project this week using ${skillName}. Ship something small, measure it, and document one lesson learned — that is how StarM tracks real progress.`,
        keyPoints: ['Starter exercise', 'Debugging checklist', 'Code review habits'],
        checkpoint: {
          question: 'What is the smallest project you can finish in 2 hours?',
          answer: 'A focused script, component, or notebook that demonstrates one concept end-to-end.',
        },
      },
      {
        id: 'career',
        title: `Career Lens (${careerGoal})`,
        content: `Interviewers for ${careerGoal} roles expect you to explain ${skillName} in system context: scale, security, cost, and team workflow — not isolated syntax.`,
        keyPoints: ['Typical interview questions', 'Portfolio evidence to collect', 'Senior-level expectations'],
      },
    ];
  },

  async explainHighlight(
    userId: string,
    params: { selection: string; skillName: string; careerGoal: string; sectionTitle?: string }
  ): Promise<CoachResponse> {
    const { selection, skillName, careerGoal, sectionTitle } = params;
    const trimmed = selection.trim().slice(0, 500);
    if (!trimmed) {
      return {
        explanation: 'Highlight text in the notes to ask StarM.',
        analogy: '',
        followUps: [],
        proTip: '',
      };
    }

    const llm = await enhanceWithLLM(
      STARM_SYSTEM_PROMPT,
      `User highlighted: "${trimmed}" from ${sectionTitle || 'notes'} about ${skillName} (${careerGoal}). Explain simply, give an analogy, 2 follow-up Q&As, and one pro tip. Format as JSON: explanation, analogy, followUps [{question,answer}], proTip.`
    );

    if (llm) {
      try {
        const parsed = JSON.parse(llm.replace(/```json|```/g, '').trim());
        if (parsed.explanation) {
          if (isSupabaseConfigured) {
            await supabase.from('starm_coach_sessions').insert({
              user_id: userId,
              skill_slug: skillName.toLowerCase().replace(/\s+/g, '-'),
              selected_text: trimmed,
              explanation: parsed.explanation,
              follow_up_questions: parsed.followUps || [],
            });
          }
          return parsed as CoachResponse;
        }
      } catch {
        /* template fallback */
      }
    }

    const response: CoachResponse = {
      explanation: `"${trimmed}" is a key idea in ${skillName}. For your ${careerGoal} path, think of it as a building block you will reuse across modules, projects, and interviews — not an isolated fact.`,
      analogy: `Like learning a musical scale before a song — this concept is the scale. Once it clicks, advanced topics in ${skillName} feel natural.`,
      followUps: [
        {
          question: `How would you explain "${trimmed.slice(0, 40)}..." to a teammate?`,
          answer: `Use a concrete example from ${skillName}, state when to use it, and mention one pitfall to avoid.`,
        },
        {
          question: 'What mistake do beginners make here?',
          answer: 'They memorize without context. Tie the idea to a real task in your current project.',
        },
      ],
      proTip: `StarM recommends re-reading this section after your next ${skillName} practice session — spaced recall locks it in.`,
    };

    if (isSupabaseConfigured) {
      await supabase.from('starm_coach_sessions').insert({
        user_id: userId,
        selected_text: trimmed,
        explanation: response.explanation,
        follow_up_questions: response.followUps,
      });
    }

    return response;
  },
};
