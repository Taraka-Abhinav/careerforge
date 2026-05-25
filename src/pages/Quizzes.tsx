import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CalendarRange, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { supabase } from '../supabase/client';
import { ProfileService } from '../services/profileService';
import { QuizDeckService, type QuizDeck } from '../services/quizDeckService';
import { cn } from '../utils/cn';

export default function QuizzesPage() {
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily');
  const [deck, setDeck] = useState<QuizDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'error' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

      const next = mode === 'daily'
        ? QuizDeckService.getDailyQuiz(user.id, profile)
        : QuizDeckService.getWeeklyQuiz(user.id, profile);

      if (isMounted) {
        setDeck(next);
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [mode, navigate]);

  const handleSubmit = async (answers: Record<string, number>) => {
    if (!userId || !deck) return;
    setSubmitting(true);
    const attempt = await QuizDeckService.submitAttempt(userId, deck, answers);
    const xpText = attempt.passed
      ? attempt.awarded
        ? `+${attempt.xpEarned} XP`
        : '+0 XP (already awarded)'
      : 'Below pass threshold';
    setMessage(`Score: ${attempt.score}% — ${xpText}`);
    setMessageTone(attempt.passed ? 'success' : 'error');
    setDeck({ ...deck, attempt });
    setSubmitting(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="text-neutral-400 text-center py-20">Loading quizzes…</div>
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
              Daily quizzes adapt to your known and learning skills. Weekly quizzes are shared across the same career track.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'daily' ? 'primary' : 'secondary'}
              icon={<CalendarDays className="w-4 h-4" />}
              onClick={() => setMode('daily')}
            >
              Daily
            </Button>
            <Button
              size="sm"
              variant={mode === 'weekly' ? 'primary' : 'secondary'}
              icon={<CalendarRange className="w-4 h-4" />}
              onClick={() => setMode('weekly')}
            >
              Weekly
            </Button>
          </div>
        </header>

        <Card className="p-6 border-white/5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge color="indigo">{deck.title}</Badge>
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
              Last attempt: {new Date(deck.attempt.completedAt).toLocaleString()} — score {deck.attempt.score}%
            </div>
          )}
          <p className="text-xs text-neutral-500">
            XP is awarded once per quiz deck when you pass.
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
      </div>
    </AppShell>
  );
}
