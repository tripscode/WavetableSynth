import { Patch } from '../model/Patch.js';
import { Preset } from '../model/Preset.js';

const FALLBACK_STATUS = 'using fallback patch — check API if this keeps happening';

/**
 * Application controller. It owns no DOM and no audio code itself; it
 * connects the pieces it is given:
 *
 *   views ──(user events)──► SynthApp ──► SynthState ──(change events)──► views + AudioEngine
 *
 * Views report what the user did, SynthApp decides what that means, and
 * every change to the sound goes through SynthState, which notifies the
 * views and the audio engine.
 */
export class SynthApp {
  #state;
  #engine;
  #presets;
  #designer;
  #fallbackDesigner;
  #views;
  #loadedPresetId = null;

  /**
   * @param {object} deps
   * @param {import('../model/SynthState.js').SynthState} deps.state
   * @param {import('../audio/AudioEngine.js').AudioEngine} deps.engine
   * @param {import('../storage/PresetRepository.js').PresetRepository} deps.presets
   * @param {import('../ai/PatchDesigner.js').PatchDesigner} deps.designer          AI designer
   * @param {import('../ai/PatchDesigner.js').PatchDesigner} deps.fallbackDesigner  used when the AI fails
   * @param {object} deps.views  header, aiPanel, controls, performance, wavetable, keyboard, params, presets, saveDialog
   */
  constructor({ state, engine, presets, designer, fallbackDesigner, views }) {
    this.#state = state;
    this.#engine = engine;
    this.#presets = presets;
    this.#designer = designer;
    this.#fallbackDesigner = fallbackDesigner;
    this.#views = views;
  }

  start() {
    this.#bindState();
    this.#bindViews();
    this.#renderPatch(this.#state.patch);
    this.#renderSound(this.#state);
    this.#renderPresets();
  }

  /* ── State → views and audio ──────────────────────────────────────── */

  #bindState() {
    this.#state.on('patchchange', patch => this.#renderPatch(patch));
    this.#state.on('soundchange', sound => this.#renderSound(sound));
  }

  #renderPatch(patch) {
    this.#engine.apply(patch);
    this.#views.controls.render(patch);
    this.#views.wavetable.render(patch.waveform);
    this.#views.params.render(patch);
  }

  #renderSound({ name, reasoning }) {
    this.#views.header.showSound(name);
    this.#views.aiPanel.showReasoning(reasoning);
  }

  #renderPresets() {
    this.#views.presets.render(this.#presets.all(), this.#loadedPresetId);
  }

  /* ── User actions → state ─────────────────────────────────────────── */

  #bindViews() {
    const { aiPanel, controls, performance, keyboard, header, saveDialog, presets } = this.#views;

    aiPanel.on('generate', prompt => this.#generate(prompt));

    controls.on('paramchange', (key, value) => this.#state.updatePatch({ [key]: value }));
    controls.on('waveformchange', waveform => this.#state.updatePatch({ waveform }));
    controls.on('fxtoggle', fx => this.#state.toggleFx(fx));

    performance.on('play', note => this.#play(note));
    performance.on('holdchange', on => this.#engine.setHold(on));
    performance.on('randomize', () => this.#randomize());

    keyboard.on('play', note => this.#play(note));

    header.on('save', () => saveDialog.open(this.#state.name ?? ''));
    saveDialog.on('save', details => this.#savePreset(details));

    presets.on('load', id => this.#loadPreset(id));
    presets.on('delete', id => this.#deletePreset(id));
  }

  async #play(note) {
    await this.#engine.playNote(note);
    this.#views.keyboard.flash(note);
  }

  async #generate(prompt) {
    const { aiPanel, header } = this.#views;
    aiPanel.setBusy(true);
    header.showDesigning();
    aiPanel.setStatus('thinking', 'AI is shaping the patch...');

    try {
      try {
        this.#state.load(await this.#designer.design(prompt));
        aiPanel.setStatus('ok', 'sound ready');
      } catch {
        aiPanel.setStatus('err', FALLBACK_STATUS);
        this.#state.load(await this.#fallbackDesigner.design(prompt));
      }
      await this.#play('C4');
    } finally {
      aiPanel.setBusy(false);
    }
  }

  #randomize() {
    this.#state.load({ patch: Patch.random(), name: 'Random Aero Patch' });
    this.#play('C4');
  }

  #savePreset({ name, description }) {
    const preset = Preset.create({
      name,
      description,
      reasoning: this.#state.reasoning ?? '',
      patch: this.#state.patch,
    });
    this.#presets.add(preset);
    this.#loadedPresetId = preset.id;
    this.#renderPresets();
    this.#state.rename(name);
    this.#views.aiPanel.setStatus('ok', 'saved: ' + name);
  }

  #loadPreset(id) {
    const preset = this.#presets.find(id);
    if (!preset) return;
    this.#loadedPresetId = id;
    this.#state.load({ patch: preset.params, name: preset.name, reasoning: preset.reasoning });
    this.#views.aiPanel.setStatus('ok', 'preset loaded: ' + preset.name);
    this.#renderPresets();
    this.#play('C4');
  }

  #deletePreset(id) {
    this.#presets.remove(id);
    if (this.#loadedPresetId === id) this.#loadedPresetId = null;
    this.#renderPresets();
  }
}
