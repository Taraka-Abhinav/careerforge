import type { SEORoadmapPage } from '../../types/seo';

export const electricalEngineer: SEORoadmapPage = {
  slug: 'electrical-engineer',
  title: 'Electrical Engineer Roadmap (2026)',
  metaDescription: 'Step-by-step Electrical Engineer roadmap with skills, projects, salary insights, tools, and resources to become job-ready in India and globally.',
  introduction: {
    whatIsIt: 'Professional roadmap for becoming a Electrical Engineer with industry-focused skills and projects.',
    whyItMatters: 'Organizations hire professionals who can create measurable impact, improve systems, and solve complex business problems.',
    futureScope: 'Strong demand is expected over the next decade. Common mistake: collecting certificates without building a portfolio of real projects. Key tools include Industry-standard tools and technologies used by professionals..'
  },
  roadmapSteps: [
    { phase: 'Beginner', title: 'Build Core Foundations', description: 'Learn fundamentals, terminology, and basic workflows through guided practice.', recommendedOrder: 1 },
    { phase: 'Intermediate', title: 'Develop Practical Depth', description: 'Work with real tools, version control, and structured problem-solving patterns.', recommendedOrder: 2 },
    { phase: 'Advanced', title: 'Master Production Standards', description: 'Study architecture decisions, performance, security, and maintainability at scale.', recommendedOrder: 3 },
    { phase: 'Projects', title: 'Ship Portfolio Projects', description: 'Create 3 to 5 end-to-end projects demonstrating impact, code quality, and documentation.', recommendedOrder: 4 },
    { phase: 'Industry Readiness', title: 'Prepare for Hiring', description: 'Optimize resume, practice interviews, and align portfolio to role-specific expectations.', recommendedOrder: 5 }
  ],
  requiredSkills: [
    { name: 'Core Fundamentals', description: 'Strong base in the principles required for Electrical Engineer work.', priority: 'high' },
    { name: 'Programming and Automation', description: 'Ability to script, automate tasks, and build maintainable solutions.', priority: 'high' },
    { name: 'Systems Thinking', description: 'Understanding of architecture, trade-offs, and reliability in production.', priority: 'medium' },
    { name: 'Communication', description: 'Clear written and verbal collaboration across teams and stakeholders.', priority: 'medium' },
    { name: 'Domain Specialization', description: 'Hands-on expertise in tools and workflows specific to this career path.', priority: 'high' }
  ],
  recommendedLearningOrder: [
    'Fundamentals',
    'Hands-on Tooling',
    'Production Practices',
    'Portfolio Projects',
    'Interview Preparation'
  ],
  projectIdeas: [
    {
      title: 'Electrical Engineer Starter Project',
      difficulty: 'Beginner',
      description: 'A focused project to demonstrate core concepts, clean implementation, and basic testing.',
      architectureHint: 'Use a simple modular architecture with clear separation of concerns and README documentation.'
    },
    {
      title: 'Electrical Engineer Workflow Automation Project',
      difficulty: 'Intermediate',
      description: 'Build a system that automates a repetitive workflow with metrics and observability.',
      architectureHint: 'Use API-first design, structured logging, and a persistent datastore for activity history.'
    },
    {
      title: 'Electrical Engineer Production-Ready Capstone',
      difficulty: 'Advanced',
      description: 'Design and implement a scalable capstone that reflects real industry constraints.',
      architectureHint: 'Use layered architecture, CI validation, environment-based configs, and deployment automation.'
    }
  ],
  industryTools: ['MATLAB', 'PSCAD', 'ETAP', 'AutoCAD Electrical', 'LabVIEW'],
  salaryInfo: {
    indiaRange: { fresher: 'INR 4 LPA - 10 LPA', experienced: 'INR 12 LPA - 35+ LPA' },
    globalRange: { fresher: 'USD 55,000 - 95,000', experienced: 'USD 110,000 - 220,000+' }
  },
  careerOpportunities: ['Electrical Engineer', 'Power Systems Engineer', 'Control Engineer'],
  faqs: [
    {
      question: 'How long does it take to become job-ready as a Electrical Engineer?',
      answer: 'With consistent weekly effort and project-based learning, most learners can reach entry-level readiness in 6 to 12 months.'
    },
    {
      question: 'Do I need a degree for Electrical Engineer roles?',
      answer: 'A degree can help, but strong projects, practical skills, and interview performance are often the deciding factors.'
    },
    {
      question: 'What should I prioritize first?',
      answer: 'Start with fundamentals and one strong toolchain, then build projects that show measurable outcomes and clear technical decisions.'
    }
  ],
  commonMistakes: [
    'Jumping into advanced topics before building fundamentals.',
    'Completing tutorials without shipping independent projects.',
    'Ignoring documentation, testing, or debugging discipline.',
    'Underestimating communication and collaboration skills.'
  ],
  tipsForSuccess: [
    'Use a weekly learning plan with measurable milestones.',
    'Publish project write-ups explaining architecture trade-offs.',
    'Practice interview-style questions after each major topic.',
    'Track progress with a public portfolio and version control history.'
  ],
  curatedResources: [
    { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', type: 'practice platform' },
    { title: 'Roadmap.sh', url: 'https://roadmap.sh/', type: 'career roadmap' },
    { title: 'Coursera', url: 'https://www.coursera.org/', type: 'structured courses' },
    { title: 'edX', url: 'https://www.edx.org/', type: 'university-backed learning' },
    { title: 'GitHub', url: 'https://github.com/', type: 'portfolio hosting' }
  ]
};

export default electricalEngineer;
