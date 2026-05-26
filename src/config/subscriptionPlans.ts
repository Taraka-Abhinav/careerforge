export type PlanId = 'free' | 'pro' | 'professional';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  displayPrice: string;
  originalPrice?: string;
  discount?: string;
  features: string[];
}

export type FeatureKey =
  | 'personalized_roadmaps'
  | 'basic_learning'
  | 'daily_quizzes'
  | 'daily_challenges'
  | 'progress_tracking'
  | 'basic_analytics'
  | 'community_features'
  | 'ai_mentor'
  | 'unlimited_quizzes'
  | 'unlimited_challenges'
  | 'personalized_recommendations'
  | 'resume_analysis'
  | 'interview_practice'
  | 'advanced_analytics'
  | 'skill_gap_detection'
  | 'priority_features'
  | 'unlimited_ai_mentor'
  | 'professional_resume_optimization'
  | 'advanced_career_intelligence'
  | 'mock_technical_interviews'
  | 'personalized_weekly_reports'
  | 'premium_assessments'
  | 'portfolio_reviews'
  | 'early_access_features';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'CareerForge Free',
    displayPrice: 'Free Forever',
    features: [
      'Personalized Roadmaps',
      'Basic Learning',
      'Daily Quizzes',
      'Daily Challenges',
      'Progress Tracking',
      'Basic Analytics',
      'Community Features',
    ],
  },
  {
    id: 'pro',
    name: 'CareerForge Pro',
    displayPrice: '₹99/month',
    originalPrice: '₹199/month',
    discount: '50% OFF',
    features: [
      'Everything in Free',
      'AI Mentor',
      'Unlimited Quizzes',
      'Unlimited Challenges',
      'Personalized Recommendations',
      'Resume Analysis',
      'Interview Practice',
      'Advanced Analytics',
      'Skill Gap Detection',
      'Priority Features',
    ],
  },
  {
    id: 'professional',
    name: 'CareerForge Professional',
    displayPrice: '₹210/month',
    originalPrice: '₹350/month',
    discount: '40% OFF',
    features: [
      'Everything in Pro',
      'Unlimited AI Mentor Usage',
      'Professional Resume Optimization',
      'Advanced Career Intelligence',
      'Mock Technical Interviews',
      'Personalized Weekly Reports',
      'Premium Assessments',
      'Portfolio Reviews',
      'Early Access Features',
    ],
  },
];

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  professional: 2,
};

export const FEATURE_GATES: Record<FeatureKey, PlanId> = {
  personalized_roadmaps: 'free',
  basic_learning: 'free',
  daily_quizzes: 'free',
  daily_challenges: 'free',
  progress_tracking: 'free',
  basic_analytics: 'free',
  community_features: 'free',
  ai_mentor: 'pro',
  unlimited_quizzes: 'pro',
  unlimited_challenges: 'pro',
  personalized_recommendations: 'pro',
  resume_analysis: 'pro',
  interview_practice: 'pro',
  advanced_analytics: 'pro',
  skill_gap_detection: 'pro',
  priority_features: 'pro',
  unlimited_ai_mentor: 'professional',
  professional_resume_optimization: 'professional',
  advanced_career_intelligence: 'professional',
  mock_technical_interviews: 'professional',
  personalized_weekly_reports: 'professional',
  premium_assessments: 'professional',
  portfolio_reviews: 'professional',
  early_access_features: 'professional',
};

export function getPlan(planId: PlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || SUBSCRIPTION_PLANS[0];
}
