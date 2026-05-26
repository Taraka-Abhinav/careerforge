import {
  FEATURE_GATES,
  PLAN_RANK,
  SUBSCRIPTION_PLANS,
  getPlan,
  type FeatureKey,
  type PlanId,
  type SubscriptionPlan,
} from '../config/subscriptionPlans';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface UserSubscription {
  planId: PlanId;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  plan: SubscriptionPlan;
  developmentUnlocked: boolean;
}

const DEV_UNLOCKED =
  import.meta.env.DEV ||
  import.meta.env.VITE_UNLOCK_PREMIUM === 'true' ||
  import.meta.env.VITE_ENABLE_DEV_GATES === 'true';

function normalizePlanId(planId?: string | null): PlanId {
  if (planId === 'pro' || planId === 'professional') return planId;
  return 'free';
}

export const SubscriptionService = {
  plans: SUBSCRIPTION_PLANS,

  isDevelopmentUnlocked(): boolean {
    return DEV_UNLOCKED;
  },

  async getSubscription(userId: string): Promise<UserSubscription> {
    if (!isSupabaseConfigured) {
      return {
        planId: 'free',
        status: 'active',
        plan: getPlan('free'),
        developmentUnlocked: DEV_UNLOCKED,
      };
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return {
        planId: 'free',
        status: 'active',
        plan: getPlan('free'),
        developmentUnlocked: DEV_UNLOCKED,
      };
    }

    const planId = normalizePlanId(data.plan_id);
    return {
      planId,
      status: (data.status as UserSubscription['status']) || 'active',
      plan: getPlan(planId),
      developmentUnlocked: DEV_UNLOCKED,
    };
  },

  async canUseFeature(userId: string, featureKey: FeatureKey): Promise<boolean> {
    if (DEV_UNLOCKED) return true;
    const subscription = await this.getSubscription(userId);
    if (subscription.status !== 'active' && subscription.status !== 'trialing') return false;
    const requiredPlan = FEATURE_GATES[featureKey] || 'free';
    return PLAN_RANK[subscription.planId] >= PLAN_RANK[requiredPlan];
  },

  async trackFeatureUsage(userId: string, featureKey: FeatureKey): Promise<void> {
    if (!isSupabaseConfigured) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('feature_usage')
      .select('used_count')
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
      .eq('usage_date', today)
      .maybeSingle();

    await supabase.from('feature_usage').upsert({
      user_id: userId,
      feature_key: featureKey,
      usage_date: today,
      used_count: (data?.used_count || 0) + 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,feature_key,usage_date' });
  },
};
