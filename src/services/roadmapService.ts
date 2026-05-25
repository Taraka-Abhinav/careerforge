import type { RoadmapPhase } from '../types';

const ROADMAP_LIBRARY: Record<string, RoadmapPhase[]> = {
  "AI Engineer": [
    { 
      phase: "Phase 1: Foundations & Python AI Mastery", 
      duration: "Weeks 1-4", 
      items: [
        { id: "ai-f1", type: "skill", title: "Python Advanced Concepts", diff: "Medium" }, 
        { id: "ai-f2", type: "resource", title: "CS50 Introduction to Artificial Intelligence", format: "Course" },
        { id: "ai-f3", type: "project", title: "Build a Search & Optimization Algorithm", format: "Project" }
      ] 
    },
    { 
      phase: "Phase 2: Machine Learning Frameworks", 
      duration: "Weeks 5-10", 
      items: [
        { id: "ai-ml1", type: "skill", title: "Scikit-Learn, Pandas & Data Manipulation", diff: "Hard" }, 
        { id: "ai-ml2", type: "project", title: "Automated House Price Predictor Engine", format: "Project" }
      ] 
    },
    { 
      phase: "Phase 3: Deep Learning & Neural Architectures", 
      duration: "Weeks 11-16", 
      items: [
        { id: "ai-dl1", type: "skill", title: "PyTorch Deep Learning Foundations", diff: "Hard" },
        { id: "ai-dl2", type: "skill", title: "Transformer Architectures & NLP", diff: "Expert" }
      ] 
    }
  ],
  "Software Engineer": [
    { 
      phase: "Phase 1: Computer Science & Data Structures", 
      duration: "Weeks 1-4", 
      items: [
        { id: "se-f1", type: "skill", title: "Data Structures & Algorithms", diff: "Medium" }, 
        { id: "se-f2", type: "resource", title: "Systematic Algorithmic Problem Solving", format: "Course" },
        { id: "se-f3", type: "project", title: "Create custom Heap and Graph structures", format: "Project" }
      ] 
    },
    { 
      phase: "Phase 2: Advanced Web Architectures", 
      duration: "Weeks 5-10", 
      items: [
        { id: "se-web1", type: "skill", title: "TypeScript & React State Patterns", diff: "Medium" }, 
        { id: "se-web2", type: "project", title: "Collaborative Realtime Canvas Board", format: "Project" }
      ] 
    },
    { 
      phase: "Phase 3: System Design & Scalability", 
      duration: "Weeks 11-16", 
      items: [
        { id: "se-sys1", type: "skill", title: "Database Sharding & Caching Protocols", diff: "Hard" },
        { id: "se-sys2", type: "skill", title: "Docker & CI/CD Pipeline Automation", diff: "Hard" }
      ] 
    }
  ],
  "Data Scientist": [
    {
      phase: "Phase 1: Advanced Statistical Analysis",
      duration: "Weeks 1-4",
      items: [
        { id: "ds-f1", type: "skill", title: "Linear Algebra & Probability Theory", diff: "Medium" },
        { id: "ds-f2", type: "project", title: "Exploratory Data Analysis Report", format: "Project" }
      ]
    }
  ]
};

const DEFAULT_ECOSYSTEM_PATH: RoadmapPhase[] = [
  { 
    phase: "Phase 1: Developer Foundations", 
    duration: "Weeks 1-4", 
    items: [
      { id: "def-1", type: "skill", title: "Web Basics (HTML/CSS/JS)", diff: "Easy" }, 
      { id: "def-2", type: "resource", title: "Modern Web Roadmap Course", format: "Course" }
    ] 
  },
  { 
    phase: "Phase 2: Advanced Application Scaling", 
    duration: "Weeks 5-10", 
    items: [
      { id: "def-3", type: "skill", title: "Frameworks & State Management", diff: "Medium" }, 
      { id: "def-4", type: "project", title: "E-Commerce Microservices App", format: "Project" }
    ] 
  }
];

export const RoadmapService = {
  generateRoadmap(careerGoal: string): RoadmapPhase[] {
    return ROADMAP_LIBRARY[careerGoal] || DEFAULT_ECOSYSTEM_PATH;
  }
};