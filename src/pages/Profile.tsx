import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Target, BrainCircuit, MapPin, GraduationCap, Github, Flame, Trophy, Settings, Pencil, Save,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { supabase } from '../supabase/client';
import { ProfileService } from '../services/profileService';
import { ProgressService } from '../services/progressService';
import { RoadmapEngine } from '../services/roadmapEngine';
import type { UserProfile, UserProgress } from '../types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [roadmapPercent, setRoadmapPercent] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const p = await ProfileService.getProfile(user.id);
    const prog = await ProgressService.getProgress(user.id);
    const phases = await RoadmapEngine.getPhases(user.id);
    const total = phases.flatMap((ph) => ph.items.filter((i) => i.type === 'skill')).length;
    const mastered = p?.skills.known.length || 0;
    setRoadmapPercent(total ? Math.min(100, Math.round((mastered / total) * 100)) : 0);
    setProfile(p);
    setDraft(p);
    setProgress(prog);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await ProfileService.saveProfile(user.id, { ...draft, isComplete: true });
    setProfile(draft);
    setEditing(false);
    setSaving(false);
  };

  if (!profile || !progress) {
    return (
      <AppShell>
        <div className="text-neutral-400 text-center py-20">Loading profile…</div>
      </AppShell>
    );
  }

  const p = editing && draft ? draft : profile;
  const xpToNext = Math.pow(progress.level, 2) * 50 - progress.xp;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg">
              {p.basic.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{p.basic.name || 'Your Profile'}</h1>
              <p className="text-neutral-400 flex items-center gap-2 mt-1">
                <Target className="w-4 h-4 text-indigo-400" />
                {p.goals.career}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!editing ? (
              <Button variant="secondary" icon={<Pencil className="w-4 h-4" />} onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { setEditing(false); setDraft(profile); }}>Cancel</Button>
                <Button icon={<Save className="w-4 h-4" />} onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </>
            )}
            <Button variant="ghost" icon={<Settings className="w-4 h-4" />} onClick={() => navigate('/settings')}>
              Settings
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-white/5 text-center">
            <Trophy className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <div className="text-2xl font-black">{progress.level}</div>
            <div className="text-xs text-neutral-500">Level</div>
          </Card>
          <Card className="p-4 border-white/5 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-black">{progress.streakDays}</div>
            <div className="text-xs text-neutral-500">Day streak</div>
          </Card>
          <Card className="p-4 border-white/5 text-center">
            <div className="text-2xl font-black text-emerald-400">{progress.xp.toLocaleString()}</div>
            <div className="text-xs text-neutral-500">Total XP</div>
          </Card>
          <Card className="p-4 border-white/5 text-center">
            <div className="text-2xl font-black">{roadmapPercent}%</div>
            <div className="text-xs text-neutral-500">Roadmap</div>
          </Card>
        </div>

        <Card className="p-6 border-white/5">
          <div className="flex justify-between text-xs mb-2 text-neutral-400">
            <span>Progress to Level {progress.level + 1}</span>
            <span>{xpToNext > 0 ? `${xpToNext} XP to go` : 'Max level soon!'}</span>
          </div>
          <ProgressBar progress={Math.min(100, (progress.xp % (progress.level * progress.level * 50 || 50)) / 2)} color="bg-indigo-500" containerClass="h-2 rounded-full bg-neutral-950" />
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-white/5 space-y-4">
            <h2 className="font-bold flex items-center gap-2"><User className="w-5 h-5 text-indigo-400" /> Basic</h2>
            {editing ? (
              <div className="space-y-3">
                <input className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" value={p.basic.name} onChange={(e) => setDraft({ ...draft!, basic: { ...draft!.basic, name: e.target.value } })} placeholder="Name" />
                <input className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" value={p.basic.location} onChange={(e) => setDraft({ ...draft!, basic: { ...draft!.basic, location: e.target.value } })} placeholder="Location" />
                <input className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" value={p.basic.occupation} onChange={(e) => setDraft({ ...draft!, basic: { ...draft!.basic, occupation: e.target.value } })} placeholder="Occupation" />
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-500">Age</dt><dd>{p.basic.age}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</dt><dd>{p.basic.location || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Occupation</dt><dd>{p.basic.occupation}</dd></div>
              </dl>
            )}
          </Card>

          <Card className="p-6 border-white/5 space-y-4">
            <h2 className="font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-400" /> Education</h2>
            {editing ? (
              <div className="space-y-3">
                <input className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" value={p.basic.education} onChange={(e) => setDraft({ ...draft!, basic: { ...draft!.basic, education: e.target.value } })} />
                <input className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" value={p.basic.school} onChange={(e) => setDraft({ ...draft!, basic: { ...draft!.basic, school: e.target.value } })} placeholder="School" />
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-500">Degree</dt><dd>{p.basic.education}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">School</dt><dd>{p.basic.school || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Grad year</dt><dd>{p.basic.gradYear || '—'}</dd></div>
              </dl>
            )}
          </Card>

          <Card className="p-6 border-white/5 space-y-4 md:col-span-2">
            <h2 className="font-bold flex items-center gap-2"><Target className="w-5 h-5 text-pink-400" /> Career goals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-neutral-500 block mb-1">Target role</span><Badge color="indigo">{p.goals.career}</Badge></div>
              <div><span className="text-neutral-500 block mb-1">Salary goal</span><span className="font-bold">{p.goals.salary}</span></div>
              <div><span className="text-neutral-500 block mb-1">Dream company</span><span className="font-bold">{p.goals.dreamCompany || '—'}</span></div>
            </div>
          </Card>

          <Card className="p-6 border-white/5 space-y-4 md:col-span-2">
            <h2 className="font-bold flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-emerald-400" /> Skills</h2>
            <div>
              <p className="text-xs text-neutral-500 uppercase mb-2">Known</p>
              <div className="flex flex-wrap gap-2">
                {p.skills.known.map((s) => (
                  <Badge key={s.name} color="emerald">{s.name}</Badge>
                ))}
                {!p.skills.known.length && <span className="text-neutral-500 text-sm">None yet</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase mb-2">Learning</p>
              <div className="flex flex-wrap gap-2">
                {p.skills.learning.map((s) => (
                  <Badge key={s.name} color="indigo">{s.name}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 border-white/5 md:col-span-2 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm"><Github className="w-4 h-4" /> {p.experience.github || 'No GitHub linked'}</div>
            <div className="text-sm text-neutral-400">Projects: <strong className="text-white">{p.experience.projects}</strong></div>
            <div className="text-sm text-neutral-400">Internship: <strong className="text-white">{p.experience.internship}</strong></div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/roadmap')}>View roadmap</Button>
          <Button variant="secondary" onClick={() => navigate('/starm')}>Open StarM AI</Button>
        </div>
      </div>
    </AppShell>
  );
}
