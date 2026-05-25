import { ProfileService } from '../services/profileService';

export async function getPostAuthPath(userId: string): Promise<string> {
  const profile = await ProfileService.getProfile(userId);
  if (!profile || !profile.isComplete) return '/onboarding';
  return '/dashboard';
}

export function getOAuthRedirectUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/auth/callback`;
}
