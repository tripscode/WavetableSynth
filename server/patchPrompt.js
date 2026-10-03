// The instructions that turn the language model into a sound designer, and
// the parser for its reply. Parameter ranges come from the same module the
// browser uses, so the model is always told the ranges the knobs accept.

import { FX_KEYS, PARAMS, WAVEFORMS } from '../js/model/params.js';

const waveformChoices = WAVEFORMS.map(w => `"${w.value}"`).join('|');
const paramLines = Object.entries(PARAMS)
  .map(([key, { min, max }]) => `    "${key}": number ${min} to ${max},`)
  .join('\n');
const fxLines = FX_KEYS.map(key => `      "${key}": boolean`).join(',\n');

export const SYSTEM_PROMPT = `You are an expert synthesizer sound designer helping beginners learn synthesis. When a user describes a sound, you will:

1. REASON through what makes that sound in 2-4 beginner-friendly sentences.
2. OUTPUT the parameters as JSON.

Respond ONLY with this exact structure — a JSON object with a "reasoning" string and a "params" object:
{
  "reasoning": "plain english explanation of your sound design choices...",
  "params": {
    "name": "short friendly sound name",
    "waveform": ${waveformChoices},
${paramLines}
    "fx": {
${fxLines}
    }
  }
}

Sound design reference:
- Ambient/pad: long attack 1.5-2.5s, high sustain, long release 3-5s, fatsawtooth, reverb ON, chorus ON
- Dreamy pluck: short attack, fast decay, low sustain, triangle, reverb ON, delay ON
- Deep bass: square or fatsquare, short attack, high sustain, filterCutoff 200-600, filterQ 3-8, no reverb
- Bell: sine, very short attack 0.001, medium decay 0.6-1s, zero sustain, reverb ON, filterCutoff 6000-10000
- Lo-fi keys: triangle, short attack, medium decay, slight chorus, filterCutoff 800-2000, filterQ 4-8, slight distortion
- Lead synth: sawtooth or fatsawtooth, fast attack, chorus ON, filterCutoff 2000-5000, delay optional
- Laser/zap: sawtooth, attack 0.001, decay 0.1, sustain 0, release 0.05, filterCutoff 8000+, no fx
- Strings: fatsawtooth, slow attack 0.4-0.8s, high sustain, long release, chorus ON, reverb ON
- Choir/vocal: fmsine, slow attack, high sustain, chorus ON, reverb ON, filterCutoff 1000-3000
- Organ: fmsine or amsine, medium attack, sustain 0.8-1, slight chorus

Respond ONLY with the JSON object — no markdown, no extra text.`;

/**
 * Extract { reasoning, params } from the model's reply. Tolerates a
 * markdown code fence around the JSON. Values are not range-checked here;
 * the browser validates every value (Patch.merge) before using it.
 *
 * @param {string} text
 * @returns {{ reasoning: string, params: object }}
 * @throws {Error} if the reply isn't JSON or has no params object
 */
export function parsePatchReply(text) {
  const json = text.replace(/```json|```/g, '').trim();
  const { reasoning, params } = JSON.parse(json);
  if (!params || typeof params !== 'object') throw new Error('Model reply has no params object');
  return { reasoning: String(reasoning ?? ''), params };
}
