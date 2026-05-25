import { supabase, isSupabaseConfigured } from '../supabase/client';

export const HACKATHON_EVENT = {
  id: 'careerforge-2026-spring',
  name: 'CareerForge Hackathon — Spring 2026',
  tagline: 'Build. Ship. Get hired.',
  theme: 'AI for Real Students',
  startDate: '2026-06-01',
  endDate: '2026-06-03',
  registrationDeadline: '2026-05-25',
  maxTeams: 500,
  prizes: [
    { place: 'Grand Prize', reward: '$5,000 + mentor loop + featured profile', count: 1 },
    { place: 'Track Winners', reward: '$1,000 per track + swag kit', count: 6 },
    { place: 'Best Student Newcomer', reward: '$500 + internship intros', count: 3 },
  ],
  tracks: ['AI/ML', 'Web3', 'Full Stack', 'DevOps', 'Cybersecurity', 'Open Innovation'] as const,
  schedule: [
    { day: 'Day 0 — May 25', items: ['Registration closes 11:59 PM UTC', 'Team validation emails sent'] },
    { day: 'Day 1 — Jun 1', items: ['Opening ceremony (livestream)', 'Hacking begins — theme revealed', 'Office hours with mentors'] },
    { day: 'Day 2 — Jun 2', items: ['24h checkpoint — submit WIP demo URL', 'Workshops: pitching & deployment'] },
    { day: 'Day 3 — Jun 3', items: ['Code freeze 10:00 UTC', 'Final submissions', 'Judging & awards livestream'] },
  ],
  rules: [
    'All code must be written during the hackathon window (Jun 1–3).',
    'Teams of 1–4; at least one member must be a registered CareerForge student.',
    'Submit: GitHub repo, README, 3-min demo video, and deployment link.',
    'AI tools allowed — document what you used in README.',
    'No plagiarism; judges may request live code walkthrough.',
  ],
};

export type HackathonTrack = (typeof HACKATHON_EVENT.tracks)[number];

export interface HackathonRegistration {
  id: string;
  teamName: string;
  track: HackathonTrack;
  mode: 'solo' | 'team';
  teammateEmails?: string;
  projectTitle?: string;
  status: string;
  registeredAt: string;
}

const localKey = (userId: string) => `hackathon_reg_${userId}`;

export const HackathonService = {
  async getRegistration(userId: string): Promise<HackathonRegistration | null> {
    if (!isSupabaseConfigured) {
      const raw = localStorage.getItem(localKey(userId));
      return raw ? JSON.parse(raw) : null;
    }
    const { data } = await supabase
      .from('hackathon_registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', HACKATHON_EVENT.id)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      teamName: data.team_name,
      track: data.track as HackathonTrack,
      mode: data.mode as 'solo' | 'team',
      teammateEmails: data.teammate_emails,
      projectTitle: data.project_title,
      status: data.status,
      registeredAt: data.registered_at,
    };
  },

  async register(
    userId: string,
    payload: {
      teamName: string;
      track: HackathonTrack;
      mode: 'solo' | 'team';
      teammateEmails?: string;
      projectTitle?: string;
    }
  ): Promise<{ ok: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      localStorage.setItem(
        localKey(userId),
        JSON.stringify({
          id: 'local',
          ...payload,
          status: 'registered',
          registeredAt: new Date().toISOString(),
        })
      );
      return { ok: true };
    }
    const { error } = await supabase.from('hackathon_registrations').upsert({
      user_id: userId,
      event_id: HACKATHON_EVENT.id,
      team_name: payload.teamName,
      track: payload.track,
      mode: payload.mode,
      teammate_emails: payload.teammateEmails || null,
      project_title: payload.projectTitle || null,
      status: 'registered',
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },

  async getStats(): Promise<{ registered: number }> {
    if (!isSupabaseConfigured) return { registered: 128 };
    const { count } = await supabase
      .from('hackathon_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', HACKATHON_EVENT.id);
    return { registered: count || 0 };
  },
};
