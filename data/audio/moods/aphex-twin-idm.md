---
category: experimental
energy: high
tags: [idm, glitch, polyrhythm]
---
## Aphex Twin (IDM / Intelligent Dance Music)

**Tempo**: 85-140 BPM (often irregular, tempo shifts)
**Time Signature**: Complex polyrhythms (5/8 over 4/4, 7/8 patterns, irregular grids)
**Key**: Minor or modal (often D minor, A minor, with chromatic inflections)
**Instruments**: FM bells, acid bass with high-Q filter, bitcrushed textures, irregular kick patterns, displaced snares (breakbeat feel), polyrhythmic hi-hats, glitch stutters
**Structure**: Unstable → Pattern emerge → Glitch disruption → Rebuild → Cascade breakdown
**Vibe**: Mathematical complexity masked by emotional depth. Brain-tickling polyrhythms that feel alien yet oddly comforting. Like Richard D. James invading your subconscious through fractal drum patterns and melancholic synths. Nostalgic yet unsettling, beautiful yet broken.

### Key Characteristics

1. **Polyrhythmic Complexity**: Layers of patterns at different rates (5-step, 7-step patterns over standard 16)
2. **FM Bell Tones**: Distinctive metallic bells with slow attacks, detuned slightly
3. **Acid Bass**: High-Q resonant filter (Q: 8-12) with automated sweeps
4. **Irregular Drums**: Non-standard kick placement, breakbeat snare displacement
5. **Glitch Stutters**: Random 32nd note repeats and retriggering
6. **BitCrusher**: Lo-fi digital artifacts on leads and percussion
7. **Drift**: Patterns that slowly evolve rather than exact loops
8. **Dynamic Silence**: Unexpected pauses and breath spaces

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 92;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER & FX ===
  const master = new Tone.Gain(0.85).toDestination();

  const glitchReverb = new Tone.Reverb({ decay: 2.2, wet: 0.25 });
  await glitchReverb.generate();
  glitchReverb.connect(master);

  // BitCrusher for digital artifacts
  const crusher = new Tone.BitCrusher({ bits: 8 }).connect(glitchReverb);

  // Ping pong delay for spatial interest
  const pingPong = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.35,
    wet: 0.2
  }).connect(glitchReverb);

  // Clean bus
  const cleanBus = new Tone.Gain(1).connect(master);

  // === FM BELL (Aphex signature) ===
  const fmBell = new Tone.FMSynth({
    harmonicity: 3.5,
    modulationIndex: 12,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 0.01,
      decay: 1.8,
      sustain: 0.1,
      release: 2.5
    },
    modulationEnvelope: {
      attack: 0.01,
      decay: 0.8,
      sustain: 0.2,
      release: 1.5
    },
    volume: -10
  }).connect(pingPong);

  // Detuned second bell layer
  const fmBell2 = new Tone.FMSynth({
    harmonicity: 3.52,  // Slight detune
    modulationIndex: 10,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 0.02,
      decay: 2.0,
      sustain: 0.08,
      release: 2.8
    },
    volume: -14
  }).connect(pingPong);

  // === ACID BASS ===
  const acidFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 400,
    Q: 10,  // High resonance for acid squelch
    rolloff: -24
  }).connect(cleanBus);

  const acidBass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.002,
      decay: 0.15,
      sustain: 0.3,
      release: 0.1
    },
    filterEnvelope: {
      attack: 0.002,
      decay: 0.3,
      sustain: 0.2,
      release: 0.2,
      baseFrequency: 200,
      octaves: 3
    },
    volume: -6
  }).connect(acidFilter);

  // === DRUMS (irregular/breakbeat) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 6,
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0
    },
    volume: -4
  }).connect(cleanBus);

  // Snare with crusher for lo-fi
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0
    },
    volume: -8
  }).connect(crusher);

  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 3,
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0
    },
    volume: -12
  }).connect(crusher);

  // Hi-hat through crusher
  const hat = new Tone.MetalSynth({
    frequency: 320,
    envelope: {
      attack: 0.001,
      decay: 0.04,
      release: 0.01
    },
    harmonicity: 5.2,
    modulationIndex: 32,
    resonance: 5500,
    volume: -16
  }).connect(crusher);

  // === POLYRHYTHMIC PAD ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 1.5,
      decay: 0.5,
      sustain: 0.7,
      release: 3.0
    },
    volume: -18
  }).connect(glitchReverb);

  // === BELL PATTERN (5-note polyrhythm) ===
  // 5 notes spread across 16 steps = notes on steps 0, 3.2, 6.4, 9.6, 12.8
  const bellNotes = ["D5", "A5", "F5", "C5", "E5"];
  const bellPart = new Tone.Part((time, ev) => {
    fmBell.triggerAttackRelease(ev.note, "4n", time + H(8), 0.65);
    fmBell2.triggerAttackRelease(ev.note, "4n", time + H(12) + 0.02, 0.4);
  }, [
    { time: "0:0:0", note: bellNotes[0] },
    { time: "0:0:3.2", note: bellNotes[1] },
    { time: "0:1:2.4", note: bellNotes[2] },
    { time: "0:2:1.6", note: bellNotes[3] },
    { time: "0:3:0.8", note: bellNotes[4] }
  ]);
  bellPart.loop = true;
  bellPart.loopEnd = "1m";

  // === ACID BASS PATTERN ===
  const acidNotes = ["D2", "D2", "F2", "D2", "A1", "D2", "G2", "D2"];
  const acidSeq = new Tone.Sequence((time, note) => {
    if (note && Math.random() > 0.15) {  // 15% chance of silence
      acidBass.triggerAttackRelease(note, "16n", time + H(5), 0.85);
      // Random filter sweep
      if (Math.random() > 0.7) {
        acidFilter.frequency.setValueAtTime(400 + Math.random() * 2000, time);
        acidFilter.frequency.exponentialRampToValueAtTime(400, time + 0.2);
      }
    }
  }, acidNotes, "8n");
  acidSeq.loop = true;
  acidSeq.loopEnd = "2m";

  // === IRREGULAR KICK (non-standard 16-step) ===
  // Pattern: hits on 0, 3, 6, 10, 12 (not standard 4-on-floor)
  const kickPattern = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0];
  const kickSeq = new Tone.Sequence((time, hit) => {
    if (hit && Math.random() > 0.08) {
      kick.triggerAttackRelease("C1", "8n", time + H(4), 0.9);
    }
  }, kickPattern, "16n");
  kickSeq.loop = true;
  kickSeq.loopEnd = "1m";

  // === DISPLACED SNARE (breakbeat feel) ===
  // Off-grid placements for IDM feel
  const snareEvents = [
    { time: "0:1:2", vel: 0.8 },
    { time: "0:3:1", vel: 0.75 },
    { time: "1:0:3", vel: 0.7 },
    { time: "1:2:2", vel: 0.85 }
  ];
  const snarePart = new Tone.Part((time, ev) => {
    snare.triggerAttackRelease("16n", time + H(12), ev.vel);
    snareBody.triggerAttackRelease("C4", "32n", time + H(6), ev.vel * 0.6);
  }, snareEvents);
  snarePart.loop = true;
  snarePart.loopEnd = "2m";

  // === 7-STEP HI-HAT (polyrhythmic drift) ===
  let hatStep = 0;
  const hatSeq = new Tone.Loop((time) => {
    if (Math.random() > 0.25) {
      const vel = 0.3 + Math.random() * 0.3;
      hat.triggerAttackRelease("64n", time + H(8), vel);
    }
    hatStep++;
  }, "7n");  // 7-step pattern creates drift against 4/4

  // === PAD PROGRESSION ===
  const padChords = [
    ["D3", "F3", "A3"],      // Dm
    ["C3", "E3", "G3"],      // C
    ["Bb2", "D3", "F3"],     // Bb
    ["A2", "C#3", "E3"]      // A (dominant)
  ];
  const padPart = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.chord, "2m", time, 0.35);
  }, [
    { time: "0:0:0", chord: padChords[0] },
    { time: "2:0:0", chord: padChords[1] },
    { time: "4:0:0", chord: padChords[2] },
    { time: "6:0:0", chord: padChords[3] }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "8m";

  // === GLITCH STUTTER (random 32nd retriggering) ===
  const glitchLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.85) {  // 15% chance per beat
      const stutterCount = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < stutterCount; i++) {
        Tone.Transport.scheduleOnce((t) => {
          if (Math.random() > 0.5) {
            hat.triggerAttackRelease("64n", t, 0.5);
          } else {
            snare.triggerAttackRelease("64n", t, 0.4);
          }
        }, time + (i * 0.03));
      }
    }
  }, "4n");

  // === ARRANGEMENT ===
  // Build up over 16 bars

  // Bars 0-4: Bells + pad only
  bellPart.start("0:0:0");
  padPart.start("0:0:0");

  // Bars 4-8: Add acid bass
  Tone.Transport.schedule((t) => {
    acidSeq.start(t);
  }, "4:0:0");

  // Bars 8-16: Full drums
  Tone.Transport.schedule((t) => {
    kickSeq.start(t);
    snarePart.start(t);
    hatSeq.start(t);
    glitchLoop.start(t);
  }, "8:0:0");

  // Filter sweep automation
  Tone.Transport.schedule((t) => {
    acidFilter.frequency.linearRampToValueAtTime(1800, t + Tone.Time("4m").toSeconds());
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { fmBell, fmBell2, acidBass, acidFilter, kick, snare, snareBody, hat, pad, crusher, pingPong, glitchReverb };
  window.toneJsParts = { bellPart, acidSeq, kickSeq, snarePart, hatSeq, padPart, glitchLoop };
};
```

### Common Mistakes to Avoid

- **Too quantized**: IDM needs human imperfection and polyrhythmic drift
- Use humanization (H) on all note timings
- 5-step or 7-step patterns create natural drift against 4/4

- **Standard drum patterns**: Don't use 4-on-floor or rock patterns
- Irregular kick placement (not on every beat)
- Displaced snares (off-grid, breakbeat feel)
- Polyrhythmic hi-hats (7-step or 5-step against 16)

- **Too clean**: Aphex Twin has lo-fi digital artifacts
- BitCrusher (8-12 bits) on percussion and leads
- Slight detuning on FM bells (two layers, +0.02 harmonicity difference)

- **Missing acid element**: High-Q filter sweeps are essential
- Q value of 8-12 on bass filter
- Random automated sweeps for squelchy character

- **No glitch/stutter**: IDM has unexpected retriggering
- Random 32nd note bursts (15% chance per beat)
- Unexpected silences (15% note dropout)

### Mixing Approach

- **FM Bells**: -10dB, through ping-pong delay (35% feedback, 20% wet)
- **Acid Bass**: -6dB, high-Q filter (Q: 10), automated 400-2000Hz sweeps
- **Kick**: -4dB, clean bus, irregular pattern (not 4-on-floor)
- **Snare**: -8dB, through 8-bit crusher, displaced timing
- **Hat**: -16dB, through crusher, 7-step polyrhythm
- **Pad**: -18dB, heavy reverb (2.2s decay), slow attack (1.5s)

### Reference Tracks

1. **Aphex Twin - Windowlicker** - FM bells, acid bass, complex polyrhythms
2. **Aphex Twin - Avril 14th** - Melodic, melancholic (different mood but same emotional depth)
3. **Aphex Twin - 4** - Irregular drums, unexpected pauses
4. **Autechre - Gantz Graf** - Extreme polyrhythmic complexity
5. **Squarepusher - My Red Hot Car** - Breakbeat IDM, glitch aesthetics

### Structural Blueprint (60s @ 92 BPM = 16 bars)

- **Bars 0-4 (Intro)**: FM bells with 5-note polyrhythm + atmospheric pad
- **Bars 4-8 (Build)**: Acid bass enters with squelchy filter sweeps
- **Bars 8-12 (Main)**: Full drums (irregular kick, displaced snare, 7-step hats)
- **Bars 12-16 (Peak)**: Glitch stutters active, filter opens to 1800Hz

### Tonal Characteristics

- **Harmonic**: D minor modal with chromatic inflections (Dm → C → Bb → A)
- **Melodic**: FM bell arpeggios, mathematical rather than conventional melody
- **Rhythmic**: Layered polyrhythms (5/16 bells, 7/16 hats, irregular kicks)
- **Textural**: BitCrushed percussion, detuned FM synthesis, acid filter sweeps
- **Dynamic**: Unexpected silences, random note dropouts, glitch bursts
- **Production**: Lo-fi digital artifacts (8-bit), humanized timing throughout
