import type { NoteSection } from '../services/starmService';
import { getLessonContent } from './skillContent';

const DEEP_TOPICS: Record<string, { pillars: string[]; pitfalls: string[]; interview: string[] }> = {
  Python: {
    pillars: ['Interpreted runtime & GIL implications', 'List/dict comprehensions & generators', 'venv, pip, packaging (pyproject)', 'asyncio vs threading for I/O'],
    pitfalls: ['Mutable default arguments', 'Shallow copy of nested lists', 'Import cycles in large repos'],
    interview: ['Explain list vs generator memory', 'When to use dataclasses vs dicts', 'How would you debug a memory leak?'],
  },
  JavaScript: {
    pillars: ['Event loop, microtasks, macrotasks', 'Closures & lexical scope', 'Prototypes vs classes', 'ES modules vs CommonJS'],
    pitfalls: ['== vs ===', 'this binding in callbacks', 'Floating point money math'],
    interview: ['Explain event loop with setTimeout/Promise order', 'Design a debounce function', 'How do you structure a large SPA?'],
  },
  React: {
    pillars: ['Virtual DOM reconciliation', 'Hooks rules & custom hooks', 'State colocation vs global store', 'Server components overview'],
    pitfalls: ['Missing effect dependencies', 'Derived state anti-pattern', 'Re-render storms from context'],
    interview: ['useEffect vs useLayoutEffect', 'Optimize a slow list render', 'Error boundaries — when and why'],
  },
  SQL: {
    pillars: ['Normalization (1NF–3NF)', 'JOIN types & query plans', 'Indexes: B-tree, covering, partial', 'Transactions & isolation levels'],
    pitfalls: ['SELECT * in production', 'N+1 queries from ORMs', 'Implicit casts killing indexes'],
    interview: ['Write query for top N per group', 'Explain EXPLAIN output', 'Design schema for orders + payments'],
  },
  'Machine Learning': {
    pillars: ['Bias–variance tradeoff', 'Train/val/test splits & leakage', 'Feature scaling & encoding', 'Precision/recall vs accuracy'],
    pitfalls: ['Testing on training distribution only', 'P-hacking / peeking at test set', 'Ignoring class imbalance'],
    interview: ['How do you detect overfitting?', 'Explain ROC-AUC intuitively', 'Design A/B test for model rollout'],
  },
  Docker: {
    pillars: ['Images vs containers vs volumes', 'Layer caching in Dockerfile', 'Compose for local multi-service', 'Security: non-root, scan images'],
    pitfalls: ['Huge images from poor layering', 'Storing secrets in ENV', 'Orphan volumes filling disk'],
    interview: ['Multi-stage build benefits', 'How would you debug container OOM?', 'CI pipeline with Docker'],
  },
};

function topicPack(skill: string) {
  return (
    DEEP_TOPICS[skill] || {
      pillars: [
        `Core abstractions of ${skill}`,
        `Industry tooling ecosystem`,
        `Testing & observability patterns`,
        `Performance and scalability basics`,
      ],
      pitfalls: [
        'Skipping fundamentals for tutorials',
        'No hands-on project tying concepts together',
        'Ignoring official documentation',
      ],
      interview: [
        `Explain ${skill} to a non-technical stakeholder in 60 seconds`,
        `Describe a bug you fixed using ${skill}`,
        `What trade-offs does ${skill} introduce?`,
      ],
    }
  );
}

export function getPremiumNoteSections(skill: string, career: string): NoteSection[] {
  const lesson = getLessonContent(skill, career);
  const pack = topicPack(skill);

  return [
    {
      id: 'overview',
      title: 'Executive Summary',
      content: `${lesson.overview}\n\n**Career lens (${career}):** Hiring managers expect you to connect ${skill} to shipped outcomes — latency reduced, revenue protected, users unblocked — not just syntax recall.`,
      keyPoints: lesson.keyTakeaways,
      checkpoint: {
        question: `In one sentence, why is ${skill} on your ${career} roadmap?`,
        answer: `It unlocks the next phase of your track and appears in interviews for ${career} roles.`,
      },
    },
    {
      id: 'pillars',
      title: 'Core Pillars (Deep Dive)',
      content: pack.pillars.map((p, i) => `**${i + 1}. ${p}**\nMaster this before moving to advanced patterns.`).join('\n\n'),
      keyPoints: pack.pillars,
    },
    {
      id: 'theory',
      title: 'Theory & Mental Models',
      content: lesson.theorySections.map((s) => `### ${s.title}\n${s.body}`).join('\n\n'),
      keyPoints: lesson.theorySections.map((s) => s.title),
    },
    {
      id: 'code-lab',
      title: 'Code Lab Walkthrough',
      content: lesson.codeExamples
        .map(
          (e) =>
            `### ${e.title}\n\`\`\`${e.language}\n${e.code}\n\`\`\`\n**Why this matters:** ${e.explanation}\n\n**Try this:** Modify one line, predict output, then run.`
        )
        .join('\n\n'),
      keyPoints: lesson.codeExamples.map((e) => e.title),
    },
    {
      id: 'pitfalls',
      title: 'Production Pitfalls',
      content: `Teams lose weeks to these ${skill} mistakes:\n\n${pack.pitfalls.map((p) => `- **${p}** — document how you would prevent it in code review.`).join('\n')}`,
      keyPoints: pack.pitfalls,
    },
    {
      id: 'patterns',
      title: 'Design Patterns & Architecture',
      content: `**Validate → Process → Respond** appears everywhere in ${skill} systems.\n\n\`\`\`javascript\nfunction handle(input) {\n  if (!input) throw new Error("Invalid");\n  const result = process(input);\n  return { ok: true, data: result };\n}\n\`\`\`\n\nUse this skeleton in practice problems and capstone projects.`,
      keyPoints: ['Separation of concerns', 'Testable pure functions', 'Observable failures (logs/metrics)'],
    },
    {
      id: 'interview',
      title: 'Interview Question Bank',
      content: pack.interview.map((q, i) => `**Q${i + 1}:** ${q}\n**Approach:** Situation → Action → Result (STAR). Mention ${skill} trade-offs.`).join('\n\n'),
      keyPoints: pack.interview,
      checkpoint: { question: 'Pick one question above and outline a 2-minute spoken answer.', answer: 'Use a real or realistic project story with metrics if possible.' },
    },
    {
      id: 'cheatsheet',
      title: 'Quick Reference Cheatsheet',
      content: `| Topic | Remember |\n|-------|----------|\n| Syntax | Official docs beat random blogs |\n| Debug | Reproduce → isolate → fix → test |\n| Ship | Small PRs with tests |\n| ${skill} | ${lesson.keyTakeaways[0]} |`,
      keyPoints: ['Docs first', 'Test edge cases', 'Explain trade-offs aloud'],
    },
    {
      id: 'resources',
      title: 'Curated Resources',
      content: lesson.resources.map((r) => `- **${r.title}** (${r.type})${r.url ? ` — ${r.url}` : ''}`).join('\n'),
      keyPoints: lesson.resources.map((r) => r.title),
    },
    {
      id: 'career',
      title: `Career Playbook — ${career}`,
      content: `**Week 1–2:** Theory + notes + easy problems.\n**Week 3–4:** Practice sandbox + medium problems.\n**Week 5+:** Project module + mock interviews using ${skill} stories.\n\nTarget companies want evidence: GitHub, demo, or write-up.`,
      keyPoints: ['Build one visible artifact', 'Pair notes with Code Arena problems', 'Teach concept to a peer (Feynman)'],
    },
  ];
}
