---
category: cinematic
energy: high
tags: [epic, orchestral, emotional]
---
## Hans Zimmer (Interstellar Minimalist)

**Tempo**: 60-75 BPM
**Key**: Minor (modal, ambiguous tonality)
**Instruments**: Pipe organ-inspired sustained tones, sparse ticking percussion, overwhelming low-end presence
**Structure**: Slow build → Cathedral space → Sustained climax → Fade
**Vibe**: Cathedral space, pipe organ-inspired sustained tones, glacial harmonic movement, massive reverb creating infinite space, spiritual grandeur through restraint, time dilation made audible

### Key Characteristics

1. **Pipe Organ Tones**: Primary element with extremely slow attack (1.0s+) and long sustain
2. **Glacial Movement**: Minimal harmonic changes, focus on timbre and space
3. **Massive Reverb**: Cathedral-like space with 8+ second decay
4. **Sparse Percussion**: Ticking clock elements, minimal rhythmic presence
5. **Overwhelming Low-End**: Sub-bass presence that creates physical weight
6. **Spiritual Restraint**: Power through minimalism and patience

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 68;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - cathedral solemnity

  // === FX BUSES ===
  const cathedralReverb = new Tone.Reverb({ decay: 8.0, wet: 0.70 }).toDestination();
  await cathedralReverb.generate();

  const infiniteReverb = new Tone.Reverb({ decay: 12.0, wet: 0.50 }).toDestination();
  await infiniteReverb.generate();

  // === PIPE ORGAN (primary element) ===
  const organ = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 1.2, decay: 0.2, sustain: 0.98, release: 5.0 }
  }).connect(cathedralReverb);
  organ.volume.value = -8;

  // Am → C → F → G (i-III-VI-VII) - glacial modal progression
  const organChords = [
    ["A1", "A2", "E3", "A3"], // Am with power fifth
    ["C2", "C3", "G3", "C4"], // C major
    ["F1", "F2", "C3", "F3"], // F major
    ["G1", "G2", "D3", "G3"]  // G major
  ];
  let organIdx = 0;
  const organLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.35 : (bar >= 12 ? 0.85 : 0.60);
    organ.triggerAttackRelease(organChords[organIdx % organChords.length], "4m", time, velocity);
    organIdx++;
  }, "2m");

  // === SUB BASS (overwhelming low-end) ===
  const subBass = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.5, decay: 0.3, sustain: 0.90, release: 2.0 }
  }).toDestination();
  subBass.volume.value = -4;

  const bassNotes = ["A0", "C1", "F0", "G0"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) { // Enter after intro
      const velocity = bar >= 12 ? 0.85 : 0.65;
      subBass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "2m", time, velocity);
    }
    bassIdx++;
  }, "2m");

  // === HARMONIC OVERTONES (timbre depth) ===
  const overtones = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 2.0, decay: 0.5, sustain: 0.85, release: 6.0 }
  }).connect(infiniteReverb);
  overtones.volume.value = -20;

  const overtoneChords = [
    ["E4", "A4", "C5"], // High harmonics
    ["G4", "C5", "E5"],
    ["C5", "F5", "A5"],
    ["D5", "G5", "B5"]
  ];
  let overtoneIdx = 0;
  const overtoneLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar % 2 === 0) { // Sparse, only on even bars after build
      overtones.triggerAttackRelease(overtoneChords[overtoneIdx % overtoneChords.length], "4m", time, 0.40);
      overtoneIdx++;
    }
  }, "2m");

  // === TICKING CLOCK (sparse percussion) ===
  const tick = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
  }).toDestination();
  tick.volume.value = -24;

  const tickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 16) { // Only in middle section
      tick.triggerAttackRelease("C5", "32n", time, 0.30);
    }
  }, "4n");

  // === MASTER CHAIN ===
  const masterFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 0.3 }).toDestination();

  // Connect reverbs to master filter instead of direct to destination
  cathedralReverb.disconnect();
  cathedralReverb.connect(masterFilter);
  infiniteReverb.disconnect();
  infiniteReverb.connect(masterFilter);
  subBass.disconnect();
  subBass.connect(masterFilter);
  tick.disconnect();
  tick.connect(masterFilter);

  // Gradual filter opening (glacial reveal)
  Tone.Transport.schedule((time) => {
    masterFilter.frequency.rampTo(2000, 20, time); // 20 second sweep
  }, 0);

  // === START LOOPS ===
  organLoop.start(0);
  bassLoop.start(0);
  overtoneLoop.start(0);
  tickLoop.start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { organ, subBass, overtones, tick, cathedralReverb, infiniteReverb, masterFilter };
  window.toneJsParts = { organLoop, bassLoop, overtoneLoop, tickLoop };
};
```

### Common Mistakes
- Too fast tempo - this style requires extreme patience (60-75 BPM maximum)
- Complex progressions - use simple modal changes, focus on timbre
- Not enough reverb - cathedral space is essential, 8+ second decay
- Too much percussion - sparse ticking only, not a rhythm section
- Weak sub-bass - low-end presence must be overwhelming

### Arrangement Tips
- **Intro (4 bars)**: Organ alone with infinite reverb, establishing space
- **Build (8 bars)**: Add sub-bass, maintain glacial pace
- **Climax (8 bars)**: Full harmonic overtones, maximum intensity through restraint
- **Outro (4 bars)**: Fade to organ alone, reverb tail extends beyond track

### Mixing Approach
- Organ: -8dB, cathedral reverb
- Sub Bass: -4dB, no reverb (direct power)
- Overtones: -20dB, infinite reverb (ethereal presence)
- Ticking: -24dB, sparse (time awareness)
- Master: Gentle lowpass filter sweep from 600Hz to 2kHz over duration
