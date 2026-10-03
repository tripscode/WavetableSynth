import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Patch } from '../js/model/Patch.js';
import { Preset } from '../js/model/Preset.js';
import { PresetRepository } from '../js/storage/PresetRepository.js';
import { MemoryStorage } from './helpers/MemoryStorage.js';

const savedPreset = (id, name = `Sound ${id}`) => ({
  id, name, description: '', reasoning: '', savedAt: '2026-01-01T00:00:00.000Z',
  params: Patch.defaults().toJSON(),
});

describe('Preset', () => {
  it('captures the patch as plain JSON with a timestamp id', () => {
    const now = new Date('2026-03-04T05:06:07.000Z');
    const patch = Patch.defaults().merge({ waveform: 'sine' });
    const preset = Preset.create({ name: 'Bell', description: '', reasoning: 'why', patch }, now);

    assert.equal(preset.id, String(now.getTime()));
    assert.equal(preset.savedAt, '2026-03-04T05:06:07.000Z');
    assert.deepEqual(preset.params, patch.toJSON());
    assert.equal(preset.params instanceof Patch, false);
  });

  it('summarizes as the description, or the waveform and active effects', () => {
    const params = Patch.defaults().merge({ waveform: 'sine', fx: { reverb: true, distortion: true } }).toJSON();
    assert.equal(new Preset({ id: '1', name: 'a', params }).summary, 'sine · reverb · drive');
    assert.equal(new Preset({ id: '1', name: 'a', description: 'mine', params }).summary, 'mine');
  });

  it('serializes to the same shape older versions saved', () => {
    const data = savedPreset('1');
    assert.deepEqual(JSON.parse(JSON.stringify(new Preset(data))), data);
  });
});

describe('PresetRepository', () => {
  it('starts empty with no saved data', () => {
    assert.deepEqual(new PresetRepository(new MemoryStorage()).all(), []);
  });

  it('loads presets saved under the current key', () => {
    const storage = new MemoryStorage({ aerowave_presets: JSON.stringify([savedPreset('1')]) });
    const [preset] = new PresetRepository(storage).all();
    assert.ok(preset instanceof Preset);
    assert.equal(preset.name, 'Sound 1');
  });

  it('falls back to presets saved under the legacy key', () => {
    const storage = new MemoryStorage({ aisynth_presets: JSON.stringify([savedPreset('old')]) });
    assert.equal(new PresetRepository(storage).all()[0].id, 'old');
  });

  it('adds newest first and persists under the current key', () => {
    const storage = new MemoryStorage();
    const repo = new PresetRepository(storage);
    repo.add(new Preset(savedPreset('1')));
    repo.add(new Preset(savedPreset('2')));

    assert.deepEqual(repo.all().map(p => p.id), ['2', '1']);
    assert.deepEqual(JSON.parse(storage.getItem('aerowave_presets')).map(p => p.id), ['2', '1']);
    assert.equal(new PresetRepository(storage).find('1').name, 'Sound 1');
  });

  it('removes presets', () => {
    const storage = new MemoryStorage();
    const repo = new PresetRepository(storage);
    repo.add(new Preset(savedPreset('1')));
    repo.remove('1');
    assert.equal(repo.find('1'), undefined);
    assert.deepEqual(JSON.parse(storage.getItem('aerowave_presets')), []);
  });

  it('treats corrupt saved data as empty', () => {
    const storage = new MemoryStorage({ aerowave_presets: '{not json' });
    assert.deepEqual(new PresetRepository(storage).all(), []);
  });

  it('works in memory when storage is missing or failing', () => {
    const noStorage = new PresetRepository(null);
    noStorage.add(new Preset(savedPreset('1')));
    assert.equal(noStorage.all().length, 1);

    const failing = {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: () => { throw new Error('QuotaExceededError'); },
    };
    const repo = new PresetRepository(failing);
    assert.doesNotThrow(() => repo.add(new Preset(savedPreset('2'))));
    assert.equal(repo.all().length, 1);
  });
});
