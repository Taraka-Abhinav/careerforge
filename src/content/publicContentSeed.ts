export type SeedResourceType = 'career' | 'skill';

export interface PublicContentSeed {
  resourceType: SeedResourceType;
  slug: string;
  title: string;
  summary: string;
  metadata: {
    sections?: { title: string; body: string }[];
    relatedSkills?: string[];
    careerTrack?: string;
  };
  isPublished: boolean;
}

function careerSeed(
  slug: string,
  title: string,
  summary: string,
  relatedSkills: string[],
  careerTrack: string
): PublicContentSeed {
  return {
    resourceType: 'career',
    slug,
    title,
    summary,
    metadata: {
      careerTrack,
      relatedSkills,
      sections: [
        {
          title: 'What you do',
          body: `${title.replace(' Roadmap', '')} roles build, ship, and improve software that users depend on. You own problem solving, architecture trade-offs, and reliable delivery.`,
        },
        {
          title: 'Core skills to master',
          body: 'Data structures, system design, clean coding, testing, and real project delivery. Employers want evidence of impact, not just certificates.',
        },
        {
          title: 'Hiring signals',
          body: 'Portfolio projects, measurable outcomes, strong fundamentals, and consistent learning streaks. Show real-world decisions and trade-offs.',
        },
      ],
    },
    isPublished: true,
  };
}

function skillSeed(
  slug: string,
  title: string,
  summary: string,
  relatedSkills: string[]
): PublicContentSeed {
  return {
    resourceType: 'skill',
    slug,
    title,
    summary,
    metadata: {
      relatedSkills,
      sections: [
        {
          title: 'Why it matters',
          body: `${title} appears in modern product work, interviews, and production systems. It is a high-leverage skill for career growth.`,
        },
        {
          title: 'Key concepts',
          body: 'Learn the core mental models, failure modes, and trade-offs. Strong fundamentals beat copy-paste coding every time.',
        },
        {
          title: 'Projects to build',
          body: 'Ship a focused project that proves mastery: a real workflow, deployed demo, or measurable outcome you can explain in interviews.',
        },
      ],
    },
    isPublished: true,
  };
}

export const PUBLIC_CONTENT_SEED: PublicContentSeed[] = [
  careerSeed(
    'software-engineer',
    'Software Engineer Roadmap',
    'A complete software engineer roadmap covering foundations, backend, frontend, and system design with real projects.',
    ['JavaScript', 'Python', 'System Design', 'SQL', 'Git', 'Testing'],
    'web'
  ),
  careerSeed(
    'fullstack',
    'Full Stack Developer Roadmap',
    'Become a full stack developer with a roadmap for frontend, backend, databases, and scalable delivery.',
    ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs', 'Docker'],
    'web'
  ),
  careerSeed(
    'frontend',
    'Frontend Engineer Roadmap',
    'A focused frontend engineer roadmap for UI architecture, performance, and product-ready interfaces.',
    ['React', 'TypeScript', 'Web Accessibility', 'CSS', 'Vite', 'Testing'],
    'web'
  ),
  careerSeed(
    'backend',
    'Backend Engineer Roadmap',
    'A backend engineer roadmap centered on APIs, databases, infrastructure, and scalability.',
    ['Node.js', 'PostgreSQL', 'Redis', 'System Design', 'OAuth', 'Docker'],
    'backend'
  ),
  careerSeed(
    'ai-engineer',
    'AI Engineer Roadmap',
    'An AI engineer roadmap for ML systems, LLM workflows, and production-grade AI delivery.',
    ['Python', 'Machine Learning', 'MLOps', 'SQL', 'Docker', 'System Design'],
    'ai'
  ),
  careerSeed(
    'ml-engineer',
    'Machine Learning Engineer Roadmap',
    'A machine learning engineer roadmap covering model training, deployment, and MLOps pipelines.',
    ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'MLOps', 'Data Modeling'],
    'ai'
  ),
  careerSeed(
    'data-scientist',
    'Data Scientist Roadmap',
    'A data scientist roadmap focused on statistics, experimentation, and storytelling with data.',
    ['Python', 'Statistics', 'Pandas', 'Data Visualization', 'SQL', 'Machine Learning'],
    'data'
  ),
  careerSeed(
    'data-engineer',
    'Data Engineer Roadmap',
    'A data engineer roadmap for pipelines, warehouses, and reliable analytics infrastructure.',
    ['SQL', 'Apache Spark', 'Airflow', 'Data Modeling', 'Python', 'Data Warehousing'],
    'data'
  ),
  careerSeed(
    'devops',
    'DevOps Engineer Roadmap',
    'A DevOps engineer roadmap for CI/CD, infrastructure, and reliability engineering.',
    ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Monitoring', 'Linux'],
    'devops'
  ),
  careerSeed(
    'cloud',
    'Cloud Engineer Roadmap',
    'A cloud engineer roadmap for AWS/GCP/Azure architecture, cost, and platform reliability.',
    ['AWS', 'Azure', 'Google Cloud', 'Terraform', 'Kubernetes', 'Linux'],
    'devops'
  ),
  careerSeed(
    'security',
    'Cybersecurity Engineer Roadmap',
    'A cybersecurity engineer roadmap focused on secure design, AppSec, and threat modeling.',
    ['Cybersecurity', 'Network Security', 'OWASP', 'Secure Coding', 'SIEM', 'Cryptography'],
    'security'
  ),
  careerSeed(
    'product',
    'Product Manager (Tech) Roadmap',
    'A technical product manager roadmap covering strategy, metrics, and execution with engineering teams.',
    ['System Design', 'Agile', 'Technical Writing', 'SQL', 'Design Patterns', 'Git'],
    'product'
  ),
  skillSeed(
    'python',
    'Python',
    'Python is the default language for automation, data, and backend systems. Master it to unlock high-demand roles.',
    ['SQL', 'Pandas', 'Machine Learning', 'FastAPI', 'Docker', 'Git']
  ),
  skillSeed(
    'javascript',
    'JavaScript',
    'JavaScript powers the web. Learn it for frontend, backend, and full stack engineering roles.',
    ['TypeScript', 'React', 'Node.js', 'HTML', 'CSS', 'REST APIs']
  ),
  skillSeed(
    'typescript',
    'TypeScript',
    'TypeScript adds safety and scale to JavaScript codebases. It is a hiring filter for modern web teams.',
    ['JavaScript', 'React', 'Node.js', 'Testing', 'Design Patterns', 'System Design']
  ),
  skillSeed(
    'react',
    'React',
    'React is the dominant UI library for modern product engineering. It is essential for frontend and full stack roles.',
    ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux', 'Vite']
  ),
  skillSeed(
    'sql',
    'SQL',
    'SQL is the language of data. It powers analytics, backend systems, and product experimentation.',
    ['PostgreSQL', 'Data Modeling', 'Data Warehousing', 'Python', 'ETL', 'Data Visualization']
  ),
  skillSeed(
    'machine-learning',
    'Machine Learning',
    'Machine learning enables predictive systems, recommendations, and automation. It is core for AI roles.',
    ['Python', 'Statistics', 'PyTorch', 'TensorFlow', 'MLOps', 'Data Engineering']
  ),
  skillSeed(
    'aws',
    'AWS',
    'AWS skills unlock cloud engineering and DevOps roles. Learn architecture, cost, and reliability.',
    ['Docker', 'Kubernetes', 'Terraform', 'Linux', 'Monitoring', 'Security']
  ),
  skillSeed(
    'docker',
    'Docker',
    'Docker is the standard for shipping apps in containers. It is required for DevOps and backend roles.',
    ['Kubernetes', 'CI/CD', 'Linux', 'AWS', 'Nginx', 'Microservices']
  ),
  skillSeed(
    'kubernetes',
    'Kubernetes',
    'Kubernetes orchestrates containerized apps at scale. It is a top skill for cloud and DevOps engineers.',
    ['Docker', 'AWS', 'Terraform', 'Helm', 'Monitoring', 'Linux']
  ),
  skillSeed(
    'system-design',
    'System Design',
    'System design shows you can build reliable, scalable systems. It is a must-have for senior roles.',
    ['Microservices', 'Redis', 'PostgreSQL', 'Kafka', 'Distributed Systems', 'Design Patterns']
  ),
  skillSeed(
    'node-js',
    'Node.js',
    'Node.js enables backend and full stack development using JavaScript. It is popular in startups and enterprise.',
    ['JavaScript', 'TypeScript', 'Express', 'PostgreSQL', 'REST APIs', 'Docker']
  ),
  skillSeed(
    'postgresql',
    'PostgreSQL',
    'PostgreSQL is the most trusted open-source relational database. It is critical for backend reliability.',
    ['SQL', 'Data Modeling', 'REST APIs', 'System Design', 'MySQL', 'Redis']
  ),
  skillSeed(
    'data-visualization',
    'Data Visualization',
    'Data visualization helps teams communicate insights clearly. It is essential for data and product teams.',
    ['Python', 'Pandas', 'SQL', 'Statistics', 'NumPy', 'Machine Learning']
  ),
  skillSeed(
    'cybersecurity',
    'Cybersecurity',
    'Cybersecurity protects products, users, and infrastructure. Demand is growing across every industry.',
    ['Network Security', 'OWASP', 'Secure Coding', 'SIEM', 'Cryptography', 'Zero Trust']
  ),
];

export function getSeedResource(type: SeedResourceType, slug: string): PublicContentSeed | null {
  return PUBLIC_CONTENT_SEED.find((item) => item.resourceType === type && item.slug === slug) || null;
}
