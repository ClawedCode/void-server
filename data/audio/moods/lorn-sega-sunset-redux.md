---
category: industrial
energy: medium
tags: [dark, melancholic, heavy]
---
## Lorn - Sega Sunset Redux

**Tempo**: 88 BPM
**Key**: D# minor (dark, melancholic progressions)
**Instruments**: Deep distorted sawtooth bass, detuned fat pads, triangle lead with portamento, membrane kick, white noise snare with reverb
**Structure**: Heavy bass groove with sustained chords and sparse haunting melody
**Vibe**: Dark synthwave meets industrial - VHS tape decay aesthetic, bitcrushed grit, slow and deliberate weight. Like watching a neon-lit city through a corrupted video signal.

### Key Characteristics

1. **Tape Warble Effect**: Vibrato on master chain for wow/flutter instability (0.5Hz, 0.15 depth)
2. **Bitcrushed Grit**: 6-bit crushing on master for lo-fi degradation
3. **Distorted Bass**: Sawtooth bass through distortion (0.4 drive) and chorus for width
4. **Detuned Pads**: Fat custom partials with 40-cent spread, slow attack
5. **Triangle Lead**: Simple, piercing lead with portamento and ping-pong delay
6. **Heavy Kick**: Membrane synth with high octaves (4) for punch
7. **Lo-Fi Snare**: White noise through reverb for atmosphere

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 88;
  Tone.Transport.bpm.value = bpm;

  // === MASTER EFFECTS CHAIN (The "Lorn" Sound) ===
  const masterGain = new Tone.Gain(0.8).toDestination();
  const masterLimiter = new Tone.Limiter(-2).connect(masterGain);

  // Tape Warble: Vibrato with low freq to simulate wow/flutter
  const tapeWarble = new Tone.Vibrato({
    frequency: 0.5,
    depth: 0.15,
    type: "sine"
  }).connect(masterLimiter);

  const masterBitcrusher = new Tone.BitCrusher({
    bits: 6,
    wet: 0.2
  }).connect(tapeWarble);

  const reverb = new Tone.Reverb({
    decay: 4,
    preDelay: 0.2,
    wet: 0.4
  }).connect(masterBitcrusher);
  await reverb.generate();

  // === BASS: Deep, distorted, wide ===
  const bassDistortion = new Tone.Distortion(0.4).connect(reverb);
  const bassWidener = new Tone.Chorus({
    frequency: 0.5,
    delayTime: 2.5,
    depth: 0.7,
    wet: 0.5
  }).connect(bassDistortion);

  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 0.5 },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.5,
      sustain: 0.5,
      release: 1,
      baseFrequency: 50,
      octaves: 3
    },
    volume: -2
  }).connect(bassWidener);

  // Bass progression: D#m → Bm → F#m → C#m
  const bassNotes = ["D#1", "B0", "F#1", "C#1"];
  let bassIdx = 0;

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar < 20) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "1m", time);
      bassIdx++;
    }
  }, "1m").start(0);

  // === PADS: Detuned, melancholic ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "fatcustom",
      partials: [1, 0.5, 0.3],
      spread: 40,
      count: 3
    },
    envelope: { attack: 0.5, decay: 1, sustain: 0.6, release: 2 },
    volume: -8
  }).connect(reverb);

  // D#m chord progression
  const padChords = [
    ["D#3", "A#3", "D#4"],  // D#m
    ["B2", "F#3", "B3"],     // B
    ["F#2", "C#3", "A#3"],   // F#m
    ["C#3", "G#3", "C#4"]    // C#m
  ];
  let padIdx = 0;

  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar < 20) {
      pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, 0.25);
      padIdx++;
    }
  }, "1m").start(0);

  // === LEAD: Simple, piercing triangle with portamento ===
  const leadDelay = new Tone.PingPongDelay("8n", 0.4).connect(reverb);

  const lead = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 1 },
    portamento: 0.1,
    volume: -5
  }).connect(leadDelay);

  // Sparse haunting melody
  const leadMelody = [
    { time: "2:2:0", note: "A#3", duration: "4n" },
    { time: "2:2:2", note: "G#3", duration: "4n" },
    { time: "2:3:0", note: "F#3", duration: "2n" },
    { time: "6:2:0", note: "F#3", duration: "4n" },
    { time: "6:2:2", note: "F3", duration: "4n" },
    { time: "6:3:0", note: "D#3", duration: "2n" },
    { time: "10:2:0", note: "A#3", duration: "4n" },
    { time: "10:2:2", note: "G#3", duration: "4n" },
    { time: "10:3:0", note: "F#3", duration: "2n" },
    { time: "14:2:0", note: "F#3", duration: "4n" },
    { time: "14:2:2", note: "F3", duration: "4n" },
    { time: "14:3:0", note: "D#3", duration: "2n" }
  ];

  leadMelody.forEach(({ time, note, duration }) => {
    Tone.Transport.schedule((schedTime) => {
      lead.triggerAttackRelease(note, duration, schedTime, 0.7);
    }, time);
  });

  // === KICK: Heavy, punchy ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    volume: 2
  }).connect(masterBitcrusher);

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const beat = kickStep % 4;

    if (bar < 20) {
      // Kick on beat 1, with ghost on 2.5 and 3.5
      if (beat === 0) {
        kick.triggerAttackRelease("D#1", "8n", time, 0.95);
      } else if (beat === 1 && kickStep % 8 >= 4) {
        kick.triggerAttackRelease("D#1", "8n", time, 0.6); // Ghost kick
      } else if (beat === 2 && kickStep % 8 >= 4) {
        kick.triggerAttackRelease("D#1", "8n", time, 0.75);
      }
    }
    kickStep++;
  }, "4n").start(0);

  // === SNARE: White noise through reverb ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    volume: -5
  }).connect(reverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const beat = snareStep % 4;

    // Snare on beats 2 and 4
    if (bar >= 1 && bar < 20 && (beat === 1 || beat === 3)) {
      snare.triggerAttackRelease("8n", time, 0.7);
    }
    snareStep++;
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = {
    bass, pad, lead, kick, snare,
    reverb, tapeWarble, masterBitcrusher, masterLimiter, masterGain,
    bassDistortion, bassWidener, leadDelay
  };
  window.toneJsParts = { bassLoop, padLoop, kickLoop, snareLoop };
};
```

### Common Mistakes to Avoid

**Too clean/polished**: This needs tape warble and bitcrushing
- Use Vibrato on master chain for wow/flutter (0.5Hz, 0.15 depth)
- BitCrusher at 6 bits with 0.2 wet for subtle grit
- Distortion on bass (0.4 drive) for warmth

**Wrong tempo**: 88 BPM is critical for the weight
- Not too slow like industrial (60-70)
- Not too fast like synthwave (100-120)
- 88 BPM hits the sweet spot for heavy groove

**Too busy melodically**: Lorn's melodies are extremely sparse
- Only 4-6 melodic phrases in entire track
- Long sustained bass notes (whole measures)
- Lead melody descends in simple patterns

**Missing the chord progression**: D#m → B → F#m → C#m
- Dark minor progression
- Each chord sustains for full measure
- Fat detuned pads with slow attack

### Mixing Approach

- **Master Chain**: Limiter at -2dB → Vibrato (tape warble) → BitCrusher (6-bit, 20% wet)
- **Bass**: -2dB, distorted (0.4), chorus for width, low-pass filtered at 50Hz base
- **Pads**: -8dB, fat oscillators (40-cent spread), heavy reverb (4s decay, 40% wet)
- **Lead**: -5dB, triangle wave, ping-pong delay (8th note, 40% feedback)
- **Kick**: +2dB, straight to bitcrusher for punch, 4 octaves
- **Snare**: -5dB, white noise through reverb

### Reference Tracks

1. **Lorn - Sega Sunset** - The definitive reference for this mood
2. **Lorn - Anvil** - Similar crushing bass weight
3. **Lorn - Acid Rain** - Dark atmospheric glitch textures
4. **Gesaffelstein - Pursuit** - Dark synthwave weight
5. **Perturbator - Perturbator's Theme** - VHS synthwave aesthetic

### Structural Blueprint (60s @ 88 BPM ≈ 20 bars)

- **Bars 0-1 (Intro)**: Bass and pads establish D#m foundation
  - Full bass enters immediately with chord progression
  - Pads layer underneath with slow attack
  - No drums yet - create anticipation

- **Bars 1-4 (Groove Establishes)**: Drums enter
  - Kick and snare establish half-time groove
  - Bass and pads continue progression
  - Tape warble adds subtle instability

- **Bars 4-8 (First Melody)**: Lead melody enters
  - Sparse descending melodic fragment (A#3 → G#3 → F#3)
  - Ping-pong delay creates space
  - Ghost kicks add syncopation

- **Bars 8-12 (Development)**: Second melody phrase
  - Variation on opening melody (F#3 → F3 → D#3)
  - Maintain heavy groove
  - BitCrushing adds texture

- **Bars 12-16 (Peak)**: Full arrangement
  - All elements active
  - Melody repeats with variations
  - Maximum emotional weight

- **Bars 16-20 (Wind-down)**: Return to foundation
  - Drums continue but could thin out slightly
  - Melody ceases
  - Return to bass/pad focus for seamless loop

### Tonal Characteristics

- **Harmonic**: D# minor, dark and melancholic (D#m → B → F#m → C#m)
- **Melodic**: Sparse descending phrases, heavy portamento, triangle timbre
- **Rhythmic**: 88 BPM with half-time feel, ghost kicks for swing
- **Textural**: Tape warble, bitcrushing, heavy reverb, chorus on bass
- **Dynamic**: Consistent weight, filter sweeps minimal, focus on groove
- **Production**: VHS degradation aesthetic, controlled distortion, wide stereo field
