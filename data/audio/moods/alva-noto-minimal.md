---
category: electronic
energy: low
tags: [minimal, microsound, glitch, ultraclean, precise]
---
## Alva Noto (Microsound / Minimal)

**Tempo**: 120 BPM (precise clock, metronomic, zero swing)
**Time Signature**: 4/4 (strict grid, mathematical)
**Key**: Atonal (pure sine frequencies - 55Hz, 220Hz, 440Hz, 880Hz, 1320Hz - harmonic series, not scale-based)
**Instruments**: Sine click (ultra-short sine burst, more click than tone), sub-bass pulse (pure 55Hz sine), micro-noise grain (white noise burst through random-pitched filter), sparse harmonic tone (pure sine at harmonic series frequencies), silence (the primary instrument)
**Structure**: Single click pattern → Sub-bass pulse joins → Micro-textures emerge → Density peak (still sparse) → Reduction to click + silence
**Vibe**: The inside of a computer rendered as sound. Pristine digital silence interrupted by microscopic sonic events - each click, pulse, and grain placed with surgical precision on an exact grid. Alva Noto (Carsten Nicolai) reduces electronic music to its smallest possible gestures: a sine wave burst lasting 10 milliseconds, a sub-bass pulse every four beats, a noise grain shorter than a heartbeat. The silence between sounds is as composed as the sounds themselves. No reverb, no warmth, no humanity. Think Xerrox or Unitxt - music that treats the digital medium as an end rather than a means. Where other producers add, Noto subtracts. Where others humanize, Noto mechanizes. The result is not cold but crystalline - beautiful in its absolute reduction.

### Key Characteristics

1. **Reductive Aesthetic**: Fewer elements, more space - 3-5 sound events per bar maximum
2. **Composed Silence**: Gaps between events are active compositional elements, not emptiness
3. **Sine Click**: Ultra-short sine burst (1ms attack, 10ms decay) - more click than pitch
4. **Precise Grid**: Zero humanization, zero swing - events land on exact subdivisions
5. **Sub-Bass Pulse**: Pure 55Hz sine triggered every 4 beats, the only pitched anchor
6. **Micro-Noise Grains**: White noise bursts lasting 5ms total, randomly filtered
7. **No Reverb / Minimal Reverb**: Dry or near-dry (0.3s decay, 10% wet maximum)
8. **Mathematical Patterns**: Rhythms based on binary sequences, Euclidean distributions, modular arithmetic

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 120;
  Tone.Transport.bpm.value = bpm;

  // No humanization - precision IS the aesthetic
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN (clean, no coloring) ===
  const master = new Tone.Gain(0.75).toDestination();

  const limiter = new Tone.Limiter({ threshold: -1 }).connect(master);

  // NO compression - dynamics must be precise, not squashed
  // NO master reverb - pristine digital space

  // Minimal room tone (barely perceptible)
  const microVerb = new Tone.Reverb({
    decay: 0.3,
    preDelay: 0.001,
    wet: 0.08
  });
  await microVerb.generate();
  microVerb.connect(limiter);

  // Dry bus for most elements
  const dryBus = new Tone.Gain(1).connect(limiter);

  // === SINE CLICK (ultra-short sine burst) ===
  const sineClick = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.01,
      sustain: 0,
      release: 0.005
    },
    volume: -12
  }).connect(dryBus);

  // === SUB-BASS PULSE (pure 55Hz) ===
  const subPulse = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.002,
      decay: 0.15,
      sustain: 0,
      release: 0.08
    },
    volume: -6
  }).connect(dryBus);

  // === MICRO-NOISE GRAIN (ultra-short filtered noise) ===
  const grainFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 4000,
    Q: 8
  }).connect(microVerb);

  const grain = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.005,
      sustain: 0
    },
    volume: -18
  }).connect(grainFilter);

  // === SPARSE HARMONIC TONE (pure sine at harmonic series) ===
  const harmonicTone = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.003,
      decay: 0.2,
      sustain: 0,
      release: 0.1
    },
    volume: -16
  }).connect(microVerb);

  // === HIGH SINE PING (very rare, precise) ===
  const highPing = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0,
      release: 0.04
    },
    volume: -20
  }).connect(dryBus);

  // === DIGITAL ARTIFACT (bit-like texture) ===
  const artifact = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.003,
      sustain: 0,
      release: 0.001
    },
    volume: -26
  }).connect(dryBus);

  // === SINE CLICK PATTERN (binary-inspired: 1001001010010010) ===
  const clickPattern = [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0];
  const clickSeq = new Tone.Sequence((time, hit) => {
    if (hit) {
      // Alternate between two click frequencies
      const freq = clickSeq._loopCount % 2 === 0 ? 1000 : 1200;
      sineClick.frequency.setValueAtTime(freq, time);
      sineClick.triggerAttackRelease("64n", time, 0.6);
    }
  }, clickPattern, "16n");
  clickSeq.loop = true;
  clickSeq.loopEnd = "1m";

  // === SUB-BASS PULSE (every whole note / 4 beats) ===
  const subLoop = new Tone.Loop((time) => {
    subPulse.frequency.setValueAtTime(55, time);
    subPulse.triggerAttackRelease("8n", time, 0.85);
  }, "1m");

  // === MICRO-NOISE PATTERN (Euclidean-distributed, sparse) ===
  // Euclidean(3, 16): hits at 0, 5, 11
  const grainPattern = [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0];
  const grainSeq = new Tone.Sequence((time, hit) => {
    if (hit) {
      // Random filter frequency for each grain
      const randFreq = 2000 + Math.random() * 8000;
      grainFilter.frequency.setValueAtTime(randFreq, time);
      grain.triggerAttackRelease("128n", time, 0.5);
    }
  }, grainPattern, "16n");
  grainSeq.loop = true;
  grainSeq.loopEnd = "1m";

  // === HARMONIC TONE EVENTS (rare, specific frequencies from harmonic series) ===
  const harmonicFreqs = [220, 440, 880, 1320, 660];
  const harmonicPart = new Tone.Part((time, ev) => {
    harmonicTone.frequency.setValueAtTime(ev.freq, time);
    harmonicTone.triggerAttackRelease("16n", time, ev.vel);
  }, [
    { time: "0:0:0", freq: harmonicFreqs[0], vel: 0.45 },
    { time: "2:2:0", freq: harmonicFreqs[1], vel: 0.35 },
    { time: "5:0:0", freq: harmonicFreqs[2], vel: 0.3 },
    { time: "7:3:0", freq: harmonicFreqs[3], vel: 0.25 },
    { time: "10:1:0", freq: harmonicFreqs[4], vel: 0.35 },
    { time: "13:0:0", freq: harmonicFreqs[0], vel: 0.4 }
  ]);
  harmonicPart.loop = true;
  harmonicPart.loopEnd = "16m";

  // === HIGH PING (very rare accents) ===
  const pingPart = new Tone.Part((time, ev) => {
    highPing.frequency.setValueAtTime(ev.freq, time);
    highPing.triggerAttackRelease("32n", time, ev.vel);
  }, [
    { time: "3:0:0", freq: 3520, vel: 0.3 },
    { time: "8:2:0", freq: 2640, vel: 0.25 },
    { time: "12:0:0", freq: 3520, vel: 0.2 }
  ]);
  pingPart.loop = true;
  pingPart.loopEnd = "16m";

  // === DIGITAL ARTIFACT EVENTS (ultra-rare, ultra-short) ===
  const artifactSeq = new Tone.Sequence((time, hit) => {
    if (hit && Math.random() > 0.85) {
      const freq = 500 + Math.random() * 3000;
      artifact.frequency.setValueAtTime(freq, time);
      artifact.triggerAttackRelease("128n", time, 0.3);
    }
  }, [0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0], "32n");
  artifactSeq.loop = true;
  artifactSeq.loopEnd = "1m";

  // === ARRANGEMENT (60s @ 120 BPM = 16 bars) ===

  // Bars 0-4: Click pattern only (isolated in silence)
  clickSeq.start("0:0:0");

  // Bars 4-6: Sub-bass pulse joins
  Tone.Transport.schedule((t) => {
    subLoop.start(t);
  }, "4:0:0");

  // Bars 6-8: Micro-noise grains emerge
  Tone.Transport.schedule((t) => {
    grainSeq.start(t);
  }, "6:0:0");

  // Bars 6-12: Harmonic tones and pings (sparse events)
  Tone.Transport.schedule((t) => {
    harmonicPart.start(t);
    pingPart.start(t);
  }, "6:0:0");

  // Bars 8-12: Digital artifacts (density peak - still sparse by any standard)
  Tone.Transport.schedule((t) => {
    artifactSeq.start(t);
  }, "8:0:0");

  // Bars 12-14: Begin reduction
  Tone.Transport.schedule((t) => {
    artifactSeq.stop(t);
    pingPart.stop(t);
    harmonicPart.stop(t + Tone.Time("1m").toSeconds());
  }, "12:0:0");

  // Bars 14-16: Strip to click + sub + silence
  Tone.Transport.schedule((t) => {
    grainSeq.stop(t);
  }, "14:0:0");

  // Sub-bass continues through to loop point, clicks continue throughout

  // === STORE REFERENCES ===
  window.toneJsInstruments = { sineClick, subPulse, grain, grainFilter, harmonicTone, highPing, artifact, microVerb, dryBus, limiter };
  window.toneJsParts = { clickSeq, subLoop, grainSeq, harmonicPart, pingPart, artifactSeq };
};
```

### Common Mistakes to Avoid

- **Adding reverb/warmth**: Alva Noto is DRY and pristine
  - Maximum 0.3s reverb decay at 8-10% wet
  - No chorus, no delay, no spatial effects
  - Sounds exist in precise digital space, not rooms
  - Warmth is antithetical to this aesthetic

- **Too many simultaneous events**: This is REDUCTIVE
  - 3-5 sound events per bar at most
  - Even at "peak density" it sounds sparse
  - Each event is isolated by silence on both sides
  - If it sounds full, you have too much

- **Humanization/swing**: Precision IS the aesthetic
  - Zero timing deviation, zero velocity randomization on clicks
  - Events land on exact grid positions
  - The mechanical quality is the point, not a limitation
  - Any humanization destroys the identity

- **Using pitched scales**: This is not tonal music
  - Use specific frequencies from the harmonic series (55, 110, 220, 440, 880Hz)
  - No chord progressions, no melodies, no keys
  - Frequency relationships are mathematical, not musical
  - Pitch is a parameter, not a note

- **Compression or limiting that colors the sound**: Dynamics must be exact
  - No bus compression for "glue" - there is nothing to glue
  - Limiter only as safety ceiling (-1dB)
  - Each sound's loudness is precisely calibrated
  - Dynamic range is intentional, not managed

- **Too many textures/timbres**: Restrict the palette severely
  - Pure sine waves for pitched content
  - White noise for unpitched content
  - That's essentially the entire timbral vocabulary
  - Complexity comes from arrangement of simple elements in time

- **Filling the silence**: Silence is the primary instrument
  - 60-70% of the duration should be silence
  - Resist the urge to add padding or drones
  - The space between events IS the composition
  - If you can't hear silence, you've failed

### Mixing Approach

- **Sine Click**: -12dB, pure sine (1000-1200Hz), 1ms attack + 10ms decay, dry bus
- **Sub-Bass Pulse**: -6dB, pure 55Hz sine, 2ms attack + 150ms decay, dry bus
- **Micro-Noise Grain**: -18dB, white noise through random bandpass (2-10kHz, Q: 8), barely-there reverb
- **Harmonic Tone**: -16dB, pure sine at harmonic series frequencies, micro-reverb
- **High Ping**: -20dB, pure sine (2640-3520Hz), very rare, dry
- **Digital Artifact**: -26dB, square wave, sub-5ms events, barely audible
- **Overall**: Extremely clean, wide dynamic range, silence dominant

**Effects:**
- Micro Reverb: 0.3s decay, 8% wet (applied to 2 elements only)
- Limiter: -1dB threshold (safety only, never engaging in normal playback)
- No compression, no chorus, no delay, no modulation effects

### Reference Tracks

1. **Alva Noto - Xerrox Phaser Acat** - Sine clicks in mathematical patterns, pristine silence between events
2. **Alva Noto - Uni Rec** - Sub-bass pulse architecture, reductive rhythm
3. **Alva Noto + Ryuichi Sakamoto - Trioon I** - Microsound meeting piano, digital frost on acoustic
4. **Alva Noto - Transform 5** - Pure sine manipulation, scientific precision
5. **Ryoji Ikeda - Test Pattern** - Adjacent aesthetic - data as sound, absolute precision

### Structural Blueprint (60s @ 120 BPM = 16 bars)

- **Bars 0-4 (Click Field)**: Sine click pattern in isolation
  - Binary-inspired pattern (1001001010010010) at 16th-note grid
  - Completely dry, no other elements
  - Clicks at 1000Hz and 1200Hz alternating
  - Silence dominates, clicks punctuate

- **Bars 4-8 (Sub Pulse)**: 55Hz sub-bass joins, micro-textures emerge
  - Sub-bass pulse on each whole note (every 4 beats)
  - Micro-noise grains at bars 6-8 (Euclidean distribution)
  - Harmonic tones begin (rare, seconds apart)
  - Still overwhelmingly sparse

- **Bars 8-12 (Density Peak)**: Maximum elements (still sparse)
  - Digital artifacts added (ultra-short, ultra-quiet)
  - High pings at precise moments
  - All 6 sound sources potentially active
  - "Dense" by Alva Noto standards means 5-6 events per bar

- **Bars 12-14 (Reduction)**: Artifacts, pings, harmonic tones removed
  - Systematic subtraction, one element at a time
  - Mathematical precision in the removal
  - The space opens back up

- **Bars 14-16 (Return to Click)**: Click + sub-bass + silence
  - Micro-noise grains stop at bar 14
  - Only the click pattern and sub pulse remain
  - Near-opening sparsity for seamless loop
  - Silence reclaims the composition

### Tonal Characteristics

- **Harmonic**: Atonal - harmonic series frequencies (55, 110, 220, 440, 880, 1320Hz), no key or scale
- **Melodic**: None - individual frequency events, not melody
- **Rhythmic**: Binary/Euclidean patterns on strict 16th-note grid, zero swing, metronomic
- **Textural**: Pure sine waves and white noise, no timbral complexity, pristine digital
- **Dynamic**: Precise calibration per element, no compression, wide dynamic range, silence dominant
- **Production**: Absolutely dry, no spatial effects, no warmth, no coloring - sound as data
