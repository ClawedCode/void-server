---
category: ambient
energy: low
tags: [shoegaze, dreamy, oceanic]
---
## Slowdive (Oceanic Drift)

**Tempo**: 70-85 BPM
**Key**: Major (dreamlike blur)
**Instruments**: Ultra-heavy chorus, glacial pads, distant drums, soft lead tones
**Structure**: Intro → Float → Swell → Float → Drift → Fade
**Vibe**: Space station weightlessness - glacial pace, filter sweeps for movement, extended chord voicings, time suspended

### Key Characteristics

1. **Ultra-Heavy Chorus**: Everything bathed in chorus depth 0.85+, creating shimmer
2. **Glacial Pace**: Slow tempo, long note durations, patient development
3. **Filter Sweeps**: Movement comes from slow filter automation, not rhythm
4. **Distant Buried Drums**: Percussion barely perceptible through the wash
5. **Soft Rounded Leads**: No sharp edges, everything cushioned in effects
6. **Extended Voicings**: Wide chord spreads for dreamlike blur

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - weightless drift

  // === OCEANIC FX BUSES ===
  const oceanicReverb = new Tone.Reverb({ decay: 9.0, wet: 0.75 }).toDestination();
  await oceanicReverb.generate();

  const shimmerDelay = new Tone.FeedbackDelay({ delayTime: "4n.", feedback: 0.55, wet: 0.45 }).connect(oceanicReverb);

  const ultraChorus = new Tone.Chorus({ frequency: 0.8, delayTime: 15, depth: 0.90, wet: 0.90 }).connect(shimmerDelay);
  ultraChorus.start();

  // === GLACIAL PAD (primary element) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 2.0, decay: 0.80, sustain: 0.95, release: 4.0 },
    detune: 15 // Shimmering blur
  }).connect(ultraChorus);

  // Extended voicings: Cmaj9
  const padChords = [
    ["C2", "E3", "G3", "B3", "D4", "E4"], // Cmaj9 (wide spread)
    ["F2", "A3", "C4", "E4", "G4"], // Fmaj9
    ["G2", "B3", "D4", "F#4", "A4"], // Gmaj9
    ["A2", "C3", "E3", "G3", "B3"]  // Am9
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "4m", time, 0.55);
    padIdx++;
  }, "4m").start(0);

  // === FLOATING BASS (barely there) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" }, // Soft rounded tone
    envelope: { attack: 0.50, decay: 0.80, sustain: 0.70, release: 1.0 },
    filterEnvelope: { attack: 0.30, decay: 0.60, sustain: 0.50, baseFrequency: 120, octaves: 1.0 }
  }).connect(ultraChorus);

  const bassPat = ["C2", null, null, null, "F2", null, null, null];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    if (bassPat[bassIdx % bassPat.length]) {
      bass.triggerAttackRelease(bassPat[bassIdx % bassPat.length], "1m", time, 0.45);
    }
    bassIdx++;
  }, "1m").start(0);

  // === SOFT LEAD (distant melody) ===
  const lead = new Tone.Synth({
    oscillator: { type: "sine" }, // Rounded, no edges
    envelope: { attack: 0.40, decay: 0.60, sustain: 0.80, release: 1.5 },
    portamento: 0.35 // Very slow gliding
  }).connect(ultraChorus);

  const leadMelody = ["E5", "D5", "C5", "B4", "C5", "D5", "E5", null];
  const leadVelocities = [0.50, 0.48, 0.45, 0.48, 0.45, 0.48, 0.50, 0];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && leadMelody[leadIdx % leadMelody.length]) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "2m",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.55
      );
    }
    leadIdx++;
  }, "2m").start(0);

  // === TEXTURAL SHIMMER (atmosphere) ===
  const shimmer = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.5, decay: 1.0, sustain: 0.60, release: 2.0 },
    filterEnvelope: { attack: 1.0, decay: 2.0, sustain: 0.40, baseFrequency: 3500, octaves: 2.5 }
  }).connect(ultraChorus);

  const shimmerPattern = ["G5", null, null, null, "A5", null, null, null];
  let shimmerIdx = 0;
  const shimmerLoop = new Tone.Loop((time) => {
    if (shimmerPattern[shimmerIdx % shimmerPattern.length]) {
      shimmer.triggerAttackRelease(shimmerPattern[shimmerIdx % shimmerPattern.length], "2m", time, 0.30);
    }
    shimmerIdx++;
  }, "2m").start(0);

  // === DISTANT KICK (weightless pulse) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.12,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.60, sustain: 0, release: 0.30 }
  }).connect(ultraChorus);

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      kick.triggerAttackRelease("C1", "8n", time, 0.35);
    }
    kickStep++;
  }, "4n").start(0);

  // === BURIED SNARE (barely perceptible) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.05, decay: 0.30, sustain: 0, release: 0.25 }
  }).connect(oceanicReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && snareStep % 4 === 2) {
      snare.triggerAttackRelease("16n", time, 0.25);
    }
    snareStep++;
  }, "4n").start(0);

  // === OCEANIC WASH (atmospheric texture) ===
  const wash = new Tone.MetalSynth({
    frequency: 120,
    envelope: { attack: 0.50, decay: 3.0, release: 4.0 },
    harmonicity: 2.8,
    modulationIndex: 12,
    resonance: 1800
  }).connect(oceanicReverb);

  let washStep = 0;
  const washLoop = new Tone.Loop((time) => {
    if (washStep % 32 === 0) {
      wash.triggerAttackRelease("2m", time, 0.20);
    }
    washStep++;
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, bass, lead, shimmer, kick, snare, wash };
  window.toneJsParts = { padLoop, bassLoop, leadLoop, shimmerLoop, kickLoop, snareLoop, washLoop };
};
```

### Common Mistakes to Avoid

❌ **Too fast**: Slowdive is glacial and patient
- Keep BPM 70-85 (not 90+)
- Long note durations (whole notes, double whole notes)
- Time must feel suspended

❌ **Not enough chorus**: Ultra-heavy is the key
- Chorus depth 0.90 (not 0.50)
- Wet mix 0.90 for complete immersion
- Shimmer everything

❌ **Too percussive**: Drums should be distant ghosts
- Kick at 0.35 volume, buried in chorus
- Snare barely perceptible at 0.25 volume
- Percussion through the wash, not on top of it

❌ **Sharp edges**: Everything must be soft and rounded
- Use sine waves for leads (not saws)
- Long attacks (0.40s+) on all melodic elements
- Slow portamento (0.35s) for weightless glides

### Arrangement Tips

1. **Intro (8 bars)**: Pad alone, establishing oceanic drift
2. **Float (8 bars)**: Bass enters, shimmer adds texture
3. **Swell (8 bars)**: Distant kick pulses, lead melody floats in
4. **Float 2 (8 bars)**: All elements present, time suspended
5. **Drift (8 bars)**: Snare barely perceptible, maximum weightlessness
6. **Fade (8 bars)**: Gradual dissolution, return to single pad

### Mixing Approach

- **Pad**: 0.50-0.60 volume, oceanic foundation with extended voicings
- **Bass**: 0.40-0.50 volume, barely there, floating low
- **Lead**: 0.35-0.45 volume, distant melody through the shimmer
- **Shimmer**: 0.25-0.35 volume, textural atmosphere
- **Kick**: 0.30-0.40 volume, weightless pulse
- **Snare**: 0.20-0.30 volume, ghost in the wash
- **Wash**: 0.15-0.25 volume, oceanic texture
- **Overall**: Ultra-heavy chorus (0.90 depth), massive reverb (9s decay), everything floating weightless in space
