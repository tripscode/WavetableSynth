import { DEFAULT_WAVEFORM, FX_KEYS, PARAMS, PARAM_KEYS, WAVEFORMS } from './params.js';

const WAVEFORM_VALUES = new Set(WAVEFORMS.map(w => w.value));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * An immutable synth patch: a waveform, every numeric parameter, and the
 * on/off state of each effect.
 *
 * Every way of changing a sound (knobs, AI output, saved presets, the
 * randomizer) goes through merge(), which validates untrusted input, so a
 * Patch instance is always complete and in range.
 */
export class Patch {
  /** Trusted, complete values only. Use Patch.defaults().merge(raw) for anything else. */
  constructor(values) {
    this.waveform = values.waveform;
    for (const key of PARAM_KEYS) this[key] = values[key];
    this.fx = Object.freeze({ ...values.fx });
    Object.freeze(this);
  }

  static defaults() {
    return new Patch({
      waveform: DEFAULT_WAVEFORM,
      ...Object.fromEntries(PARAM_KEYS.map(key => [key, PARAMS[key].default])),
      fx: Object.fromEntries(FX_KEYS.map(key => [key, false])),
    });
  }

  /** A playable random sound. Ranges are tuned to stay musical, not span every knob. */
  static random(rng = Math.random) {
    const waveforms = [...WAVEFORM_VALUES];
    return Patch.defaults().merge({
      waveform:      waveforms[Math.floor(rng() * waveforms.length)],
      attack:        rng() * 1.5,
      decay:         0.05 + rng() * 2,
      sustain:       rng(),
      release:       0.05 + rng() * 3,
      filterCutoff:  200 + rng() * 8000,
      filterQ:       0.5 + rng() * 8,
      detune:        (rng() - 0.5) * 40,
      volume:        -14 + rng() * 8,
      reverbDecay:   1 + rng() * 6,
      reverbWet:     rng(),
      delayTime:     0.1 + rng() * 0.7,
      delayFeedback: rng() * 0.7,
      chorusDepth:   rng(),
      distortionAmt: rng() * 0.5,
      fx: {
        reverb:     rng() > 0.5,
        delay:      rng() > 0.6,
        chorus:     rng() > 0.6,
        distortion: rng() > 0.85,
      },
    });
  }

  /**
   * Returns a new Patch with `raw` layered on top. Unknown keys are ignored,
   * numbers are clamped to their range, and invalid waveforms or
   * non-numeric values leave the current value in place.
   */
  merge(raw = {}) {
    const next = { ...this, fx: { ...this.fx } };

    if (WAVEFORM_VALUES.has(raw.waveform)) next.waveform = raw.waveform;

    for (const key of PARAM_KEYS) {
      if (raw[key] == null) continue;
      const value = Number(raw[key]);
      if (Number.isFinite(value)) next[key] = clamp(value, PARAMS[key].min, PARAMS[key].max);
    }

    if (raw.fx) {
      for (const key of FX_KEYS) {
        if (raw.fx[key] != null) next.fx[key] = Boolean(raw.fx[key]);
      }
    }

    return new Patch(next);
  }

  toggleFx(key) {
    return this.merge({ fx: { [key]: !this.fx[key] } });
  }

  /** The value as shown on the knob readout. */
  format(key) {
    const { decimals } = PARAMS[key];
    const value = Number(this[key]);
    // Math.round avoids toFixed(0) printing "-0" for small negative values.
    return decimals ? value.toFixed(decimals) : String(Math.round(value));
  }

  /** Plain-object form, used for the params view and saved presets. */
  toJSON() {
    return {
      waveform: this.waveform,
      ...Object.fromEntries(PARAM_KEYS.map(key => [key, this[key]])),
      fx: { ...this.fx },
    };
  }
}
