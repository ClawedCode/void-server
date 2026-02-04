---
category: synthwave
energy: high
tags: [retro, 80s, neon]
---
## Kavinsky (Retro Outrun)

**Tempo**: 88-98 BPM
**Key**: Minor (dark progressions, often i-VI-III-VII or i-bVII-VI-VII)
**Instruments**: Heavy sidechained bass, aggressive square/saw lead, gated reverb snare, strings for drama, driving 4-on-floor
**Structure**: Dark intro → Build with strings → Drop with full sidechain → Epic breakdown → Final drop
**Vibe**: Nighttime Los Angeles drive, neon-soaked streets, cinematic tension, retro-futuristic menace like Nightcall or Odd Look

### Key Characteristics

1. **Heavy Sidechain** (8-10 dB): Creates pulsing, driving rhythm
2. **Dark Progressions**: Minor key, i-VI-III-VII or i-bVII-VI-VII
3. **Gated Reverb Snare**: Essential 80s aesthetic
4. **Dramatic Strings**: Layered for cinematic tension
5. **Square Wave Lead**: Aggressive, retro synth sound
6. **4-on-Floor Kick**: Driving, unrelenting pulse

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 94;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 1.5, wet: 0.20 }).toDestination();
  await masterReverb.generate();

  // Sidechain compressor for pumping effect
  const compressor = new Tone.Compressor({
    threshold: -25,
    ratio: 10,
    attack: 0.003,
    release: 0.20
  }).connect(masterReverb);

  // === HEAVY SIDECHAINED BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 220, Q: 0.9 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.10 }
  }).connect(bassFilter);

  const bassNotes = ["F1", "Db2", "Ab1", "Eb2"]; // i-VI-III-VII in F minor
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) { // Start in build
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "8n", time, 0.80);
      bassIdx++;
    }
  }, "8n").start(0);

  // === AGGRESSIVE SQUARE LEAD ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.25, wet: 0.20 }).connect(masterReverb);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.10 }
  }).connect(leadDelay);

  const leadMelody = ["F4", "Eb4", "Db4", "Ab3", "Db4", "Eb4", "F4"];
  const leadVelocities = [0.85, 0.80, 0.85, 0.90, 0.85, 0.80, 0.85];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 15) { // Build through drop
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "2n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.80
      );
      leadIdx++;
    }
  }, "2n").start(0);

  // === DRAMATIC STRINGS ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.5, decay: 0.3, sustain: 0.90, release: 2.5 }
  }).connect(masterReverb);

  const stringChords = [
    ["F3", "Ab3", "C4", "F4"],  // Fm
    ["Db3", "F3", "Ab3", "Db4"], // Db
    ["Ab3", "C4", "Eb4", "Ab4"], // Ab
    ["Eb3", "G3", "Bb3", "Eb4"]  // Eb
  ];
  let stringIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.50 : (bar >= 9 ? 0.70 : 0.60);
    strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], "1m", time, velocity);
    stringIdx++;
  }, "1m").start(0);

  // === 4-ON-FLOOR KICK (triggers sidechain) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.20, sustain: 0, release: 0.05 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      // Trigger sidechain pump
      compressor.threshold.setValueAtTime(-35, time);
      compressor.threshold.exponentialRampToValueAtTime(-25, time + 0.20);
    }
  }, "4n").start(0);

  // === GATED REVERB SNARE ===
  const snareReverb = new Tone.Reverb({ decay: 0.6, wet: 0.70 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.08, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && snareStep % 2 === 1) { // On beats 2 and 4
      snare.triggerAttackRelease("16n", time, 0.90);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS (16th notes, driving groove) ===
  const hat = new Tone.MetalSynth({
    frequency: 320,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 5.0,
    modulationIndex: 26,
    resonance: 3600
  }).connect(masterReverb);

  const hatVelocities = [0.7, 0.4, 0.6, 0.35, 0.7, 0.4, 0.6, 0.35];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("16n", time, vel * 0.50);
      hatStep++;
    }
  }, "16n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { bass, lead, strings, kick, snare, hat };
  window.toneJsParts = { bassLoop, leadLoop, stringsLoop, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Weak sidechain**: Outrun needs aggressive pumping
- Set sidechain_duck_db to 8-10 (not 3-4)
- Apply heavy compression to bass and pads
- Creates signature "breathing" rhythm

❌ **Missing gated reverb on snare**: Essential 80s aesthetic
- Use short reverb decay (0.6-0.8s)
- High wet mix (0.60-0.70)
- Creates iconic "gated plate" sound

❌ **Not dark enough**: This isn't upbeat synthwave
- Use minor progressions (i-VI-III-VII or i-bVII-VI-VII)
- Keep lead melodies tense, not happy
- Dark, driving energy - not playful

❌ **Tempo too fast**: Kavinsky is cruising, not racing
- Keep BPM 88-98 (not 110+)
- Create sense of powerful forward motion, not frenetic energy

### Arrangement Tips

1. **Intro (4 bars)**: Strings only, build tension
2. **Build (5 bars)**: Add lead melody, increasing drama
3. **Drop (6 bars)**: Full instrumentation, heavy sidechain, peak energy
4. **Breakdown (4 bars)**: Strip to strings + minimal bass, reset tension
5. **Finale (5 bars)**: Return to full energy, all instruments

### Mixing Approach

- **Bass**: 0.75-0.85 volume, 10dB sidechain duck for massive pump
- **Lead**: 0.75-0.85 volume, aggressive square wave, cutting through mix
- **Strings**: 0.50-0.70 volume, dramatic swells for cinematic feel
- **Drums**: 0.90-1.0 volume, kick drives everything, gated snare signature
- **Hi-hats**: 0.45-0.55 volume, driving 16ths create forward momentum
