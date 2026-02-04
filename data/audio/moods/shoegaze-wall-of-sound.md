---
category: ambient
energy: medium
tags: [shoegaze, reverb, dreamy]
---
## Shoegaze (Wall of Sound)

**Tempo**: 90-105 BPM
**Key**: Minor (drowned in effects)
**Instruments**: Heavily chorused saw waves, washed-out textures, distant leads, buried drums
**Structure**: Intro → Verse → Swell → Verse → Swell → Outro
**Vibe**: Dense layers like My Bloody Valentine - heavily chorused, extreme reverb, dreamlike wash with crushing noise floor

### Key Characteristics

1. **Heavily Chorused Guitars**: Saw waves buried in extreme chorus depth 0.85
2. **Washed-Out Textures**: Everything swimming in reverb and delay feedback
3. **Slow Filter Sweeps**: Gradual movement creating evolving soundscape
4. **Distant Leads**: Melodies buried in the mix, swimming in effects
5. **Lo-Fi Aesthetic**: Embracing noise floor and distortion
6. **Dense Layers**: Wall of sound where individual elements blur together

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 98;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - drowned in effects

  // === EXTREME FX BUSES ===
  const massiveReverb = new Tone.Reverb({ decay: 8.0, wet: 0.70 }).toDestination();
  await massiveReverb.generate();

  const feedbackDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.60, wet: 0.50 }).connect(massiveReverb);

  const extremeChorus = new Tone.Chorus({ frequency: 1.2, delayTime: 12, depth: 0.85, wet: 0.85 }).connect(feedbackDelay);
  extremeChorus.start();

  // === WASHED-OUT RHYTHM (buried foundation) ===
  const rhythm = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.05, decay: 0.30, sustain: 0.40, release: 0.25 },
    filterEnvelope: { attack: 0.10, decay: 0.50, sustain: 0.35, baseFrequency: 1200, octaves: 1.5 }
  }).connect(extremeChorus);

  const rhythmPattern = ["E3", "G3", "E3", "G3", "D3", "G3", "D3", "G3"];
  let rhythmIdx = 0;
  const rhythmLoop = new Tone.Loop((time) => {
    rhythm.triggerAttackRelease(rhythmPattern[rhythmIdx % rhythmPattern.length], "8n", time, 0.55);
    rhythmIdx++;
  }, "8n").start(0);

  // === DROWNED BASS (low rumble) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.08, decay: 0.40, sustain: 0.50, release: 0.30 },
    filterEnvelope: { attack: 0.05, decay: 0.30, sustain: 0.40, baseFrequency: 150, octaves: 1.2 }
  }).connect(extremeChorus);

  const bassPat = ["E2", null, "E2", null, "D2", null, "D2", null];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    if (bassPat[bassIdx % bassPat.length]) {
      bass.triggerAttackRelease(bassPat[bassIdx % bassPat.length], "4n", time, 0.60);
    }
    bassIdx++;
  }, "4n").start(0);

  // === TEXTURAL PAD (thick wash) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.0, decay: 0.50, sustain: 0.90, release: 2.5 },
    detune: 12 // Lo-fi shimmer
  }).connect(extremeChorus);

  const padChords = [
    ["E3", "G3", "B3", "E4"], // Em
    ["D3", "F#3", "A3", "D4"], // D
    ["C3", "E3", "G3", "C4"], // C
    ["D3", "F#3", "A3", "D4"]  // D
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, 0.50);
    padIdx++;
  }, "2m").start(0);

  // === DISTANT LEAD (buried in mix) ===
  const lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.15, decay: 0.40, sustain: 0.65, release: 0.80 },
    portamento: 0.25 // Very slow glides
  }).connect(extremeChorus);

  const leadMelody = ["E5", "D5", "C5", "B4", "A4", "B4", "C5", null];
  const leadVelocities = [0.55, 0.50, 0.48, 0.50, 0.45, 0.50, 0.55, 0];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && leadMelody[leadIdx % leadMelody.length]) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "1n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.60
      );
    }
    leadIdx++;
  }, "1n").start(0);

  // === NOISE LAYER (lo-fi aesthetic) ===
  const noise = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.20, decay: 0.50, sustain: 0.15, release: 0.40 }
  }).connect(massiveReverb);

  let noiseStep = 0;
  const noiseLoop = new Tone.Loop((time) => {
    if (noiseStep % 16 === 0) {
      noise.triggerAttackRelease("2n", time, 0.15);
    }
    noiseStep++;
  }, "4n").start(0);

  // === BURIED KICK (distant thump) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.40, sustain: 0, release: 0.15 }
  }).connect(extremeChorus);

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 0.50);
    kickStep++;
  }, "4n").start(0);

  // === WASHED SNARE (barely there) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.01, decay: 0.20, sustain: 0, release: 0.15 }
  }).connect(massiveReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    if (snareStep % 4 === 2) {
      snare.triggerAttackRelease("16n", time, 0.35);
    }
    snareStep++;
  }, "4n").start(0);

  // === TEXTURAL CYMBAL (atmospheric wash) ===
  const cymbal = new Tone.MetalSynth({
    frequency: 150,
    envelope: { attack: 0.10, decay: 2.0, release: 3.0 },
    harmonicity: 3.2,
    modulationIndex: 15,
    resonance: 2000
  }).connect(massiveReverb);

  let cymbalStep = 0;
  const cymbalLoop = new Tone.Loop((time) => {
    if (cymbalStep % 16 === 0) {
      cymbal.triggerAttackRelease("1m", time, 0.25);
    }
    cymbalStep++;
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { rhythm, bass, pad, lead, noise, kick, snare, cymbal };
  window.toneJsParts = { rhythmLoop, bassLoop, padLoop, leadLoop, noiseLoop, kickLoop, snareLoop, cymbalLoop };
};
```

### Common Mistakes to Avoid

❌ **Too clean**: Shoegaze is about texture and noise
- Embrace the lo-fi aesthetic
- Add noise layers for crushing effect
- Let elements blur together

❌ **Not enough chorus**: This is extreme modulation
- Chorus depth 0.85 (not 0.30)
- Multiple chorus stages if possible
- Everything swimming in modulation

❌ **Too dry**: Reverb is the instrument
- Massive reverb (8s decay) on everything
- High feedback delay (0.60) for wash
- Wet mix 0.70+ on reverb

❌ **Too defined**: The wall-of-sound is about blur
- Slow attacks (0.15s+) on leads
- Long releases (2.0s+) on pads
- Distant buried mix on all elements

### Arrangement Tips

1. **Intro (8 bars)**: Rhythm and bass establish drowned foundation
2. **Verse (8 bars)**: Pads swell in, creating thickness
3. **Swell (4 bars)**: All elements present, noise layer adds density
4. **Verse 2 (8 bars)**: Lead enters, buried in the wall
5. **Swell 2 (4 bars)**: Maximum density, everything blurred together
6. **Outro (8 bars)**: Gradual fade, wash continues to infinity

### Mixing Approach

- **Rhythm**: 0.50-0.60 volume, buried in chorus
- **Bass**: 0.55-0.65 volume, low rumble through the wash
- **Pad**: 0.45-0.55 volume, thick harmonic foundation
- **Lead**: 0.35-0.45 volume, distant and buried
- **Noise**: 0.10-0.20 volume, lo-fi texture
- **Kick**: 0.45-0.55 volume, distant thump
- **Snare**: 0.30-0.40 volume, barely perceptible
- **Cymbal**: 0.20-0.30 volume, atmospheric wash
- **Overall**: Dense, washed-out, lo-fi - extreme chorus and reverb create impenetrable wall
