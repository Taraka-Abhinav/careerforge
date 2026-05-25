import React from 'react';

/** Lightweight markdown-ish rendering for StarM notes (bold, inline code, fenced blocks). */
export function RichNoteText({ text }: { text: string }) {
  const blocks = text.split(/```([\s\S]*?)```/g);

  return (
    <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
      {blocks.map((block, i) => {
        if (i % 2 === 1) {
          return (
            <pre
              key={`code-${i}`}
              className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 text-emerald-100/90 font-mono text-xs overflow-x-auto"
            >
              {block.trim()}
            </pre>
          );
        }
        return (
          <div key={`p-${i}`} className="space-y-3">
            {block.split(/\n\n+/).filter(Boolean).map((para, j) => (
              <p key={j} className="whitespace-pre-wrap">
                {para.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, k) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={k} className="text-white font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                      <code key={k} className="px-1.5 py-0.5 rounded bg-neutral-800 text-indigo-300 font-mono text-xs">
                        {part.slice(1, -1)}
                      </code>
                    );
                  }
                  return <span key={k}>{part}</span>;
                })}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
