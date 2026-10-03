import { View } from './View.js';

/**
 * "Current Params" panel: the live patch as JSON, so learners can see
 * exactly what the AI (or their own knob moves) produced.
 */
export class ParamsView extends View {
  /** @param {import('../model/Patch.js').Patch} patch */
  render(patch) {
    this.root.textContent = JSON.stringify(patch, null, 2);
  }
}
