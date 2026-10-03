// Approximate shapes for drawing the wavetable display. These are visual
// only; the actual sound comes from Tone's oscillators.

const SINE_FAMILY = new Set(['sine', 'amsine', 'fmsine']);

/**
 * Sample a waveform for drawing.
 * @param {string} type         waveform name (see WAVEFORMS in model/params.js)
 * @param {number} phase        position across the display, 0..1
 * @param {number} layerOffset  phase shift, used to draw offset "table" layers
 * @returns {number} amplitude, roughly -1..1
 */
export function waveSample(type, phase, layerOffset = 0) {
  const cycles = SINE_FAMILY.has(type) ? 3 : 4;
  const t = (phase + layerOffset + 1) % 1;
  const c = (t * cycles) % 1;

  switch (type) {
    case 'sine':
      return Math.sin(2 * Math.PI * cycles * t);

    case 'triangle':
      return c < 0.25 ? c * 4 : c < 0.75 ? 2 - c * 4 : c * 4 - 4;

    case 'sawtooth':
      return 2 * c - 1;

    case 'square':
      return c < 0.5 ? 1 : -1;

    case 'fatsawtooth': {
      const c2 = ((t + 0.035 + layerOffset) * cycles) % 1;
      return (2 * c - 1) * 0.62 + (2 * c2 - 1) * 0.38;
    }

    case 'fatsquare': {
      const c2 = ((t + 0.04 + layerOffset) * cycles) % 1;
      return (c < 0.5 ? 1 : -1) * 0.7 + (c2 < 0.5 ? 1 : -1) * 0.3;
    }

    case 'amsine': {
      const carrier = Math.sin(2 * Math.PI * cycles * t);
      const amp = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (t * 1.15 + layerOffset)));
      return carrier * amp;
    }

    case 'fmsine': {
      const mod = 0.32 * Math.sin(2 * Math.PI * (t * 2.1 + layerOffset));
      return Math.sin(2 * Math.PI * (cycles * t + mod));
    }

    default:
      return Math.sin(2 * Math.PI * cycles * t);
  }
}

/**
 * SVG path data for one layer of the display.
 * @param {{ width: number, midY: number, amp: number, samples: number, offset?: number }} layout
 */
export function wavePath(type, { width, midY, amp, samples, offset = 0 }) {
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const phase = i / samples;
    const x = phase * width;
    const y = midY - waveSample(type, phase, offset) * amp;
    points.push((i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1));
  }
  return points.join(' ');
}
