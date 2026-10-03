// Every synth parameter's range, default and display precision, plus the
// waveform and effect catalogs. This is the single source of truth: the
// knobs, the patch validator and the server-side AI prompt all read it, so
// a range only ever changes here.

export const WAVEFORMS = Object.freeze([
  { value: 'sine',        label: 'sine',       tableName: 'Sine Glass' },
  { value: 'triangle',    label: 'triangle',   tableName: 'Aqua Triangle' },
  { value: 'sawtooth',    label: 'sawtooth',   tableName: 'Bright Saw' },
  { value: 'square',      label: 'square',     tableName: 'Square Current' },
  { value: 'fatsawtooth', label: 'fat saw',    tableName: 'Wide Fat Saw' },
  { value: 'fatsquare',   label: 'fat square', tableName: 'Fat Square' },
  { value: 'amsine',      label: 'AM sine',    tableName: 'AM Shimmer' },
  { value: 'fmsine',      label: 'FM sine',    tableName: 'FM Crystal' },
]);

export const DEFAULT_WAVEFORM = 'triangle';

// decimals sets the on-screen readout precision (0 = whole numbers).
export const PARAMS = Object.freeze({
  detune:        { min: -50,   max: 50,    step: 1,     default: 0,    decimals: 0 },
  attack:        { min: 0.001, max: 3,     step: 0.001, default: 0.01, decimals: 3 },
  decay:         { min: 0.01,  max: 3,     step: 0.01,  default: 0.4,  decimals: 3 },
  sustain:       { min: 0,     max: 1,     step: 0.01,  default: 0.2,  decimals: 2 },
  release:       { min: 0.01,  max: 6,     step: 0.01,  default: 0.3,  decimals: 3 },
  filterCutoff:  { min: 80,    max: 12000, step: 10,    default: 3000, decimals: 0 },
  filterQ:       { min: 0.1,   max: 20,    step: 0.1,   default: 1,    decimals: 1 },
  volume:        { min: -30,   max: 0,     step: 1,     default: -6,   decimals: 0 },
  reverbDecay:   { min: 0.1,   max: 10,    step: 0.1,   default: 2.5,  decimals: 2 },
  reverbWet:     { min: 0,     max: 1,     step: 0.01,  default: 0.4,  decimals: 2 },
  delayTime:     { min: 0.05,  max: 1,     step: 0.01,  default: 0.25, decimals: 2 },
  delayFeedback: { min: 0,     max: 0.9,   step: 0.01,  default: 0.35, decimals: 2 },
  chorusDepth:   { min: 0,     max: 1,     step: 0.01,  default: 0.5,  decimals: 2 },
  distortionAmt: { min: 0,     max: 1,     step: 0.01,  default: 0.3,  decimals: 2 },
});

export const PARAM_KEYS = Object.freeze(Object.keys(PARAMS));

export const FX_KEYS = Object.freeze(['reverb', 'delay', 'chorus', 'distortion']);
