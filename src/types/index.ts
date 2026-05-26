export interface UserBasicProfile {
  name: string;
  age: number;
  location: string;
  education: string;
  school: string;
  gradYear: string;
  occupation: string;
}

export interface UserCareerGoals {
  career: string;
  salary: string;
  dreamCompany: string;
  workType: string;
}

export type SkillStatus = 'Locked' | 'Learning' | 'Practicing' | 'Assessing' | 'Mastered';
export type ModuleType = 'lesson' | 'practice' | 'quiz' | 'assessment' | 'project';
export type MissionType = 'lesson' | 'practice' | 'quiz' | 'challenge';

export interface SkillItem {
  id?: string;
  name: string;
  level?: string;      // "Beginner", "Intermediate", "Advanced"
  priority?: string;   // "Must Learn", "Interested", "Maybe Later"
  status?: SkillStatus;
}

export interface SkillInventory {
  known: SkillItem[];
  learning: SkillItem[];
}

export interface TimeAllocation {
  hoursPerDay: number;
  hoursPerWeek: number;
  schedule: string;
  weekend: boolean;
}

export interface PersonalityMatrix {
  learningSpeed: 'Fast' | 'Normal' | 'Steady';
  preference: 'Practical' | 'Theoretical';
  team: 'Solo' | 'Team';
  discipline: 'High' | 'Medium' | 'Flexible';
}

export interface GoalCommitment {
  timeline: string;
  urgency: string;
}

export interface ProjectExperience {
  projects: number;
  hackathons: number;
  github: string;
  internship: string;
}

export interface ProfileIntelligence {
  readinessScore: number;
  learningSpeedScore: number;
  confidenceScore: number;
}

export interface UserProfile {
  isComplete: boolean;
  basic: UserBasicProfile;
  goals: UserCareerGoals;
  skills: SkillInventory;
  learningStyle: string[];
  time: TimeAllocation;
  personality: PersonalityMatrix;
  commitment: GoalCommitment;
  experience: ProjectExperience;
  analysis: ProfileIntelligence;
}

export interface ProgressRecord {
  userId: string;
  xp: number;
  level: number;
  completedTasks: string[];
  completedGoals: string[];
  completedChallenges: string[];
}

export interface RoadmapNode {
  id: string;
  type: 'skill' | 'resource' | 'project';
  title: string;
  diff?: string;
  format?: string;
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  weekStart?: number;
  weekEnd?: number;
  studyNote?: string;
  items: RoadmapNode[];
  locked?: boolean;
}

export type XPSourceType =
  | 'lesson'
  | 'quiz'
  | 'assessment'
  | 'challenge'
  | 'project'
  | 'practice'
  | 'milestone'
  | 'mission'
  | 'goal'
  | 'module';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface ChallengeRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  xpReward: number;
  status: string;
  starterCode?: string;
  testCases?: { input: Record<string, unknown>; expected: unknown }[];
  invoke?: string;
  assignedDate?: string;
  personalizedReason?: string;
}

export interface DailyChallenge {
  id: string;
  type: string;
  title: string;
  diff: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  xp: number;
}

export const INITIAL_BASELINE_PROFILE: UserProfile = {
  isComplete: false,
  basic: { name: '', age: 24, location: '', education: 'B.S. Computer Science', school: '', gradYear: '', occupation: 'Student' },
  goals: { career: 'AI Engineer', salary: '$120,000', dreamCompany: '', workType: 'Remote' },
  skills: { known: [], learning: [] },
  learningStyle: [],
  time: { hoursPerDay: 4, hoursPerWeek: 20, schedule: 'Flexible', weekend: true },
  personality: { learningSpeed: 'Fast', preference: 'Practical', team: 'Solo', discipline: 'High' },
  commitment: { timeline: '6 Months', urgency: 'Very Serious' },
  experience: { projects: 0, hackathons: 0, github: '', internship: 'None' },
  analysis: { readinessScore: 0, learningSpeedScore: 80, confidenceScore: 60 }
};

export interface LearningModule {
  id: string;
  skillId: string;
  title: string;
  type: ModuleType;
  content: Record<string, unknown>;
  xpReward: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  sortOrder?: number;
}

export interface Mission {
  id: string;
  title: string;
  type: MissionType;
  isCompleted: boolean;
  xpReward: number;
  targetRef?: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  status: 'active' | 'completed' | 'failed';
  xpReward: number;
  metric?: 'lesson' | 'challenge' | 'milestone';
  targetRef?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  weeklyStreak?: number;
  longestStreak?: number;
  lastWeeklyActive?: string;
}

export { SKILL_TAXONOMY, ALL_SKILLS } from '../config/skillTaxonomy';
export { CAREER_OPTIONS, getCareerTrack } from '../config/careers';
