import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { KeywordPatchDesigner } from '../js/ai/KeywordPatchDesigner.js';
import { PatchDesigner } from '../js/ai/PatchDesigner.js';
import { RemotePatchDesigner } from '../js/ai/RemotePatchDesigner.js';

describe('PatchDesigner', () => {
  it('requires subclasses to implement design()', async () => {
    class Incomplete extends PatchDesigner {}
    await assert.rejects(new Incomplete().design('pad'), /Incomplete must implement design\(\)/);
  });

  it('is the shared interface of both designers', () => {
    assert.ok(new KeywordPatchDesigner() instanceof PatchDesigner);
    assert.ok(new RemotePatchDesigner('/api') instanceof PatchDesigner);
  });
});

describe('KeywordPatchDesigner', () => {
  const designer = new KeywordPatchDesigner();

  it('designs a pad from "ambient"', async () => {
    const { patch, name, reasoning } = await designer.design('Warm AMBIENT texture');
    assert.equal(name, 'Aqua Pad');
    assert.equal(reasoning, null);
    assert.equal(patch.waveform, 'fatsawtooth');
    assert.equal(patch.attack, 2);
    assert.equal(patch.release, 4);
    assert.deepEqual(patch.fx, { reverb: true, delay: false, chorus: true, distortion: false });
  });

  it('matches recipes in order, so "pad" wins over "bass"', async () => {
    assert.equal((await designer.design('bass pad')).name, 'Aqua Pad');
  });

  it('designs the other recipes', async () => {
    assert.equal((await designer.design('deep sub bass')).name, 'Ocean Bass');
    assert.equal((await designer.design('airy pluck')).name, 'Airy Pluck');
    assert.equal((await designer.design('glass bell')).name, 'Glass Bell');
    assert.equal((await designer.design('zap!')).name, 'Aero Zap');
  });

  it('falls back to a softened init patch named "custom"', async () => {
    const { patch, name } = await designer.design('something else');
    assert.equal(name, 'custom');
    assert.deepEqual(
      { attack: patch.attack, decay: patch.decay, sustain: patch.sustain, release: patch.release },
      { attack: 0.05, decay: 0.5, sustain: 0.3, release: 0.4 },
    );
    assert.equal(patch.waveform, 'triangle');
  });
});

describe('RemotePatchDesigner', () => {
  const respond = (status, body) => async () => ({ ok: status < 300, status, json: async () => body });

  it('posts the prompt and returns the designed patch', async () => {
    const requests = [];
    const fetchImpl = async (url, init) => {
      requests.push({ url, init });
      return respond(200, { reasoning: 'Saws are bright.', params: { name: 'Lead', waveform: 'sawtooth' } })();
    };

    const result = await new RemotePatchDesigner('/api/generate-patch', fetchImpl).design('bright lead');

    assert.equal(requests[0].url, '/api/generate-patch');
    assert.equal(requests[0].init.method, 'POST');
    assert.deepEqual(JSON.parse(requests[0].init.body), { prompt: 'bright lead' });
    assert.deepEqual(result, {
      patch: { name: 'Lead', waveform: 'sawtooth' },
      name: 'Lead',
      reasoning: 'Saws are bright.',
    });
  });

  it('fails on an error status so the app can fall back', async () => {
    await assert.rejects(new RemotePatchDesigner('/api', respond(502, {})).design('x'), /502/);
  });

  it('fails when the response has no params', async () => {
    await assert.rejects(new RemotePatchDesigner('/api', respond(200, { reasoning: 'hi' })).design('x'), /no params/);
  });
});
