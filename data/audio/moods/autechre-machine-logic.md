---
category: experimental
energy: high
tags: [algorithmic, glitch, generative, irregular, abstract]
---
## Autechre (Algorithmic Machine Logic)

**Tempo**: 138 BPM (in shifting time signatures - alternates 7/8 and 4/4 bars)
**Time Signature**: Complex irregular (7/8 ↔ 4/4 shifting, prime subdivisions, Euclidean rhythms)
**Key**: Atonal / chromatic (tone rows, cluster harmonics, no tonal center)
**Instruments**: Granular kick (MembraneSynth, aggressive short pitch decay), metallic percussion (MetalSynth with per-hit harmonicity variation), glitchy FM bass (MonoSynth with rapid filter modulation), digital texture pad (triangle wave with high-frequency filter modulation for bitcrusher-like quality), noise burst accents, chromatic tone-row bells
**Structure**: Sparse machine pulse → Euclidean rhythms emerge → Algorithmic complexity peak → Pattern mutation → Folding cascade
**Vibe**: Mathematics made audible. Beats that fold in on themselves through prime-number subdivisions, bass patterns that defy prediction, metallic textures evolving through algorithmic transformations. Gantz Graf-era machine intelligence - not chaos, but a logic too complex for human pattern recognition. Inhuman rhythmic complexity delivered with surgical precision. The sound of computation becoming music, where every parameter is a variable in a system that never repeats the same way twice.

### Key Characteristics

1. **Euclidean Rhythms**: Kick and percussion patterns derived from Euclidean algorithm (E(5,8), E(7,16), E(3,7))
2. **Shifting Time Signatures**: Alternating 7/8 and 4/4 bars creating continuous metric displacement
3. **Chromatic Tone Rows**: Bass and melodic content uses all 12 chromatic pitches, no tonal center
4. **Per-Hit Variation**: MetalSynth harmonicity and modulationIndex change on every single hit
5. **Rapid Filter Modulation**: Bass filter frequency modulates at audio-adjacent rates for digital texture
6. **Prime Subdivisions**: Hi-hat bursts in groups of 3, 5, 7 - never regular 4s or 8s
7. **Continuous Evolution**: No section repeats identically - parameters drift, mutate, transform
8. **Negative Predictability**: Patterns designed to defeat listener expectation at every turn

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 138;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const limiter = new Tone.Limiter(-3).toDestination();
  const masterComp = new Tone.Compressor({
    ratio: 4,
    threshold: -14,
    attack: 0.003,
    release: 0.12,
    knee: 6
  }).connect(limiter);
  const master = new Tone.Gain(0.88).connect(masterComp);

  // === FX BUSES ===
  const metalVerb = new Tone.Reverb({
    decay: 1.6,
    preDelay: 0.005,
    wet: 0.18
  });
  await metalVerb.generate();
  metalVerb.connect(master);

  // Short room for percussion
  const roomVerb = new Tone.Reverb({ decay: 0.5, wet: 0.12 });
  await roomVerb.generate();
  roomVerb.connect(master);

  // Comb filter effect for metallic resonance
  const feedbackDelay = new Tone.FeedbackDelay({
    delayTime: 0.012,
    feedback: 0.4,
    wet: 0.15
  }).connect(metalVerb);

  // Clean bus for low end
  const cleanBus = new Tone.Gain(1).connect(master);

  // === GRANULAR KICK (aggressive, short pitch decay) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 8,
    envelope: {
      attack: 0.001,
      decay: 0.18,
      sustain: 0
    },
    volume: -3
  }).connect(cleanBus);

  // Transient click layer
  const kickClick = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.008,
      sustain: 0
    },
    volume: -12
  }).connect(new Tone.Filter({ frequency: 6000, type: "highpass" }).connect(master));

  // === METALLIC PERCUSSION (per-hit variation) ===
  const metalPerc = new Tone.MetalSynth({
    frequency: 200,
    envelope: {
      attack: 0.001,
      decay: 0.06,
      release: 0.02
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4500,
    volume: -10
  }).connect(feedbackDelay);

  // Second metallic layer for density
  const metalPerc2 = new Tone.MetalSynth({
    frequency: 340,
    envelope: {
      attack: 0.001,
      decay: 0.03,
      release: 0.01
    },
    harmonicity: 7.3,
    modulationIndex: 24,
    resonance: 6000,
    volume: -14
  }).connect(roomVerb);

  // === GLITCHY FM BASS (rapid filter modulation) ===
  const bassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    Q: 8,
    rolloff: -24
  }).connect(cleanBus);

  const bassFilterLFO = new Tone.LFO({
    frequency: 18,
    min: 200,
    max: 2400,
    type: "sawtooth"
  });
  bassFilterLFO.connect(bassFilter.frequency);
  bassFilterLFO.start();

  const bass = new Tone.MonoSynth({
    oscillator: { type: "fmsawtooth", modulationType: "square", modulationIndex: 3 },
    envelope: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0.4,
      release: 0.08
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0.2,
      release: 0.05,
      baseFrequency: 150,
      octaves: 3
    },
    volume: -6
  }).connect(bassFilter);

  // === DIGITAL TEXTURE PAD (triangle + high-freq filter mod) ===
  const padFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    Q: 3
  }).connect(metalVerb);

  const padFilterLFO = new Tone.LFO({
    frequency: 6.5,
    min: 800,
    max: 4000,
    type: "triangle"
  });
  padFilterLFO.connect(padFilter.frequency);
  padFilterLFO.start();

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.8,
      decay: 0.4,
      sustain: 0.5,
      release: 2.0
    },
    volume: -16
  }).connect(padFilter);

  // === CHROMATIC TONE-ROW BELL ===
  const bell = new Tone.FMSynth({
    harmonicity: 5.5,
    modulationIndex: 14,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.6,
      sustain: 0.05,
      release: 1.0
    },
    modulationEnvelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.1,
      release: 0.5
    },
    volume: -14
  }).connect(metalVerb);

  // === NOISE BURST ACCENTS ===
  const noiseBurst = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.025,
      sustain: 0
    },
    volume: -16
  }).connect(new Tone.Filter({ frequency: 8000, type: "highpass" }).connect(roomVerb));

  // === EUCLIDEAN RHYTHM GENERATOR ===
  function euclidean(pulses, steps) {
    const pattern = new Array(steps).fill(0);
    let bucket = 0;
    for (let i = 0; i < steps; i++) {
      bucket += pulses;
      if (bucket >= steps) {
        bucket -= steps;
        pattern[i] = 1;
      }
    }
    return pattern;
  }

  // E(5,8) for kick in 4/4 bars, E(3,7) for kick in 7/8 bars
  const kickE58 = euclidean(5, 8);   // [1,0,1,0,1,0,1,1]
  const kickE37 = euclidean(3, 7);   // [1,0,1,0,1,0,0]

  // E(7,16) for metallic percussion in 4/4
  const metalE716 = euclidean(7, 16);
  // E(5,14) for metallic percussion in 7/8
  const metalE514 = euclidean(5, 14);

  // Chromatic tone row for bass (all 12 pitches, scrambled)
  const toneRow = ["C2", "F#2", "Eb2", "A2", "Db2", "G2", "E2", "Bb2", "D2", "Ab2", "F2", "B1"];
  let toneRowIdx = 0;

  // Bell tone row (same set, different octave, reversed)
  const bellRow = ["B4", "F5", "Ab4", "D5", "Bb4", "E5", "G4", "Db5", "A4", "Eb5", "F#4", "C5"];
  let bellRowIdx = 0;

  // === SHIFTING METER SYSTEM ===
  // Alternate between 7/8 bars (7 8th notes) and 4/4 bars (8 8th notes)
  // Total pattern = 15 8th notes, then repeat
  let globalStep = 0;
  let barType = 0; // 0 = 7/8 bar, 1 = 4/4 bar

  // Track which 8th note within the current bar
  let barStep = 0;
  const barLengths = [7, 8]; // 7/8 then 4/4

  const mainClock = new Tone.Loop((time) => {
    const currentBarLength = barLengths[barType];
    const subStep = barStep;

    // --- KICK (Euclidean) ---
    const kickPattern = barType === 0 ? kickE37 : kickE58;
    if (kickPattern[subStep % kickPattern.length]) {
      kick.triggerAttackRelease("C1", "16n", time + H(3), 0.9 + Math.random() * 0.1);
      kickClick.triggerAttackRelease("64n", time, 0.5);
    }

    // --- METALLIC PERCUSSION (Euclidean, per-hit variation) ---
    const metalPattern = barType === 0 ? metalE514 : metalE716;
    const metalSubIdx = barType === 0 ? subStep * 2 : subStep * 2;
    if (metalSubIdx < metalPattern.length && metalPattern[metalSubIdx]) {
      // Vary harmonicity and modulationIndex per hit
      metalPerc.harmonicity = 3 + Math.random() * 8;
      metalPerc.modulationIndex = 16 + Math.random() * 32;
      metalPerc.triggerAttackRelease("64n", time + H(6), 0.4 + Math.random() * 0.3);
    }
    if (metalSubIdx + 1 < metalPattern.length && metalPattern[metalSubIdx + 1]) {
      metalPerc2.harmonicity = 4 + Math.random() * 10;
      metalPerc2.modulationIndex = 12 + Math.random() * 28;
      metalPerc2.triggerAttackRelease("64n", time + H(8), 0.25 + Math.random() * 0.25);
    }

    // --- BASS (chromatic tone row, on select beats) ---
    if (subStep === 0 || (subStep === 3 && Math.random() > 0.3) || (subStep === 5 && barType === 0)) {
      const note = toneRow[toneRowIdx % toneRow.length];
      bass.triggerAttackRelease(note, "16n", time + H(5), 0.8);
      toneRowIdx++;
      // Modulate filter LFO rate per note
      bassFilterLFO.frequency.value = 8 + Math.random() * 25;
    }

    // --- BELL (sparse, chromatic, on prime-numbered steps) ---
    if (globalStep > 0 && (subStep === 2 || subStep === 5) && Math.random() > 0.5) {
      bell.triggerAttackRelease(bellRow[bellRowIdx % bellRow.length], "8n", time + H(10), 0.5);
      bellRowIdx++;
    }

    // --- NOISE BURSTS (prime clusters: 3, 5, 7) ---
    if (globalStep % 7 === 0 || globalStep % 13 === 0) {
      const burstCount = [3, 5, 7][Math.floor(Math.random() * 3)];
      for (let i = 0; i < burstCount; i++) {
        Tone.Transport.scheduleOnce((t) => {
          noiseBurst.triggerAttackRelease("64n", t, 0.3 + Math.random() * 0.2);
        }, time + (i * 0.018));
      }
    }

    // Advance step counters
    barStep++;
    globalStep++;
    if (barStep >= currentBarLength) {
      barStep = 0;
      barType = (barType + 1) % 2;
    }
  }, "8n");

  // === PAD CLUSTERS (chromatic, slowly shifting) ===
  const padClusters = [
    ["C3", "Db3", "F#3"],
    ["Eb3", "G3", "B3"],
    ["D3", "Ab3", "Bb3"],
    ["E3", "A3", "C4"]
  ];
  let padClusterIdx = 0;
  const padPart = new Tone.Part((time, ev) => {
    const cluster = padClusters[padClusterIdx % padClusters.length];
    pad.triggerAttackRelease(cluster, "2m", time, 0.35);
    padClusterIdx++;
  }, [
    { time: "0:0:0" },
    { time: "4:0:0" },
    { time: "8:0:0" },
    { time: "12:0:0" }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "16m";

  // === HI-HAT BURST SYSTEM (prime-grouped clusters) ===
  const hatBurst = new Tone.MetalSynth({
    frequency: 420,
    envelope: {
      attack: 0.001,
      decay: 0.02,
      release: 0.008
    },
    harmonicity: 9.1,
    modulationIndex: 40,
    resonance: 7000,
    volume: -18
  }).connect(roomVerb);

  const burstLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.6) {
      const groupSize = [3, 5, 7][Math.floor(Math.random() * 3)];
      const spacing = 0.025 + Math.random() * 0.035;
      for (let i = 0; i < groupSize; i++) {
        Tone.Transport.scheduleOnce((t) => {
          hatBurst.harmonicity = 6 + Math.random() * 8;
          hatBurst.triggerAttackRelease("64n", t, 0.2 + Math.random() * 0.25);
        }, time + (i * spacing));
      }
    }
  }, "4n");

  // === ARRANGEMENT (60s @ 138 BPM = ~18 bars) ===

  // Bars 0-3: Sparse machine pulse - pad + scattered metallic hits
  padPart.start("0:0:0");
  Tone.Transport.schedule((t) => {
    // Start clock but bass filter is narrow
    bassFilterLFO.max.value = 600;
    mainClock.start(t);
  }, "0:0:0");

  // Bars 3-7: Euclidean rhythms emerge - kick enters, bass opens
  Tone.Transport.schedule((t) => {
    bassFilterLFO.max.linearRampToValueAtTime(1600, t + Tone.Time("2m").toSeconds());
  }, "3:0:0");

  // Bars 7-11: Full algorithmic complexity - hat bursts, all layers active
  Tone.Transport.schedule((t) => {
    burstLoop.start(t);
    bassFilterLFO.max.linearRampToValueAtTime(2400, t + Tone.Time("2m").toSeconds());
    // Increase pad filter modulation depth
    padFilterLFO.max.value = 5000;
  }, "7:0:0");

  // Bars 11-14: Pattern mutation - shift behavior
  Tone.Transport.schedule((t) => {
    // Speed up bass filter LFO for more aggressive modulation
    bassFilterLFO.frequency.linearRampToValueAtTime(35, t + Tone.Time("2m").toSeconds());
    // Increase feedback delay for more resonance
    feedbackDelay.feedback.linearRampToValueAtTime(0.6, t + Tone.Time("1m").toSeconds());
  }, "11:0:0");

  // Bars 14-18: Folding cascade - maximum density then strip
  Tone.Transport.schedule((t) => {
    // Peak complexity
    padFilterLFO.frequency.value = 12;
    bassFilterLFO.max.value = 3500;
  }, "14:0:0");

  Tone.Transport.schedule((t) => {
    // Begin cascade reduction
    feedbackDelay.feedback.linearRampToValueAtTime(0.4, t + Tone.Time("2m").toSeconds());
    bassFilterLFO.max.linearRampToValueAtTime(800, t + Tone.Time("2m").toSeconds());
    burstLoop.stop(t + Tone.Time("1m").toSeconds());
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, kickClick, metalPerc, metalPerc2, bass, bassFilter, bassFilterLFO, pad, padFilter, padFilterLFO, bell, noiseBurst, hatBurst, feedbackDelay, metalVerb, roomVerb };
  window.toneJsParts = { mainClock, padPart, burstLoop };
};
```

### Common Mistakes to Avoid

- **Regular time signatures**: Autechre avoids standard 4/4 grooves
  - Alternate between 7/8 and 4/4 bars for metric displacement
  - Use Euclidean rhythm algorithms (E(k,n)) instead of hand-placed beats
  - If you can tap your foot easily, it is too regular

- **Tonal harmony**: There should be no key center
  - Use all 12 chromatic pitches in tone rows
  - Pad clusters use non-triadic voicings (Db + F# + C, not major/minor)
  - If it sounds like a chord progression, it is too conventional

- **Static percussion**: Every metallic hit must vary
  - Randomize harmonicity (3-11) and modulationIndex (16-48) per hit
  - No two MetalSynth triggers should sound identical
  - Variation is the system, not the exception

- **Predictable structure**: Sections must mutate, not repeat
  - Parameters drift continuously (filter LFO rate, delay feedback, modulation depth)
  - Same Euclidean pattern sounds different each pass due to shifting meter
  - The listener should never feel settled

- **Missing rapid filter modulation**: The bass needs audio-rate-adjacent filter movement
  - LFO on bass filter at 8-35 Hz creates digital granular texture
  - Sawtooth LFO waveform for aggressive stepping quality
  - This is the core of the Autechre bass sound

- **Regular hi-hat patterns**: Hats must cluster in prime-number groups
  - Bursts of 3, 5, or 7 rapid hits that appear and vanish
  - Variable spacing between hits within each burst (25-60ms)
  - 40% trigger probability per beat - sparse but dense when triggered

### Mixing Approach

- **Granular Kick**: -3dB, very short pitch decay (8ms), 8 octaves, through clean bus
- **Metallic Percussion**: -10dB primary / -14dB secondary, through comb filter + reverb
- **FM Bass**: -6dB, through rapid LFO-modulated filter (8-35Hz), clean bus
- **Digital Pad**: -16dB, triangle wave through LFO-modulated lowpass (6.5Hz), metallic reverb
- **Tone-Row Bell**: -14dB, FM synth (harmonicity 5.5), through metallic reverb
- **Hat Bursts**: -18dB, high harmonicity (6-14), prime-number cluster groups
- **Noise Bursts**: -16dB, white noise highpassed at 8kHz, short room reverb
- **Kick Click**: -12dB, white noise highpassed at 6kHz, transient accent

**Master Chain:**
- Compressor: 4:1 ratio, -14dB threshold, 3ms attack, 120ms release
- Limiter: -3dB ceiling

**Effects:**
- Metallic Reverb: 1.6s decay, 18% wet
- Room Reverb: 0.5s decay, 12% wet
- Comb Filter Delay: 12ms, 40% feedback (increases to 60% in mutation section)

### Reference Tracks

1. **Autechre - Gantz Graf** - Extreme rhythmic complexity, folding beat structures
2. **Autechre - plyPhon** - Shifting meters, granular percussion, algorithmic bass
3. **Autechre - Clipper** - Metallic textures, prime subdivisions, machine precision
4. **Autechre - Eutow** - Euclidean rhythms, chromatic tone rows, evolving parameters
5. **Autechre - Surripere** - Dense polyrhythmic layering, continuous transformation

### Structural Blueprint (60s @ 138 BPM = ~18 bars)

- **Bars 0-3 (Sparse Machine Pulse)**: Pad clusters + scattered metallic hits, narrow bass filter
  - Chromatic pad clusters establish atonal harmonic space
  - Main clock running but bass filter restricted (max 600Hz)
  - Euclidean kick pattern audible but restrained
  - Metallic percussion with per-hit variation hints at complexity

- **Bars 3-7 (Euclidean Rhythms Emerge)**: Bass filter opens, full kick pattern, tone row bass
  - Bass filter max opens to 1600Hz, LFO modulation becomes audible
  - Kick + metallic percussion Euclidean patterns fully active
  - Chromatic bass tone row creates unpredictable melodic content
  - FM bells appear sporadically on prime-numbered steps

- **Bars 7-11 (Algorithmic Complexity Peak)**: Hat bursts enter, maximum density
  - Prime-number hat burst clusters (3, 5, 7 hits) at 40% probability
  - Bass filter opens further (2400Hz), pad filter widens
  - All layers active - metric shifting between 7/8 and 4/4 fully felt
  - Noise burst accents on prime-step intervals

- **Bars 11-14 (Pattern Mutation)**: Parameters shift, behavior changes
  - Bass filter LFO accelerates (18Hz to 35Hz) for more aggressive texture
  - Feedback delay increases (40% to 60%) adding metallic resonance
  - Same patterns sound transformed through parameter drift
  - Complexity reaches critical density

- **Bars 14-18 (Folding Cascade)**: Peak density then controlled reduction
  - Maximum pad filter modulation speed and depth
  - Bass filter at widest then narrows back
  - Hat bursts removed, feedback delay recedes
  - System folds back toward opening sparsity

### Tonal Characteristics

- **Harmonic**: Atonal - chromatic tone rows and cluster voicings (C/Db/F#, Eb/G/B), no tonal center
- **Melodic**: 12-tone row for bass and bells - all pitches equal weight, anti-melodic
- **Rhythmic**: Euclidean algorithms in shifting meter (7/8 ↔ 4/4), prime-number subdivisions
- **Textural**: Rapid filter modulation (8-35Hz LFO), per-hit metallic variation, comb filtering
- **Dynamic**: Continuous parameter drift - no section repeats identically, system evolves
- **Production**: Tight compression (4:1), limited at -3dB, dry-ish (short reverbs), precision over warmth
