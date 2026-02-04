---
category: cinematic
energy: high
tags: [electronic, epic, futuristic]
---
## Daft Punk (Tron Legacy)

**Tempo**: 100-120 BPM
**Key**: Minor (cinematic, epic progressions)
**Instruments**: Layered filtered arpeggios, cinematic strings, heavy sidechain bass, dramatic lead sequences, orchestral drums
**Structure**: Filtered intro → Arpeggio build → Epic drop with strings → Breakdown → Massive finale
**Vibe**: Cinematic, futuristic, epic - like the Tron: Legacy soundtrack (Encom II, The Grid, Derezzed). Combines electronic precision with orchestral grandeur. Heavy filter automation, layered arpeggios, dramatic dynamics, sidechain pumping.

### Key Characteristics

1. **Filter Automation**: Aggressive filter sweeps (start low, open to high)
2. **Layered Arpeggios**: Multiple arp patterns at different octaves
3. **Orchestral Elements**: Use strings for dramatic swells
4. **Heavy Sidechain**: Bass ducks heavily on kick (8-10 dB)
5. **Cinematic Dynamics**: Dramatic volume changes between sections
6. **Precise Timing**: No swing - robotic precision (swing: 0)

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 112;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - precise, robotic timing

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 1.8, wet: 0.25 }).toDestination();
  await masterReverb.generate();

  // Sidechain compressor for pumping effect
  const compressor = new Tone.Compressor({
    threshold: -25,
    ratio: 12,
    attack: 0.003,
    release: 0.15
  }).connect(masterReverb);

  // === LAYERED ARPEGGIOS (filtered, automated) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 300, Q: 1.2 }).connect(compressor);
  const arp = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.08 }
  }).connect(arpFilter);

  // Filter automation: 300Hz → 3000Hz over build section
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(2000, time + 4 * (60 / bpm) * 4);
  }, "0:0:0"); // Start immediately

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(3000, time + 6 * (60 / bpm) * 4);
  }, "4:0:0"); // Bar 4 (build section)

  // Dm → Bb → F → C (i-VI-III-VII) arpeggios
  const arpPattern = [
    ["D4", "F4", "A4", "D5"], // Dm
    ["Bb3", "D4", "F4", "Bb4"], // Bb
    ["F3", "A3", "C4", "F4"], // F
    ["C4", "E4", "G4", "C5"]  // C
  ];
  let arpChordIdx = 0;
  let arpNoteIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.30 : 0.50; // Quieter in intro

    const chord = arpPattern[arpChordIdx % arpPattern.length];
    const note = chord[arpNoteIdx % chord.length];
    arp.triggerAttackRelease(note, "16n", time, velocity);

    arpNoteIdx++;
    if (arpNoteIdx % 8 === 0) arpChordIdx++; // Change chord every 8 notes
  }, "16n").start(0);

  // === CINEMATIC STRINGS (orchestral swells) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.6, decay: 0.4, sustain: 0.90, release: 2.5 }
  }).connect(compressor);

  const stringChords = [
    ["D3", "F3", "A3", "D4"], // Dm
    ["Bb2", "D3", "F3", "Bb3"], // Bb
    ["F3", "A3", "C4", "F4"], // F
    ["C3", "E3", "G3", "C4"]  // C
  ];
  let stringChordIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) { // Start in build section
      const velocity = bar >= 10 ? 0.75 : 0.40; // Louder in drop
      strings.triggerAttackRelease(stringChords[stringChordIdx % stringChords.length], "1m", time, velocity);
      stringChordIdx++;
    }
  }, "1m").start(0);

  // === HEAVY BASS (sidechained, filtered) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 250, Q: 0.9 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.10 },
    filterEnvelope: { attack: 0.01, decay: 0.10, sustain: 0, baseFrequency: 100, octaves: 2 }
  }).connect(bassFilter);

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10) { // Start in drop section
      bass.triggerAttackRelease("D1", "8n", time, 0.75);
    }
  }, "8n").start(0);

  // === SUB BASS (sine wave, massive) ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.15 }
  }).connect(compressor);

  const subBassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10) {
      const velocity = bar >= 20 ? 0.85 : 0.65; // Even louder in finale
      subBass.triggerAttackRelease("D0", "8n", time, velocity);
    }
  }, "8n").start(0);

  // === KICK (4-on-floor, triggers sidechain) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.03 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) { // Start in build
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      // Trigger sidechain pump
      compressor.threshold.setValueAtTime(-35, time);
      compressor.threshold.exponentialRampToValueAtTime(-25, time + 0.15);
    }
  }, "4n").start(0);

  // === SNARE (2 and 4, gated reverb) ===
  const snareReverb = new Tone.Reverb({ decay: 0.8, wet: 0.6 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && snareStep % 2 === 1) { // On beats 2 and 4
      snare.triggerAttackRelease("16n", time, 0.85);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS (16th notes, precise) ===
  const hat = new Tone.MetalSynth({
    frequency: 350,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 5.0,
    modulationIndex: 28,
    resonance: 3800
  }).connect(masterReverb);

  const hatVelocities = [0.7, 0.4, 0.6, 0.35, 0.7, 0.4, 0.6, 0.35];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("16n", time, vel * 0.55);
      hatStep++;
    }
  }, "16n").start(0);

  // === DRAMATIC LEAD (finale section only) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.35, wet: 0.30 }).toDestination();
  const lead = new Tone.MonoSynth({
    oscillator: { type: "square" },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.15 },
    portamento: 0.05
  }).connect(leadDelay);

  const leadMelody = ["D4", "F4", "G4", "A4", "G4", "F4", "D4"];
  const leadVelocities = [0.80, 0.85, 0.90, 0.95, 0.90, 0.85, 0.80];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 20) { // Finale section only
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "4n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.75
      );
      leadIdx++;
    }
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { arp, strings, bass, subBass, kick, snare, hat, lead };
  window.toneJsParts = { arpLoop, stringsLoop, bassLoop, subBassLoop, kickLoop, snareLoop, hatLoop, leadLoop };
};
```

### Common Mistakes to Avoid

❌ **Not enough filter automation**: Tron Legacy is ALL about filter sweeps
- Use automation blocks for intro/build sections
- Start with low cutoffs (300-500 Hz), sweep to high (2000-3000 Hz)
- Use exponential curves for dramatic opening

❌ **Missing orchestral elements**: Strings are essential for cinematic feel
- Enable strings in build/drop sections
- Use long attack/release (0.6s attack, 2.5s release)
- Layer with electronic elements, don't replace them

❌ **Weak sidechain**: Tron has aggressive pumping
- Set sidechain_duck_db to 8-10 (not 3-4)
- Apply to bass and pads
- Creates rhythmic breathing effect

❌ **Too much swing**: Tron is precise and robotic
- Set swing to 0 (not 0.15-0.20)
- Mechanical perfection is the aesthetic

### Arrangement Tips

1. **Intro (4 bars)**: Filtered arps only, low volume, building tension
2. **Build (6 bars)**: Add strings at low volume, filter opening, drums enter
3. **Drop (6 bars)**: Full instrumentation, strings at peak, heavy sidechain
4. **Breakdown (4 bars)**: Strip to pads and minimal bass, reset tension
5. **Finale (6 bars)**: All instruments, lead melody, maximum intensity

### Mixing Approach

- **Arps**: 0.45-0.55 volume, heavily filtered and automated
- **Strings**: 0.65-0.75 volume in drop, create orchestral wall
- **Bass**: 0.70-0.80 volume, 10dB sidechain duck for pumping
- **Lead**: 0.70-0.80 volume, only in finale for dramatic impact
- **Drums**: 0.90-1.0 volume, precise and punchy
