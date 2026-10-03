import { Patch } from '../model/Patch.js';
import { PatchDesigner } from './PatchDesigner.js';

// Hand-made sounds, picked by the first keyword found in the description.
const RECIPES = [
  {
    keywords: ['pad', 'ambient'],
    name: 'Aqua Pad',
    patch: {
      waveform: 'fatsawtooth', attack: 2, decay: 1, sustain: 0.8, release: 4,
      filterCutoff: 1200, reverbDecay: 6, reverbWet: 0.7, chorusDepth: 0.6,
      fx: { reverb: true, chorus: true },
    },
  },
  {
    keywords: ['bass'],
    name: 'Ocean Bass',
    patch: { waveform: 'square', attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.2, filterCutoff: 500, filterQ: 5 },
  },
  {
    keywords: ['pluck', 'string'],
    name: 'Airy Pluck',
    patch: {
      waveform: 'triangle', attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.3,
      filterCutoff: 3500, reverbWet: 0.4, delayTime: 0.3, delayFeedback: 0.3,
      fx: { reverb: true, delay: true },
    },
  },
  {
    keywords: ['bell'],
    name: 'Glass Bell',
    patch: {
      waveform: 'sine', attack: 0.001, decay: 0.8, sustain: 0, release: 1.5,
      filterCutoff: 8000, reverbWet: 0.5,
      fx: { reverb: true },
    },
  },
  {
    keywords: ['laser', 'zap'],
    name: 'Aero Zap',
    patch: { waveform: 'sawtooth', attack: 0.001, decay: 0.1, sustain: 0, release: 0.05, filterCutoff: 10000 },
  },
];

// Every fallback sound starts from the init patch with a softer envelope.
const BASE = Patch.defaults().merge({ attack: 0.05, decay: 0.5, sustain: 0.3, release: 0.4 });

/**
 * Offline designer used when the AI endpoint is unavailable: matches
 * keywords in the description against a few built-in recipes.
 */
export class KeywordPatchDesigner extends PatchDesigner {
  async design(prompt) {
    const text = prompt.toLowerCase();
    const recipe = RECIPES.find(r => r.keywords.some(word => text.includes(word)));
    if (!recipe) return { patch: BASE, name: 'custom', reasoning: null };
    return { patch: BASE.merge(recipe.patch), name: recipe.name, reasoning: null };
  }
}
