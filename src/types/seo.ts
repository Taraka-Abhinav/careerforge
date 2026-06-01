export interface SEORoadmapPage {
  slug: string;
  title: string;
  metaDescription: string;
  introduction: {
    whatIsIt: string;
    whyItMatters: string;
    futureScope: string;
  };
  roadmapSteps: {
    phase: 'Beginner' | 'Intermediate' | 'Advanced' | 'Projects' | 'Industry Readiness';
    title: string;
    description: string;
    recommendedOrder: number;
  }[];
  requiredSkills: {
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  recommendedLearningOrder: string[];
  projectIdeas: {
    title: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    architectureHint: string;
  }[];
  industryTools: string[];
  salaryInfo: {
    indiaRange: { fresher: string; experienced: string };
    globalRange: { fresher: string; experienced: string };
  };
  careerOpportunities: string[];
  faqs: { question: string; answer: string }[];
  commonMistakes: string[];
  tipsForSuccess: string[];
  curatedResources: { title: string; url: string; type: string }[];
}
