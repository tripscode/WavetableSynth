import { View } from './View.js';

/**
 * AI Sound Designer panel: prompt box, Generate button, prompt suggestions,
 * status line, and the AI's reasoning.
 *
 * Emits 'generate' (prompt) when the user submits a non-empty prompt.
 */
export class AiPanelView extends View {
  #prompt;
  #generateButton;
  #statusDot;
  #statusText;
  #reasoningBox;
  #reasoningText;

  constructor(root) {
    super(root);
    this.#prompt = this.find('#prompt');
    this.#generateButton = this.find('#generateBtn');
    this.#statusDot = this.find('#dot');
    this.#statusText = this.find('#statusText');
    this.#reasoningBox = this.find('#reasoningBox');
    this.#reasoningText = this.find('#reasoningText');

    this.#generateButton.addEventListener('click', () => this.#submit());
    this.#prompt.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.#submit();
      }
    });

    for (const pill of this.findAll('[data-suggest]')) {
      pill.addEventListener('click', () => {
        this.#prompt.value = pill.dataset.suggest;
        this.#prompt.focus();
      });
    }
  }

  /** While busy, Generate is disabled and the previous reasoning is hidden. */
  setBusy(busy) {
    this.#generateButton.disabled = busy;
    if (busy) this.#reasoningBox.classList.remove('visible');
  }

  /**
   * @param {''|'thinking'|'ok'|'err'} state  colors the status dot
   * @param {string} message
   */
  setStatus(state, message) {
    this.#statusDot.className = 'dot' + (state ? ' ' + state : '');
    this.#statusText.textContent = message;
  }

  showReasoning(reasoning) {
    this.#reasoningText.textContent = reasoning || '';
    this.#reasoningBox.classList.toggle('visible', Boolean(reasoning));
  }

  #submit() {
    const prompt = this.#prompt.value.trim();
    if (prompt && !this.#generateButton.disabled) this.emit('generate', prompt);
  }
}
