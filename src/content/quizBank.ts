import type { QuizQuestion } from '../types';
import { toSkillSlug } from '../utils/slug';

export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestionMeta extends QuizQuestion {
  difficulty: QuizDifficulty;
  skill: string;
}

type QuizTemplate = {
  prompt: (skill: string, career?: string) => string;
  options: (skill: string, career?: string) => string[];
  correctIndex: number;
};

const EASY_TEMPLATES: QuizTemplate[] = [
  {
    prompt: (skill) => `What is ${skill} primarily used for?`,
    options: () => [
      'Building and improving software systems',
      'Cooking recipes in a kitchen',
      'Designing clothes for fashion shows',
      'Fixing hardware with a soldering iron',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `Which statement best fits ${skill}?`,
    options: () => [
      'A tool or skill used in modern engineering work',
      'A social media trend',
      'A type of sports equipment',
      'A music genre',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `Where would you most likely see ${skill} in practice?`,
    options: () => [
      'In product code, data pipelines, or infrastructure',
      'In a grocery store aisle',
      'In a movie script format',
      'In a cooking recipe',
    ],
    correctIndex: 0,
  },
];

const MEDIUM_TEMPLATES: QuizTemplate[] = [
  {
    prompt: (skill) => `When working with ${skill}, which habit prevents most bugs?`,
    options: () => [
      'Validate inputs and test edge cases',
      'Skip tests to move faster',
      'Avoid code reviews',
      'Ship without logging',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `You are adopting ${skill} at work. What is the best first step?`,
    options: () => [
      'Define clear inputs, outputs, and success criteria',
      'Ignore requirements until later',
      'Copy random snippets without understanding',
      'Over-optimize before it works',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `Which choice best reflects good ${skill} practice?`,
    options: () => [
      'Readable code with tests and small iterations',
      'One giant function with no checks',
      'No documentation or comments ever',
      'Optimize before correctness',
    ],
    correctIndex: 0,
  },
];

const HARD_TEMPLATES: QuizTemplate[] = [
  {
    prompt: (skill) => `At scale, which trade-off matters most when using ${skill}?`,
    options: () => [
      'Performance versus reliability',
      'Font size versus color theme',
      'Keyboard layout versus mouse speed',
      'Tab width versus line endings',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill) => `For production ${skill} systems, what risk should you mitigate early?`,
    options: () => [
      'Silent failures and unhandled edge cases',
      'Having too many comments',
      'Naming variables too clearly',
      'Writing tests first',
    ],
    correctIndex: 0,
  },
  {
    prompt: (skill, career) => `Which signal best indicates mature ${skill} usage for a ${career || 'career'} team?`,
    options: () => [
      'Monitoring, tests, and clear ownership',
      'Only local experiments',
      'No staging environment',
      'Avoiding automation',
    ],
    correctIndex: 0,
  },
];

const TEMPLATE_MAP: Record<QuizDifficulty, QuizTemplate[]> = {
  Easy: EASY_TEMPLATES,
  Medium: MEDIUM_TEMPLATES,
  Hard: HARD_TEMPLATES,
};

const SPECIFIC_QUESTIONS: Record<string, Record<QuizDifficulty, QuizQuestion[]>> = {
  CAD: {
    Easy: [
      { id: 'cad-e1', prompt: 'What does CAD stand for in engineering?', options: ['Computer-Aided Design', 'Computer-Architectural Diagram', 'Control-Automated Drafting', 'Coordinate-Aligned Drawing'], correctIndex: 0 },
      { id: 'cad-e2', prompt: 'Which of the following is a primary output of CAD software?', options: ['3D parametric models and 2D engineering drawings', 'Compiled machine executable binary files', 'Stripe payment integration APIs', 'HTML/CSS webpage markup'], correctIndex: 0 }
    ],
    Medium: [
      { id: 'cad-m1', prompt: 'What is the main advantage of parametric modeling in CAD?', options: ['Modifying a dimension automatically updates all related parts', 'It renders models using cloud-based GPU shaders', 'It removes the need for physical materials analysis', 'It automatically compiles logic to digital circuits'], correctIndex: 0 }
    ],
    Hard: [
      { id: 'cad-h1', prompt: 'In product development, why is Finite Element Analysis (FEA) integrated with CAD?', options: ['To simulate physical stress, heat, and strain on CAD parts before manufacturing', 'To optimize the compilation speed of embedded software systems', 'To automatically test user interface responsive design alignment', 'To manage user session tokens and secure database schemas'], correctIndex: 0 }
    ]
  },
  MATLAB: {
    Easy: [
      { id: 'matlab-e1', prompt: 'What is MATLAB primarily optimized for?', options: ['Numerical computation, matrix manipulation, and algorithms', 'Building scalable full-stack web applications', 'Configuring cloud container orchestration layers', 'Parsing markup languages like HTML and CSS'], correctIndex: 0 },
      { id: 'matlab-e2', prompt: 'Which operator is used for matrix multiplication in MATLAB?', options: ['*', '.*', 'x', '^'], correctIndex: 0 }
    ],
    Medium: [
      { id: 'matlab-m1', prompt: 'In MATLAB, what is the difference between * and .* operators?', options: ['* is matrix multiplication, .* is element-by-element multiplication', '* is pointer dereference, .* is object attribute retrieval', '* is scalar addition, .* is vector multiplication', '* is cross product, .* is dot product'], correctIndex: 0 }
    ],
    Hard: [
      { id: 'matlab-h1', prompt: 'Why is MATLAB/Simulink widely used in automotive and aerospace control systems design?', options: ['It supports model-based design, automatic code generation (C/C++), and hardware-in-the-loop (HIL) testing', 'It compiles directly to assembly instructions for 8-bit microcontrollers', 'It integrates with relational databases through an object-relational mapping (ORM) library', 'It has native support for client-side state management in single-page apps'], correctIndex: 0 }
    ]
  },
  Robotics: {
    Easy: [
      { id: 'robotics-e1', prompt: 'What is the study of robot motion without considering forces called?', options: ['Kinematics', 'Kinetics', 'Dynamics', 'Statics'], correctIndex: 0 },
      { id: 'robotics-e2', prompt: 'Which component acts as the "muscles" of a robot, converting energy to physical motion?', options: ['Actuators', 'Sensors', 'Controllers', 'Microcontrollers'], correctIndex: 0 }
    ],
    Medium: [
      { id: 'robotics-m1', prompt: 'What is the purpose of Inverse Kinematics (IK) in robotics?', options: ['To compute required joint angles to place a robotic hand/end-effector at a specific 3D coordinate', 'To calculate the velocity of the center of mass based on actuator torque', 'To reverse the direction of motor rotation in case of collision', 'To filter noise from camera sensor readings using high-pass filters'], correctIndex: 0 }
    ],
    Hard: [
      { id: 'robotics-h1', prompt: 'In autonomous mobile robotics, what does SLAM stand for?', options: ['Simultaneous Localization and Mapping', 'Sensor-Linkage Actuation Matrix', 'System-Level Adaptive Modeling', 'Symmetric Linear Acceleration Metric'], correctIndex: 0 }
    ]
  },
  VHDL: {
    Easy: [
      { id: 'vhdl-e1', prompt: 'What type of language is VHDL?', options: ['Hardware Description Language', 'Procedural Programming Language', 'Functional Web Framework', 'Database Query Language'], correctIndex: 0 },
      { id: 'vhdl-e2', prompt: 'Which VHDL block describes the external interface of a digital circuit (its inputs and outputs)?', options: ['Entity', 'Architecture', 'Package', 'Configuration'], correctIndex: 0 }
    ],
    Medium: [
      { id: 'vhdl-m1', prompt: 'In VHDL, what is the main purpose of a process block?', options: ['To contain sequential statements that model digital behavior over time', 'To allocate dynamic memory on the system heap', 'To configure network communication endpoints', 'To define database transactions'], correctIndex: 0 }
    ],
    Hard: [
      { id: 'vhdl-h1', prompt: 'What is the difference between synthesis and simulation in VHDL?', options: ['Synthesis translates VHDL to a gate-level netlist; simulation verifies logic behavior over time', 'Synthesis compiles VHDL to binary machine code; simulation uploads it to the FPGA', 'Synthesis compiles the code for a web browser; simulation runs it on a virtual machine', 'Synthesis verifies syntax errors; simulation optimizes power consumption'], correctIndex: 0 }
    ]
  },
  Verilog: {
    Easy: [
      { id: 'verilog-e1', prompt: 'What is Verilog primarily used for in electronic engineering?', options: ['Designing and verifying digital integrated circuits (ASICs and FPGAs)', 'Writing scripts to scrape websites', 'Developing multi-threaded video games', 'Performing large-scale statistical data analysis'], correctIndex: 0 },
      { id: 'verilog-e2', prompt: 'Which keyword in Verilog defines a component that can be instantiated?', options: ['module', 'class', 'struct', 'function'], correctIndex: 0 }
    ],
    Medium: [
      { id: 'verilog-m1', prompt: 'In Verilog, what is the difference between blocking (=) and non-blocking (<=) assignments?', options: ['Blocking executes sequentially; non-blocking executes concurrently (typically used for sequential logic)', 'Blocking locks system threads; non-blocking uses callbacks', 'Blocking is for integer math; non-blocking is for floating point math', 'Blocking blocks compiler warnings; non-blocking is for debugging'], correctIndex: 0 }
    ],
    Hard: [
      { id: 'verilog-h1', prompt: 'In Verilog, what does a race condition in simulation usually stem from?', options: ['Improper mixing of blocking and non-blocking assignments in sequential always blocks', 'Exceeding the maximum call stack size in recursive functions', 'Accessing uninitialized memory arrays in the heap', 'Too many concurrent connection requests to the server'], correctIndex: 0 }
    ]
  }
};

export function buildSkillQuestion(skill: string, difficulty: QuizDifficulty, variant: number, career?: string): QuizQuestionMeta {
  const specific = SPECIFIC_QUESTIONS[skill];
  if (specific && specific[difficulty]) {
    const list = specific[difficulty];
    const idx = Math.abs(variant) % list.length;
    return {
      ...list[idx],
      difficulty,
      skill,
    };
  }

  const templates = TEMPLATE_MAP[difficulty];
  const idx = Math.abs(variant) % templates.length;
  const template = templates[idx];
  const slug = toSkillSlug(skill);

  return {
    id: `${difficulty.toLowerCase()}-${slug}-${idx}`,
    prompt: template.prompt(skill, career),
    options: template.options(skill, career),
    correctIndex: template.correctIndex,
    difficulty,
    skill,
  };
}
