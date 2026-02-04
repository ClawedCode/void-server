---
category: industrial
energy: high
tags: [dark, heavy, cinematic]
---
## Lorn (Industrial Cinematic)

**Tempo**: 65-75 BPM
**Key**: Minor (dark, tense progressions)
**Instruments**: Deep sub-bass (primary focus), glitchy percussion, haunting pad layers, minimal melodic elements, emphasis on sound design and space
**Structure**: Sparse intro with sub-bass → Gradual layering → Heavy drop → Breakdown → Crushing finale
**Vibe**: Dark, heavy, industrial-influenced electronic with emotional weight - like standing in an abandoned warehouse as machinery groans. Aggressive yet deeply melancholic, cinematic tension, sub-bass you feel in your chest

### Key Characteristics

1. **Massive Sub-Bass**: Deep sine waves you feel in your chest, primary sonic element
2. **Slow Heavy Tempo** (65-75 BPM): Creates weight and deliberate movement
3. **Sparse Arrangement**: Focus on space, minimal elements for maximum impact
4. **Dark Atmosphere**: Haunting pads, heavy reverb, industrial textures
5. **Minimal Percussion**: Glitchy, syncopated rhythms, no traditional drum patterns
6. **Sound Design Focus**: Emphasis on texture and timbre over melody

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 70;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - heavy, deliberate

  // === FX BUSES ===
  const deepReverb = new Tone.Reverb({ decay: 4.0, wet: 0.50 }).toDestination();
  await deepReverb.generate();

  const crushReverb = new Tone.Reverb({ decay: 3.5, wet: 0.45 }).toDestination();
  await crushReverb.generate();

  // === MASSIVE SUB-BASS (primary element) ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.80, release: 0.40 }
  }).toDestination();

  // Cm → Bb → Ab → Bb (i-bVII-bVI-bVII)
  const subBassNotes = ["C0", "C0", "Bb-1", "Bb-1", "Ab-1", "Ab-1", "Bb-1", "Bb-1"];
  let subIdx = 0;
  const subBassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 6 ? 0.40 : (bar >= 12 ? 0.90 : 0.70);
    subBass.triggerAttackRelease(subBassNotes[subIdx % subBassNotes.length], "2n", time, velocity);
    subIdx++;
  }, "2n").start(0);

  // === DEEP BASS (filtered saw) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 150, Q: 1.2 }).toDestination();
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.20, sustain: 0, release: 0.15 },
    filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0, baseFrequency: 80, octaves: 2.5 }
  }).connect(bassFilter);

  const bassPattern = ["C2", "C2", "D2", "C2", null, "C2", "Eb2", "C2"];
  const bassVelocities = [0.90, 0.70, 0.85, 0.90, 0, 0.85, 0.95, 0.90];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bassPattern[bassIdx % bassPattern.length]) {
      bass.triggerAttackRelease(
        bassPattern[bassIdx % bassPattern.length],
        "4n",
        time,
        bassVelocities[bassIdx % bassVelocities.length] * 0.75
      );
    }
    bassIdx++;
  }, "4n").start(0);

  // === HAUNTING PAD (dark, filtered) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 0.5 }).connect(deepReverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.85, release: 3.0 },
    detune: -15 // Dark, detuned
  }).connect(padFilter);

  // Filter automation: 800Hz → 300Hz during breakdown
  Tone.Transport.schedule((time) => {
    padFilter.frequency.exponentialRampToValueAtTime(300, time + 4 * (60 / bpm) * 4);
  }, "18:0:0"); // Bar 18 (breakdown)

  const padChords = [
    ["C3", "Eb3", "G3"], // Cm
    ["Bb2", "D3", "F3"], // Bb
    ["Ab2", "C3", "Eb3"], // Ab
    ["Bb2", "D3", "F3"]  // Bb
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, 0.20);
    padIdx++;
  }, "2m").start(0);

  // === SPARSE MELODIC ELEMENT (industrial, haunting) ===
  const lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.02, decay: 0.25, sustain: 0, release: 0.30 }
  }).connect(crushReverb);

  const leadMelody = ["C4", null, null, "Eb4", null, null, null, null];
  const leadVelocities = [0.60, 0, 0, 0.65, 0, 0, 0, 0];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 12 && leadMelody[leadIdx % leadMelody.length]) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "2n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.50
      );
    }
    leadIdx++;
  }, "2n").start(0);

  // === MINIMAL KICK (heavy, sparse) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 7,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.30, sustain: 0, release: 0.08 }
  }).toDestination();

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    // Minimal pattern: only on certain beats
    if (bar >= 6 && kickStep % 4 === 0) {
      kick.triggerAttackRelease("C0", "8n", time, 0.95);
    }
    kickStep++;
  }, "4n").start(0);

  // === GLITCHY PERCUSSION (syncopated hi-hat) ===
  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: { attack: 0.001, decay: 0.06, release: 0.01 },
    harmonicity: 3.5,
    modulationIndex: 22,
    resonance: 2800
  }).toDestination();

  // Syncopated, glitchy pattern
  const hatPattern = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && hatPattern[hatStep % hatPattern.length]) {
      hat.triggerAttackRelease("32n", time, 0.35);
    }
    hatStep++;
  }, "16n").start(0);

  // === INDUSTRIAL NOISE TEXTURE (sparse) ===
  const noise = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: { attack: 0.05, decay: 0.20, sustain: 0 }
  }).connect(deepReverb);

  let noiseStep = 0;
  const noiseLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    // Very sparse, random-feeling hits
    if (bar >= 12 && noiseStep % 11 === 0) {
      noise.triggerAttackRelease("8n", time, 0.25);
    }
    noiseStep++;
  }, "8n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { subBass, bass, pad, lead, kick, hat, noise };
  window.toneJsParts = { subBassLoop, bassLoop, padLoop, leadLoop, kickLoop, hatLoop, noiseLoop };
};
```

### Common Mistakes to Avoid

❌ **Too fast/energetic**: Lorn is slow and heavy
- Keep BPM 65-75 (not 90+)
- Create weight through tempo and space
- Deliberate, crushing movement

❌ **Over-layering instruments**: Less is more
- Focus on sub-bass as primary element
- Sparse melodic content
- Use space and silence for impact

❌ **Not dark enough**: This is industrial, not ambient
- Use minor keys with dark progressions (i-bVII-bVI)
- Heavy filtering, keep sounds muffled
- Aggressive sub-bass, not gentle atmosphere

❌ **Traditional drum patterns**: Avoid 4-on-floor
- Minimal, syncopated percussion
- Glitchy, industrial textures
- Focus on weight over rhythm

### Arrangement Tips

1. **Intro (6 bars)**: Sub-bass and pad only, establish dark atmosphere
2. **Layer (6 bars)**: Add filtered bass and minimal kick, building tension
3. **Drop (6 bars)**: Full sub-bass, sparse melodic element enters, crushing weight
4. **Breakdown (4 bars)**: Strip to pads with filter automation, create void
5. **Finale (6 bars)**: Return to full intensity, all elements, maximum sub-bass

### Mixing Approach

- **Sub-Bass**: 0.40-0.90 volume (dynamic across sections), primary sonic focus
- **Bass**: 0.70-0.80 volume, heavily filtered for industrial grit
- **Pad**: 0.15-0.25 volume, atmospheric layer bathed in reverb
- **Lead**: 0.45-0.55 volume, sparse and haunting, only in drop/finale
- **Percussion**: 0.30-0.40 volume, glitchy and minimal, not driving
- **Kick**: 0.90-1.0 volume, sparse but heavy when it hits
