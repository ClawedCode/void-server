---
category: triphop
energy: low
tags: [lo-fi, chill, vinyl]
---
## Lo-Fi Downtempo Trip-Hop

**Tempo**: 80-95 BPM
**Key**: Minor (melancholic, nostalgic)
**Instruments**: Detuned synths, warm saturated bass, dusty drums with swing, vinyl crackle textures, mellow pads
**Structure**: Laid-back intro → Groove establish → Texture layering → Mellow climax → Fade
**Vibe**: Relaxed, mellow, nostalgic warmth - like late-night studying or rainy day introspection. Think Nujabes, DJ Shadow, early Massive Attack. Heavy use of swing, detuned oscillators for warmth, low-pass filtering for "dusty" quality.

### Key Characteristics

1. **Swing Timing** (0.15-0.25): Creates laid-back, human feel
2. **Detuned Synths**: Use detune_cents (8-15 cents) for analog warmth
3. **Low-Pass Filtering**: Keep cutoffs low (250-800 Hz) for muffled, lo-fi quality
4. **Minimal Drums**: Sparse kick patterns, soft snares, subtle hats
5. **Warm Saturation**: Mid-heavy mix, avoid harsh highs
6. **Vinyl Aesthetic**: Use chorus/filtering to create "dusty" texture

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 88;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.20; // Laid-back feel

  // === FX ===
  const reverb = new Tone.Reverb({ decay: 2.0, wet: 0.15 }).toDestination();
  await reverb.generate();

  const chorus = new Tone.Chorus({ frequency: 0.8, depth: 0.6, wet: 0.5 }).toDestination().start();

  // === DUSTY PAD (detuned, low-pass filtered) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 0.5 }).connect(chorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: -12, // Analog warmth
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.5, release: 1.8 }
  }).connect(padFilter);

  // Progression: Am → F → C → G (i-VI-III-VII)
  const chords = [
    ["A3", "C4", "E4"], // Am
    ["F3", "A3", "C4"], // F
    ["C3", "E3", "G3"], // C
    ["G3", "B3", "D4"]  // G
  ];
  let chordIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(chords[chordIndex % chords.length], "1m", time, 0.30);
    chordIndex++;
  }, "1m").start(0);

  // === WARM BASS (detuned, saturated) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 250, Q: 0.7 }).connect(reverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    detune: -10,
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.15 }
  }).connect(bassFilter);

  const bassNotes = ["A1", "A1", "F1", "F1", "C2", "C2", "G1", "G1"];
  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) { // Start after intro
      bass.triggerAttackRelease(bassNotes[bassIndex % bassNotes.length], "8n", time, 0.55);
      bassIndex++;
    }
  }, "8n").start(0);

  // === MELLOW ARP (triangle wave, subtle) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 0.4 }).connect(reverb);
  const arpDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.30, wet: 0.25 }).connect(arpFilter);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.10 }
  }).connect(arpDelay);

  const arpNotes = ["A4", "C5", "E5", "A5", "E5", "C5"];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 14) { // Middle section only
      arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], "8n", time, 0.35);
      arpIdx++;
    }
  }, "8n").start(0);

  // === MINIMAL DRUMS ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.20, sustain: 0, release: 0.05 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      kick.triggerAttackRelease("C1", "8n", time, 0.70);
    }
  }, "4n").start(0);

  // Soft snare with human velocities
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.10, sustain: 0 }
  }).connect(reverb);

  const snareVelocities = [0.5, 0.7, 0.55, 0.75];
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      const vel = snareVelocities[snareStep % snareVelocities.length];
      snare.triggerAttackRelease("16n", time, vel * 0.60);
      snareStep++;
    }
  }, "2n").start(0);

  // Subtle hats with groove
  const hat = new Tone.MetalSynth({
    frequency: 300,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 4.5,
    modulationIndex: 25,
    resonance: 3500
  }).connect(reverb);

  const hatVelocities = [0.6, 0.4, 0.5, 0.35, 0.6, 0.4, 0.5, 0.35];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("16n", time, vel * 0.40);
      hatStep++;
    }
  }, "8n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, bass, arp, kick, snare, hat };
  window.toneJsParts = { padLoop, bassLoop, arpLoop, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Too clean/digital**: Lo-fi requires warmth and imperfection
- Use detuned oscillators (detune_cents: 10-15)
- Keep filter cutoffs low (300-800 Hz range)
- Add chorus for analog warmth

❌ **Too fast/energetic**: Trip-hop is laid-back
- Keep BPM 80-95 (not 110+)
- Use swing 0.15-0.25 for relaxed feel
- Minimal drum patterns, not constant 16ths

❌ **Overly complex arrangements**: Less is more
- Sparse instrumentation (pad + bass + minimal drums)
- Long section durations (6-8 bars) for hypnotic effect
- Avoid busy arpeggios or fast melodic runs

### Mixing Approach

- **Bass**: 0.50-0.60 volume, low-pass filtered (200-300 Hz)
- **Pads**: 0.25-0.35 volume, mid-heavy (800-1200 Hz cutoff)
- **Drums**: 0.60-0.75 volume, soft transients, human velocities
- **Arp (if used)**: 0.30-0.40 volume, filtered, sparse patterns
