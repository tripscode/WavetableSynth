const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Groq retires models on a schedule (llama-3.3-70b-versatile left the free
// tier on 2026-08-16): https://console.groq.com/docs/deprecations
// Set the GROQ_MODEL environment variable to switch models without a deploy.
export const DEFAULT_MODEL = 'openai/gpt-oss-120b';

/**
 * Thin client for Groq's OpenAI-compatible chat completions API. To switch
 * AI providers, write another class with the same complete() method and
 * use it in netlify/functions/generate-patch.js.
 */
export class GroqClient {
  #apiKey;
  #model;
  #fetch;

  constructor({ apiKey, model = DEFAULT_MODEL, fetchImpl = (...args) => globalThis.fetch(...args) }) {
    if (!apiKey) throw new Error('GroqClient: apiKey is required');
    this.#apiKey = apiKey;
    this.#model = model;
    this.#fetch = fetchImpl;
  }

  /**
   * Send one system + user message pair and return the model's reply, which
   * JSON mode guarantees is a JSON object (the prompt must ask for JSON).
   * @throws {Error} on a non-2xx response, including Groq's error message
   */
  async complete({ system, user, maxTokens = 2048, temperature = 0.7 }) {
    const res = await this.#fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.#apiKey}`,
      },
      body: JSON.stringify({
        model: this.#model,
        // gpt-oss models think before answering, and those reasoning tokens
        // count against this limit; low effort leaves room for the answer.
        max_completion_tokens: maxTokens,
        reasoning_effort: 'low',
        include_reasoning: false,
        temperature,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Groq responded ${res.status}${await errorDetail(res)}`);

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}

// Groq errors look like { error: { message, code } }; surface the message so
// failures (a retired model, a bad key, rate limits) are diagnosable.
async function errorDetail(res) {
  try {
    const { error } = await res.json();
    return error?.message ? `: ${error.message}` : '';
  } catch {
    return '';
  }
}
