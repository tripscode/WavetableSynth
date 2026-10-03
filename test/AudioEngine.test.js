import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { AudioEngine } from '../js/audio/AudioEngine.js';
import { Patch } from '../js/model/Patch.js';
import { createFakeTone } from './helpers/FakeTone.js';

describe('AudioEngine', () => {
  let tone;
  let engine;

  beforeEach(() => {
    tone = createFakeTone();
    engine = new AudioEngine(tone);
  });

  it('builds nothing until the first note (browsers need a user gesture)', () => {
    engine.apply(Patch.defaults());
    assert.equal(tone.nodes.length, 0);
    assert.equal(tone.startCalls, 0);
  });

  it('refuses to play before a patch is applied', async () => {
    await assert.rejects(engine.playNote('C4'), /apply\(\) a patch/);
  });

  it('wires synth → filter → distortion → chorus → delay → reverb → volume → speakers', async () => {
    engine.apply(Patch.defaults());
    await engine.playNote('C4');

    const chain = [];
    for (let node = tone.find('PolySynth')[0]; node !== 'destination'; node = node.output) chain.push(node.kind);
    assert.deepEqual(chain, ['PolySynth', 'Filter', 'Distortion', 'Chorus', 'FeedbackDelay', 'Reverb', 'Volume']);
    assert.equal(tone.find('Chorus')[0].started, true);
    assert.equal(tone.startCalls, 1);
  });

  it('builds nodes from the current patch, with effects muted when off', async () => {
    engine.apply(Patch.defaults().merge({ waveform: 'sine', detune: 7, filterCutoff: 900, volume: -12 }));
    await engine.playNote('C4');

    const [synthClass, voice] = tone.find('PolySynth')[0].args;
    assert.equal(synthClass, tone.Synth);
    assert.deepEqual(voice.oscillator, { type: 'sine', detune: 7 });
    assert.equal(tone.find('Filter')[0].frequency.value, 900);
    assert.deepEqual(tone.find('Volume')[0].args, [-12]);
    for (const kind of ['Reverb', 'FeedbackDelay', 'Chorus', 'Distortion']) {
      assert.equal(tone.find(kind)[0].args[0].wet, 0, kind);
    }
  });

  it('applies knob changes in place and sets effect wet levels from the toggles', async () => {
    engine.apply(Patch.defaults());
    await engine.playNote('C4');

    engine.apply(Patch.defaults().merge({
      filterCutoff: 5000, filterQ: 4, reverbWet: 0.8,
      fx: { reverb: true, delay: true, chorus: true, distortion: true },
    }));

    assert.equal(tone.find('PolySynth').length, 1);
    assert.equal(tone.find('Filter')[0].frequency.value, 5000);
    assert.equal(tone.find('Filter')[0].Q.value, 4);
    assert.equal(tone.find('Reverb')[0].lastSet('wet'), 0.8);
    assert.equal(tone.find('FeedbackDelay')[0].lastSet('wet'), 0.5);
    assert.equal(tone.find('Chorus')[0].lastSet('wet'), 0.5);
    assert.equal(tone.find('Distortion')[0].lastSet('wet'), 0.6);
  });

  it('rebuilds the voices when the waveform changes', async () => {
    engine.apply(Patch.defaults());
    await engine.playNote('C4');
    const [oldVoices] = tone.find('PolySynth');

    engine.apply(Patch.defaults().merge({ waveform: 'fmsine' }));

    const [newVoices] = tone.find('PolySynth');
    assert.equal(oldVoices.disposed, true);
    assert.notEqual(newVoices, oldVoices);
    assert.equal(newVoices.output, tone.find('Filter')[0]);
    assert.equal(newVoices.args[1].oscillator.type, 'fmsine');
  });

  it('plays a note for its attack + decay, but at least 0.6 s', async () => {
    engine.apply(Patch.defaults().merge({ attack: 1, decay: 0.5 }));
    await engine.playNote('E4');
    engine.apply(Patch.defaults().merge({ attack: 0.01, decay: 0.01 }));
    await engine.playNote('G4');

    assert.deepEqual(tone.find('PolySynth')[0].events, [
      ['attackRelease', 'E4', '1.8'],
      ['attackRelease', 'G4', '0.6'],
    ]);
  });

  it('in hold mode, sustains one note at a time until hold is released', async () => {
    engine.apply(Patch.defaults());
    engine.setHold(true);
    await engine.playNote('C4');
    await engine.playNote('D4');
    engine.setHold(false);

    assert.deepEqual(tone.find('PolySynth')[0].events, [
      ['attack', 'C4'],
      ['release', ['C4']],
      ['attack', 'D4'],
      ['release', ['D4']],
    ]);
  });
});
