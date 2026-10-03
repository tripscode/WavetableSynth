import { EventEmitter } from '../core/EventEmitter.js';
import { Patch } from './Patch.js';

/**
 * The app's single source of state: the current patch, plus the sound's
 * display name and the AI's explanation of it.
 *
 * Events:
 *   'patchchange' (patch)              the sound itself changed
 *   'soundchange' ({ name, reasoning }) the sound's label or explanation changed
 *
 * `name` stays null until a named sound is loaded (AI result, preset,
 * random patch); the Save button is only enabled once there is one.
 */
export class SynthState extends EventEmitter {
  #patch;
  #name = null;
  #reasoning = null;

  constructor(patch = Patch.defaults()) {
    super();
    this.#patch = patch;
  }

  get patch() { return this.#patch; }
  get name() { return this.#name; }
  get reasoning() { return this.#reasoning; }

  /** Tweak part of the current patch (a knob move, a waveform change). */
  updatePatch(changes) {
    this.#patch = this.#patch.merge(changes);
    this.emit('patchchange', this.#patch);
  }

  toggleFx(key) {
    this.#patch = this.#patch.toggleFx(key);
    this.emit('patchchange', this.#patch);
  }

  /**
   * Load a whole sound: an AI design, a preset, or a random patch.
   * `patch` may be partial; anything it leaves out keeps its current value.
   */
  load({ patch, name = null, reasoning = null }) {
    this.#patch = this.#patch.merge(patch);
    if (name) this.#name = name;
    this.#reasoning = reasoning || null;
    this.emit('patchchange', this.#patch);
    this.#emitSoundChange();
  }

  rename(name) {
    this.#name = name;
    this.#emitSoundChange();
  }

  #emitSoundChange() {
    this.emit('soundchange', { name: this.#name, reasoning: this.#reasoning });
  }
}
