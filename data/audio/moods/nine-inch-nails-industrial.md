---
category: industrial
energy: high
tags: [industrial, dark, aggressive]
---
## Nine Inch Nails (Industrial Rock)

**Tempo**: 90-130 BPM (driving, mechanical, relentless)
**Time Signature**: 4/4 (heavy emphasis on downbeats)
**Key**: Minor (often D minor, A minor, dark and aggressive)
**Instruments**: Heavy distorted bass, clipped industrial kick, layered noise snare with metal click, screaming synths with resonant filter sweeps (Q: 12+), constant noise bed, dark pads, aggressive compression
**Structure**: Noise intro → Mechanical pulse build → Heavy drop → Wall of sound → Breakdown with tension → Crushing finale
**Vibe**: Aggressive yet deeply emotional industrial. Like machines having a nervous breakdown. Trent Reznor's signature blend of electronic harshness and rock intensity. Wall of distortion punctuated by moments of fragile beauty. Self-destruction set to a beat.

### Key Characteristics

1. **Heavy Distortion**: Clipped bass, distorted drums, saturated synths
2. **Mechanical Drums**: Industrial kick (clipped, punchy), layered snare (noise + metal click)
3. **Noise Layers**: Constant pink/brown noise bed through bandpass filter
4. **Screaming Synth**: High-Q resonant filter sweeps (Q: 12+) on saw oscillator
5. **Sub-Bass Foundation**: Clean sine sub underneath distorted layers
6. **Dynamic Extremes**: Quiet fragile moments exploding into walls of sound
7. **Heavy Compression**: 6:1 ratio glue compression, limiting on master
8. **Metal Textures**: Metallic percussion, resonant hits, industrial machinery sounds

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 110;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN (heavy compression) ===
  const limiter = new Tone.Limiter(-2).toDestination();

  const masterComp = new Tone.Compressor({
    ratio: 6,
    threshold: -12,
    attack: 0.005,
    release: 0.15,
    knee: 4
  }).connect(limiter);

  const master = new Tone.Gain(0.9).connect(masterComp);

  // Distortion bus
  const distBus = new Tone.Distortion({
    distortion: 0.4,
    oversample: "2x"
  }).connect(master);

  // Dark reverb
  const darkReverb = new Tone.Reverb({
    decay: 2.8,
    preDelay: 0.01,
    wet: 0.22
  });
  await darkReverb.generate();
  darkReverb.connect(master);

  // Short industrial reverb
  const shortVerb = new Tone.Reverb({
    decay: 0.8,
    wet: 0.15
  });
  await shortVerb.generate();
  shortVerb.connect(distBus);

  // === NOISE BED (constant industrial texture) ===
  const noiseBed = new Tone.Noise("brown");
  const noiseFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 800,
    Q: 1.5
  }).connect(new Tone.Gain(0.08).connect(master));
  noiseBed.connect(noiseFilter);
  noiseBed.start();

  // === SUB BASS (clean foundation) ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.8,
      release: 0.3
    },
    volume: -4
  }).connect(new Tone.Gain(0.9).connect(master));

  // === DISTORTED BASS (layered on top of sub) ===
  const distBassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    Q: 2
  }).connect(distBus);

  const distBass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.002,
      decay: 0.15,
      sustain: 0.5,
      release: 0.1
    },
    volume: -8
  }).connect(new Tone.Distortion({ distortion: 0.6 }).connect(distBassFilter));

  // === INDUSTRIAL KICK (clipped) ===
  const kickDist = new Tone.Distortion({
    distortion: 0.25,
    oversample: "2x"
  }).connect(master);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.015,
    octaves: 5,
    envelope: {
      attack: 0.001,
      decay: 0.25,
      sustain: 0
    },
    volume: -2
  }).connect(kickDist);

  // Click layer for attack
  const kickClick = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.015,
      sustain: 0
    },
    volume: -10
  }).connect(new Tone.Filter({ frequency: 4000, type: "highpass" }).connect(master));

  // === INDUSTRIAL SNARE (noise + metal) ===
  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.18,
      sustain: 0
    },
    volume: -6
  }).connect(new Tone.Distortion({ distortion: 0.3 }).connect(shortVerb));

  // Metal click layer
  const snareMetal = new Tone.MetalSynth({
    frequency: 180,
    envelope: {
      attack: 0.001,
      decay: 0.08,
      release: 0.02
    },
    harmonicity: 3,
    modulationIndex: 16,
    resonance: 3000,
    volume: -12
  }).connect(shortVerb);

  // === SCREAMING SYNTH (high-Q filter sweep) ===
  const screamFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 800,
    Q: 12,  // High resonance for screaming quality
    rolloff: -24
  }).connect(darkReverb);

  const screamSynth = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.6,
      release: 0.8
    },
    volume: -10
  }).connect(new Tone.Distortion({ distortion: 0.35 }).connect(screamFilter));

  // === DARK PAD ===
  const darkPad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 2.0,
      decay: 0.5,
      sustain: 0.6,
      release: 3.5
    },
    volume: -16
  }).connect(new Tone.Filter({ frequency: 1200, type: "lowpass" }).connect(darkReverb));

  // === HI-HAT (metallic, aggressive) ===
  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.02
    },
    harmonicity: 5.5,
    modulationIndex: 28,
    resonance: 5000,
    volume: -14
  }).connect(new Tone.Distortion({ distortion: 0.15 }).connect(shortVerb));

  // === BASS PATTERN ===
  const bassPattern = ["D1", "D1", null, "D1", "F1", "D1", null, "E1"];
  const bassSeq = new Tone.Sequence((time, note) => {
    if (note) {
      subBass.triggerAttackRelease(note, "8n", time + H(4), 0.9);
      distBass.triggerAttackRelease(Tone.Frequency(note).transpose(12).toNote(), "8n", time + H(6), 0.7);
    }
  }, bassPattern, "8n");
  bassSeq.loop = true;
  bassSeq.loopEnd = "2m";

  // === DRIVING KICK PATTERN ===
  const kickPattern = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1];
  const kickSeq = new Tone.Sequence((time, hit) => {
    if (hit) {
      kick.triggerAttackRelease("C1", "8n", time + H(3), 0.95);
      kickClick.triggerAttackRelease("32n", time, 0.6);
    }
  }, kickPattern, "16n");
  kickSeq.loop = true;
  kickSeq.loopEnd = "1m";

  // === SNARE (heavy backbeat) ===
  const snarePart = new Tone.Part((time) => {
    snareNoise.triggerAttackRelease("8n", time + H(8), 0.85);
    snareMetal.triggerAttackRelease("16n", time + H(5), 0.6);
  }, [
    { time: "0:1:0" },
    { time: "0:3:0" }
  ]);
  snarePart.loop = true;
  snarePart.loopEnd = "1m";

  // === HI-HAT (16th note drive) ===
  const hatSeq = new Tone.Sequence((time, i) => {
    const accent = (i % 4 === 0) ? 0.7 : 0.35;
    if (Math.random() > 0.1) {  // 10% dropout
      hat.triggerAttackRelease("64n", time + H(6), accent);
    }
  }, new Array(16).fill(0).map((_, i) => i), "16n");
  hatSeq.loop = true;
  hatSeq.loopEnd = "1m";

  // === SCREAMING SYNTH MELODY ===
  const screamMelody = [
    { time: "0:0:0", note: "D4", dur: "2n", filterTarget: 3000 },
    { time: "2:0:0", note: "F4", dur: "2n", filterTarget: 4500 },
    { time: "4:0:0", note: "E4", dur: "2n", filterTarget: 2500 },
    { time: "6:0:0", note: "A4", dur: "1n", filterTarget: 6000 }
  ];
  const screamPart = new Tone.Part((time, ev) => {
    screamSynth.triggerAttackRelease(ev.note, ev.dur, time + H(10), 0.75);
    // Filter sweep up
    screamFilter.frequency.setValueAtTime(800, time);
    screamFilter.frequency.exponentialRampToValueAtTime(ev.filterTarget, time + Tone.Time(ev.dur).toSeconds() * 0.6);
    screamFilter.frequency.exponentialRampToValueAtTime(800, time + Tone.Time(ev.dur).toSeconds());
  }, screamMelody);
  screamPart.loop = true;
  screamPart.loopEnd = "8m";

  // === DARK PAD ===
  const padChords = [
    ["D2", "A2", "F3"],      // Dm
    ["D2", "Bb2", "F3"],     // Bbmaj (darker)
    ["D2", "A2", "E3"],      // Dm variation
    ["C2", "G2", "E3"]       // C (tension)
  ];
  const padPart = new Tone.Part((time, ev) => {
    darkPad.triggerAttackRelease(ev.chord, "2m", time, 0.4);
  }, [
    { time: "0:0:0", chord: padChords[0] },
    { time: "2:0:0", chord: padChords[1] },
    { time: "4:0:0", chord: padChords[2] },
    { time: "6:0:0", chord: padChords[3] }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "8m";

  // === ARRANGEMENT ===
  // 60s @ 110 BPM = ~16 bars

  // Bars 0-2: Noise bed + dark pad only (tension build)
  padPart.start("0:0:0");

  // Bars 2-4: Add bass pulse
  Tone.Transport.schedule((t) => {
    bassSeq.start(t);
  }, "2:0:0");

  // Bars 4-8: Add drums (industrial pound)
  Tone.Transport.schedule((t) => {
    kickSeq.start(t);
    snarePart.start(t);
  }, "4:0:0");

  // Bars 8-12: Full arrangement with hats and scream
  Tone.Transport.schedule((t) => {
    hatSeq.start(t);
    screamPart.start(t);
  }, "8:0:0");

  // Bars 12-16: Peak intensity
  Tone.Transport.schedule((t) => {
    // Increase noise bed
    noiseFilter.frequency.linearRampToValueAtTime(1200, t + Tone.Time("2m").toSeconds());
    // Boost distortion
    distBus.distortion = 0.55;
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { subBass, distBass, kick, kickClick, snareNoise, snareMetal, hat, screamSynth, screamFilter, darkPad, noiseBed, noiseFilter, distBus, darkReverb };
  window.toneJsParts = { bassSeq, kickSeq, snarePart, hatSeq, screamPart, padPart };
};
```

### Common Mistakes to Avoid

- **Too clean**: NIN is defined by distortion and saturation
- Heavy compression (6:1 ratio minimum)
- Distortion on bass, drums, and synths
- Constant noise bed for industrial texture

- **Weak drums**: Industrial needs mechanical punch
- Clipped kick with high attack transient
- Layered snare (noise + metallic click)
- Aggressive 16th note hi-hat drive

- **No screaming synth**: High-Q filter sweeps are NIN signature
- Q value of 12+ on filter
- Automated sweeps from 800Hz to 4000-6000Hz
- Distortion before the filter for harmonic richness

- **Missing dynamics**: Wall of sound needs quiet contrast
- Build from sparse (noise + pad) to full arrangement
- Breakdown sections that strip back before crushing finale

- **Insufficient bass**: Need both sub AND distorted layers
- Clean sine sub (D1, E1, F1) for low-end foundation
- Distorted sawtooth layer one octave up for presence

### Mixing Approach

- **Sub Bass**: -4dB, clean sine, foundation of the track
- **Distorted Bass**: -8dB, sawtooth through distortion + lowpass
- **Kick**: -2dB, clipped membrane + highpass click layer, through light distortion
- **Snare**: -6dB, white noise + metal synth, through distortion + short reverb
- **Hi-Hat**: -14dB, metallic synth, light distortion, 16th notes with accents
- **Screaming Synth**: -10dB, sawtooth, heavy distortion, high-Q filter (12+)
- **Dark Pad**: -16dB, filtered sawtooth, 2s attack, dark reverb
- **Noise Bed**: 0.08 gain, brown noise through bandpass (800Hz), constant

**Master Chain:**
- Compressor: 6:1 ratio, -12dB threshold, 5ms attack, 150ms release
- Limiter: -2dB ceiling

### Reference Tracks

1. **Nine Inch Nails - Closer** - Driving industrial rhythm, iconic synth screams
2. **Nine Inch Nails - March of the Pigs** - Aggressive dynamics, industrial chaos
3. **Nine Inch Nails - Wish** - Relentless mechanical drums, distorted bass
4. **Nine Inch Nails - Hurt** - Emotional depth within industrial framework
5. **Ministry - Thieves** - Pure industrial aggression reference

### Structural Blueprint (60s @ 110 BPM = 16 bars)

- **Bars 0-2 (Noise Intro)**: Brown noise bed + dark pad swells only, building tension
- **Bars 2-4 (Pulse Build)**: Bass enters with driving 8th note pattern
- **Bars 4-8 (Industrial Drop)**: Drums enter - clipped kicks, heavy snares on 2 & 4
- **Bars 8-12 (Full Assault)**: Hi-hats add 16th drive, screaming synth with filter sweeps
- **Bars 12-16 (Peak)**: Maximum intensity - increased noise, boosted distortion

### Tonal Characteristics

- **Harmonic**: D minor, dark and aggressive (Dm → Bb → Dm → C)
- **Melodic**: Screaming synth lines with dramatic filter sweeps (800Hz → 6000Hz)
- **Rhythmic**: Driving 4/4, mechanical precision, syncopated kick patterns
- **Textural**: Layered distortion, constant noise bed, metallic percussion
- **Dynamic**: Quiet tension building to crushing walls of sound
- **Production**: Heavy compression (6:1), limiting, oversample distortion
