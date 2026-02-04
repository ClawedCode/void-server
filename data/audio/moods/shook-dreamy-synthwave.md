---
category: synthwave
energy: medium
tags: [dreamy, 80s, nostalgic]
---
## Shook (Dreamy Hopeful Synthwave)

**Tempo**: 82-92 BPM
**Key**: Minor or major (allow major for hopefulness!)
**Instruments**: Lush reverb-soaked pads, gentle floating arpeggios, warm bass, soft lead melodies, delicate percussion
**Structure**: Ethereal intro → Gentle build → Full instrumentation with hopeful melody → Breakdown → Uplifting finale
**Vibe**: Ethereal, dreamy, like floating through clouds at sunset - hopeful yet melancholic, warm analog textures, everything bathed in reverb creating sense of weightlessness and nostalgia

### Key Characteristics

1. **Lush Reverb**: Everything bathed in long reverb (3-4s decay) for dreamy atmosphere
2. **Floating Arpeggios**: Gentle triangle wave patterns with delay and reverb
3. **Warm Pads**: Thick, layered with chorus for analog warmth and width
4. **Soft Percussion**: Delicate, minimal drums that don't interrupt the dream
5. **Hopeful Melodies**: Allow major keys, uplifting progressions for optimism
6. **Slow Tempo** (82-92 BPM): Creates sense of weightlessness

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 88;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.08; // Slight humanization

  // === FX BUSES ===
  const dreamReverb = new Tone.Reverb({ decay: 3.5, wet: 0.50 }).toDestination();
  await dreamReverb.generate();

  const softReverb = new Tone.Reverb({ decay: 2.0, wet: 0.30 }).toDestination();
  await softReverb.generate();

  const chorus = new Tone.Chorus({ frequency: 1.0, depth: 0.85, wet: 0.65 }).toDestination().start();

  // === LUSH REVERB-SOAKED PAD ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 2000, Q: 0.3 }).connect(dreamReverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.0, decay: 0.5, sustain: 0.80, release: 2.5 },
    detune: 8 // Warm analog feel
  }).connect(padFilter);

  // Gm → Eb → Bb → F (i-VI-III-VII)
  const padChords = [
    ["G3", "Bb3", "D4", "G4"], // Gm
    ["Eb3", "G3", "Bb3", "Eb4"], // Eb
    ["Bb3", "D4", "F4", "Bb4"], // Bb
    ["F3", "A3", "C4", "F4"]  // F
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 5 ? 0.25 : 0.35;
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, velocity);
    padIdx++;
  }, "1m").start(0);

  // === FLOATING ARPEGGIO (triangle wave with delay) ===
  const arpDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.40, wet: 0.35 }).connect(softReverb);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.12 }
  }).connect(arpDelay);

  const arpPattern = [
    ["G4", "Bb4", "D5"], // Gm
    ["Eb4", "G4", "Bb4"], // Eb
    ["Bb4", "D5", "F5"], // Bb
    ["F4", "A4", "C5"]  // F
  ];
  let arpChordIdx = 0;
  let arpNoteIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 5 ? 0.30 : 0.40;

    const chord = arpPattern[arpChordIdx % arpPattern.length];
    const note = chord[arpNoteIdx % chord.length];
    arp.triggerAttackRelease(note, "8n", time, velocity);

    arpNoteIdx++;
    if (arpNoteIdx % 6 === 0) arpChordIdx++;
  }, "8n").start(0);

  // === WARM BASS (minimal, supportive) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 250, Q: 0.6 }).connect(chorus);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.20, sustain: 0, release: 0.15 }
  }).connect(bassFilter);

  const bassNotes = ["G1", "G1", "Eb2", "Eb2", "Bb1", "Bb1", "F2", "F2"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5) { // Start after intro
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "4n", time, 0.50);
    }
    bassIdx++;
  }, "4n").start(0);

  // === HOPEFUL LEAD MELODY (triangle wave with vibrato) ===
  const lead = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.20, sustain: 0.70, release: 0.40 },
    portamento: 0.06 // Smooth glides
  }).connect(softReverb);

  const vibrato = new Tone.Vibrato({ frequency: 4.5, depth: 0.005 }).connect(lead.output);
  lead.connect(vibrato);

  const leadMelody = ["G4", "A4", "Bb4", "D5", "C5", "Bb4", "A4", "G4"];
  const leadVelocities = [0.65, 0.70, 0.75, 0.80, 0.75, 0.70, 0.65, 0.60];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 11) { // Start in full section
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "2n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.65
      );
      leadIdx++;
    }
  }, "2n").start(0);

  // === SOFT KICK (sparse buildup) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.20, sustain: 0, release: 0.05 }
  }).toDestination();

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    // Sparse buildup pattern
    if (bar >= 11 || (bar >= 5 && kickStep % 2 === 0)) {
      kick.triggerAttackRelease("C1", "8n", time, 0.75);
    }
    kickStep++;
  }, "4n").start(0);

  // === MINIMAL SNARE (soft) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0 }
  }).connect(softReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 11 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.65);
    }
    snareStep++;
  }, "4n").start(0);

  // === DELICATE HI-HATS (8th notes) ===
  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: { attack: 0.001, decay: 0.06, release: 0.01 },
    harmonicity: 4.0,
    modulationIndex: 20,
    resonance: 3000
  }).connect(softReverb);

  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5) {
      hat.triggerAttackRelease("16n", time, 0.35);
    }
    hatStep++;
  }, "8n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, arp, bass, lead, kick, snare, hat };
  window.toneJsParts = { padLoop, arpLoop, bassLoop, leadLoop, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Not enough reverb**: This mood is all about atmosphere
- Use long decay times (3-4s) on pads
- Heavy wet mix (0.40-0.60) for dreamy quality
- Layer multiple reverb types for depth

❌ **Too aggressive/dark**: Shook is hopeful, not menacing
- Allow major keys and uplifting progressions
- Soft, triangle wave leads (not harsh square)
- Gentle percussion that doesn't interrupt

❌ **Missing the floating quality**: Everything should feel weightless
- Add delay to arps (8n. dotted, 0.35-0.40 wet)
- Use chorus on pads for width
- Slow tempo (82-92 BPM) creates drift

❌ **Too busy**: Simplicity is key
- Minimal drum patterns, sparse kicks
- Simple arp patterns, not complex runs
- Focus on atmosphere over complexity

### Arrangement Tips

1. **Intro (5 bars)**: Pads and arps only, establishing ethereal atmosphere
2. **Build (6 bars)**: Add bass and lead melody, gentle momentum
3. **Full (7 bars)**: Soft drums enter, hopeful peak with all elements
4. **Breakdown (4 bars)**: Strip to pads and minimal arp, create space
5. **Finale (6 bars)**: Return to full, uplifting climax with lead melody

### Mixing Approach

- **Pad**: 0.25-0.35 volume, primary atmospheric element, bathed in reverb
- **Arp**: 0.30-0.40 volume, floating with delay and reverb
- **Bass**: 0.45-0.55 volume, warm and supportive, not dominant
- **Lead**: 0.60-0.70 volume, hopeful and expressive with vibrato
- **Drums**: 0.35-0.75 volume, delicate and minimal, don't overpower
- **Overall**: Mid-heavy mix, avoid harsh highs, create warm cloud of sound
