---
category: synthwave
energy: medium
tags: [atmospheric, 80s, mysterious]
---
## Stranger Things (Atmospheric)

**Tempo**: 60-70 BPM
**Key**: Minor (dark progressions)
**Instruments**: Strings (primary), pad (layered), minimal bass, sparse drums, NO arp
**Structure**: Long intro build → Sustained tension → No drops, constant atmosphere
**Vibe**: Brooding, ominous, cinematic

### Key Characteristics

1. **String-Dominant**: Strings are the primary voice, not a background element
2. **Slow, Brooding**: 60-70 BPM, no fast motion
3. **No Drops**: Constant tension, no release
4. **Minimal Drums**: Sparse, atmospheric, never driving
5. **Long Sustains**: 2-3 second releases, everything breathes
6. **NO Arpeggios**: Too busy for this aesthetic

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 66;
  Tone.Transport.bpm.value = bpm;

  // === DARK REVERB ===
  const masterReverb = new Tone.Reverb({ decay: 2.5, wet: 0.25 }).toDestination();
  await masterReverb.generate();

  // === OMINOUS STRINGS (primary voice) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.8, decay: 0.5, sustain: 0.95, release: 3.0 }
  }).connect(masterReverb);

  // Fm → Eb → Db → C (i-bVII-VI-V)
  const stringChords = [
    ["F3", "Ab3", "C4", "F4"],  // Fm
    ["Eb3", "G3", "Bb3", "Eb4"], // Eb
    ["Db3", "F3", "Ab3", "Db4"], // Db
    ["C3", "E3", "G3", "C4"]     // C
  ];
  let stringIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 8 ? 0.30 : 0.70; // Quiet intro, louder tension
    strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], "2m", time, velocity);
    stringIdx++;
  }, "2m").start(0);

  // === DARK PAD (layered beneath strings) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 0.6 }).connect(masterReverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 1.2, decay: 0.6, sustain: 0.7, release: 2.5 }
  }).connect(padFilter);

  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(stringChords[padIdx % stringChords.length], "1m", time, 0.30);
    padIdx++;
  }, "1m").start(0);

  // === MINIMAL BASS (sparse, not driving) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 150, Q: 0.8 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.25 }
  }).connect(bassFilter);

  const bassNotes = ["F1", "Eb1", "Db1", "C1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar % 2 === 0) { // Start after intro, very sparse
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "2n", time, 0.50);
      bassIdx++;
    }
  }, "2n").start(0);

  // === MINIMAL KICK (atmospheric, not rhythmic) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.30, sustain: 0, release: 0.15 }
  }).connect(masterReverb);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar % 3 === 0) { // Very sparse - every 3 bars
      kick.triggerAttackRelease("C1", "8n", time, 0.60);
    }
  }, "1m").start(0);

  // === SPARSE HI-HAT (texture, not groove) ===
  const hat = new Tone.MetalSynth({
    frequency: 250,
    envelope: { attack: 0.001, decay: 0.10, release: 0.03 },
    harmonicity: 4.0,
    modulationIndex: 22,
    resonance: 3200
  }).connect(masterReverb);

  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar % 2 === 1) { // Sparse - every other bar
      hat.triggerAttackRelease("16n", time, 0.25);
    }
  }, "2n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { strings, pad, bass, kick, hat };
  window.toneJsParts = { stringsLoop, padLoop, bassLoop, kickLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Adding arpeggios**: Too busy, breaks atmospheric tension
- Stranger Things is about sustained dread, not pulsing energy
- Only use strings and pads, no fast-moving elements

❌ **Too fast**: This is slow, brooding horror
- Keep BPM 60-70 (not 80+)
- Long section durations (8-10 bars)
- Everything moves slowly

❌ **Driving drums**: Drums should be minimal texture, not rhythm
- Kick every 3 bars, not every beat
- No snare
- Hi-hats very sparse (every other bar at most)

❌ **Not string-dominant**: Strings are the LEAD, not background
- Strings at 0.60-0.75 volume (louder than everything else)
- Pads are secondary, supporting strings
- Bass and drums barely audible

### Arrangement Tips

1. **Intro (8 bars)**: Quiet strings + pads only, build tension slowly
2. **Tension (10 bars)**: Louder strings, add minimal bass and kick
3. **Sustain (8+ bars)**: Full instrumentation, maintain constant dread

### Mixing Approach

- **Strings**: 0.60-0.75 volume, primary voice, long sustains
- **Pads**: 0.25-0.35 volume, dark support layer beneath strings
- **Bass**: 0.45-0.55 volume, minimal presence, very sparse
- **Drums**: 0.25-0.35 volume, atmospheric texture only, not rhythmic
