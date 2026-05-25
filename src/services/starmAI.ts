/**
 * Optional LLM enhancement for StarM.
 * Set VITE_OPENAI_API_KEY in .env for richer explanations (falls back to templates).
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

export async function enhanceWithLLM(system: string, user: string): Promise<string | null> {
  if (!OPENAI_KEY?.trim()) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export const STARM_SYSTEM_PROMPT = `You are StarM AI, an elite career coach for engineers. Be clear, encouraging, and precise. Use short paragraphs and bullet points when helpful. Tie answers to the user's career goal and skill context.`;
