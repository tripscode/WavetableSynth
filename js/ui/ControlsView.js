import { PARAMS, PARAM_KEYS, WAVEFORMS } from '../model/params.js';
import { KnobView } from './KnobView.js';
import { View } from './View.js';

/**
 * The synth's sound controls: one knob per parameter, the waveform select,
 * and the FX on/off toggles.
 *
 * Emits:
 *   'paramchange' (key, value)
 *   'waveformchange' (waveform)
 *   'fxtoggle' (fxKey)
 */
export class ControlsView extends View {
  #knobs;
  #waveformSelect;
  #waveformLabel;
  #fxButtons;

  constructor(root) {
    super(root);

    this.#knobs = this.findAll('.knob-card[data-param]').map(card => {
      const spec = PARAMS[card.dataset.param];
      if (!spec) throw new Error(`ControlsView: unknown parameter "${card.dataset.param}"`);
      const knob = new KnobView(card, spec);
      knob.on('input', value => this.emit('paramchange', knob.key, value));
      return knob;
    });
    const missing = PARAM_KEYS.filter(key => !this.#knobs.some(knob => knob.key === key));
    if (missing.length) throw new Error(`ControlsView: no knob for ${missing.join(', ')}`);

    this.#waveformSelect = this.find('#waveform');
    this.#waveformLabel = this.find('#waveformValue');
    this.#waveformSelect.replaceChildren(...WAVEFORMS.map(({ value, label }) => new Option(label, value)));
    this.#waveformSelect.addEventListener('input', () => this.emit('waveformchange', this.#waveformSelect.value));

    this.#fxButtons = this.findAll('[data-fx]');
    for (const button of this.#fxButtons) {
      button.addEventListener('click', () => this.emit('fxtoggle', button.dataset.fx));
    }
  }

  /** @param {import('../model/Patch.js').Patch} patch */
  render(patch) {
    for (const knob of this.#knobs) knob.render(patch[knob.key], patch.format(knob.key));

    this.#waveformSelect.value = patch.waveform;
    this.#waveformLabel.textContent = patch.waveform;

    for (const button of this.#fxButtons) button.classList.toggle('on', patch.fx[button.dataset.fx]);
  }
}
