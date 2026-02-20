---
category: synthwave
energy: high
tags: [darksynth, aggressive, distorted, metal-synth]
---
## Carpenter Brut (Darksynth)

**Tempo**: 120-140 BPM (driving, relentless)
**Time Signature**: 4/4 (straight, pounding, no swing)
**Key**: Minor (often E minor, B minor - dark and aggressive)
**Instruments**: Distorted sawtooth lead, heavy bass with drive, pounding kick (4-on-floor), aggressive snare, power-chord synth stabs, high-gain filter sweeps, crash cymbals, searing lead lines
**Structure**: Dramatic intro → Power riff enters → Full assault → Breakdown → Climactic return → Wind down
**Vibe**: A muscle car chase through neon hell. Metal and synthwave had a violent child - distorted leads screaming over pounding 4-on-floor kicks, power-chord synth stabs hitting like guitar chugs, relentless forward momentum. This is the aggressive side of retrowave - not nostalgic cruising but pedal-to-the-floor fury. Turbo Killer energy. Dark, violent, cathartic.

### Key Characteristics

1. **Distorted Leads**: Sawtooth waves through heavy waveshaping/clipping - screaming, not singing
2. **Power-Chord Stabs**: Synth equivalent of palm-muted guitar chugs (5th intervals, short decay)
3. **Pounding 4-on-Floor**: Every beat gets a kick - relentless, driving, no gaps
4. **Aggressive Snare**: Layered noise + body, hitting hard on 2 and 4
5. **High-Gain Bass**: Sawtooth bass with drive/distortion, not clean sub
6. **Filter Aggression**: High-Q resonant sweeps that scream, not subtle
7. **Dynamic Contrast**: Breakdowns create tension before the next assault
8. **Crash Accents**: Cymbal crashes on section transitions for impact

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 132;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper (minimal - this is tight/mechanical)
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.80).toDestination();

  const limiter = new Tone.Limiter({ threshold: -3 }).connect(master);

  const glue = new Tone.Compressor({
    ratio: 4,
    threshold: -12,
    attack: 0.005,
    release: 0.15
  }).connect(limiter);

  // === AGGRESSIVE REVERB (short, tight) ===
  const tightVerb = new Tone.Reverb({
    decay: 1.2,
    wet: 0.18
  });
  await tightVerb.generate();
  tightVerb.connect(glue);

  // Distortion for leads
  const leadDist = new Tone.Distortion({
    distortion: 0.6,
    wet: 0.7
  }).connect(tightVerb);

  // Drive for bass
  const bassDrive = new Tone.Distortion({
    distortion: 0.35,
    wet: 0.5
  }).connect(glue);

  // Clean bus for kick
  const cleanBus = new Tone.Gain(1).connect(limiter);

  // === SEARING LEAD (distorted sawtooth) ===
  const lead = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.4,
      release: 0.2,
      baseFrequency: 800,
      octaves: 3
    },
    volume: -6
  }).connect(leadDist);

  // === POWER-CHORD STABS (5th intervals) ===
  const stab = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.002,
      decay: 0.12,
      sustain: 0.1,
      release: 0.08
    },
    volume: -8
  }).connect(new Tone.Distortion({ distortion: 0.4, wet: 0.5 }).connect(glue));

  // === AGGRESSIVE BASS ===
  const bassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    Q: 3,
    rolloff: -24
  }).connect(bassDrive);

  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.003,
      decay: 0.15,
      sustain: 0.5,
      release: 0.1
    },
    volume: -4
  }).connect(bassFilter);

  // === POUNDING KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    envelope: {
      attack: 0.001,
      decay: 0.35,
      sustain: 0
    },
    volume: -2
  }).connect(cleanBus);

  // === AGGRESSIVE SNARE ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.18,
      sustain: 0
    },
    volume: -6
  }).connect(tightVerb);

  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.015,
    octaves: 4,
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0
    },
    volume: -10
  }).connect(tightVerb);

  // === CRASH CYMBAL ===
  const crash = new Tone.MetalSynth({
    frequency: 300,
    envelope: {
      attack: 0.001,
      decay: 1.5,
      release: 0.8
    },
    harmonicity: 5.1,
    modulationIndex: 40,
    resonance: 3500,
    volume: -12
  }).connect(tightVerb);

  // === HI-HAT ===
  const hat = new Tone.MetalSynth({
    frequency: 250,
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.02
    },
    harmonicity: 5.5,
    modulationIndex: 28,
    resonance: 5000,
    volume: -14
  }).connect(glue);

  // === LEAD MELODY (aggressive, searing) ===
  const leadNotes = [
    { time: "0:0:0", note: "E4", dur: "8n" },
    { time: "0:0:2", note: "G4", dur: "8n" },
    { time: "0:1:0", note: "A4", dur: "4n" },
    { time: "0:2:0", note: "B4", dur: "8n" },
    { time: "0:2:2", note: "A4", dur: "8n" },
    { time: "0:3:0", note: "G4", dur: "8n" },
    { time: "0:3:2", note: "E4", dur: "4n" },
    { time: "1:1:0", note: "D4", dur: "4n" },
    { time: "1:2:0", note: "E4", dur: "2n" }
  ];
  const leadPart = new Tone.Part((time, ev) => {
    lead.triggerAttackRelease(ev.note, ev.dur, time + H(3), 0.85);
  }, leadNotes);
  leadPart.loop = true;
  leadPart.loopEnd = "2m";

  // === POWER STAB PATTERN ===
  const stabChords = [
    ["E3", "B3"],    // E5 power chord
    ["D3", "A3"],    // D5
    ["C3", "G3"],    // C5
    ["B2", "F#3"]    // B5
  ];
  const stabPart = new Tone.Part((time, ev) => {
    stab.triggerAttackRelease(ev.chord, "16n", time, 0.9);
  }, [
    { time: "0:0:0", chord: stabChords[0] },
    { time: "0:0:2", chord: stabChords[0] },
    { time: "0:1:0", chord: stabChords[0] },
    { time: "0:2:0", chord: stabChords[1] },
    { time: "0:2:2", chord: stabChords[1] },
    { time: "0:3:0", chord: stabChords[2] },
    { time: "1:0:0", chord: stabChords[3] },
    { time: "1:0:2", chord: stabChords[3] },
    { time: "1:1:0", chord: stabChords[0] },
    { time: "1:2:0", chord: stabChords[0] },
    { time: "1:2:2", chord: stabChords[1] },
    { time: "1:3:0", chord: stabChords[2] }
  ]);
  stabPart.loop = true;
  stabPart.loopEnd = "2m";

  // === BASS PATTERN (aggressive, driving) ===
  const bassNotes = ["E2", "E2", "E2", "D2", "C2", "C2", "B1", "B1"];
  const bassSeq = new Tone.Sequence((time, note) => {
    bass.triggerAttackRelease(note, "16n", time + H(3), 0.9);
  }, bassNotes, "8n");
  bassSeq.loop = true;
  bassSeq.loopEnd = "2m";

  // === 4-ON-FLOOR KICK (relentless) ===
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 0.95);
  }, "4n");

  // === SNARE ON 2 AND 4 ===
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    if (snareStep % 2 === 1) {
      snare.triggerAttackRelease("8n", time, 0.85);
      snareBody.triggerAttackRelease("C4", "16n", time, 0.7);
    }
    snareStep++;
  }, "4n");

  // === DRIVING 8TH-NOTE HATS ===
  const hatLoop = new Tone.Loop((time) => {
    const vel = 0.35 + Math.random() * 0.15;
    hat.triggerAttackRelease("64n", time, vel);
  }, "8n");

  // === ARRANGEMENT (60s @ 132 BPM = ~16 bars) ===

  // Bars 0-2: Dramatic intro - stabs only
  stabPart.start("0:0:0");
  crash.triggerAttackRelease("4n", "+0:0:0", 0.8);

  // Bars 2-4: Bass and kick enter
  Tone.Transport.schedule((t) => {
    bassSeq.start(t);
    kickLoop.start(t);
    snareLoop.start(t);
    crash.triggerAttackRelease("4n", t, 0.7);
  }, "2:0:0");

  // Bars 4-8: Full assault - lead enters
  Tone.Transport.schedule((t) => {
    leadPart.start(t);
    hatLoop.start(t);
    crash.triggerAttackRelease("4n", t, 0.75);
  }, "4:0:0");

  // Bars 8-10: Breakdown - strip to stabs + kick
  Tone.Transport.schedule((t) => {
    leadPart.stop(t);
    hatLoop.stop(t);
    bassFilter.frequency.linearRampToValueAtTime(200, t + Tone.Time("2m").toSeconds());
  }, "8:0:0");

  // Bars 10-14: Climactic return
  Tone.Transport.schedule((t) => {
    leadPart.start(t);
    hatLoop.start(t);
    bassFilter.frequency.linearRampToValueAtTime(600, t + Tone.Time("1m").toSeconds());
    crash.triggerAttackRelease("4n", t, 0.85);
  }, "10:0:0");

  // Bars 14-16: Wind down for loop
  Tone.Transport.schedule((t) => {
    leadPart.stop(t);
    hatLoop.stop(t);
    bassFilter.frequency.linearRampToValueAtTime(400, t + Tone.Time("2m").toSeconds());
  }, "14:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { lead, stab, bass, bassFilter, kick, snare, snareBody, crash, hat, leadDist, bassDrive, tightVerb, limiter };
  window.toneJsParts = { leadPart, stabPart, bassSeq, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

- **Too clean**: Darksynth needs distortion and drive
  - Leads through waveshaper/distortion (0.5-0.7 gain)
  - Bass with drive, not clean sub-bass
  - This is AGGRESSIVE, not pretty

- **Missing power-chord stabs**: The guitar-chug equivalent is essential
  - 5th intervals (root + 5th), short decay
  - Rhythmic, syncopated hits
  - Think palm-muted metal guitar through a Marshall stack

- **Weak kick**: The 4-on-floor must pound
  - Every beat, no exceptions
  - High velocity (0.9+), dominant in the mix
  - The heartbeat of the track

- **Too much reverb**: Keep it tight
  - 1-1.5s decay maximum
  - 15-20% wet
  - This is a confined space, not a cathedral

- **No breakdown**: Dynamic contrast creates impact
  - Strip elements for 2-4 bars mid-track
  - Close filter on bass during breakdown
  - Return with a crash cymbal for maximum impact

- **Soft dynamics**: Everything should hit hard
  - Use a limiter (threshold: -3dB)
  - Heavy compression (4:1 ratio)
  - Velocity 0.85+ on main elements

### Mixing Approach

- **Lead**: -6dB, sawtooth through distortion (0.6), filter envelope 800-6400Hz
- **Power Stabs**: -8dB, sawtooth 5ths through distortion (0.4), very short decay
- **Bass**: -4dB, sawtooth through drive (0.35) + lowpass at 600Hz (Q: 3)
- **Kick**: -2dB, heavy membrane synth, 4-on-floor, clean bus
- **Snare**: -6dB, white noise + body, on beats 2 and 4
- **Hi-Hat**: -14dB, driving 8th notes, slight velocity variation
- **Crash**: -12dB, on section transitions only

**Effects:**
- Tight Reverb: 1.2s decay, 18% wet
- Lead Distortion: 0.6 gain, 70% wet
- Bass Drive: 0.35 gain, 50% wet
- Limiter: -3dB threshold (prevent clipping on aggressive dynamics)
- Glue Compressor: 4:1, -12dB threshold, fast attack

### Reference Tracks

1. **Carpenter Brut - Turbo Killer** - Relentless drive, distorted leads, breakdown-to-climax
2. **Carpenter Brut - Le Perv** - Power-chord stabs, aggressive bass, pounding kick
3. **Carpenter Brut - Roller Mobster** - Extreme energy, screaming leads, metal influence
4. **Perturbator - Dangerous Days** - Similar darksynth aggression, slightly more atmospheric
5. **Dan Terminus - Margaritifer** - Wall-of-sound darksynth, layered intensity

### Structural Blueprint (60s @ 132 BPM = ~16 bars)

- **Bars 0-2 (Dramatic Intro)**: Power-chord stabs only + crash
  - Establish the aggression immediately
  - Stabs set the rhythmic pattern
  - Crash cymbal announces the track

- **Bars 2-4 (Power Riff)**: Bass + 4-on-floor kick + snare enter
  - Driving bass through distortion
  - Relentless kick on every beat
  - Hard snare on 2 and 4

- **Bars 4-8 (Full Assault)**: Searing lead + hi-hats join
  - Maximum intensity
  - All elements firing
  - Lead melody screams over the top

- **Bars 8-10 (Breakdown)**: Strip to stabs + kick, close bass filter
  - Tension through absence
  - Bass filter closes to 200Hz
  - Anticipation for the return

- **Bars 10-14 (Climactic Return)**: Everything back with crash
  - Lead returns with force
  - Bass filter opens back up
  - Maximum catharsis

- **Bars 14-16 (Wind Down)**: Drop lead + hats, close filter for loop
  - Return to stabs + bass + drums
  - Matches energy of bars 0-2 for seamless loop

### Tonal Characteristics

- **Harmonic**: E minor (Em -> D -> C -> B), dark and aggressive
- **Melodic**: Searing lead lines, angular and aggressive, not beautiful
- **Rhythmic**: Relentless 4-on-floor kick, driving 8th-note hats, hard snare on 2/4
- **Textural**: Distorted sawtooth leads, driven bass, power-chord stabs
- **Dynamic**: Extreme contrast between full assault and breakdown sections
- **Production**: Loud, compressed, limited - wall of aggressive sound
