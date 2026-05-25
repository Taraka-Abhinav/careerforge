import React, { useEffect, useState } from 'react';
import {
  Trophy, Calendar, Users, Rocket, CheckCircle2, Sparkles, Clock, Award,
  FileText, Video, Github, ChevronRight, Zap,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import {
  HackathonService,
  HACKATHON_EVENT,
  type HackathonTrack,
  type HackathonRegistration,
} from '../services/hackathonService';
import { cn } from '../utils/cn';

export default function HackathonPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [registration, setRegistration] = useState<HackathonRegistration | null>(null);
  const [stats, setStats] = useState({ registered: 0 });
  const [teamName, setTeamName] = useState('');
  const [track, setTrack] = useState<HackathonTrack>('Full Stack');
  const [mode, setMode] = useState<'solo' | 'team'>('solo');
  const [teammates, setTeammates] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id || null;
      setUserId(uid);
      setStats(await HackathonService.getStats());
      if (uid) {
        const reg = await HackathonService.getRegistration(uid);
        setRegistration(reg);
        if (reg) {
          setTeamName(reg.teamName);
          setTrack(reg.track);
          setMode(reg.mode);
          setTeammates(reg.teammateEmails || '');
          setProjectTitle(reg.projectTitle || '');
        }
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (!userId || !teamName.trim()) {
      setMessage('Enter a team name to register.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    const res = await HackathonService.register(userId, {
      teamName: teamName.trim(),
      track,
      mode,
      teammateEmails: mode === 'team' ? teammates : undefined,
      projectTitle: projectTitle || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setRegistration(await HackathonService.getRegistration(userId));
      setMessage('You are registered for CareerForge Hackathon!');
      setStats(await HackathonService.getStats());
    } else {
      setMessage(res.error || 'Registration failed.');
    }
  };

  const daysUntil = Math.max(
    0,
    Math.ceil((new Date(HACKATHON_EVENT.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-10 pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-neutral-900 to-purple-950/50 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
          <Badge color="purple" className="mb-4">CareerForge Official Event</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{HACKATHON_EVENT.name}</h1>
          <p className="text-xl text-indigo-200/90 mb-6">{HACKATHON_EVENT.tagline}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2 text-neutral-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {HACKATHON_EVENT.startDate} → {HACKATHON_EVENT.endDate}
            </span>
            <span className="flex items-center gap-2 text-neutral-300">
              <Users className="w-4 h-4 text-emerald-400" />
              {stats.registered}+ builders registered
            </span>
            <span className="flex items-center gap-2 text-neutral-300">
              <Clock className="w-4 h-4 text-amber-400" />
              {daysUntil} days to kickoff
            </span>
          </div>
          <p className="mt-6 text-neutral-400">
            <strong className="text-white">Theme:</strong> {HACKATHON_EVENT.theme}
          </p>
        </section>

        {/* Prizes */}
        <section>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <Trophy className="w-7 h-7 text-amber-400" /> Prizes
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {HACKATHON_EVENT.prizes.map((p) => (
              <Card key={p.place} padding="p-5" className="border-amber-500/20 bg-amber-500/5">
                <Award className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="font-bold text-white">{p.place}</h3>
                <p className="text-sm text-neutral-400 mt-2">{p.reward}</p>
                <p className="text-xs text-neutral-500 mt-2">{p.count} winner{p.count > 1 ? 's' : ''}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Tracks */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Competition tracks</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HACKATHON_EVENT.tracks.map((t) => (
              <Card
                key={t}
                padding="p-4"
                className={cn('cursor-pointer transition-all', track === t && 'border-indigo-500 bg-indigo-500/10')}
                onClick={() => setTrack(t)}
              >
                <span className="font-bold text-white">{t}</span>
                <p className="text-xs text-neutral-500 mt-1">Judged separately — pick one at registration</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-indigo-400" /> Schedule
          </h2>
          <div className="space-y-4">
            {HACKATHON_EVENT.schedule.map((block) => (
              <Card key={block.day} padding="p-5" className="border-white/5">
                <h3 className="font-bold text-indigo-300 mb-3">{block.day}</h3>
                <ul className="space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-neutral-300">
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Rules & submission */}
        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Rules
            </h2>
            <Card padding="p-5" className="space-y-3">
              {HACKATHON_EVENT.rules.map((r, i) => (
                <p key={r} className="text-sm text-neutral-400">
                  <span className="text-indigo-400 font-bold">{i + 1}.</span> {r}
                </p>
              ))}
            </Card>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5" /> Final submission checklist
            </h2>
            <Card padding="p-5" className="space-y-4">
              {[
                { icon: Github, label: 'Public GitHub repository with MIT license' },
                { icon: FileText, label: 'README: setup, theme fit, AI tools used' },
                { icon: Video, label: '3-minute demo video (YouTube unlisted OK)' },
                { icon: Zap, label: 'Live deployment or reproducible local demo' },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 text-sm text-neutral-300">
                  <item.icon className="w-5 h-5 text-emerald-400 shrink-0" />
                  {item.label}
                </div>
              ))}
            </Card>
          </section>
        </div>

        {/* Registration */}
        <section id="register">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <Sparkles className="w-7 h-7 text-purple-400" />
            {registration ? 'Your registration' : 'Register now'}
          </h2>
          <Card padding="p-6 md:p-8" className="border-indigo-500/20">
            {registration && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-300">Registered as {registration.teamName}</p>
                  <p className="text-sm text-neutral-400">
                    Track: {registration.track} · {registration.mode === 'solo' ? 'Solo' : 'Team'}
                  </p>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Team name *</label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="Night Owls"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Working title (optional)</label>
                <input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="StudyBuddy AI"
                />
              </div>
            </div>
            <div className="flex gap-3 mb-4">
              {(['solo', 'team'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 py-3 rounded-xl border font-bold text-sm capitalize',
                    mode === m ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'border-white/10 text-neutral-400'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            {mode === 'team' && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Teammate emails (comma-separated)</label>
                <input
                  value={teammates}
                  onChange={(e) => setTeammates(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="alex@school.edu, sam@school.edu"
                />
              </div>
            )}
            <p className="text-xs text-neutral-500 mb-4">
              Registration closes {HACKATHON_EVENT.registrationDeadline}. Max {HACKATHON_EVENT.maxTeams} teams.
            </p>
            {message && (
              <p className={cn('text-sm mb-4 font-semibold', message.includes('registered') ? 'text-emerald-400' : 'text-rose-400')}>
                {message}
              </p>
            )}
            <Button
              size="lg"
              className="w-full md:w-auto"
              disabled={submitting || !userId}
              onClick={handleRegister}
              icon={<Rocket className="w-5 h-5" />}
            >
              {registration ? 'Update registration' : 'Join CareerForge Hackathon'}
            </Button>
          </Card>
        </section>

        {/* Mentors / FAQ teaser */}
        <section>
          <h2 className="text-xl font-bold mb-3">FAQ</h2>
          <div className="space-y-3">
            {[
              { q: 'Who can participate?', a: 'Any CareerForge student with a completed profile. Solo or teams up to 4.' },
              { q: 'Is there a fee?', a: 'Free for all registered CareerForge users.' },
              { q: 'Can I use my roadmap project?', a: 'Yes, if you build new features during the hackathon window and document them.' },
              { q: 'How are projects judged?', a: 'Impact, technical depth, demo quality, and theme alignment — by industry mentors.' },
            ].map((faq) => (
              <Card key={faq.q} padding="p-4">
                <p className="font-bold text-white text-sm">{faq.q}</p>
                <p className="text-sm text-neutral-400 mt-1">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
