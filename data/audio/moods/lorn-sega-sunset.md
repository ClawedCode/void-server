---
category: industrial
energy: medium
tags: [dark, melancholic, heavy]
---
## Lorn (Sega Sunset Dark Glitch)

**Tempo**: 60-65 BPM (half-time feel from 120-130 BPM)
**Key**: G# minor (dark, brooding)
**Instruments**: Crushing sub-bass, glitchy percussion, distorted synth stabs, atmospheric pads, sparse melodic fragments
**Structure**: Minimal intro → Heavy drop → Glitch breakdown → Final impact
**Vibe**: Dark, heavy, industrial - like wandering through a dystopian cityscape at night. Crushing bass, glitchy textures, and sparse melodies create a sense of isolation and unease.

### Key Characteristics

1. **Crushing Sub-Bass**: Extremely low sine wave bass (40-60Hz), sustained and heavy
2. **Glitchy Percussion**: Distorted, bit-crushed drums with irregular patterns
3. **Industrial Textures**: Metallic hits, noise bursts, distorted stabs
4. **Half-Time Feel**: 60-65 BPM with occasional double-time hi-hat patterns (120-130 BPM)
5. **Sparse Melody**: Minimal, haunting melodic fragments with heavy processing
6. **Heavy Sidechain**: Bass ducks other elements for impact
7. **Dark Atmosphere**: Minor key, low valence, brooding and ominous
8. **Distortion & Grit**: BitCrusher, Distortion, Chebyshev for lo-fi degradation

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 64;  // Half-time feel
  Tone.Transport.bpm.value = bpm;

  // === MASTER EFFECTS CHAIN ===
  const limiter = new Tone.Limiter(-1).toDestination();
  const masterComp = new Tone.Compressor({
    threshold: -12,
    ratio: 4,
    attack: 0.003,
    release: 0.1
  }).connect(limiter);

  // Reverb bus for atmosphere
  const reverb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.01,
    wet: 0.25
  });
  await reverb.generate();
  reverb.connect(masterComp);

  const reverbBus = new Tone.Gain(1).connect(reverb);

  // === CRUSHING SUB-BASS ===
  const bassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 150,
    Q: 0.5
  }).connect(masterComp);

  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.9,
      release: 0.8
    },
    volume: -3
  }).connect(bassFilter);

  // Bass progression (G# minor)
  const bassNotes = ["G#1", "D#1", "E1", "B0"];
  let bassIdx = 0;

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    // Enter after bar 2
    if (bar >= 2 && bar < 20) {
      bass.triggerAttackRelease(
        bassNotes[bassIdx % bassNotes.length],
        "1n",  // Whole note - sustained and heavy
        time,
        1.0
      );
      bassIdx++;
    }
  }, "1n").start(0);

  // === GLITCHY KICK (distorted) ===
  const kickDist = new Tone.Distortion(0.8).connect(masterComp);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 8,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0,
      release: 0.2
    },
    volume: -4
  }).connect(kickDist);

  let kickBeat = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const beat = kickBeat % 4;

    // Enter at bar 2
    if (bar >= 2 && bar < 20) {
      // Kick on beats 1 and 3
      if (beat === 0 || beat === 2) {
        kick.triggerAttackRelease("C0", "8n", time, 0.95);
      }
    }
    kickBeat++;
  }, "4n").start(0);

  // === GLITCHY SNARE (bit-crushed) ===
  const snareCrusher = new Tone.BitCrusher(4).connect(reverbBus);

  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.02,
      release: 0.1
    },
    volume: -8
  }).connect(snareCrusher);

  let snareBeat = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const beat = snareBeat % 4;

    if (bar >= 4 && bar < 20) {
      // Snare on beat 2 and 4
      if (beat === 1 || beat === 3) {
        snare.triggerAttackRelease("8n", time, 0.85);
      }
    }
    snareBeat++;
  }, "4n").start(0);

  // === DOUBLE-TIME HI-HATS (glitchy, irregular) ===
  const hatCrusher = new Tone.BitCrusher(6).connect(reverbBus);

  const hat = new Tone.MetalSynth({
    frequency: 180,
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.02
    },
    harmonicity: 8,
    modulationIndex: 40,
    resonance: 3000,
    volume: -18
  }).connect(hatCrusher);

  let hatBeat = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    // Sparse, irregular hi-hats (not every 8th)
    if (bar >= 6 && bar < 18) {
      // Random probability for glitchy feel
      if (Math.random() > 0.3) {
        hat.triggerAttackRelease("32n", time, 0.4);
      }
    }
    hatBeat++;
  }, "8n").start(0);

  // === INDUSTRIAL METALLIC HITS ===
  const metalHit = new Tone.MetalSynth({
    frequency: 80,
    envelope: {
      attack: 0.001,
      decay: 0.3,
      release: 0.4
    },
    harmonicity: 12,
    modulationIndex: 60,
    resonance: 2000,
    volume: -12
  }).connect(new Tone.Distortion(0.6).connect(reverbBus));

  // Scheduled metallic impacts at key moments
  [4, 8, 12, 16].forEach((bar) => {
    Tone.Transport.schedule((time) => {
      metalHit.triggerAttackRelease("16n", time, 0.9);
    }, `${bar}:0:0`);
  });

  // === DARK ATMOSPHERIC PAD ===
  const padFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1200,
    Q: 2
  }).connect(reverbBus);

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "sawtooth"
    },
    envelope: {
      attack: 2.0,
      decay: 0.5,
      sustain: 0.8,
      release: 3.0
    },
    volume: -20
  }).connect(padFilter);

  // G# minor pad progression
  const padChords = [
    ["G#3", "B3", "D#4"],   // G#m
    ["D#3", "F#3", "A#3"],  // D#m
    ["E3", "G#3", "B3"],    // E
    ["B2", "D#3", "F#3"]    // B
  ];

  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    // Pad present throughout
    if (bar < 20) {
      const velocity = bar < 2 ? 0.15 : bar < 16 ? 0.25 : 0.15;
      pad.triggerAttackRelease(
        padChords[padIdx % padChords.length],
        "2n",
        time,
        velocity
      );
      padIdx++;
    }
  }, "2n").start(0);

  // === SPARSE DISTORTED LEAD (glitchy) ===
  const leadDist = new Tone.Chebyshev(50).connect(reverbBus);
  const leadDelay = new Tone.PingPongDelay({
    delayTime: "8n",
    feedback: 0.4,
    wet: 0.3
  }).connect(leadDist);

  const lead = new Tone.MonoSynth({
    oscillator: { type: "square" },
    filter: {
      type: "lowpass",
      frequency: 800
    },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.5
    },
    volume: -14
  }).connect(leadDelay);

  // Very sparse melodic fragments
  const leadMelody = [
    { note: "D#5", time: "6:0:0", duration: "4n" },
    { note: "C#5", time: "7:2:0", duration: "8n" },
    { note: "B4", time: "10:0:0", duration: "4n" },
    { note: "G#4", time: "14:0:0", duration: "2n" }
  ];

  leadMelody.forEach(({ note, time, duration }) => {
    Tone.Transport.schedule((schedTime) => {
      lead.triggerAttackRelease(note, duration, schedTime, 0.7);
    }, time);
  });

  // === NOISE BURSTS (glitch texture) ===
  const noiseBurst = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0
    },
    volume: -16
  }).connect(new Tone.BitCrusher(3).connect(reverbBus));

  // Random noise bursts in breakdown section
  let noiseBeat = 0;
  const noiseLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    // Only in middle section, sparse
    if (bar >= 10 && bar < 14 && Math.random() > 0.7) {
      noiseBurst.triggerAttackRelease("32n", time, 0.6);
    }
    noiseBeat++;
  }, "16n").start(0);

  // === FILTER AUTOMATION (build tension) ===
  // Open pad filter during build
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(2400, time + 8 * (60 / bpm) * 4);
  }, "4:0:0");

  // Close filter before loop
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1200, time + 4 * (60 / bpm) * 4);
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = {
    bass, kick, snare, hat, metalHit, pad, lead, noiseBurst,
    reverb, limiter, masterComp, bassFilter, padFilter
  };
  window.toneJsParts = {
    bassLoop, kickLoop, snareLoop, hatLoop, padLoop, noiseLoop
  };
};
```

### Common Mistakes to Avoid

❌ **Not heavy enough**: This needs crushing low-end
- Sub-bass should be felt, not just heard (40-60Hz sine wave)
- Use distortion and bit-crushing for grit
- Heavy compression and limiting for impact
- Don't be afraid of aggressive processing

❌ **Too clean/polished**: Lorn's aesthetic is lo-fi and distorted
- Use BitCrusher on drums (4-6 bits)
- Add Distortion and Chebyshev to leads
- Glitchy, irregular hi-hat patterns (random probability)
- Noise bursts for texture and chaos

❌ **Too busy**: Lorn's compositions are sparse and spacious
- Long sustained bass notes (whole notes)
- Sparse melodic fragments (3-4 notes total)
- Irregular percussion patterns
- Let the bass and atmosphere dominate

❌ **Wrong tempo feel**: Half-time is critical
- Use 60-65 BPM for the main groove
- Hi-hats can be double-time (8th notes at this BPM)
- Kick on beats 1 and 3, snare on 2 and 4
- Should feel slow but heavy, not fast

### Mixing Approach

- **Master**: Limiter at -1dB, heavy compression (4:1 ratio, -12dB threshold)
- **Sub-Bass**: 1.0 velocity, -3dB, lowpass at 150Hz, sustained whole notes
- **Kick**: 0.95 velocity, -4dB, distorted (0.8 drive), on beats 1 & 3
- **Snare**: 0.85 velocity, -8dB, bit-crushed (4-bit), on beats 2 & 4
- **Hi-Hats**: 0.4 velocity, -18dB, bit-crushed (6-bit), sparse/random
- **Metallic Hits**: 0.9 velocity, -12dB, distorted (0.6 drive), at bar transitions
- **Pad**: 0.15-0.25 velocity, -20dB, lowpass filtered (1200-2400Hz sweep)
- **Lead**: 0.7 velocity, -14dB, Chebyshev distortion (50), very sparse
- **Noise Bursts**: 0.6 velocity, -16dB, bit-crushed (3-bit), random in breakdown

**Effects Levels:**
- Reverb: 2.5s decay, 25% wet (dark, industrial space)
- Delay: 8th note, 40% feedback, 30% wet (on lead only)
- BitCrusher: 3-6 bits (drums and noise)
- Distortion: 0.6-0.8 drive (kick, metallic hits, lead)
- Compression: Heavy on master (4:1 ratio) for glue and impact

### Reference Tracks

1. **Lorn - Sega Sunset** - The definitive example
2. **Lorn - Anvil** - Similar crushing bass and industrial textures
3. **Lorn - Acid Rain** - Dark atmospheric glitch
4. **Burial - Archangel** - Sparse, haunting, glitchy percussion
5. **The Haxan Cloak - Excavation** - Heavy industrial atmospheres

### Structural Blueprint (60s @ 64 BPM ≈ 20 bars)

- **Bars 0-2 (Intro)**: Pad only (dark, atmospheric opening)
  - Pad plays G#m progression
  - No bass or drums - create tension
  - Filter closed at 1200Hz

- **Bars 2-4 (Bass Entry)**: Sub-bass drops
  - Crushing sub-bass enters on G# root
  - Kick and distorted textures begin
  - Still no snare - build anticipation

- **Bars 4-10 (Main Section)**: Full industrial groove
  - Snare enters on 2 & 4 (half-time backbeat)
  - Metallic hits on bar transitions
  - Pad filter opens gradually (1200Hz → 2400Hz)
  - Sparse lead fragments appear

- **Bars 10-14 (Glitch Breakdown)**: Chaos and texture
  - Random noise bursts (brown noise, bit-crushed)
  - Irregular hi-hat patterns (probability-based)
  - Maintain heavy bass and kick foundation

- **Bars 14-16 (Final Impact)**: Return to power
  - All elements present
  - Pad filter stays open at 2400Hz
  - Heavy groove with glitchy textures

- **Bars 16-20 (Wind-down)**: Loop preparation
  - Pad filter closes back to 1200Hz
  - Reduce intensity gradually
  - Drop drums by bar 18
  - Return to pad-only by bar 20 (matches intro)

**Looping**: Track ends at bar 20 and loops back to bar 0, matching intro texture.

### Tonal Characteristics

- **Harmonic**: G# minor, dark and brooding (G#m → D#m → E → B)
- **Melodic**: Extremely sparse - 3-4 notes across entire track, heavily processed
- **Rhythmic**: Half-time feel (64 BPM) with crushing kick/snare pattern
- **Textural**: Industrial - distortion, bit-crushing, metallic hits, noise bursts
- **Dynamic**: Heavy compression for consistent impact, filter sweeps for movement
- **Production**: Lo-fi glitch aesthetic - embrace distortion and degradation
