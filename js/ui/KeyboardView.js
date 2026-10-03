import { View } from './View.js';

// Two octaves of white keys plus top C, with computer-key shortcuts on the
// bottom letter row (Z–M) and the home row (A–K).
const KEYS = [
  { note: 'C3', key: 'Z' }, { note: 'D3', key: 'X' }, { note: 'E3', key: 'C' },
  { note: 'F3', key: 'V' }, { note: 'G3', key: 'B' }, { note: 'A3', key: 'N' },
  { note: 'B3', key: 'M' }, { note: 'C4', key: 'A' }, { note: 'D4', key: 'S' },
  { note: 'E4', key: 'D' }, { note: 'F4', key: 'F' }, { note: 'G4', key: 'G' },
  { note: 'A4', key: 'H' }, { note: 'B4', key: 'J' }, { note: 'C5', key: 'K' },
];

const FLASH_MS = 280;

/**
 * On-screen keyboard plus computer-keyboard shortcuts.
 *
 * Emits 'play' (note).
 */
export class KeyboardView extends View {
  #keys;
  #flashTimer = null;

  /**
   * @param {HTMLElement} root            the keyboard container
   * @param {EventTarget} shortcutTarget  where to listen for key presses
   */
  constructor(root, shortcutTarget = root.ownerDocument) {
    super(root);

    this.#keys = KEYS.map(({ note, key }) => {
      const button = root.ownerDocument.createElement('button');
      button.className = 'key';
      button.dataset.note = note;
      button.textContent = note;
      button.title = `Computer key: ${key}`;
      button.addEventListener('click', () => this.emit('play', note));
      return button;
    });
    this.root.append(...this.#keys);

    shortcutTarget.addEventListener('keydown', event => {
      // Leave typing in the prompt and the save dialog alone.
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') return;
      const match = KEYS.find(k => k.key === event.key.toUpperCase());
      if (match && !event.repeat) this.emit('play', match.note);
    });
  }

  /** Light up the key for a note that just played. */
  flash(note) {
    for (const key of this.#keys) key.classList.toggle('active', key.dataset.note === note);
    clearTimeout(this.#flashTimer);
    this.#flashTimer = setTimeout(() => {
      for (const key of this.#keys) key.classList.remove('active');
    }, FLASH_MS);
  }
}
