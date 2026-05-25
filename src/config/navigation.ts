import { Home, Compass, Target, BarChart3, Sparkles, User, Trophy, ListChecks } from 'lucide-react';

export const APP_NAV = [
  { path: '/dashboard', label: 'My Matrix', icon: Home },
  { path: '/roadmap', label: 'Live Roadmap', icon: Compass },
  { path: '/starm', label: 'Daily Code', icon: Sparkles },
  { path: '/quizzes', label: 'Quizzes', icon: ListChecks },
  { path: '/challenges', label: 'Code Arena', icon: Target },
  { path: '/hackathon', label: 'Hackathon', icon: Trophy },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

/** @deprecated use APP_NAV */
export const PHASE1_NAV = APP_NAV;
