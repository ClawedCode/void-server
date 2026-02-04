---
category: electronic
energy: high
tags: [pop, bouncy, catchy]
---
## Synthpop Bounce

**Tempo**: 115-125 BPM
**Key**: Major or minor (uplifting character)
**Instruments**: Punchy sequence basslines, playful arpeggios, bright gliding leads, crisp drums
**Structure**: Intro → Verse → Chorus → Verse → Chorus → Bridge → Chorus
**Vibe**: Precision meets drama - sequence-driven, tight filtering, danceable without aggression, uplifting energy

### Key Characteristics

1. **Punchy Sequence Basslines**: Tight filtering, driving rhythm foundation
2. **Playful Arpeggios**: Bright, bouncy, infectious melodic patterns
3. **Bright Gliding Leads**: Fast portamento, dramatic melodic lines
4. **Crisp Electronic Drums**: Tight, punchy, danceable groove
5. **Uplifting Character**: Positive energy without being overly aggressive
6. **Danceable**: Four-on-floor foundation, groove-oriented without hard edges

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 120;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - precise bounce

  // === FX BUSES ===
  const popReverb = new Tone.Reverb({ decay: 1.5, wet: 0.30 }).toDestination();
  await popReverb.generate();

  const bounceDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.28, wet: 0.22 }).connect(popReverb);

  // === PUNCHY SEQUENCE BASS (foundation) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.003, decay: 0.18, sustain: 0.35, release: 0.12 },
    filterEnvelope: { attack: 0.002, decay: 0.12, sustain: 0.30, baseFrequency: 250, octaves: 2.2 }
  }).toDestination();

  // Dm progression: D → Bb → F → C
  const bassPat = ["D2", "D2", "F2", "D2", "Bb1", "Bb1", "D2", "C2"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    bass.triggerAttackRelease(bassPat[bassIdx % bassPat.length], "16n", time, 0.75);
    bassIdx++;
  }, "16n").start(0);

  // === PLAYFUL ARPEGGIO (bounce element) ===
  const arp = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.25, release: 0.10 },
    filterEnvelope: { attack: 0.003, decay: 0.10, sustain: 0.28, baseFrequency: 2800, octaves: 2.5 }
  }).connect(bounceDelay);

  const arpPattern = ["D4", "F4", "A4", "D5", "A4", "F4", "D4", "A3"];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      arp.triggerAttackRelease(arpPattern[arpIdx % arpPattern.length], "16n", time, 0.65);
    }
    arpIdx++;
  }, "16n").start(0);

  // === BRIGHT GLIDING LEAD (chorus) ===
  const lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.03, decay: 0.22, sustain: 0.65, release: 0.35 },
    portamento: 0.05 // Bright gliding
  }).connect(bounceDelay);

  const leadMelody = ["D5", "C5", "Bb4", "A4", "F4", "A4", "Bb4", null];
  const leadVelocities = [0.78, 0.75, 0.72, 0.75, 0.70, 0.75, 0.78, 0];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && leadMelody[leadIdx % leadMelody.length]) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "4n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.72
      );
    }
    leadIdx++;
  }, "4n").start(0);

  // === UPLIFTING PAD (harmonic support) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.35, decay: 0.25, sustain: 0.82, release: 1.2 },
    detune: 5
  }).connect(popReverb);

  const padChords = [
    ["D3", "F3", "A3"], // Dm
    ["Bb2", "D3", "F3"], // Bb
    ["F3", "A3", "C4"], // F
    ["C3", "E3", "G3"]  // C
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, 0.38);
    }
    padIdx++;
  }, "1m").start(0);

  // === CRISP KICK (four-on-floor) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.07 }
  }).toDestination();

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 0.82);
    kickStep++;
  }, "4n").start(0);

  // === PUNCHY SNARE (on 2 and 4) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.10, sustain: 0, release: 0.06 }
  }).connect(popReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    if (snareStep % 4 === 2) {
      snare.triggerAttackRelease("16n", time, 0.72);
    }
    snareStep++;
  }, "4n").start(0);

  // === CRISP HI-HATS (bounce rhythm) ===
  const hihat = new Tone.MetalSynth({
    frequency: 220,
    envelope: { attack: 0.001, decay: 0.07, release: 0.04 },
    harmonicity: 5.2,
    modulationIndex: 35,
    resonance: 4200
  }).toDestination();

  let hihatStep = 0;
  const hihatLoop = new Tone.Loop((time) => {
    const velocity = hihatStep % 2 === 0 ? 0.52 : 0.38;
    hihat.triggerAttackRelease("32n", time, velocity);
    hihatStep++;
  }, "8n").start(0);

  // === PLAYFUL CLAPS (extra bounce) ===
  const clap = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
  }).connect(popReverb);

  let clapStep = 0;
  const clapLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && clapStep % 4 === 2) { // Chorus sections
      clap.triggerAttackRelease("16n", time, 0.65);
    }
    clapStep++;
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { bass, arp, lead, pad, kick, snare, hihat, clap };
  window.toneJsParts = { bassLoop, arpLoop, leadLoop, padLoop, kickLoop, snareLoop, hihatLoop, clapLoop };
};
```

### Common Mistakes to Avoid

❌ **Too aggressive**: Synthpop is uplifting, not hard
- Keep filter cutoffs moderate (2800Hz max on arp)
- Avoid harsh resonance
- Bounce without aggression

❌ **Too slow**: This is danceable pop
- Keep BPM 115-125 (not 100-110)
- 16th-note patterns for drive
- Maintain uplifting energy

❌ **Missing the bounce**: Rhythmic interplay is key
- Sequence bass with tight filtering
- Playful arpeggios threading through
- Crisp drums providing the groove

❌ **Too dark**: Synthpop is positive and bright
- Use major moments even in minor keys
- Bright filter frequencies
- Uplifting character throughout

### Arrangement Tips

1. **Intro (4 bars)**: Kick and bass establish groove
2. **Verse (8 bars)**: Arpeggio enters, building energy
3. **Chorus (8 bars)**: Lead melody, pads support, claps add bounce
4. **Verse 2 (8 bars)**: Variation on arpeggio pattern
5. **Bridge (4 bars)**: Strip to bass and pads, tension before final chorus
6. **Final Chorus (8 bars)**: All elements, maximum bounce and uplift

### Mixing Approach

- **Bass**: 0.70-0.80 volume, punchy sequence driving the foundation
- **Arpeggio**: 0.60-0.70 volume, playful bounce threading through
- **Lead**: 0.68-0.78 volume, bright and present in chorus
- **Pad**: 0.35-0.45 volume, harmonic support
- **Kick**: 0.78-0.88 volume, crisp four-on-floor
- **Snare**: 0.68-0.78 volume, punchy on 2 and 4
- **Hi-hats**: 0.38-0.52 volume, crisp rhythm texture
- **Claps**: 0.60-0.70 volume, extra bounce in chorus
- **Overall**: Precise, uplifting, danceable - tight filtering and crisp drums create the bounce
