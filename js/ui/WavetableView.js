import { wavePath } from '../audio/waveshapes.js';
import { WAVEFORMS } from '../model/params.js';
import { View } from './View.js';

const FALLBACK_TABLE_NAME = 'Aqua Motion';

// Three stacked, slightly phase-shifted traces give the "table" look.
// Geometry matches the SVG's viewBox (520 × 180).
const LAYERS = [
  { selector: '#wavePathMain', offset: 0,      amp: 54 },
  { selector: '#wavePathAlt1', offset: 0.045,  amp: 42 },
  { selector: '#wavePathAlt2', offset: -0.055, amp: 34 },
];
const LAYOUT = { width: 520, midY: 90, samples: 180 };

/** The wavetable screen: draws the current waveform and names its table. */
export class WavetableView extends View {
  #name;
  #layers;
  #drawn = null;

  constructor(root) {
    super(root);
    this.#name = this.find('#waveName');
    this.#layers = LAYERS.map(layer => ({ ...layer, path: this.find(layer.selector) }));
  }

  render(waveform) {
    if (waveform === this.#drawn) return;
    this.#drawn = waveform;

    this.#name.textContent = WAVEFORMS.find(w => w.value === waveform)?.tableName ?? FALLBACK_TABLE_NAME;
    for (const { path, offset, amp } of this.#layers) {
      path.setAttribute('d', wavePath(waveform, { ...LAYOUT, offset, amp }));
    }
  }
}
