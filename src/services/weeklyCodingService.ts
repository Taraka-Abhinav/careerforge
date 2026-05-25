import { getCareerTrack } from '../config/careers';
import { ChallengeService } from './challengeService';
import type { ChallengeRecord, UserProfile } from '../types';

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getWeekKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getWeeklyProblems(profile: UserProfile): ChallengeRecord[] {
  const library = ChallengeService.getArenaLibrary();
  const week = getWeekKey();
  const track = getCareerTrack(profile.goals.career);
  const seed = hashSeed(`${profile.goals.career}-${track}-${week}`);
  return seededShuffle(library, seed);
}
