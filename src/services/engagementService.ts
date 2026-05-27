import { supabase, isSupabaseConfigured } from '../supabase/client';

export type EngagementEventType =
  | 'app_open'
  | 'lesson_completed'
  | 'quiz_completed'
  | 'challenge_completed'
  | 'assessment_completed'
  | 'project_completed'
  | 'milestone_completed'
  | 'resource_opened'
  | 'learning_time';

function todayKey(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

function localEventsKey(userId: string): string {
  return `activity_events_${userId}`;
}

function appendLocalEvent(
  userId: string,
  eventType: EngagementEventType,
  metadata: Record<string, unknown>,
  durationSeconds: number
) {
  try {
    const key = localEventsKey(userId);
    const raw = localStorage.getItem(key);
    const events = raw ? JSON.parse(raw) as unknown[] : [];
    events.unshift({
      eventType,
      eventDate: todayKey(),
      durationSeconds,
      metadata,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(events.slice(0, 250)));
  } catch {
    /* local analytics should never block product flows */
  }
}

export const EngagementService = {
  async trackEvent(
    userId: string,
    eventType: EngagementEventType,
    metadata: Record<string, unknown> = {},
    durationSeconds = 0
  ): Promise<void> {
    appendLocalEvent(userId, eventType, metadata, durationSeconds);

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('activity_events').insert({
        user_id: userId,
        event_type: eventType,
        event_date: todayKey(),
        duration_seconds: Math.max(0, Math.round(durationSeconds)),
        metadata,
      });
    } catch (error) {
      console.warn('activity event tracking failed', error);
    }
  },

  async trackActiveDay(userId: string): Promise<void> {
    const key = `activity_open_${userId}_${todayKey()}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    await this.trackEvent(userId, 'app_open');
  },

  getLocalEvents(userId: string): {
    eventType: string;
    eventDate: string;
    durationSeconds: number;
    metadata?: Record<string, unknown>;
    createdAt: string;
  }[] {
    try {
      const raw = localStorage.getItem(localEventsKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};
