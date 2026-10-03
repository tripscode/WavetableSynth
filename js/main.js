// Composition root: builds every object, hands each one its dependencies,
// and starts the app. This is the only module that touches browser globals
// (document, Tone, localStorage, the API endpoint).

import { KeywordPatchDesigner } from './ai/KeywordPatchDesigner.js';
import { RemotePatchDesigner } from './ai/RemotePatchDesigner.js';
import { SynthApp } from './app/SynthApp.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { SynthState } from './model/SynthState.js';
import { PresetRepository } from './storage/PresetRepository.js';
import { AiPanelView } from './ui/AiPanelView.js';
import { ControlsView } from './ui/ControlsView.js';
import { HeaderView } from './ui/HeaderView.js';
import { KeyboardView } from './ui/KeyboardView.js';
import { ParamsView } from './ui/ParamsView.js';
import { PerformanceView } from './ui/PerformanceView.js';
import { PresetsView } from './ui/PresetsView.js';
import { SaveDialog } from './ui/SaveDialog.js';
import { WavetableView } from './ui/WavetableView.js';

const PATCH_API = '/api/generate-patch';

const $ = selector => document.querySelector(selector);

// Accessing localStorage throws in some privacy modes; run without saving then.
function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const app = new SynthApp({
  state: new SynthState(),
  engine: new AudioEngine(window.Tone),
  presets: new PresetRepository(browserStorage()),
  designer: new RemotePatchDesigner(PATCH_API),
  fallbackDesigner: new KeywordPatchDesigner(),
  views: {
    header: new HeaderView($('.topbar')),
    aiPanel: new AiPanelView($('.ai-panel')),
    controls: new ControlsView($('.plugin-grid')),
    performance: new PerformanceView($('.action-bank')),
    wavetable: new WavetableView($('.wave-panel')),
    keyboard: new KeyboardView($('#keyboard')),
    params: new ParamsView($('#jsonOutput')),
    presets: new PresetsView($('.presets-panel')),
    saveDialog: new SaveDialog($('#modalBackdrop')),
  },
});

app.start();
