import { View } from './View.js';

const EMPTY_MESSAGE = 'No presets yet — generate a sound and save it';

/**
 * "Saved Sounds" panel: a card per preset with Load and Delete buttons.
 *
 * Emits:
 *   'load' (presetId)
 *   'delete' (presetId)
 */
export class PresetsView extends View {
  #list;
  #count;

  constructor(root) {
    super(root);
    this.#list = this.find('#presetList');
    this.#count = this.find('#presetCount');

    // One delegated listener survives every re-render.
    this.#list.addEventListener('click', event => {
      const button = event.target.closest('.preset-btn');
      if (!button) return;
      this.emit(button.classList.contains('load') ? 'load' : 'delete', button.dataset.id);
    });
  }

  /**
   * @param {import('../model/Preset.js').Preset[]} presets
   * @param {string|null} loadedId  highlighted as the current sound
   */
  render(presets, loadedId) {
    this.#count.textContent = presets.length + ' saved';

    if (!presets.length) {
      this.#list.replaceChildren(this.#el('div', 'presets-empty', EMPTY_MESSAGE));
      return;
    }

    const list = this.#el('div', 'preset-list');
    list.append(...presets.map(preset => this.#card(preset, preset.id === loadedId)));
    this.#list.replaceChildren(list);
  }

  #card(preset, loaded) {
    const actions = this.#el('div', 'preset-actions');
    for (const [action, label] of [['load', 'Load'], ['del', 'Delete']]) {
      const button = this.#el('button', `preset-btn ${action}`, label);
      button.type = 'button';
      button.dataset.id = preset.id;
      actions.append(button);
    }

    const card = this.#el('div', 'preset-item' + (loaded ? ' loaded' : ''));
    card.append(
      this.#el('div', 'preset-art'),
      this.#el('div', 'preset-name', preset.name),
      this.#el('div', 'preset-desc', preset.summary),
      actions,
    );
    return card;
  }

  // textContent (not innerHTML) so preset names can't inject markup.
  #el(tag, className, text) {
    const el = this.root.ownerDocument.createElement(tag);
    el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }
}
