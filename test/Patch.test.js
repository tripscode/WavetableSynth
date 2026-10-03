import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Patch } from '../js/model/Patch.js';
import { FX_KEYS, PARAMS, PARAM_KEYS } from '../js/model/params.js';

describe('Patch', () => {
  it('starts from the init patch', () => {
    const patch = Patch.defaults();
    assert.equal(patch.waveform, 'triangle');
    for (const key of PARAM_KEYS) assert.equal(patch[key], PARAMS[key].default, key);
    assert.deepEqual(patch.fx, { reverb: false, delay: false, chorus: false, distortion: false });
  });

  it('is immutable; merge returns a new patch', () => {
    const patch = Patch.defaults();
    const next = patch.merge({ attack: 1 });
    assert.notEqual(next, patch);
    assert.equal(patch.attack, 0.01);
    assert.equal(next.attack, 1);
    assert.throws(() => { patch.attack = 2; }, TypeError);
    assert.throws(() => { patch.fx.reverb = true; }, TypeError);
  });

  describe('merge', () => {
    it('clamps numbers to each parameter range', () => {
      const patch = Patch.defaults().merge({ filterCutoff: 99999, volume: -100, sustain: 1.5 });
      assert.equal(patch.filterCutoff, 12000);
      assert.equal(patch.volume, -30);
      assert.equal(patch.sustain, 1);
    });

    it('accepts numeric strings', () => {
      assert.equal(Patch.defaults().merge({ detune: '12' }).detune, 12);
    });

    it('keeps the current value for missing, null or non-numeric input', () => {
      const patch = Patch.defaults().merge({ attack: null, decay: 'slow', release: NaN });
      assert.equal(patch.attack, 0.01);
      assert.equal(patch.decay, 0.4);
      assert.equal(patch.release, 0.3);
    });

    it('ignores unknown waveforms and unknown keys', () => {
      const patch = Patch.defaults().merge({ waveform: 'noise', name: 'Bass', bogus: 1 });
      assert.equal(patch.waveform, 'triangle');
      assert.equal('bogus' in patch, false);
      assert.equal('name' in patch, false);
    });

    it('merges effects individually and coerces them to booleans', () => {
      const patch = Patch.defaults().merge({ fx: { reverb: 1, delay: null, unknown: true } });
      assert.deepEqual(patch.fx, { reverb: true, delay: false, chorus: false, distortion: false });
    });
  });

  it('toggles one effect', () => {
    const patch = Patch.defaults().toggleFx('chorus');
    assert.equal(patch.fx.chorus, true);
    assert.equal(patch.toggleFx('chorus').fx.chorus, false);
  });

  describe('format', () => {
    it('uses each parameter\'s readout precision', () => {
      const patch = Patch.defaults().merge({ decay: 0.4, filterQ: 1, filterCutoff: 3004, sustain: 0.2 });
      assert.equal(patch.format('decay'), '0.400');
      assert.equal(patch.format('filterQ'), '1.0');
      assert.equal(patch.format('filterCutoff'), '3004');
      assert.equal(patch.format('sustain'), '0.20');
      assert.equal(patch.format('volume'), '-6');
    });

    it('never prints negative zero', () => {
      assert.equal(Patch.defaults().merge({ detune: -0.4 }).format('detune'), '0');
    });
  });

  it('serializes waveform, then every parameter, then fx', () => {
    const json = Patch.defaults().toJSON();
    assert.deepEqual(Object.keys(json), ['waveform', ...PARAM_KEYS, 'fx']);
    assert.deepEqual(Object.keys(json.fx), FX_KEYS);
    assert.equal(JSON.stringify(Patch.defaults()), JSON.stringify(json));
  });

  it('generates random patches within range, deterministically for a given RNG', () => {
    const seeded = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const a = Patch.random(seeded(42));
    const b = Patch.random(seeded(42));
    assert.deepEqual(a.toJSON(), b.toJSON());

    for (let i = 0; i < 200; i++) {
      const patch = Patch.random();
      for (const key of PARAM_KEYS) {
        assert.ok(patch[key] >= PARAMS[key].min && patch[key] <= PARAMS[key].max, key);
      }
    }
  });
});
