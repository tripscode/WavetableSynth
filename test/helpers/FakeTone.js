// A stand-in for the Tone.js global that records how AudioEngine builds and
// drives the audio graph, so the engine can be tested without Web Audio.

class FakeNode {
  constructor(kind, args) {
    this.kind = kind;
    this.args = args;
    this.output = null;
    this.settings = [];
    this.started = false;
    this.disposed = false;
  }

  connect(node) { this.output = node; return this; }
  toDestination() { this.output = 'destination'; return this; }
  set(values) { this.settings.push(values); return this; }
  start() { this.started = true; return this; }
  dispose() { this.disposed = true; }

  /** The most recent value passed to set() for `key`. */
  lastSet(key) {
    for (let i = this.settings.length - 1; i >= 0; i--) {
      if (key in this.settings[i]) return this.settings[i][key];
    }
    return undefined;
  }
}

export function createFakeTone() {
  const nodes = [];
  const nodeClass = kind => class extends FakeNode {
    constructor(...args) {
      super(kind, args);
      nodes.push(this);
    }
  };

  class Filter extends nodeClass('Filter') {
    constructor(frequency, type) {
      super(frequency, type);
      this.frequency = { value: frequency };
      this.Q = { value: 1 };
    }
  }

  class PolySynth extends nodeClass('PolySynth') {
    events = [];
    triggerAttack(note) { this.events.push(['attack', note]); }
    triggerRelease(notes) { this.events.push(['release', notes]); }
    triggerAttackRelease(note, duration) { this.events.push(['attackRelease', note, duration]); }
  }

  return {
    nodes,
    startCalls: 0,
    async start() { this.startCalls++; },
    Volume: nodeClass('Volume'),
    Reverb: nodeClass('Reverb'),
    FeedbackDelay: nodeClass('FeedbackDelay'),
    Chorus: nodeClass('Chorus'),
    Distortion: nodeClass('Distortion'),
    Filter,
    PolySynth,
    Synth: class Synth {},
    /** Live (not disposed) nodes of a kind. */
    find(kind) { return nodes.filter(n => n.kind === kind && !n.disposed); },
  };
}
