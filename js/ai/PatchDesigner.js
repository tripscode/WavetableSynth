/**
 * Turns a plain-language description ("warm ambient pad") into a sound.
 *
 * Abstract base class: subclasses implement design(). The app depends only
 * on this interface, so the AI-backed designer and the offline keyword
 * designer are interchangeable.
 *
 * @typedef {object} SoundDesign
 * @property {object} patch          patch values; may be partial and is validated by Patch.merge()
 * @property {string|null} name      display name for the sound
 * @property {string|null} reasoning beginner-friendly explanation, if any
 */
export class PatchDesigner {
  /**
   * @param {string} prompt
   * @returns {Promise<SoundDesign>}
   */
  async design(prompt) {
    throw new Error(`${this.constructor.name} must implement design()`);
  }
}
