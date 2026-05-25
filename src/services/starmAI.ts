/**
 * Optional LLM enhancement for StarM.
 * This calls a serverless API so secrets are never exposed in the browser.
 */

const STARM_API_ENDPOINT = '/api/starm';

export async function enhanceWithLLM(system: string, user: string): Promise<string | null> {
  try {
    const res = await fetch(STARM_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system,
        user,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.content === 'string' ? data.content.trim() : null;
  } catch {
    return null;
  }
}

export const STARM_SYSTEM_PROMPT = `You are StarM AI, an elite career coach for engineers. Be clear, encouraging, and precise. Use short paragraphs and bullet points when helpful. Tie answers to the user's career goal and skill context.`;
