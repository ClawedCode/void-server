---
category: electronic
energy: medium
tags: [krautrock, motorik, minimal]
---
## Kraftwerk (Motorik Precision)

**Tempo**: 120-130 BPM
**Key**: Minor or modal (geometric patterns)
**Instruments**: Robotic sequences, clean bass, minimal leads, metronomic drums
**Structure**: Intro → Section A → Section B → Section A → Outro
**Vibe**: Mechanical repetition - robotic accuracy, hypnotic sequences, geometric patterns, inhuman perfection

### Key Characteristics

1. **Robotic Accuracy**: Perfect timing, no humanization, no swing
2. **Minimal Variation**: Patterns repeat with geometric precision
3. **Hypnotic Sequences**: Repetitive arpeggios that entrance through consistency
4. **Geometric Patterns**: Mathematical relationships between notes
5. **Clean Tones**: Dry production, minimal effects, crisp and clear
6. **Metronomic Drums**: Exact, unwavering, machine-like percussion

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 126;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - perfect mechanical timing

  // === MINIMAL FX (dry production) ===
  const cleanReverb = new Tone.Reverb({ decay: 0.8, wet: 0.15 }).toDestination();
  await cleanReverb.generate();

  // === ROBOTIC SEQUENCE (primary element) ===
  const sequence = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.001, decay: 0.10, sustain: 0.15, release: 0.05 },
    filterEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.20, baseFrequency: 2500, octaves: 2.0 }
  }).toDestination();

  // Geometric pattern: Em pentatonic
  const seqPattern = ["E4", "G4", "A4", "B4", "E4", "G4", "A4", "D4"];
  let seqIdx = 0;
  const seqLoop = new Tone.Loop((time) => {
    sequence.triggerAttackRelease(seqPattern[seqIdx % seqPattern.length], "16n", time, 0.70);
    seqIdx++;
  }, "16n").start(0);

  // === CLEAN BASS (metronomic) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.30, release: 0.08 },
    filterEnvelope: { attack: 0.001, decay: 0.10, sustain: 0.25, baseFrequency: 150, octaves: 1.5 }
  }).toDestination();

  const bassPat = ["E2", "E2", null, "E2", "E2", null, "E2", "E2"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    if (bassPat[bassIdx % bassPat.length]) {
      bass.triggerAttackRelease(bassPat[bassIdx % bassPat.length], "8n", time, 0.75);
    }
    bassIdx++;
  }, "8n").start(0);

  // === MINIMAL LEAD (sparse melodic element) ===
  const lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.40, release: 0.15 },
    portamento: 0 // No gliding, robotic
  }).connect(cleanReverb);

  const leadMelody = ["E5", null, null, null, "D5", null, null, null];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && leadMelody[leadIdx % leadMelody.length]) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "2n",
        time,
        0.65
      );
    }
    leadIdx++;
  }, "2n").start(0);

  // === ROBOTIC PAD (subtle harmonic support) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.20, decay: 0.10, sustain: 0.85, release: 0.80 },
    detune: 0 // Perfect tuning, no warmth
  }).connect(cleanReverb);

  const padChords = [
    ["E3", "G3", "B3"], // Em
    ["E3", "G3", "B3"], // Em (repetition)
    ["D3", "F#3", "A3"], // D
    ["E3", "G3", "B3"]  // Em
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, 0.30);
    padIdx++;
  }, "1m").start(0);

  // === METRONOMIC KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.05 }
  }).toDestination();

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 0.80);
    kickStep++;
  }, "4n").start(0);

  // === PRECISE SNARE (on 2 and 4, exact timing) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 }
  }).toDestination();

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    if (snareStep % 4 === 2) {
      snare.triggerAttackRelease("16n", time, 0.70);
    }
    snareStep++;
  }, "4n").start(0);

  // === GEOMETRIC HI-HATS (perfect 16ths) ===
  const hihat = new Tone.MetalSynth({
    frequency: 220,
    envelope: { attack: 0.001, decay: 0.06, release: 0.04 },
    harmonicity: 5.5,
    modulationIndex: 30,
    resonance: 4500
  }).toDestination();

  let hihatStep = 0;
  const hihatLoop = new Tone.Loop((time) => {
    const velocity = hihatStep % 4 === 0 ? 0.50 : 0.30; // Accent on downbeats
    hihat.triggerAttackRelease("32n", time, velocity);
    hihatStep++;
  }, "16n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { sequence, bass, lead, pad, kick, snare, hihat };
  window.toneJsParts = { seqLoop, bassLoop, leadLoop, padLoop, kickLoop, snareLoop, hihatLoop };
};
```

### Common Mistakes to Avoid

❌ **Too human**: Kraftwerk is machine-perfect
- No swing or humanization
- Perfect timing on every note
- No variation for "feel"

❌ **Too complex**: This is about repetition
- Minimal chord changes
- Geometric patterns that repeat
- Simplicity creates hypnotic effect

❌ **Too wet**: Production is dry and clean
- Minimal reverb (0.8s decay max)
- No delays or modulation
- Crisp, clear, industrial

❌ **Too varied**: Consistency is key
- Patterns repeat exactly
- Minimal dynamic changes
- Machine-like precision throughout

### Arrangement Tips

1. **Intro (8 bars)**: Sequence and kick establish motorik rhythm
2. **Section A (16 bars)**: Bass enters, pattern repeats hypnotically
3. **Section B (16 bars)**: Minimal lead adds sparse melodic element
4. **Section A Return (16 bars)**: Back to core pattern, variation through repetition
5. **Outro (8 bars)**: Gradual fade, maintaining consistency to the end

### Mixing Approach

- **Sequence**: 0.65-0.75 volume, crisp and present
- **Bass**: 0.70-0.80 volume, metronomic foundation
- **Lead**: 0.60-0.70 volume, sparse and minimal
- **Pad**: 0.25-0.35 volume, subtle harmonic support
- **Kick**: 0.75-0.85 volume, driving the motorik beat
- **Snare**: 0.65-0.75 volume, precise and clean
- **Hi-hats**: 0.30-0.50 volume, geometric pattern
- **Overall**: Dry, clean, industrial - numbers and geometry made sound, inhuman perfection
