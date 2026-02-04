---
category: electronic
energy: high
tags: [electro, aggressive, distorted, heavy, french-touch, bass-driven]
---
## The Toxic Avenger (Spaced - Aggressive French Electro)

**Tempo**: 118-122 BPM (driving but not frantic)
**Time Signature**: 4/4 (heavy downbeat emphasis, 4-on-floor)
**Key**: Minor (D minor, A minor - dark and aggressive)
**Instruments**: Distorted sawtooth lead, layered bass (sine sub + distorted saw), punchy 4-on-floor kick, tight snare, 16th hi-hats, filtered arpeggios, dark pads, sidechain pumping
**Structure**: Filtered intro → Bass drop → Full assault → Climax → Breakdown → Peak
**Vibe**: Relentless aggressive French electro. Like being hunted through a neon-lit dystopia. Heavy distortion meets mechanical precision. Sidechain pumping creates rhythmic breathing. Dark, driving, and dangerous. The sound of Furi's most intense boss fights.

### Key Characteristics

1. **Aggressive Distorted Lead**: Sawtooth through heavy distortion + resonant filter sweeps
2. **Layered Bass**: Clean sine sub + distorted sawtooth one octave up for grit
3. **Sidechain Pumping**: Everything ducks to the kick for rhythmic movement
4. **4-on-Floor Kick**: Punchy, present, the pulse of the track
5. **Tight Snare**: Snappy, highpassed, on beats 2 & 4
6. **16th Hi-Hats**: Mechanical precision with velocity variation
7. **Filtered Arpeggios**: French electro signature - 16th note synth through animated filter
8. **Heavy Compression**: Glue compression + limiting for wall of sound

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 120;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const limiter = new Tone.Limiter(-1.5).toDestination();

  const masterComp = new Tone.Compressor({
    ratio: 5,
    threshold: -14,
    attack: 0.008,
    release: 0.12,
    knee: 5
  }).connect(limiter);

  const master = new Tone.Gain(0.88).connect(masterComp);

  // Sidechain simulation gain node
  const sidechainGain = new Tone.Gain(1).connect(master);

  // Distortion bus for synths
  const distBus = new Tone.Distortion({
    distortion: 0.45,
    oversample: "2x"
  }).connect(sidechainGain);

  // Short reverb for drums
  const drumVerb = new Tone.Reverb({
    decay: 0.6,
    wet: 0.12
  });
  await drumVerb.generate();
  drumVerb.connect(master);

  // Dark reverb for pads/leads
  const darkVerb = new Tone.Reverb({
    decay: 2.2,
    wet: 0.25
  });
  await darkVerb.generate();
  darkVerb.connect(sidechainGain);

  // Ping pong delay for arps
  const arpDelay = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.32,
    wet: 0.22
  }).connect(sidechainGain);

  // Clean bus for kick (bypasses sidechain)
  const cleanBus = new Tone.Gain(1).connect(master);

  // === SUB BASS (sine foundation) ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.008,
      decay: 0.18,
      sustain: 0.75,
      release: 0.15
    },
    volume: -4
  }).connect(sidechainGain);

  // === DISTORTED BASS (grit layer) ===
  const distBassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 550,
    Q: 2.5
  }).connect(distBus);

  const distBass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.003,
      decay: 0.12,
      sustain: 0.45,
      release: 0.08
    },
    volume: -10
  }).connect(new Tone.Distortion({ distortion: 0.55 }).connect(distBassFilter));

  // === AGGRESSIVE LEAD SYNTH ===
  const leadFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1200,
    Q: 6,
    rolloff: -24
  }).connect(darkVerb);

  const leadSynth = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.01,
      decay: 0.25,
      sustain: 0.55,
      release: 0.4
    },
    volume: -8
  }).connect(new Tone.Distortion({ distortion: 0.4 }).connect(leadFilter));

  // === FILTERED ARPEGGIO ===
  const arpFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 800,
    Q: 8,
    rolloff: -24
  }).connect(arpDelay);

  const arpSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: {
      attack: 0.002,
      decay: 0.08,
      sustain: 0.2,
      release: 0.05
    },
    volume: -14
  }).connect(arpFilter);

  // === DARK PAD ===
  const darkPad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 1.5,
      decay: 0.4,
      sustain: 0.6,
      release: 2.5
    },
    volume: -18
  }).connect(new Tone.Filter({ frequency: 1400, type: "lowpass" }).connect(darkVerb));

  // === PUNCHY KICK ===
  const kickDist = new Tone.Distortion({
    distortion: 0.18,
    oversample: "2x"
  }).connect(cleanBus);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 5.5,
    envelope: {
      attack: 0.001,
      decay: 0.28,
      sustain: 0
    },
    volume: -3
  }).connect(kickDist);

  // Kick click for attack
  const kickClick = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.012,
      sustain: 0
    },
    volume: -12
  }).connect(new Tone.Filter({ frequency: 5000, type: "highpass" }).connect(cleanBus));

  // === TIGHT SNARE ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0
    },
    volume: -7
  }).connect(new Tone.Filter({ frequency: 2200, type: "highpass" }).connect(drumVerb));

  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.015,
    octaves: 3,
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0
    },
    volume: -14
  }).connect(drumVerb);

  // === CRISP HI-HATS ===
  const hat = new Tone.MetalSynth({
    frequency: 300,
    envelope: {
      attack: 0.001,
      decay: 0.045,
      release: 0.015
    },
    harmonicity: 5.8,
    modulationIndex: 30,
    resonance: 5200,
    volume: -15
  }).connect(new Tone.Gain(0.85).connect(drumVerb));

  // === BASS PATTERN (16th pulse) ===
  const bassPattern = ["D1", null, "D1", "D1", null, "D1", null, "D1", "F1", null, "D1", "D1", null, "E1", null, "D1"];
  const bassSeq = new Tone.Sequence((time, note) => {
    if (note) {
      subBass.triggerAttackRelease(note, "16n", time + H(4), 0.88);
      distBass.triggerAttackRelease(Tone.Frequency(note).transpose(12).toNote(), "16n", time + H(5), 0.65);
    }
  }, bassPattern, "16n");
  bassSeq.loop = true;
  bassSeq.loopEnd = "1m";

  // === 4-ON-FLOOR KICK + SIDECHAIN ===
  const kickPart = new Tone.Part((time) => {
    kick.triggerAttackRelease("C1", "8n", time + H(2), 0.95);
    kickClick.triggerAttackRelease("32n", time, 0.55);
    // Sidechain duck
    sidechainGain.gain.setValueAtTime(0.3, time);
    sidechainGain.gain.linearRampToValueAtTime(1, time + 0.12);
  }, [
    { time: "0:0:0" },
    { time: "0:1:0" },
    { time: "0:2:0" },
    { time: "0:3:0" }
  ]);
  kickPart.loop = true;
  kickPart.loopEnd = "1m";

  // === SNARE ON 2 & 4 ===
  const snarePart = new Tone.Part((time) => {
    snare.triggerAttackRelease("8n", time + H(8), 0.82);
    snareBody.triggerAttackRelease("C4", "16n", time + H(5), 0.55);
  }, [
    { time: "0:1:0" },
    { time: "0:3:0" }
  ]);
  snarePart.loop = true;
  snarePart.loopEnd = "1m";

  // === 16TH HI-HATS ===
  const hatSeq = new Tone.Sequence((time, i) => {
    const accent = (i % 4 === 0) ? 0.65 : (i % 2 === 0) ? 0.45 : 0.3;
    if (Math.random() > 0.05) { // 5% dropout
      hat.triggerAttackRelease("64n", time + H(6), accent);
    }
  }, new Array(16).fill(0).map((_, i) => i), "16n");
  hatSeq.loop = true;
  hatSeq.loopEnd = "1m";

  // === FILTERED ARPEGGIO (16th notes) ===
  const arpNotes = ["D4", "A4", "D5", "F5", "A4", "D5", "A5", "F5"];
  const arpSeq = new Tone.Sequence((time, note) => {
    arpSynth.triggerAttackRelease(note, "32n", time + H(8), 0.5);
  }, arpNotes, "16n");
  arpSeq.loop = true;
  arpSeq.loopEnd = "2m";

  // === LEAD MELODY (aggressive phrase) ===
  const leadMelody = [
    { time: "0:0:0", note: "D4", dur: "4n", filterTarget: 3500 },
    { time: "0:2:0", note: "F4", dur: "8n", filterTarget: 2800 },
    { time: "0:2:2", note: "E4", dur: "8n", filterTarget: 2500 },
    { time: "0:3:0", note: "D4", dur: "4n", filterTarget: 4200 },
    { time: "1:0:0", note: "A4", dur: "4n.", filterTarget: 5000 },
    { time: "1:2:0", note: "G4", dur: "8n", filterTarget: 3000 },
    { time: "1:3:0", note: "F4", dur: "8n", filterTarget: 2200 },
    { time: "1:3:2", note: "E4", dur: "4n", filterTarget: 3800 }
  ];
  const leadPart = new Tone.Part((time, ev) => {
    leadSynth.triggerAttackRelease(ev.note, ev.dur, time + H(10), 0.75);
    // Filter sweep
    leadFilter.frequency.setValueAtTime(1200, time);
    leadFilter.frequency.exponentialRampToValueAtTime(ev.filterTarget, time + Tone.Time(ev.dur).toSeconds() * 0.5);
    leadFilter.frequency.exponentialRampToValueAtTime(1200, time + Tone.Time(ev.dur).toSeconds());
  }, leadMelody);
  leadPart.loop = true;
  leadPart.loopEnd = "2m";

  // === PAD PROGRESSION ===
  const padChords = [
    ["D2", "A2", "D3", "F3"],   // Dm
    ["C2", "G2", "C3", "E3"],   // C
    ["Bb1", "F2", "Bb2", "D3"], // Bb
    ["A1", "E2", "A2", "C#3"]   // A (tension)
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
  // 60s @ 120 BPM = 16 bars

  // Bars 0-4: Filtered intro - arp + pad only
  padPart.start("0:0:0");
  arpSeq.start("0:0:0");
  // Start with filter closed
  arpFilter.frequency.setValueAtTime(400, 0);

  // Bars 4-8: Bass drop - kick + bass enter, filter opens
  Tone.Transport.schedule((t) => {
    kickPart.start(t);
    bassSeq.start(t);
    arpFilter.frequency.linearRampToValueAtTime(2000, t + Tone.Time("2m").toSeconds());
  }, "4:0:0");

  // Bars 8-12: Full assault - add all drums + lead
  Tone.Transport.schedule((t) => {
    snarePart.start(t);
    hatSeq.start(t);
    leadPart.start(t);
  }, "8:0:0");

  // Bars 12-16: Peak intensity - open filters fully
  Tone.Transport.schedule((t) => {
    arpFilter.frequency.linearRampToValueAtTime(4500, t + Tone.Time("2m").toSeconds());
    leadFilter.frequency.setValueAtTime(2000, t);
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { subBass, distBass, leadSynth, leadFilter, arpSynth, arpFilter, darkPad, kick, kickClick, snare, snareBody, hat, sidechainGain, distBus, darkVerb, arpDelay };
  window.toneJsParts = { bassSeq, kickPart, snarePart, hatSeq, arpSeq, leadPart, padPart };
};
```

### Common Mistakes to Avoid

- **No sidechain pumping**: The breathing rhythm is essential to French electro
- Simulate with gain automation ducking on kick hits (0.3 → 1 over 120ms)
- Everything except kick should go through sidechain gain

- **Too clean**: This style needs distortion on bass, lead, and light on kick
- Layer distorted sawtooth on top of clean sine sub
- Lead synth through distortion before filter for harmonic richness

- **Weak kick**: The 4-on-floor kick must punch through the mix
- Punchy membrane synth + noise click layer for transient
- Keep kick on clean bus, bypass sidechain gain

- **Static filters**: Animated filter sweeps are the signature sound
- High-Q resonant filters (Q: 6-8) on leads and arps
- Automate from closed (400-800Hz) to open (3000-5000Hz) for builds

- **Missing arp**: French electro always has 16th note filtered arpeggios
- Square wave through high-Q lowpass with ping-pong delay
- Duck to kick for rhythmic integration

### Mixing Approach

- **Sub Bass**: -4dB, clean sine, foundation of low end
- **Distorted Bass**: -10dB, sawtooth through distortion + lowpass (550Hz)
- **Lead Synth**: -8dB, sawtooth, distortion, high-Q filter (Q: 6) with sweeps
- **Arpeggio**: -14dB, square wave, high-Q filter (Q: 8), ping-pong delay
- **Dark Pad**: -18dB, filtered sawtooth, slow attack, dark reverb
- **Kick**: -3dB, clean bus (no sidechain), punchy with click layer
- **Snare**: -7dB, tight white noise highpassed at 2200Hz
- **Hi-Hat**: -15dB, 16th notes with velocity variation, light reverb

**Master Chain:**
- Compressor: 5:1 ratio, -14dB threshold, 8ms attack, 120ms release
- Limiter: -1.5dB ceiling

**Sidechain:**
- Gain ducks to 0.3 on kick, recovers to 1 over 120ms

### Reference Tracks

1. **The Toxic Avenger - Spaced** - Dark aggressive electro, heavy sidechain pumping
2. **The Toxic Avenger - My Only Chance** - Driving bass, filtered arps
3. **Carpenter Brut - Turbo Killer** - Similar aggressive French electro energy
4. **Perturbator - Future Club** - Dark synth with heavy compression
5. **Justice - Genesis** - Classic French electro, distorted bass + filter sweeps

### Structural Blueprint (60s @ 120 BPM = 16 bars)

- **Bars 0-4 (Filtered Intro)**: Arp + pad only, filter closed at 400Hz
  - Establish the harmonic foundation
  - Arp creates rhythmic tension
  - Filter gradually starts opening

- **Bars 4-8 (Bass Drop)**: Kick + bass enter
  - 4-on-floor kick establishes pulse
  - Sub + distorted bass layer for power
  - Arp filter opens to 2000Hz
  - Sidechain pumping becomes apparent

- **Bars 8-12 (Full Assault)**: All drums + lead synth
  - Snare on 2 & 4, 16th hi-hats
  - Lead melody with filter automation
  - Maximum rhythmic drive

- **Bars 12-16 (Peak Intensity)**: Filter climax
  - Arp filter opens to 4500Hz
  - Lead filter at 2000Hz
  - Full wall of sound
  - Maximum aggression

### Tonal Characteristics

- **Harmonic**: D minor modal (Dm → C → Bb → A), dark and aggressive
- **Melodic**: Aggressive lead phrases with dramatic filter sweeps
- **Rhythmic**: 4-on-floor kick, 16th bass pulse, mechanical precision
- **Textural**: Heavy distortion, sidechain pumping, filtered arpeggios
- **Dynamic**: Build from filtered intro to wall of sound climax
- **Production**: Heavy compression, limiting, sidechain simulation
