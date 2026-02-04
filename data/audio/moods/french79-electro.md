---
category: electronic
energy: high
tags: [french, electro, groovy]
---
## French79 (French Touch Electro)

**Tempo**: 110-120 BPM
**Key**: Minor or major (uplifting progressions)
**Instruments**: Tight grooved bassline, bright filtered arpeggios, vintage synth leads, funky drums with swing, warm pads for atmosphere
**Structure**: Filtered intro → Groove establish → Filter opening → Full drop → Breakdown → Final build
**Vibe**: Funky, nostalgic, forward-moving like cruising down a French highway in the 80s - tight grooves, vintage warmth, sense of optimism and motion, influenced by Daft Punk and Air

### Key Characteristics

1. **Funky Swing** (0.15-0.20): Creates groovy, forward-moving feel
2. **Filter Automation**: Opening sweeps during intro/build sections
3. **Bright Arpeggios**: Filtered saw wave patterns, upbeat character
4. **Tight Bass**: Grooved bassline with slight sidechain for punch
5. **Vintage Warmth**: Chorus and subtle detuning for French Touch analog feel
6. **Driving 4-on-Floor**: Steady kick with funky drum patterns

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 115;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.18; // Funky groove

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 1.6, wet: 0.20 }).toDestination();
  await masterReverb.generate();

  const chorus = new Tone.Chorus({ frequency: 1.2, depth: 0.70, wet: 0.55 }).toDestination().start();

  // === BRIGHT FILTERED ARPEGGIO ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 400, Q: 0.8 }).connect(chorus);
  const arp = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(arpFilter);

  // Filter automation: 400Hz → 1800Hz over intro
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(1800, time + 4 * (60 / bpm) * 4);
  }, "0:0:0");

  // Am → F → Dm → E (i-VI-iv-V) arpeggios
  const arpPattern = [
    ["A4", "C5", "E5", "A5"], // Am
    ["F4", "A4", "C5", "F5"], // F
    ["D4", "F4", "A4", "D5"], // Dm
    ["E4", "G#4", "B4", "E5"]  // E
  ];
  let arpChordIdx = 0;
  let arpNoteIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.35 : 0.55;

    const chord = arpPattern[arpChordIdx % arpPattern.length];
    const note = chord[arpNoteIdx % chord.length];
    arp.triggerAttackRelease(note, "16n", time, velocity);

    arpNoteIdx++;
    if (arpNoteIdx % 8 === 0) arpChordIdx++;
  }, "16n").start(0);

  // === TIGHT GROOVED BASS ===
  const compressor = new Tone.Compressor({
    threshold: -28,
    ratio: 8,
    attack: 0.003,
    release: 0.18
  }).connect(masterReverb);

  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 280, Q: 1.0 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.10 },
    filterEnvelope: { attack: 0.01, decay: 0.12, sustain: 0, baseFrequency: 200, octaves: 2.5 }
  }).connect(bassFilter);

  const bassPattern = ["A1", "A1", null, "A1", "C2", "A1", null, "D2"];
  const bassVelocities = [0.85, 0.70, 0, 0.80, 0.90, 0.75, 0, 0.85];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bassPattern[bassIdx % bassPattern.length]) {
      bass.triggerAttackRelease(
        bassPattern[bassIdx % bassPattern.length],
        "8n",
        time,
        bassVelocities[bassIdx % bassVelocities.length] * 0.75
      );
    }
    bassIdx++;
  }, "8n").start(0);

  // === VINTAGE SQUARE LEAD ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.25, wet: 0.25 }).connect(masterReverb);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.005, decay: 0.18, sustain: 0, release: 0.12 },
    detune: -8 // Vintage warmth
  }).connect(leadDelay);

  const leadMelody = ["A4", "C5", "D5", "C5", "A4", null, "G4", "A4"];
  const leadVelocities = [0.75, 0.80, 0.85, 0.80, 0.75, 0, 0.70, 0.75];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10 && leadMelody[leadIdx % leadMelody.length]) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "4n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.70
      );
    }
    leadIdx++;
  }, "4n").start(0);

  // === WARM PAD ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.6, decay: 0.3, sustain: 0.70, release: 1.5 }
  }).connect(chorus);

  const padChords = [
    ["A3", "C4", "E4"], // Am
    ["F3", "A3", "C4"], // F
    ["D3", "F3", "A3"], // Dm
    ["E3", "G#3", "B3"]  // E
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, 0.25);
    padIdx++;
  }, "1m").start(0);

  // === 4-ON-FLOOR KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      kick.triggerAttackRelease("C1", "8n", time, 0.95);
      // Trigger sidechain pump
      compressor.threshold.setValueAtTime(-38, time);
      compressor.threshold.exponentialRampToValueAtTime(-28, time + 0.18);
    }
  }, "4n").start(0);

  // === FUNKY SNARE (variable velocities) ===
  const snareReverb = new Tone.Reverb({ decay: 0.7, wet: 0.40 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.10, sustain: 0 }
  }).connect(snareReverb);

  const snareVelocities = [0.30, 0.90, 0.25, 0.95];
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && snareStep % 2 === 1) {
      const vel = snareVelocities[snareStep % snareVelocities.length];
      snare.triggerAttackRelease("16n", time, vel * 0.85);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS (16th notes with groove) ===
  const hat = new Tone.MetalSynth({
    frequency: 340,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 4.8,
    modulationIndex: 26,
    resonance: 3500
  }).connect(masterReverb);

  const hatVelocities = [0.7, 0.4, 0.6, 0.35, 0.7, 0.4, 0.6, 0.35];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("16n", time, vel * 0.50);
      hatStep++;
    }
  }, "16n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { arp, bass, lead, pad, kick, snare, hat };
  window.toneJsParts = { arpLoop, bassLoop, leadLoop, padLoop, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Too aggressive/dark**: French Touch is uplifting, not menacing
- Use major or minor with uplifting progressions
- Keep filter sweeps bright (open to 1500-2000 Hz)
- Avoid heavy distortion or harsh timbres

❌ **Missing the groove**: Swing is essential
- Set swing to 0.15-0.20 for funky feel
- Use varied velocities on drums for human touch
- Tight but not robotic

❌ **Overcomplicating arrangement**: Less is more
- Focus on groove and filter automation
- Simple melodic elements
- Let the bass and arp drive the track

❌ **Too clean**: Needs vintage warmth
- Add chorus for analog feel
- Subtle detuning on synths
- Warm, mid-heavy mix

### Arrangement Tips

1. **Intro (4 bars)**: Filtered arp only, sweeping from low to bright
2. **Groove (6 bars)**: Add bass and drums, establish driving rhythm
3. **Drop (6 bars)**: Full instrumentation, lead enters, peak energy
4. **Breakdown (4 bars)**: Strip to pads and minimal elements, reset tension
5. **Finale (6 bars)**: Return to full groove, all elements

### Mixing Approach

- **Arp**: 0.35-0.55 volume, filter automation creates movement
- **Bass**: 0.70-0.80 volume, tight and groovy with 5dB sidechain
- **Lead**: 0.65-0.75 volume, only in drop/finale sections
- **Pad**: 0.20-0.30 volume, warm atmospheric layer
- **Drums**: 0.85-0.95 volume, funky velocities, driving 4-on-floor
