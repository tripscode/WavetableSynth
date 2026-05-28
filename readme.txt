# AeroWave AI

An AI-powered wavetable synth for beginner sound design. Describe a sound in plain language, hear it instantly, and learn the synth parameters that created it.

Live demo: https://wavetablesynth.netlify.app/

Built at BorderHack 2026 (UTEP) — 2nd place out of 32 teams.

## What it does

AeroWave lowers the first barrier to synthesis. Instead of learning what "ADSR" or "filter cutoff" means before you can make a sound, you start with everyday words and build intuition by adjusting the controls and listening.

Prompt -> Patch -> Play:

1. Describe — type something like "warm ambient pad" or "dreamy pluck".
2. Generate — an AI model returns a structured patch (waveform, ADSR, filter, effects) as JSON.
3. Reveal — every value maps to a visible, labeled control, so you see why the sound is what it is.
4. Play and refine — use the on-screen keyboard, tweak the knobs, and hear each change.

The point isn't to hide the work behind the AI — it's to turn its output into learnable decisions.

## Features

- Polyphonic synth engine built on Tone.js
- Oscillators (sine / saw / square / triangle) with detune, ADSR envelope, low-pass filter (cutoff + resonance), and volume
- Effects chain: reverb, delay, chorus, distortion
- Playable on-screen keyboard, hold mode, and saveable presets
- Natural-language prompt -> JSON patch via an AI endpoint, with a built-in fallback sound map if the API is unavailable

## How it works

Prompts go from the browser to a Netlify serverless function, which proxies the call to the AI provider and returns a JSON patch; the UI then updates every control to match. The API key stays server-side and is never exposed to the browser.

Flow: Browser UI (HTML/CSS + Tone.js) -> Netlify function -> AI model (Groq) -> sound + visible knobs

## Tech stack

Tone.js (Web Audio) · HTML / CSS / JavaScript · Groq API (provider-swappable) · Netlify (static site + functions)

## Getting started

Update these to match your actual setup.

Prerequisites: Node.js (LTS), a Groq API key, and the Netlify CLI (npm install -g netlify-cli).

```
git clone https://github.com/tripscode/<repo-name>.git
cd <repo-name>
npm install
echo "GROQ_API_KEY=your_key_here" > .env   # do not commit this
netlify dev
```

For production, deploy through Netlify and set GROQ_API_KEY in your site's environment variables.

## Roadmap

Bilingual (EN/ES) UI, guided ADSR/filter mini-lessons, classroom mode with shared presets, WAV export, and MIDI support.

## Acknowledgments

Built for BorderHack 2026, hosted by GDG on Campus UTEP. Thanks to my teammates for the 24-hour build.
