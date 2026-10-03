// POST /api/generate-patch   { "prompt": "warm ambient pad" }
//   200 → { "reasoning": "...", "params": { "name": ..., "waveform": ..., ..., "fx": { ... } } }
//
// The system prompt lives on the server, so this endpoint only designs
// synth patches and can't be used as a general-purpose AI proxy. The Groq
// API key comes from the GROQ_API_KEY environment variable and never
// reaches the browser.

import { GroqClient } from '../../server/GroqClient.js';
import { SYSTEM_PROMPT, parsePatchReply } from '../../server/patchPrompt.js';

const MAX_PROMPT_LENGTH = 500;

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return json(500, { error: 'API key not configured' });

  let prompt;
  try {
    prompt = JSON.parse(event.body || '{}').prompt;
  } catch {
    return json(400, { error: 'Request body must be JSON' });
  }
  if (typeof prompt !== 'string' || !prompt.trim()) return json(400, { error: 'Missing prompt' });

  try {
    const reply = await new GroqClient({ apiKey }).complete({
      system: SYSTEM_PROMPT,
      user: prompt.trim().slice(0, MAX_PROMPT_LENGTH),
    });
    return json(200, parsePatchReply(reply));
  } catch (err) {
    return json(502, { error: err.message });
  }
}
