// Fixed wet levels for the effects that only switch on/off. Reverb's wet
// level is a knob (patch.reverbWet).
const FX_WET = { delay: 0.5, chorus: 0.5, distortion: 0.6 };

const voiceOptions = patch => ({
  oscillator: { type: patch.waveform, detune: patch.detune },
  envelope: { attack: patch.attack, decay: patch.decay, sustain: patch.sustain, release: patch.release },
});

/**
 * Turns patches into sound with Tone.js.
 *
 * Signal chain:
 *   PolySynth → Filter → Distortion → Chorus → Delay → Reverb → Volume → out
 *
 * Tone is passed in rather than read from the global, which keeps this class
 * testable with a fake. Nodes are created on the first note, because
 * browsers only allow audio to start after a user gesture; until then,
 * apply() just remembers the patch.
 */
export class AudioEngine {
  #tone;
  #patch = null;
  #nodes = null;
  #voices = null;
  #voicesWaveform = null;
  #hold = false;
  #heldNotes = [];

  constructor(tone) {
    this.#tone = tone;
  }

  get hold() { return this.#hold; }

  /** Push a patch to the audio graph. Safe to call before audio has started. */
  apply(patch) {
    this.#patch = patch;
    if (!this.#nodes) return;

    // Oscillator type is swapped by rebuilding the voices; everything else
    // updates in place.
    if (patch.waveform !== this.#voicesWaveform) this.#replaceVoices(patch);
    else this.#voices.set(voiceOptions(patch));

    const { filter, distortion, chorus, delay, reverb, volume } = this.#nodes;
    filter.frequency.value = patch.filterCutoff;
    filter.Q.value = patch.filterQ;
    distortion.set({ distortion: patch.distortionAmt, wet: this.#wet(patch, 'distortion') });
    chorus.set({ depth: patch.chorusDepth, wet: this.#wet(patch, 'chorus') });
    delay.set({ delayTime: patch.delayTime, feedback: patch.delayFeedback, wet: this.#wet(patch, 'delay') });
    reverb.set({ decay: patch.reverbDecay, wet: this.#wet(patch, 'reverb') });
    volume.set({ volume: patch.volume });
  }

  /**
   * Play a note. Normally the note rings for its attack + decay (at least
   * 0.6 s); in hold mode it sustains until another note or hold is released.
   */
  async playNote(note) {
    if (!this.#patch) throw new Error('AudioEngine: apply() a patch before playing');
    await this.#tone.start();
    if (!this.#nodes) this.#buildChain(this.#patch);

    if (this.#hold) {
      if (this.#heldNotes.length) this.#voices.triggerRelease(this.#heldNotes);
      this.#heldNotes = [note];
      this.#voices.triggerAttack(note);
    } else {
      const { attack, decay } = this.#patch;
      const duration = Math.max(0.6, attack + decay + 0.3);
      this.#voices.triggerAttackRelease(note, String(duration));
    }
  }

  setHold(on) {
    this.#hold = on;
    if (!on) this.#releaseHeld();
  }

  #wet(patch, fx) {
    if (!patch.fx[fx]) return 0;
    return fx === 'reverb' ? patch.reverbWet : FX_WET[fx];
  }

  #buildChain(patch) {
    const Tone = this.#tone;
    const volume = new Tone.Volume(patch.volume).toDestination();
    const reverb = new Tone.Reverb({ decay: patch.reverbDecay, wet: this.#wet(patch, 'reverb') }).connect(volume);
    const delay = new Tone.FeedbackDelay({
      delayTime: patch.delayTime, feedback: patch.delayFeedback, wet: this.#wet(patch, 'delay'),
    }).connect(reverb);
    const chorus = new Tone.Chorus({
      depth: patch.chorusDepth, frequency: 3, delayTime: 3.5, wet: this.#wet(patch, 'chorus'),
    }).connect(delay).start();
    const distortion = new Tone.Distortion({
      distortion: patch.distortionAmt, wet: this.#wet(patch, 'distortion'),
    }).connect(chorus);
    const filter = new Tone.Filter(patch.filterCutoff, 'lowpass').set({ Q: patch.filterQ }).connect(distortion);

    this.#nodes = { filter, distortion, chorus, delay, reverb, volume };
    this.#replaceVoices(patch);
  }

  // Disposing the old voices silences anything they were playing.
  #replaceVoices(patch) {
    this.#voices?.dispose();
    this.#heldNotes = [];
    this.#voices = new this.#tone.PolySynth(this.#tone.Synth, voiceOptions(patch)).connect(this.#nodes.filter);
    this.#voicesWaveform = patch.waveform;
  }

  #releaseHeld() {
    if (this.#heldNotes.length && this.#voices) this.#voices.triggerRelease(this.#heldNotes);
    this.#heldNotes = [];
  }
}
