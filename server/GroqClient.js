const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Thin client for Groq's OpenAI-compatible chat completions API. To switch
 * AI providers, write another class with the same complete() method and
 * use it in netlify/functions/generate-patch.js.
 */
export class GroqClient {
  #apiKey;
  #model;
  #fetch;

  constructor({ apiKey, model = 'llama-3.3-70b-versatile', fetchImpl = (...args) => globalThis.fetch(...args) }) {
    if (!apiKey) throw new Error('GroqClient: apiKey is required');
    this.#apiKey = apiKey;
    this.#model = model;
    this.#fetch = fetchImpl;
  }

  /**
   * Send one system + user message pair and return the model's text reply.
   * @throws {Error} on a non-2xx response
   */
  async complete({ system, user, maxTokens = 1000, temperature = 0.7 }) {
    const res = await this.#fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.#apiKey}`,
      },
      body: JSON.stringify({
        model: this.#model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Groq responded ${res.status}`);

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}
