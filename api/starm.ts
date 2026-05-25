const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: { method?: string; body?: { system?: string; user?: string } }, res: { status: (code: number) => { json: (payload: unknown) => void } }) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'OpenAI API key not configured' });
    return;
  }

  const system = req.body?.system?.trim();
  const user = req.body?.user?.trim();

  if (!system || !user) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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

    if (!response.ok) {
      res.status(502).json({ error: 'LLM request failed' });
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    res.status(200).json({ content });
  } catch {
    res.status(500).json({ error: 'Failed to reach LLM provider' });
  }
}
