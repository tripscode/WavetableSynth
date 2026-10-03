import { View } from './View.js';

/**
 * "Save Preset" dialog. Enter saves, Escape or a click outside cancels.
 *
 * Emits 'save' ({ name, description }).
 */
export class SaveDialog extends View {
  #nameInput;
  #descriptionInput;

  constructor(root) {
    super(root);
    this.#nameInput = this.find('#presetNameInput');
    this.#descriptionInput = this.find('#presetDescInput');

    this.find('#modalCancel').addEventListener('click', () => this.close());
    this.find('#modalConfirm').addEventListener('click', () => this.#confirm());
    this.root.addEventListener('click', event => {
      if (event.target === this.root) this.close();
    });

    for (const input of [this.#nameInput, this.#descriptionInput]) {
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') this.#confirm();
        if (event.key === 'Escape') this.close();
      });
    }
  }

  open(suggestedName = '') {
    this.#nameInput.value = suggestedName;
    this.#descriptionInput.value = '';
    this.root.classList.add('open');
    this.#nameInput.focus();
  }

  close() {
    this.root.classList.remove('open');
  }

  #confirm() {
    const name = this.#nameInput.value.trim() || 'Untitled';
    const description = this.#descriptionInput.value.trim();
    this.close();
    this.emit('save', { name, description });
  }
}
