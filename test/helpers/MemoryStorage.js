// In-memory implementation of the parts of the Web Storage API we use.
export class MemoryStorage {
  #items = new Map();

  constructor(initial = {}) {
    for (const [key, value] of Object.entries(initial)) this.#items.set(key, value);
  }

  getItem(key) {
    return this.#items.has(key) ? this.#items.get(key) : null;
  }

  setItem(key, value) {
    this.#items.set(key, String(value));
  }
}
