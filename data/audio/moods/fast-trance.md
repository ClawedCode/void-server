---
category: electronic
energy: high
tags: [trance, uplifting, fast]
---
## Fast Trance (ATB Style)

**Tempo**: 130-140 BPM
**Key**: Minor or major
**Instruments**: Lead (supersaw-like with saw wave), bass (heavy), arp (fast 16n), drums (4-on-floor), pad (wide)
**Structure**: Build (64 bars) → Drop (peak energy) → Breakdown → Final drop
**Energy**: High, driving, euphoric
**Note**: Use saw wave for lead to approximate supersaw

### Key Characteristics

1. **High Energy Tempo** (130-140 BPM): Driving, euphoric forward motion
2. **Supersaw Lead**: Use saw wave to approximate wide supersaw sound
3. **Fast Arpeggios**: 16th note patterns, constant upward/downward motion
4. **Heavy Sidechain** (8dB): Bass pumps hard against kick for trance groove
5. **Relentless 4-on-Floor**: Unforgiving kick drum drives everything
6. **Long Build**: 64 bars recommended for peak tension, we'll use 5 for brevity

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 138;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - precise trance energy

  // === FX BUSES ===
  const tranceReverb = new Tone.Reverb({ decay: 2.5, wet: 0.30 }).toDestination();
  await tranceReverb.generate();

  const compressor = new Tone.Compressor({
    threshold: -22,
    ratio: 10,
    attack: 0.003,
    release: 0.15
  }).connect(tranceReverb);

  // === SUPERSAW LEAD (wide saw wave) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.20, wet: 0.15 }).connect(tranceReverb);
  const lead = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.90, release: 0.30 },
    detune: 12 // Wide supersaw approximation
  }).connect(leadDelay);

  // Gm → F → Eb → F (i-VII-VI-VII)
  const leadChords = [
    ["G4", "Bb4", "D5"], // Gm
    ["F4", "A4", "C5"], // F
    ["Eb4", "G4", "Bb4"], // Eb
    ["F4", "A4", "C5"]  // F
  ];
  const leadMelody = ["G4", "Bb4", "D5", "C5", "Bb4", "G4", "F4", "G4"];
  const leadVelocities = [0.85, 0.85, 0.90, 0.85, 0.85, 0.80, 0.75, 0.80];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8) { // Start in drop
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "2n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.80
      );
      leadIdx++;
    }
  }, "2n").start(0);

  // === FAST ARPEGGIO (16th notes) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 2500, Q: 1.0 }).connect(compressor);
  const arp = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
  }).connect(arpFilter);

  const arpPattern = [
    ["G4", "Bb4", "D5", "G5"], // Gm
    ["F4", "A4", "C5", "F5"], // F
    ["Eb4", "G4", "Bb4", "Eb5"], // Eb
    ["F4", "A4", "C5", "F5"]  // F
  ];
  let arpChordIdx = 0;
  let arpNoteIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar < 8 || bar >= 14) { // Intro and finale
      const chord = arpPattern[arpChordIdx % arpPattern.length];
      const note = chord[arpNoteIdx % chord.length];
      arp.triggerAttackRelease(note, "16n", time, 0.60);

      arpNoteIdx++;
      if (arpNoteIdx % 8 === 0) arpChordIdx++;
    }
  }, "16n").start(0);

  // === HEAVY BASS (8n pulse with sidechain) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 1.0 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.08 },
    filterEnvelope: { attack: 0.005, decay: 0.12, sustain: 0, baseFrequency: 120, octaves: 2.5 }
  }).connect(bassFilter);

  const bassNotes = ["G1", "G1", "F1", "F1", "Eb1", "Eb1", "F1", "F1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3) { // Start in build
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "8n", time, 0.80);
    }
    bassIdx++;
  }, "8n").start(0);

  // === WIDE PAD (background atmosphere) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.70, release: 2.0 },
    detune: 15 // Wide for trance atmosphere
  }).connect(tranceReverb);

  const padChords = [
    ["G3", "Bb3", "D4"], // Gm
    ["F3", "A3", "C4"], // F
    ["Eb3", "G3", "Bb3"], // Eb
    ["F3", "A3", "C4"]  // F
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, 0.20);
    padIdx++;
  }, "1m").start(0);

  // === RELENTLESS 4-ON-FLOOR KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.03 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      // Heavy sidechain pump
      compressor.threshold.setValueAtTime(-32, time);
      compressor.threshold.exponentialRampToValueAtTime(-22, time + 0.15);
    }
  }, "4n").start(0);

  // === SNARE (2 and 4) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.10, sustain: 0 }
  }).connect(tranceReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.80);
    }
    snareStep++;
  }, "4n").start(0);

  // === DRIVING HI-HATS (16th notes) ===
  const hat = new Tone.MetalSynth({
    frequency: 360,
    envelope: { attack: 0.001, decay: 0.06, release: 0.01 },
    harmonicity: 5.5,
    modulationIndex: 30,
    resonance: 4000
  }).connect(tranceReverb);

  const hatVelocities = [0.7, 0.4, 0.6, 0.35, 0.7, 0.4, 0.6, 0.35];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3) {
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("32n", time, vel * 0.55);
      hatStep++;
    }
  }, "16n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { lead, arp, bass, pad, kick, snare, hat };
  window.toneJsParts = { leadLoop, arpLoop, bassLoop, padLoop, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Not fast enough**: Trance is high-energy
- Keep BPM 130-140 (not 110-120)
- Constant 16th note hi-hats for driving energy
- Relentless 4-on-floor kick, no breaks

❌ **Weak sidechain**: Trance needs aggressive pumping
- Set sidechain to 8-10dB (not 3-4dB)
- Bass should heavily duck on kick
- Creates euphoric breathing rhythm

❌ **Missing the build**: Trance is all about tension
- Long build sections (traditionally 64 bars)
- Filter automation on arps during build
- Strip elements before drop for maximum impact

❌ **Lead not wide enough**: Supersaw is essential
- Use multiple detuned saw waves
- Wide stereo image on lead
- Layer with pad for thickness

### Arrangement Tips

1. **Intro (3 bars)**: Arp only, establish groove
2. **Build (5 bars)**: Add bass and kick, building tension with filter automation
3. **Drop (6 bars)**: Full supersaw lead, all elements, peak euphoria
4. **Breakdown (3 bars)**: Strip to pads and minimal elements, reset energy
5. **Finale (5 bars)**: Return to full energy with arp and lead

### Mixing Approach

- **Lead**: 0.75-0.85 volume, wide supersaw dominates the mix
- **Arp**: 0.55-0.65 volume, constant 16th energy in intro/build
- **Bass**: 0.75-0.85 volume, 8-10dB sidechain for massive pump
- **Pad**: 0.15-0.25 volume, wide atmospheric layer
- **Kick**: 0.95-1.0 volume, relentless and punchy, drives sidechain
- **Drums**: 0.75-0.85 volume, constant 16th hats for energy
