import { PatchDesigner } from './PatchDesigner.js';

/**
 * Asks the serverless function to design a patch with the AI model.
 * The system prompt and API key live server-side
 * (netlify/functions/generate-patch.js); the browser only sends the text.
 */
export class RemotePatchDesigner extends PatchDesigner {
  #endpoint;
  #fetch;

  constructor(endpoint, fetchImpl = (...args) => globalThis.fetch(...args)) {
    super();
    this.#endpoint = endpoint;
    this.#fetch = fetchImpl;
  }

  async design(prompt) {
    const res = await this.#fetch(this.#endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`Patch API responded ${res.status}`);

    const { params, reasoning } = await res.json();
    if (!params || typeof params !== 'object') throw new Error('Patch API returned no params');
    return { patch: params, name: params.name || null, reasoning: reasoning || null };
  }
}
