import { Preset } from '../model/Preset.js';

const STORAGE_KEY = 'aerowave_presets';
const LEGACY_STORAGE_KEY = 'aisynth_presets'; // read-only, from before the AeroWave rename

/**
 * Saved presets, newest first, persisted in a Storage-like object
 * (window.localStorage in the browser, an in-memory fake in tests).
 *
 * Storage can be missing, full, or blocked (private browsing), so every
 * access is guarded: presets then simply last for the current session.
 */
export class PresetRepository {
  #storage;
  #presets;

  /** @param {Storage|null} storage */
  constructor(storage) {
    this.#storage = storage;
    this.#presets = this.#read();
  }

  all() {
    return [...this.#presets];
  }

  find(id) {
    return this.#presets.find(preset => preset.id === id);
  }

  add(preset) {
    this.#presets.unshift(preset);
    this.#write();
  }

  remove(id) {
    this.#presets = this.#presets.filter(preset => preset.id !== id);
    this.#write();
  }

  #read() {
    try {
      const raw = this.#storage?.getItem(STORAGE_KEY) || this.#storage?.getItem(LEGACY_STORAGE_KEY);
      return raw ? JSON.parse(raw).map(data => new Preset(data)) : [];
    } catch {
      return [];
    }
  }

  #write() {
    try {
      this.#storage?.setItem(STORAGE_KEY, JSON.stringify(this.#presets));
    } catch {
      // Storage unavailable; keep the in-memory list.
    }
  }
}
