/**
 * Minimal observer: objects that publish events extend this, and listeners
 * subscribe by event name. Used by the app state (to tell the UI and audio
 * engine what changed) and by every view (to report user actions upward).
 */
export class EventEmitter {
  #listeners = new Map();

  /** Subscribe to an event. Returns a function that unsubscribes. */
  on(event, listener) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    this.#listeners.get(event)?.delete(listener);
  }

  emit(event, ...args) {
    for (const listener of this.#listeners.get(event) ?? []) listener(...args);
  }
}
