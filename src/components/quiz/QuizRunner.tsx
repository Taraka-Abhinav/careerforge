import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { QuizQuestion } from '../../types';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  passThreshold: number;
  onSubmit: (answers: Record<string, number>) => void;
  disabled?: boolean;
}

export function QuizRunner({ questions, passThreshold, onSubmit, disabled }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">Pass threshold: {passThreshold}%</p>
      {questions.map((q, idx) => (
        <Card key={q.id} padding="p-5" className="border-white/5">
          <p className="font-bold text-white mb-3">
            {idx + 1}. {q.prompt}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  answers[q.id] === i ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === i}
                  onChange={() => setAnswers({ ...answers, [q.id]: i })}
                  className="accent-indigo-500"
                />
                <span className="text-sm text-neutral-300">{opt}</span>
              </label>
            ))}
          </div>
        </Card>
      ))}
      <Button
        size="lg"
        className="w-full"
        disabled={!allAnswered || disabled}
        onClick={() => onSubmit(answers)}
      >
        Submit Quiz
      </Button>
    </div>
  );
}
