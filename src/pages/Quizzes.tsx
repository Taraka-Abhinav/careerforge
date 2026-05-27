import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CalendarRange, CheckCircle2, History } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { supabase } from '../supabase/client';
import { ProfileService } from '../services/profileService';
import { QuizDeckService, type QuizDeck, type QuizHistoryRow } from '../services/quizDeckService';
import { SubscriptionService } from '../services/subscriptionService';
import { EngagementService } from '../services/engagementService';
import { cn } from '../utils/cn';

export default function QuizzesPage() {
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily');
  const [deck, setDeck] = useState<QuizDeck | null>(null);
  const [history, setHistory] = useState<QuizHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'error' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [weeklyAllowed, setWeeklyAllowed] = useState<boolean | null>(null);
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setMessage(null);
      setMessageTone(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      if (isMounted) setUserId(user.id);

      const profile = await ProfileService.getProfile(user.id);
      if (!profile) {
        setLoading(false);
        return;
      }

      const weeklyAccess = await SubscriptionService.canUseFeature(user.id, 'unlimited_quizzes');
      if (isMounted) setWeeklyAllowed(weeklyAccess);

      if (mode === 'weekly' && !weeklyAccess) {
        if (isMounted) {
          setMode('daily');
          setMessage('Weekly quizzes are available with CareerForge Pro.');
          setMessageTone('error');
        }
        return;
      }

      const next = mode === 'daily'
        ? await QuizDeckService.getDailyQuiz(user.id, profile)
        : await QuizDeckService.getWeeklyQuiz(user.id, profile);
      const nextHistory = await QuizDeckService.getAttemptHistory(user.id);

      if (mode === 'weekly' && weeklyAccess) {
        await SubscriptionService.trackFeatureUsage(user.id, 'unlimited_quizzes');
      }

      if (isMounted) {
        setDeck(next);
        setHistory(nextHistory);
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [mode, navigate]);

  useEffect(() => {
    if (deck) setQuizStartedAt(Date.now());
  }, [deck?.id]);

  const weeklyLocked = weeklyAllowed === false;

  const handleModeChange = (nextMode: 'daily' | 'weekly') => {
    if (nextMode === 'weekly' && weeklyLocked) {
      setMessage('Weekly quizzes are part of CareerForge Pro. Upgrade to unlock.');
      setMessageTone('error');
      return;
    }
    setMode(nextMode);
  };

  const handleSubmit = async (answers: Record<string, number>) => {
    if (!userId || !deck) return;
    setSubmitting(true);
    const attempt = await QuizDeckService.submitAttempt(userId, deck, answers);
    const startedAt = quizStartedAt || Date.now();
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    await EngagementService.trackEvent(
      userId,
      'learning_time',
      { source: 'quiz', deckId: deck.id, mode: deck.mode },
      durationSeconds
    );
    const xpText = attempt.passed
      ? attempt.awarded
        ? `+${attempt.xpEarned} XP`
        : '+0 XP (already awarded)'
      : 'Below pass threshold';
    setMessage(`Score: ${attempt.score}% - ${xpText}`);
    setMessageTone(attempt.passed ? 'success' : 'error');
    setDeck({ ...deck, attempt });
    setHistory(await QuizDeckService.getAttemptHistory(userId));
    setSubmitting(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="text-neutral-400 text-center py-20">Loading quizzes...</div>
      </AppShell>
    );
  }

  if (!deck) {
    return (
      <AppShell>
        <div className="text-neutral-400 text-center py-20">No quiz deck available yet.</div>
      </AppShell>
    );
  }

  const hard = deck.questions.filter((q) => q.difficulty === 'Hard').length;
  const medium = deck.questions.filter((q) => q.difficulty === 'Medium').length;
  const easy = deck.questions.filter((q) => q.difficulty === 'Easy').length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Quizzes</h1>
            <p className="text-neutral-400 mt-2">
              Daily quizzes adapt to your roadmap focus, career path, known skills, and learning skills.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'daily' ? 'primary' : 'secondary'}
              icon={<CalendarDays className="w-4 h-4" />}
              onClick={() => handleModeChange('daily')}
            >
              Daily
            </Button>
            <Button
              size="sm"
              variant={mode === 'weekly' ? 'primary' : 'secondary'}
              icon={<CalendarRange className="w-4 h-4" />}
              onClick={() => handleModeChange('weekly')}
              disabled={weeklyLocked}
            >
              Weekly
            </Button>
          </div>
        </header>

        {weeklyLocked && (
          <Card className="p-5 border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-amber-200">
              Weekly quizzes are a Pro feature. Daily quizzes remain free.
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
              View plans
            </Button>
          </Card>
        )}

        <Card className="p-6 border-white/5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge color="indigo">{deck.title}</Badge>
            {deck.focusSkill && <Badge color="purple">{deck.focusSkill}</Badge>}
            <Badge color="neutral">Pass threshold: {deck.passThreshold}%</Badge>
            <Badge color="emerald">{deck.xpReward} XP</Badge>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-neutral-300">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-rose-400" /> Hard: {hard}</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Medium: {medium}</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Easy: {easy}</span>
          </div>
          {deck.attempt && (
            <div className="text-xs text-neutral-400">
              Last attempt: {new Date(deck.attempt.completedAt).toLocaleString()} - score {deck.attempt.score}%
            </div>
          )}
          <p className="text-xs text-neutral-500">
            XP is awarded once per quiz deck when you pass. Attempts and scores are saved.
          </p>
        </Card>

        <QuizRunner
          questions={deck.questions}
          passThreshold={deck.passThreshold}
          onSubmit={handleSubmit}
          disabled={submitting}
        />

        {message && (
          <p className={cn('text-center font-bold', messageTone === 'success' ? 'text-emerald-400' : 'text-rose-400')}>
            {message}
          </p>
        )}

        {history.length > 0 && (
          <Card className="p-6 border-white/5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" /> Recent Quiz History
            </h2>
            <div className="space-y-3">
              {history.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between gap-3 text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{attempt.focusSkill || attempt.deckId}</div>
                    <div className="text-xs text-neutral-500">{new Date(attempt.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={attempt.passed ? 'emerald' : 'rose'}>{attempt.score}%</Badge>
                    <Badge color="neutral">+{attempt.xpEarned} XP</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
