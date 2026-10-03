import { View } from './View.js';

const INIT_NAME = 'Init Patch';

/**
 * Top bar: the current sound's name and the Save button.
 *
 * Emits 'save' when Save is clicked.
 */
export class HeaderView extends View {
  #soundName;
  #saveButton;

  constructor(root) {
    super(root);
    this.#soundName = this.find('#soundName');
    this.#saveButton = this.find('#saveBtn');
    this.#saveButton.addEventListener('click', () => this.emit('save'));
  }

  /** Saving is only offered once a named sound is loaded. */
  showSound(name) {
    this.#soundName.textContent = name ?? INIT_NAME;
    this.#saveButton.disabled = name == null;
  }

  showDesigning() {
    this.#soundName.textContent = 'Designing sound...';
    this.#saveButton.disabled = true;
  }
}
