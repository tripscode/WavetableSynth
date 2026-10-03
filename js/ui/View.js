import { EventEmitter } from '../core/EventEmitter.js';

/**
 * Base class for UI components. A view owns one DOM subtree: it renders
 * data into it and emits events for what the user did. Views never call
 * each other or touch app state; SynthApp connects them.
 */
export class View extends EventEmitter {
  /** @param {HTMLElement} root */
  constructor(root) {
    super();
    if (!root) throw new Error(`${new.target.name}: root element not found`);
    this.root = root;
  }

  /** First matching descendant; throws if the markup is missing it. */
  find(selector) {
    const el = this.root.querySelector(selector);
    if (!el) throw new Error(`${this.constructor.name}: no element matches "${selector}"`);
    return el;
  }

  findAll(selector) {
    return [...this.root.querySelectorAll(selector)];
  }
}
