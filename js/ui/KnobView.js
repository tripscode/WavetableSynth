import { View } from './View.js';

const SWEEP_DEGREES = 270; // the knob turns from -135° to +135°
const RING_FILL = 75;      // the lit ring covers 75% of the circle at max

/**
 * One rotary knob: a `.knob-card[data-param]` holding a transparent range
 * input over a drawn knob, and a value readout.
 *
 * Emits 'input' (value: number) while the user drags it.
 */
export class KnobView extends View {
  #input;
  #readout;
  #shell;
  #spec;

  /**
   * @param {HTMLElement} card
   * @param {{ min: number, max: number, step: number }} spec  range from model/params.js
   */
  constructor(card, spec) {
    super(card);
    this.key = card.dataset.param;
    this.#spec = spec;
    this.#input = this.find('input[type=range]');
    this.#readout = this.find('.readout > span');
    this.#shell = this.find('.knob-shell');

    Object.assign(this.#input, { min: spec.min, max: spec.max, step: spec.step });
    this.#input.addEventListener('input', () => this.emit('input', Number(this.#input.value)));
  }

  /**
   * @param {number} value
   * @param {string} text  formatted readout
   */
  render(value, text) {
    this.#input.value = value;
    this.#readout.textContent = text;

    // Read back from the input: the browser snaps the value to the step.
    const { min, max } = this.#spec;
    const ratio = (Number(this.#input.value) - min) / (max - min);
    this.#shell.style.setProperty('--deg', (-SWEEP_DEGREES / 2 + ratio * SWEEP_DEGREES) + 'deg');
    this.#shell.style.setProperty('--pct', (ratio * RING_FILL) + '%');
  }
}
