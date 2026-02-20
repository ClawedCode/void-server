---
category: ballad
energy: low
tags: [piano, emotional, minimal, intimate, classical-crossover, Maxence-Cyrin]
---
## Piano Ballad (Maxence Cyrin Style)

**Tempo**: 50-70 BPM
**Key**: Minor or major (not locked to minor!)
**Instruments**: Piano (primary), minimal bass, NO drums, optional strings for swells
**Structure**: Intro (piano solo) → Verse (piano + bass) → Chorus (piano + strings) → Outro (piano solo fade)
**Vibe**: Intimate, emotional, minimalist - like Maxence Cyrin's piano covers

### Key Characteristics

1. **Piano as Primary Voice**: Expressive sine wave piano, center of composition
2. **Slow Intimate Tempo** (50-70 BPM): Creates emotional space and vulnerability
3. **Minimal Arrangement**: Focus on piano, sparse support from bass/strings
4. **NO Drums**: Pure melodic/harmonic content, no percussion
5. **Dynamic Velocity**: Human touch with varied note velocities
6. **Allow Major Keys**: Not locked to minor - major keys can be deeply emotional

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 65;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.05; // Very slight humanization

  // === FX BUSES ===
  const intimateReverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 }).toDestination();
  await intimateReverb.generate();

  const softReverb = new Tone.Reverb({ decay: 1.8, wet: 0.25 }).toDestination();
  await softReverb.generate();

  // === EXPRESSIVE PIANO (primary voice) ===
  const piano = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.008, decay: 0.30, sustain: 0.20, release: 0.80 }
  }).connect(intimateReverb);

  // Am → F → C → G (i-VI-III-VII)
  const pianoMelody = ["A4", "C5", "D5", "E5", "D5", "C5", "A4", null];
  const pianoVelocities = [0.75, 0.70, 0.80, 0.85, 0.75, 0.70, 0.65, 0];
  let pianoIdx = 0;
  const pianoLoop = new Tone.Loop((time) => {
    if (pianoMelody[pianoIdx % pianoMelody.length]) {
      piano.triggerAttackRelease(
        pianoMelody[pianoIdx % pianoMelody.length],
        "4n",
        time,
        pianoVelocities[pianoIdx % pianoVelocities.length] * 0.90
      );
    }
    pianoIdx++;
  }, "4n").start(0);

  // === PIANO CHORDS (left hand) ===
  const pianoChords = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.35, sustain: 0.25, release: 0.90 }
  }).connect(intimateReverb);

  const chords = [
    ["A2", "C3", "E3"], // Am
    ["F2", "A2", "C3"], // F
    ["C3", "E3", "G3"], // C
    ["G2", "B2", "D3"]  // G
  ];
  let chordIdx = 0;
  const chordsLoop = new Tone.Loop((time) => {
    pianoChords.triggerAttackRelease(chords[chordIdx % chords.length], "1m", time, 0.50);
    chordIdx++;
  }, "1m").start(0);

  // === MINIMAL BASS (supportive, not intrusive) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.30, sustain: 0.30, release: 0.40 }
  }).connect(softReverb);

  const bassNotes = ["A1", "A1", "F1", "F1", "C2", "C2", "G1", "G1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) { // Start after intro
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "2n", time, 0.40);
    }
    bassIdx++;
  }, "2n").start(0);

  // === OPTIONAL STRINGS (chorus swells only) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.90, release: 3.0 }
  }).connect(intimateReverb);

  const stringChords = [
    ["A3", "C4", "E4"], // Am
    ["F3", "A3", "C4"], // F
    ["C3", "E3", "G3"], // C
    ["G3", "B3", "D4"]  // G
  ];
  let stringIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10 && bar < 16) { // Chorus section only
      strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], "2m", time, 0.50);
    }
    stringIdx++;
  }, "2m").start(0);

  // === SUBTLE PAD (atmosphere, very quiet) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.80, release: 2.5 }
  }).connect(intimateReverb);

  const padChords = [
    ["A4", "C5", "E5"], // Am
    ["F4", "A4", "C5"], // F
    ["C4", "E4", "G4"], // C
    ["G4", "B4", "D5"]  // G
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) { // Start after intro
      pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, 0.15);
    }
    padIdx++;
  }, "2m").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { piano, pianoChords, bass, strings, pad };
  window.toneJsParts = { pianoLoop, chordsLoop, bassLoop, stringsLoop, padLoop };
};
```

### Common Mistakes to Avoid

❌ **Adding drums**: This is a piano ballad, not pop
- NO kick, snare, or hi-hats
- Pure melodic/harmonic content
- Let piano breathe without percussion

❌ **Too fast**: Ballads need space
- Keep BPM 50-70 (not 80+)
- Long note durations (whole notes, half notes)
- Patient, unhurried expression

❌ **Over-layering**: Piano should dominate
- Minimal bass (0.35-0.45 volume)
- Strings only in chorus/climax
- Don't bury the piano melody

❌ **Locked to minor**: Major keys can be emotional
- A major, D major, E major work beautifully
- Use progressions like I-V-vi-IV for hope
- Emotion comes from dynamics and space, not just minor keys

### Arrangement Tips

1. **Intro (4 bars)**: Piano solo, establish melody and mood
2. **Verse (6 bars)**: Piano + bass + subtle pad, build foundation
3. **Chorus (6 bars)**: Add strings for emotional swell, piano remains primary
4. **Outro (4 bars)**: Return to piano solo, fade to silence

### Mixing Approach

- **Piano**: 0.85-0.95 volume, primary voice with dynamic velocities
- **Piano Chords**: 0.45-0.55 volume, left hand harmonic support
- **Bass**: 0.35-0.45 volume, minimal and supportive
- **Strings**: 0.45-0.55 volume, only in chorus for swells
- **Pad**: 0.10-0.20 volume, barely audible atmospheric layer
- **Overall**: Intimate mix with space, gentle reverb, piano always in focus

### Reference Tracks

1. **Maxence Cyrin - Where Is My Mind** - Piano cover of Pixies classic, defining the intimate piano reimagination style
2. **Nils Frahm - Said and Done** - Sparse piano with gentle dynamics, masterful use of silence
3. **Yann Tiersen - Comptine d'un autre ete** - Iconic repeating melody, building emotional weight through simplicity
4. **Ryuichi Sakamoto - Merry Christmas Mr. Lawrence** - Elegant minor-key piano with restrained orchestral swells
5. **Ludovico Einaudi - Nuvole Bianche** - Ascending arpeggiated phrases, major-key emotionality, patient build

### Structural Blueprint (60s @ 65 BPM)

- **0-15s (Piano Solo Intro)**: Solo piano establishes melody and mood
  - Right hand melody with dynamic velocity (0.65-0.85)
  - Left hand chords provide harmonic foundation
  - Intimate reverb only, exposed and vulnerable
  - Each note rings out with natural decay

- **15-30s (Bass Enters, Atmosphere Builds)**: Bass and pad join the piano
  - Minimal bass enters on root notes, very supportive (0.40 volume)
  - Subtle triangle-wave pad barely audible underneath (0.15 volume)
  - Piano remains dominant voice, unaffected by new elements
  - Warmth and depth increase without adding density

- **30-45s (Strings Swell, Emotional Chorus)**: Strings provide emotional climax
  - Sawtooth strings with slow attack (0.8s) for gentle swells
  - String chords mirror the piano harmony (Am - F - C - G)
  - Peak emotional weight, but volume stays controlled
  - Piano melody still leads, strings fill the harmonic space behind it

- **45-60s (Return to Solo Piano)**: Gentle dissolution back to intimacy
  - Strings fade, bass drops out
  - Pad dissolves to silence
  - Solo piano returns for seamless loop point
  - Final notes ring with extended release, breathing into silence

### Tonal Characteristics

- **Harmonic**: Am - F - C - G (i-VI-III-VII), minor with hopeful major moments
- **Melodic**: Stepwise piano melody with gentle leaps, singable phrases
- **Rhythmic**: No percussion, rubato feel through swing and velocity variation
- **Textural**: Intimate piano front and center, warm string swells in background
- **Dynamic**: Very gentle arc, piano velocity drives all dynamics
- **Production**: Intimate room reverb, minimal processing, piano always dominant
