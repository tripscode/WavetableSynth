import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { wavePath, waveSample } from '../js/audio/waveshapes.js';
import { WAVEFORMS } from '../js/model/params.js';

describe('waveshapes', () => {
  it('draws every waveform within the display', () => {
    for (const { value } of WAVEFORMS) {
      for (let i = 0; i <= 100; i++) {
        const y = waveSample(value, i / 100);
        assert.ok(Number.isFinite(y) && Math.abs(y) <= 1.0001, `${value} at ${i}`);
      }
    }
  });

  it('samples the basic shapes correctly', () => {
    assert.equal(waveSample('square', 0.01), 1);
    assert.equal(waveSample('square', 0.2), -1);
    assert.equal(waveSample('sawtooth', 0), -1);
    assert.equal(waveSample('triangle', 0), 0);
    assert.ok(Math.abs(waveSample('sine', 0)) < 1e-12);
  });

  it('builds an SVG path that spans the display width', () => {
    const d = wavePath('sine', { width: 520, midY: 90, amp: 54, samples: 4 });
    const commands = d.split(' ').filter(token => /^[ML]/.test(token));
    assert.equal(commands.length, 5);
    assert.ok(d.startsWith('M0.0 90.0'));
    assert.match(d, /L520\.0 /);
  });
});
