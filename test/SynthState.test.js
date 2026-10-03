import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EventEmitter } from '../js/core/EventEmitter.js';
import { SynthState } from '../js/model/SynthState.js';

function record(emitter, event) {
  const calls = [];
  emitter.on(event, (...args) => calls.push(args));
  return calls;
}

describe('EventEmitter', () => {
  it('delivers events to subscribers until they unsubscribe', () => {
    const emitter = new EventEmitter();
    const seen = [];
    const unsubscribe = emitter.on('ping', (a, b) => seen.push([a, b]));
    emitter.emit('ping', 1, 2);
    unsubscribe();
    emitter.emit('ping', 3, 4);
    assert.deepEqual(seen, [[1, 2]]);
  });
});

describe('SynthState', () => {
  it('starts as the unnamed init patch', () => {
    const state = new SynthState();
    assert.equal(state.patch.waveform, 'triangle');
    assert.equal(state.name, null);
    assert.equal(state.reasoning, null);
  });

  it('updatePatch merges changes and announces the new patch', () => {
    const state = new SynthState();
    const patches = record(state, 'patchchange');
    state.updatePatch({ attack: 2 });
    assert.equal(state.patch.attack, 2);
    assert.deepEqual(patches, [[state.patch]]);
  });

  it('toggleFx flips one effect', () => {
    const state = new SynthState();
    state.toggleFx('delay');
    assert.equal(state.patch.fx.delay, true);
  });

  it('load replaces the sound, name and reasoning and announces both', () => {
    const state = new SynthState();
    const patches = record(state, 'patchchange');
    const sounds = record(state, 'soundchange');

    state.load({ patch: { waveform: 'sine' }, name: 'Glass Bell', reasoning: 'Sine waves are pure.' });

    assert.equal(state.patch.waveform, 'sine');
    assert.equal(patches.length, 1);
    assert.deepEqual(sounds, [[{ name: 'Glass Bell', reasoning: 'Sine waves are pure.' }]]);
  });

  it('load keeps the previous name when none is given, and clears old reasoning', () => {
    const state = new SynthState();
    state.load({ patch: {}, name: 'First', reasoning: 'Because.' });
    state.load({ patch: {} });
    assert.equal(state.name, 'First');
    assert.equal(state.reasoning, null);
  });

  it('rename only announces a sound change', () => {
    const state = new SynthState();
    const patches = record(state, 'patchchange');
    const sounds = record(state, 'soundchange');
    state.rename('My Pad');
    assert.equal(patches.length, 0);
    assert.deepEqual(sounds, [[{ name: 'My Pad', reasoning: null }]]);
  });
});
