export interface SkillCategory {
  category: string;
  skills: string[];
}

export const SKILL_TAXONOMY: SkillCategory[] = [
  {
    category: 'Programming Languages',
    skills: [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
      'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Dart', 'Elixir', 'Haskell', 'Lua',
    ],
  },
  {
    category: 'Web & Frontend',
    skills: [
      'HTML', 'CSS', 'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'TailwindCSS',
      'Webpack', 'Vite', 'Redux', 'GraphQL', 'REST APIs', 'Web Accessibility', 'PWA',
    ],
  },
  {
    category: 'Backend & APIs',
    skills: [
      'Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'NestJS',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'RabbitMQ', 'Kafka',
      'Microservices', 'gRPC', 'OAuth', 'JWT',
    ],
  },
  {
    category: 'AI, ML & Data',
    skills: [
      'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn',
      'Keras', 'NLP', 'Computer Vision', 'LLMs', 'Prompt Engineering', 'RAG',
      'Statistics', 'Probability', 'Pandas', 'NumPy', 'Data Visualization', 'Blender',
      'Feature Engineering', 'MLOps', 'Hugging Face',
    ],
  },
  {
    category: 'Data Engineering',
    skills: [
      'SQL', 'Apache Spark', 'Airflow', 'dbt', 'Snowflake', 'BigQuery', 'ETL',
      'Data Warehousing', 'Data Modeling', 'Databricks',
    ],
  },
  {
    category: 'Cloud & DevOps',
    skills: [
      'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
      'CI/CD', 'GitHub Actions', 'Jenkins', 'Linux', 'Bash', 'Nginx', 'Monitoring',
      'Prometheus', 'Grafana', 'Helm',
    ],
  },
  {
    category: 'Security',
    skills: [
      'Cybersecurity', 'Network Security', 'OWASP', 'Penetration Testing', 'Cryptography',
      'SIEM', 'Zero Trust', 'Secure Coding', 'Burp Suite',
    ],
  },
  {
    category: 'Mobile & Desktop',
    skills: [
      'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Electron',
      'SwiftUI', 'Jetpack Compose',
    ],
  },
  {
    category: 'Systems & Low-Level',
    skills: [
      'Operating Systems', 'Computer Architecture', 'Embedded C', 'RTOS', 'FPGA',
      'Assembly', 'Concurrency', 'Distributed Systems', 'CAD', 'Robotics', 'VHDL', 'Verilog',
    ],
  },
  {
    category: 'Game & Graphics',
    skills: [
      'Unity', 'Unreal Engine', 'Game Design', 'OpenGL', 'Shader Programming', 'Blender',
    ],
  },
  {
    category: 'Blockchain & Web3',
    skills: [
      'Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js', 'DeFi', 'Hardhat',
    ],
  },
  {
    category: 'Tools & Practices',
    skills: [
      'Git', 'GitHub', 'Agile', 'Scrum', 'System Design', 'Design Patterns',
      'Testing', 'Jest', 'Cypress', 'TDD', 'Code Review', 'Technical Writing',
    ],
  },
];

export const ALL_SKILLS = SKILL_TAXONOMY.flatMap((c) => c.skills);
