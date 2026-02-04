---
category: triphop
energy: low
tags: [downtempo, emotional, atmospheric]
---
## Felsmann + Tiley (April)

**Tempo**: 95-110 BPM
**Key**: Minor
**Instruments**: Thoughtful synth melodies, synthesized kickdrum, lush evolving pads, flowing basslines, **slow methodic horn/brass bursts**
**Structure**: Atmospheric intro → Bass/groove establishes → Horn bursts emerge → Melodic contemplation → Gentle resolution
**Vibe**: Thoughtful and melodic with gentle groove, cinematic electronica, neoclassical sensibilities, nostalgic yet forward-looking, film music aesthetic with electronic heartbeat, synth-only composition featuring slow methodic horn bursts

### Key Characteristics

1. **Synth-Only Palette**: Exclusively synthesizer-generated sounds, no samples
2. **Gentle Electronic Pulse**: Clean, subtle kick providing heartbeat (not aggressive)
3. **Slow Methodic Horn Bursts**: "Burm-bur-bur-bur" - deliberate, spaced brass stabs (defining feature)
4. **Thoughtful Melodies**: Patient, contemplative synth lines with emotional depth
5. **Evolving Pads**: Lush atmospheric beds that shift and breathe
6. **Cinematic Atmosphere**: Film music production values with spatial depth
7. **Neoclassical Touch**: Sophisticated harmonic progressions, composition-focused
8. **Melodic Over Rhythmic**: Emphasis on melody and atmosphere rather than dancefloor energy

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 100;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const cinematicReverb = new Tone.Reverb({ decay: 4.0, wet: 0.50 }).toDestination();
  await cinematicReverb.generate();

  const subtleDelay = new Tone.PingPongDelay({ delayTime: "4n", feedback: 0.40, wet: 0.30 }).connect(cinematicReverb);

  const limiter = new Tone.Limiter({ threshold: -6 }).toDestination();

  // === GENTLE SYNTHESIZED KICK (subtle heartbeat) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 }
  }).connect(limiter);
  kick.volume.value = -12; // Subtle, not dominant

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) { // Enter after atmospheric intro
      kick.triggerAttackRelease("C1", "8n", time, 0.70);
    }
  }, "4n");

  // === FLOWING BASSLINE ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { type: "lowpass", frequency: 400, Q: 0.8 },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.60, release: 0.40 }
  }).toDestination();
  bass.volume.value = -12;

  // Am progression: A → F → C → G (i-VI-III-VII) - slower, more deliberate
  const bassPattern = ["A2", "F2", "C2", "G2"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      bass.triggerAttackRelease(bassPattern[bassIdx % bassPattern.length], "2n", time, 0.75);
      bassIdx++;
    }
  }, "1m"); // Whole note intervals - slower, more contemplative

  // === THOUGHTFUL MELODIC SYNTH ===
  const melody = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    filter: { type: "lowpass", frequency: 2000, Q: 0.6 },
    envelope: { attack: 0.15, decay: 0.3, sustain: 0.50, release: 1.0 }
  }).connect(subtleDelay);
  melody.volume.value = -16;

  const melodyPattern = ["A4", "C5", "E5", "C5", "F4", "A4", "C5", "A4"];
  let melodyIdx = 0;
  const melodyLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 14) { // Enter mid-section, thoughtful pacing
      melody.triggerAttackRelease(melodyPattern[melodyIdx % melodyPattern.length], "2n", time, 0.60);
      melodyIdx++;
    }
  }, "2n"); // Half notes - patient, contemplative

  // === EVOLVING PAD (lush atmospheric foundation) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 2.5, decay: 0.6, sustain: 0.90, release: 5.0 }
  }).connect(cinematicReverb);
  pad.volume.value = -18;

  const padChords = [
    ["A3", "C4", "E4", "A4"], // Am
    ["F3", "A3", "C4", "F4"], // F
    ["C3", "E3", "G3", "C4"], // C
    ["G3", "B3", "D4", "G4"]  // G
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 2 ? 0.45 : 0.70;
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, velocity);
    padIdx++;
  }, "1m");

  // === SLOW METHODIC HORN BURSTS (signature "burm-bur-bur-bur" element) ===
  const hornReverb = new Tone.Reverb({ decay: 3.0, wet: 0.40 }).toDestination();
  await hornReverb.generate();

  // Subtle vibrato for realistic horn character
  const vibrato = new Tone.Vibrato({ frequency: 4, depth: 0.10 }).connect(hornReverb);

  const horn = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    filter: { type: "lowpass", frequency: 1800, Q: 1.2 },
    envelope: { attack: 0.15, decay: 0.4, sustain: 0.60, release: 0.80 }
  }).connect(vibrato);
  horn.volume.value = -10;

  // Slow methodic pattern - deliberate, spaced notes (burm-bur-bur-bur)
  const hornNotes = ["C4", "E4", "A4", "E4"]; // Simple, deliberate progression
  let hornIdx = 0;
  const hornLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 14) { // Enter after intro, exit before wind-down
      horn.triggerAttackRelease(hornNotes[hornIdx % hornNotes.length], "2n", time, 0.80);
      hornIdx++;
    }
  }, "1m"); // Whole note intervals - slow, methodic, deliberate bursts

  // === FILTER AUTOMATION (cinematic movement) ===
  Tone.Transport.schedule((time) => {
    bass.filter.frequency.linearRampToValueAtTime(1200, time + 8 * (60 / bpm));
  }, "4:0:0");

  Tone.Transport.schedule((time) => {
    bass.filter.frequency.linearRampToValueAtTime(500, time + 4 * (60 / bpm));
  }, "12:0:0");

  // === START ===
  padLoop.start(0);
  kickLoop.start(0);
  bassLoop.start(0);
  melodyLoop.start(0);
  hornLoop.start(0);

  // === CLEANUP REFERENCES ===
  window.toneJsInstruments = { kick, bass, melody, pad, horn, vibrato, cinematicReverb, subtleDelay, hornReverb, limiter };
  window.toneJsParts = { kickLoop, bassLoop, melodyLoop, padLoop, hornLoop };
};
```

### Common Mistakes
- **Missing slow horn bursts** - This is the signature element, methodic "burm-bur-bur-bur" pattern
- **Fast arpeggios** - Avoid quick cascading patterns, keep melodies patient and contemplative
- Too fast tempo - this is thoughtful and melodic, not dancefloor energy (95-110 BPM)
- Using samples - must be synth-only, including drums
- Too cheerful - maintain melancholic, contemplative mood throughout
- Aggressive kick - should be subtle heartbeat, not dominant rhythm driver
- Overly complex - focus on space, atmosphere, and thoughtful melodic development
- Muddy mix - keep clarity and depth for cinematic quality, especially for horn bursts
- Forgetting wind-down - layers must exit before loop point for seamless transition

### Arrangement Tips
- **Intro (0-8 bars)**: Pad establishes atmospheric, contemplative mood
- **Build (8-16 bars)**: Gentle kick and bass enter, creating subtle pulse
- **Horn Entry (16-28 bars)**: Slow methodic horn bursts emerge (signature "burm-bur-bur-bur"), thoughtful melody layers in
- **Contemplation (28-44 bars)**: Full instrumentation, horn bursts prominent, filter opens slightly
- **Wind-down (44-52 bars)**: Horn exits first, melody fades, filter closes
- **Loop Point (52-60 bars)**: Only pad, subtle kick, bass - seamless return to bar 0

### Mixing Approach
- **Horn Bursts**: -10dB, reverb + subtle vibrato (FOCAL POINT - signature methodic element)
- Pad: -18dB, heavy reverb for lush atmospheric foundation
- Bass: -12dB, filtered for gentle warmth and flow
- Kick: -12dB, subtle heartbeat (not dominant, just a gentle pulse)
- Thoughtful Melody: -16dB, delay + reverb for contemplative presence
- Master: Limiter at -6dB, maintain dynamics and spaciousness

### Reference Tracks
- Felsmann + Tiley - "April" (primary reference)
- Felsmann + Tiley - "October" (similar contemplative style)
- Neoclassical electronic with thoughtful, melodic approach
- Synth-only production aesthetic with cinematic sensibilities

### Production Notes
- **Slow methodic horn bursts are essential** - "Burm-bur-bur-bur" pattern is the defining element
- Horn should play **whole note intervals** (1m) for deliberate, spaced character
- All sounds must be synthesizer-generated (no samples except synth drums)
- Emphasize thoughtful melody and atmosphere over rhythmic energy
- Kick should be **subtle** - a gentle pulse, not a driving force
- Cinematic production values: spatial depth, breathing room, compositional focus
- Horn should be warm and contemplative with subtle vibrato for realism
- Patient pacing - let notes breathe and sustain, avoid rushing
- Nostalgic yet forward-looking, film music aesthetic with electronic heartbeat
