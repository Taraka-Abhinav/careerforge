import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Terminal, Play, CheckCircle2, Code2, Shield, Trophy,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChallengeService } from '../services/challengeService';
import { SubscriptionService } from '../services/subscriptionService';
import { EngagementService } from '../services/engagementService';
import { supabase } from '../supabase/client';
import type { ChallengeRecord } from '../types';
import confetti from 'canvas-confetti';

export default function Arena() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ChallengeRecord | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [locked, setLocked] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(false);
      setLocked(false);
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id || null;
      setUserId(uid);
      if (!uid || !challengeId) {
        setLoadError(true);
        setLoading(false);
        return;
      }
      const daily = await ChallengeService.assignDailyChallenges(uid);
      const isDaily = daily.some((item) => item.id === challengeId);
      const canUseUnlimited = await SubscriptionService.canUseFeature(uid, 'unlimited_challenges');

      if (!canUseUnlimited && !isDaily) {
        setLocked(true);
        setLoading(false);
        return;
      }

      if (canUseUnlimited && !isDaily) {
        void SubscriptionService.trackFeatureUsage(uid, 'unlimited_challenges');
      }

      const c = await ChallengeService.getChallenge(challengeId, uid);
      if (c) {
        setChallenge(c);
        setCode(c.starterCode || '// Write your solution here\n');
        setStartedAt(Date.now());
        const done = await ChallengeService.isCompleted(uid, challengeId);
        if (done) setSuccess(true);
      } else {
        setLoadError(true);
      }
      setLoading(false);
    })();
  }, [challengeId]);

  const handleSubmit = async () => {
    if (!userId || !challengeId || !challenge) return;
    setVerifying(true);
    setFailed(false);

    const result = await ChallengeService.submit(userId, challengeId, code);
    const durationSeconds = Math.max(1, Math.round((Date.now() - (startedAt || Date.now())) / 1000));
    await EngagementService.trackEvent(
      userId,
      'learning_time',
      { source: 'challenge', challengeId, passed: result.passed },
      durationSeconds
    );

    if (result.passed) {
      setSuccess(true);
      if (result.awarded) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#4f46e5', '#10b981', '#f59e0b'] });
        if (result.leveledUp) setTimeout(() => alert('LEVEL UP!'), 1000);
      }
    } else {
      setFailed(true);
    }
    setVerifying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Loading challenge...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-neutral-400">Challenge not found.</p>
        <Button onClick={() => navigate('/challenges')}>Back to Code Arena</Button>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-neutral-400 text-center max-w-md">
          This challenge is part of the full Code Arena library. Upgrade to CareerForge Pro to unlock unlimited challenges.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/challenges')}>Back to Code Arena</Button>
          <Button variant="secondary" onClick={() => navigate('/settings')}>View plans</Button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Loading challenge...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <header className="border-b border-white/5 bg-neutral-950 px-6 py-4 flex items-center justify-between z-50 gap-4 flex-wrap">
        <div className="flex items-center gap-6 min-w-0">
          <button type="button" onClick={() => navigate('/challenges')} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3 min-w-0">
            <Badge color="amber">{challenge.difficulty}</Badge>
            <h1 className="font-extrabold tracking-tight truncate">{challenge.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            <Trophy className="w-4 h-4" /> {challenge.xpReward} XP
          </div>
          <Button
            onClick={handleSubmit}
            disabled={verifying || success}
            icon={success ? <CheckCircle2 className="w-4 h-4" /> : verifying ? <Terminal className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
            className={`min-w-0 ${success ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
          >
            {success ? 'Challenge Cleared' : verifying ? 'Running Tests...' : 'Submit Solution'}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[40%] border-b lg:border-b-0 lg:border-r border-white/5 bg-neutral-900/30 overflow-y-auto p-6 lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">{challenge.type}</span>
            </div>
            <h2 className="text-2xl font-extrabold">{challenge.title}</h2>
            <p className="text-neutral-300 text-sm leading-relaxed">{challenge.description}</p>
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <Code2 className="w-4 h-4" /> Submit your solution to run test cases
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#0d0d0d] min-h-[300px]">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 font-mono text-sm bg-transparent text-[#e5e5e5] outline-none resize-none border-0"
            spellCheck={false}
          />
          <div className="h-48 border-t border-white/5 bg-neutral-950">
            <div className="px-4 py-2 border-b border-white/5 text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Console
            </div>
            <div className="p-4 font-mono text-xs overflow-y-auto h-36">
              {verifying && <div className="text-neutral-500 animate-pulse">Running test cases...</div>}
              {success && (
                <div className="text-emerald-400 space-y-1">
                  <div>All test cases passed.</div>
                  <div>XP awarded for this challenge (once).</div>
                </div>
              )}
              {failed && <div className="text-rose-400">Tests failed. Review your logic and try again.</div>}
              {!verifying && !success && !failed && (
                <div className="text-neutral-600 italic">Submit to validate against test cases.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
