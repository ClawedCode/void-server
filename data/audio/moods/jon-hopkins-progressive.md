---
category: electronic
energy: high
tags: [progressive, granular, euphoric, building, textural]
---
## Jon Hopkins (Progressive Electronic)

**Tempo**: 118-128 BPM (steady build, techno-adjacent)
**Time Signature**: 4/4 (driving but organic)
**Key**: Minor moving to major (often C minor → C major for euphoric lift)
**Instruments**: Granular texture layer, pulsing sub-bass, layered kick with tonal body, filtered pad wash, plucked synth arpeggios, noise risers, resonant lead, organic percussion (clicks, taps)
**Structure**: Textural intro → Pulse emerges → Layers accumulate → Euphoric peak → Gentle dissolution
**Vibe**: The slow crawl from darkness to light. A 60-second journey that starts in granular static and slowly builds through accumulating layers until it breaks through into euphoria. Jon Hopkins' genius is making electronic music feel organic - kicks have tonal resonance, synths breathe, textures crackle like fire. Think Open Eye Signal's patient build or Emerald Rush's ecstatic peak. Every element serves the slow, inevitable ascent toward transcendence.

### Key Characteristics

1. **Patient Build**: Nothing happens fast - layers accumulate gradually over the entire duration
2. **Granular Textures**: Crackling, organic noise textures that feel physical, not digital
3. **Tonal Kicks**: Kicks with extended pitch envelopes that sing - both percussion and bass note
4. **Filtered Pad Breathing**: Pads that slowly open through filter sweeps, like lungs expanding
5. **Organic Percussion**: Clicks, finger taps, wood-like hits alongside electronic drums
6. **Euphoric Resolution**: Minor-to-major shift or filter opening that creates transcendent peak
7. **Plucked Arpeggios**: Short, bright synth notes that shimmer above the deep layers
8. **Textural Complexity**: Many subtle layers creating a rich, living sound field

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 122;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.82).toDestination();

  const limiter = new Tone.Limiter({ threshold: -4 }).connect(master);

  const glue = new Tone.Compressor({
    ratio: 3,
    threshold: -14,
    attack: 0.01,
    release: 0.2
  }).connect(limiter);

  // === REVERBS ===
  const deepReverb = new Tone.Reverb({
    decay: 4.0,
    preDelay: 0.03,
    wet: 0.35
  });
  await deepReverb.generate();
  deepReverb.connect(glue);

  const shimmerVerb = new Tone.Reverb({
    decay: 2.5,
    wet: 0.45
  });
  await shimmerVerb.generate();
  shimmerVerb.connect(glue);

  // Delay for arpeggios
  const arpDelay = new Tone.PingPongDelay({
    delayTime: "16n.",
    feedback: 0.3,
    wet: 0.2
  }).connect(shimmerVerb);

  // === GRANULAR TEXTURE (crackling organic noise) ===
  const granular = new Tone.Noise("brown");
  const granularFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 1500,
    Q: 1.5
  }).connect(new Tone.Gain(0.05).connect(deepReverb));
  granular.connect(granularFilter);
  granular.start();

  // === TONAL KICK (singing kick with pitch envelope) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 5,
    envelope: {
      attack: 0.001,
      decay: 0.45,
      sustain: 0.01,
      release: 0.8
    },
    volume: -4
  }).connect(glue);

  // === PULSING SUB-BASS ===
  const sub = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4
    },
    volume: -6
  }).connect(new Tone.Gain(1).connect(limiter));

  // === FILTERED PAD (breathes open over time) ===
  const padFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 400,
    Q: 2,
    rolloff: -24
  }).connect(deepReverb);

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 2.0,
      decay: 1.0,
      sustain: 0.65,
      release: 3.0
    },
    volume: -12
  }).connect(padFilter);

  // === PLUCKED ARPEGGIO ===
  const pluck = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.003,
      decay: 0.3,
      sustain: 0.05,
      release: 0.5
    },
    volume: -14
  }).connect(arpDelay);

  // === ORGANIC CLICKS (finger taps, wood hits) ===
  const click = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.015,
      sustain: 0
    },
    volume: -18
  }).connect(new Tone.Filter({ frequency: 3000, type: "highpass" }).connect(glue));

  // === RESONANT LEAD (for euphoric peak) ===
  const leadFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1200,
    Q: 5
  }).connect(shimmerVerb);

  const lead = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.5,
      release: 1.0
    },
    volume: -10
  }).connect(leadFilter);

  // === HI-HAT (emerges later) ===
  const hat = new Tone.MetalSynth({
    frequency: 220,
    envelope: {
      attack: 0.001,
      decay: 0.04,
      release: 0.02
    },
    harmonicity: 5.1,
    modulationIndex: 28,
    resonance: 5000,
    volume: -16
  }).connect(glue);

  // === KICK PATTERN (4-on-floor but tonal) ===
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "4n", time, 0.85);
  }, "4n");

  // === SUB-BASS PATTERN ===
  const subNotes = ["C2", null, "C2", null, "Eb2", null, "G1", null];
  const subSeq = new Tone.Sequence((time, note) => {
    if (note) sub.triggerAttackRelease(note, "8n", time + H(5), 0.8);
  }, subNotes, "4n");
  subSeq.loop = true;
  subSeq.loopEnd = "2m";

  // === PAD PROGRESSION (Cm → Cm → Ab → Bb → resolves to C major at peak) ===
  const padPart = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.chord, "4m", time, 0.35);
  }, [
    { time: "0:0:0", chord: ["C3", "Eb3", "G3", "Bb3"] },   // Cm7
    { time: "4:0:0", chord: ["Ab2", "C3", "Eb3", "G3"] },    // Abmaj7
    { time: "8:0:0", chord: ["Bb2", "D3", "F3", "Ab3"] },    // Bb7
    { time: "12:0:0", chord: ["C3", "E3", "G3", "B3"] }      // Cmaj7 (euphoric!)
  ]);
  padPart.loop = true;
  padPart.loopEnd = "16m";

  // === PLUCKED ARPEGGIO PATTERN ===
  const arpNotes = ["C5", "Eb5", "G5", "Bb5", "G5", "Eb5", "C5", "Bb4"];
  const arpSeq = new Tone.Sequence((time, note) => {
    pluck.triggerAttackRelease(note, "32n", time + H(5), 0.55);
  }, arpNotes, "16n");
  arpSeq.loop = true;
  arpSeq.loopEnd = "1m";

  // === ORGANIC CLICK PATTERN ===
  const clickSeq = new Tone.Sequence((time, hit) => {
    if (hit && Math.random() > 0.3) {
      click.triggerAttackRelease("64n", time + H(8), 0.4 + Math.random() * 0.2);
    }
  }, [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0], "16n");
  clickSeq.loop = true;
  clickSeq.loopEnd = "1m";

  // === HI-HAT (16th notes, subtle) ===
  const hatLoop = new Tone.Loop((time) => {
    const vel = 0.25 + Math.random() * 0.15;
    hat.triggerAttackRelease("64n", time + H(6), vel);
  }, "16n");

  // === LEAD MELODY (euphoric peak only) ===
  const leadPart = new Tone.Part((time, ev) => {
    lead.triggerAttackRelease(ev.note, ev.dur, time + H(8), 0.7);
  }, [
    { time: "0:0:0", note: "C5", dur: "4n" },
    { time: "0:2:0", note: "Eb5", dur: "4n" },
    { time: "1:0:0", note: "G5", dur: "2n" },
    { time: "2:0:0", note: "Bb4", dur: "4n" },
    { time: "2:2:0", note: "C5", dur: "2n" }
  ]);
  leadPart.loop = true;
  leadPart.loopEnd = "4m";

  // === ARRANGEMENT (60s @ 122 BPM = ~16 bars) ===
  // Patient build from nothing to euphoria

  // Bars 0-2: Granular texture only (dark, atmospheric)
  // Granular noise already started

  // Bars 2-4: Kick pulse + sub emerge
  Tone.Transport.schedule((t) => {
    kickLoop.start(t);
    subSeq.start(t);
  }, "2:0:0");

  // Bars 4-8: Pad + clicks + arpeggios layer in
  Tone.Transport.schedule((t) => {
    padPart.start(t);
    clickSeq.start(t);
  }, "4:0:0");

  Tone.Transport.schedule((t) => {
    arpSeq.start(t);
  }, "6:0:0");

  // Filter opens over bars 4-12
  Tone.Transport.schedule((t) => {
    padFilter.frequency.linearRampToValueAtTime(3500, t + Tone.Time("8m").toSeconds());
  }, "4:0:0");

  // Bars 8-12: Hi-hat + lead for euphoric peak
  Tone.Transport.schedule((t) => {
    hatLoop.start(t);
    leadPart.start(t);
    leadFilter.frequency.linearRampToValueAtTime(4000, t + Tone.Time("4m").toSeconds());
  }, "8:0:0");

  // Bars 12-16: Gentle dissolution
  Tone.Transport.schedule((t) => {
    leadPart.stop(t);
    hatLoop.stop(t);
    arpSeq.stop(t + Tone.Time("2m").toSeconds());
    padFilter.frequency.linearRampToValueAtTime(400, t + Tone.Time("4m").toSeconds());
    leadFilter.frequency.linearRampToValueAtTime(1200, t + Tone.Time("2m").toSeconds());
  }, "12:0:0");

  // Final bars: strip to granular + kick for seamless loop
  Tone.Transport.schedule((t) => {
    clickSeq.stop(t);
  }, "15:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, sub, pad, padFilter, pluck, click, lead, leadFilter, hat, granular, granularFilter, deepReverb, shimmerVerb, arpDelay, limiter };
  window.toneJsParts = { kickLoop, subSeq, padPart, arpSeq, clickSeq, hatLoop, leadPart };
};
```

### Common Mistakes to Avoid

- **Too fast a build**: Jon Hopkins builds SLOWLY
  - Layers accumulate one at a time, bars apart
  - First 25% should be almost nothing
  - Patience creates the euphoria

- **Generic kick**: Kicks need tonal character
  - Extended pitch decay (0.08s) creates a singing quality
  - Longer overall decay (0.45s) than typical dance kick
  - The kick IS a melodic instrument here

- **No textural layer**: Granular crackle is essential
  - Brown noise through bandpass creates organic warmth
  - This is the foundation - everything else sits on top
  - Without it, the track sounds sterile/digital

- **Missing the minor-to-major shift**: The emotional arc needs resolution
  - Start in C minor (dark, tense)
  - Resolve to C major at the peak (euphoric, transcendent)
  - This harmonic journey IS the composition

- **Too clean**: Jon Hopkins' sound is organic/textural
  - Clicks and finger-taps alongside electronic elements
  - Granular textures throughout
  - The digital and organic coexist

- **Flat dynamics**: The entire piece should be one long crescendo-decrescendo
  - Start sparse, end sparse
  - Peak intensity at 60-75% of duration
  - Filter sweeps drive the dynamic arc

### Mixing Approach

- **Granular Texture**: 0.05 gain, brown noise bandpass at 1500Hz, constant
- **Tonal Kick**: -4dB, long pitch decay (0.08s), 4-on-floor
- **Sub-Bass**: -6dB, sine, clean bus through limiter
- **Filtered Pad**: -12dB, sawtooth, automatable lowpass (400-3500Hz, Q: 2)
- **Plucked Arpeggio**: -14dB, triangle, short decay, dotted 16th delay
- **Organic Clicks**: -18dB, white noise highpassed at 3kHz, irregular pattern
- **Resonant Lead**: -10dB, sawtooth through resonant filter (Q: 5), peak only
- **Hi-Hat**: -16dB, enters at peak, subtle 16th notes

**Effects:**
- Deep Reverb: 4.0s decay, 35% wet
- Shimmer Reverb: 2.5s decay, 45% wet (for lead and arpeggios)
- Arp Delay: Dotted 16th ping-pong, 30% feedback, 20% wet
- Limiter: -4dB threshold
- Glue: 3:1 ratio, -14dB threshold

### Reference Tracks

1. **Jon Hopkins - Open Eye Signal** - The definitive slow build, tonal kicks, granular textures
2. **Jon Hopkins - Emerald Rush** - Euphoric peak, minor-to-major resolution
3. **Jon Hopkins - Light Through the Veins** - Patient beauty, gradual accumulation
4. **Jon Hopkins - Collider** - Aggressive textures building to catharsis
5. **Jon Hopkins - Everything Connected** - Organic meets electronic, transcendent climax

### Structural Blueprint (60s @ 122 BPM = ~16 bars)

- **Bars 0-2 (Granular Void)**: Textural noise only
  - Brown noise through bandpass
  - Dark, atmospheric, no pulse yet
  - The listener leans in

- **Bars 2-4 (Pulse Emerges)**: Tonal kick + sub-bass
  - Kick establishes 4-on-floor pulse
  - Sub-bass adds harmonic foundation
  - Still minimal, still building

- **Bars 4-8 (Accumulation)**: Pad + clicks + arpeggios layer in
  - Pad filter begins opening (400 → 3500Hz)
  - Organic clicks add textural complexity
  - Plucked arpeggios shimmer above

- **Bars 8-12 (Euphoric Peak)**: Hi-hat + resonant lead
  - Maximum density
  - Lead melody soars
  - Pad reaches C major (euphoric resolution)
  - Transcendent moment

- **Bars 12-16 (Dissolution)**: Strip layers, close filters
  - Lead and hi-hat drop out
  - Arpeggios fade
  - Pad filter closes back to 400Hz
  - Returns to granular + kick for seamless loop

### Tonal Characteristics

- **Harmonic**: C minor → Ab major → Bb7 → C major (dark to light journey)
- **Melodic**: Plucked arpeggios + resonant lead at peak, always ascending
- **Rhythmic**: 4-on-floor tonal kick, organic click patterns, 16th-note hats at peak
- **Textural**: Granular noise foundation, organic percussion, shimmer reverb on highs
- **Dynamic**: One long crescendo-decrescendo arc, filter sweeps drive energy
- **Production**: Organic warmth, textural complexity, euphoric resolution
