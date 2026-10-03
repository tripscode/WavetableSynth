/**
 * A saved sound. The JSON shape matches what earlier versions of the app
 * wrote to localStorage, so presets users already saved keep loading.
 */
export class Preset {
  constructor({ id, name, description = '', reasoning = '', savedAt, params }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.reasoning = reasoning;
    this.savedAt = savedAt;
    this.params = params;
  }

  static create({ name, description, reasoning, patch }, now = new Date()) {
    return new Preset({
      id: String(now.getTime()),
      name,
      description,
      reasoning,
      savedAt: now.toISOString(),
      params: patch.toJSON(),
    });
  }

  /** One-line description: the user's own, or the waveform and active effects. */
  get summary() {
    if (this.description) return this.description;
    const fx = this.params.fx || {};
    return [
      this.params.waveform,
      fx.reverb && 'reverb',
      fx.delay && 'delay',
      fx.chorus && 'chorus',
      fx.distortion && 'drive',
    ].filter(Boolean).join(' · ');
  }

  toJSON() {
    const { id, name, description, reasoning, savedAt, params } = this;
    return { id, name, description, reasoning, savedAt, params };
  }
}
