---
category: ballad
energy: medium
tags: [synth, dark, romantic]
---
## Depeche Mode (Dark Romance)

**Tempo**: 100-115 BPM
**Key**: Minor (unresolved progressions)
**Instruments**: Deep filtered bass, melancholic arpeggios, dramatic lead, sparse reverb drums
**Structure**: Verse → Chorus → Verse → Chorus → Bridge → Chorus
**Vibe**: Brooding elegance - sophisticated sadness with analog warmth, minor harmonies without resolution

### Key Characteristics

1. **Deep Filtered Bass**: Moderate resonance, slow filter sweeps creating movement
2. **Melancholic Arpeggios**: Minor chord patterns, slightly detuned for warmth
3. **Dramatic Gliding Leads**: Expressive portamento, emotional melodic lines
4. **Sparse Reverb Drums**: Space between hits, deep reverb creating atmosphere
5. **Minor Without Resolution**: Progressions stay dark, no major uplift
6. **Analog Warmth**: Subtle detuning, organic imperfection, vintage character

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 108;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - steady, brooding

  // === FX BUSES ===
  const darkReverb = new Tone.Reverb({ decay: 3.5, wet: 0.45 }).toDestination();
  await darkReverb.generate();

  const moodDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.35, wet: 0.30 }).connect(darkReverb);

  // === DEEP BASS (foundation) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.30, sustain: 0.50, release: 0.20 },
    filterEnvelope: { attack: 0.02, decay: 0.25, sustain: 0.40, baseFrequency: 180, octaves: 1.8 }
  }).toDestination();

  // Dm → Bb → Am → C (i-VI-v-VII)
  const bassPat = ["D2", "D2", null, "D2", "Bb1", "Bb1", null, "A1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    if (bassPat[bassIdx % bassPat.length]) {
      bass.triggerAttackRelease(bassPat[bassIdx % bassPat.length], "8n", time, 0.75);
    }
    bassIdx++;
  }, "8n").start(0);

  // === MELANCHOLIC ARPEGGIO ===
  const arp = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.20, sustain: 0.30, release: 0.15 },
    filterEnvelope: { attack: 0.01, decay: 0.12, sustain: 0.25, baseFrequency: 1800, octaves: 2.0 }
  }).connect(moodDelay);

  const arpPattern = ["D4", "F4", "A4", "F4", "Bb3", "D4", "F4", "D4"];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    arp.triggerAttackRelease(arpPattern[arpIdx % arpPattern.length], "16n", time, 0.60);
    arpIdx++;
  }, "16n").start(0);

  // === DRAMATIC LEAD (verse and chorus) ===
  const lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.05, decay: 0.25, sustain: 0.65, release: 0.40 },
    portamento: 0.12 // Expressive gliding
  }).connect(moodDelay);

  const leadMelody = ["D5", "C5", "Bb4", "A4", "G4", "A4", "Bb4", null];
  const leadVelocities = [0.75, 0.70, 0.65, 0.70, 0.65, 0.70, 0.75, 0];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && leadMelody[leadIdx % leadMelody.length]) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "4n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.70
      );
    }
    leadIdx++;
  }, "4n").start(0);

  // === WARM PAD (subtle atmosphere) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.50, decay: 0.30, sustain: 0.85, release: 1.5 },
    detune: 7 // Analog warmth
  }).connect(darkReverb);

  const padChords = [
    ["D3", "F3", "A3"], // Dm
    ["Bb2", "D3", "F3"], // Bb
    ["A2", "C3", "E3"], // Am
    ["C3", "E3", "G3"]  // C
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, 0.35);
    padIdx++;
  }, "1m").start(0);

  // === SPARSE KICK (four-on-floor but restrained) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.10 }
  }).connect(darkReverb);

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 0.70);
    kickStep++;
  }, "4n").start(0);

  // === DEEP SNARE (sparse, on 2 and 4) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.12 }
  }).connect(darkReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    if (snareStep % 4 === 2) {
      snare.triggerAttackRelease("16n", time, 0.60);
    }
    snareStep++;
  }, "4n").start(0);

  // === ATMOSPHERIC HI-HATS (very subtle) ===
  const hihat = new Tone.MetalSynth({
    frequency: 180,
    envelope: { attack: 0.001, decay: 0.10, release: 0.08 },
    harmonicity: 4.5,
    modulationIndex: 25,
    resonance: 3500
  }).connect(darkReverb);

  let hihatStep = 0;
  const hihatLoop = new Tone.Loop((time) => {
    const velocity = hihatStep % 2 === 0 ? 0.35 : 0.20;
    hihat.triggerAttackRelease("32n", time, velocity);
    hihatStep++;
  }, "8n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { bass, arp, lead, pad, kick, snare, hihat };
  window.toneJsParts = { bassLoop, arpLoop, leadLoop, padLoop, kickLoop, snareLoop, hihatLoop };
};
```

### Common Mistakes to Avoid

❌ **Too bright**: Depeche Mode is dark and moody
- Keep filter cutoffs moderate (1800Hz max)
- Use minor progressions without major resolution
- Avoid cheerful or uplifting moments

❌ **Too fast**: This is brooding, not energetic
- Keep BPM 100-115 (not 120+)
- Allow space between elements
- Let the mood breathe

❌ **Too dry**: Reverb creates the atmosphere
- Use deep reverb (3.5s decay) on drums and pads
- Delay on leads and arpeggios for space
- Create depth and dimension

❌ **Missing analog warmth**: This isn't digital precision
- Add detuning (5-7 cents) for organic feel
- Moderate filter resonance, not harsh
- Imperfect is perfect

### Arrangement Tips

1. **Intro (4 bars)**: Bass and arpeggio establish dark mood
2. **Verse (8 bars)**: Lead enters with melancholic melody, pads support
3. **Chorus (8 bars)**: All elements present, emotional intensity without resolution
4. **Verse 2 (8 bars)**: Variation on lead melody, maintaining darkness
5. **Bridge (4 bars)**: Strip to bass and pads, tension and space
6. **Final Chorus (8 bars)**: Full arrangement, unresolved ending

### Mixing Approach

- **Bass**: 0.70-0.80 volume, deep foundation with moderate filtering
- **Arpeggio**: 0.55-0.65 volume, threading through the mix
- **Lead**: 0.65-0.75 volume, emotional focal point
- **Pad**: 0.30-0.40 volume, warm atmospheric support
- **Kick**: 0.65-0.75 volume, present but not aggressive
- **Snare**: 0.55-0.65 volume, deep and reverberant
- **Hi-hats**: 0.20-0.35 volume, subtle texture
- **Overall**: Dark, spacious, sophisticated - let reverb and delay create the atmosphere
