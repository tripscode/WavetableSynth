import { View } from './View.js';

/**
 * Performance buttons in the oscillator module: Play C4, Hold, Random.
 *
 * Emits:
 *   'play' (note)
 *   'holdchange' (on: boolean)
 *   'randomize'
 */
export class PerformanceView extends View {
  constructor(root) {
    super(root);

    this.find('#playBtn').addEventListener('click', () => this.emit('play', 'C4'));
    this.find('#randomBtn').addEventListener('click', () => this.emit('randomize'));

    const holdButton = this.find('#holdBtn');
    holdButton.addEventListener('click', () => {
      this.emit('holdchange', holdButton.classList.toggle('active'));
    });
  }
}
