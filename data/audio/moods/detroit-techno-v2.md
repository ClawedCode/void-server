---
category: electronic
energy: high
tags: [techno, driving, futuristic]
---
## Detroit Techno V2 (Classic Minimalist)

**Tempo**: 80-92 BPM
**Key**: Minor (A minor)
**Instruments**: Sub bass, pulsing arp (bitcrushed), detuned pad, metallic hats, membrane kick
**Structure**: Filtered intro → Progressive build → Full drop → Breakdown → Final drop
**Vibe**: Classic Detroit techno - minimalist, hypnotic, mechanical precision with subtle warmth, sidechain ducking, progressive filter sweeps

### Key Characteristics

1. **Sidechain Ducking**: Kick triggers gain reduction on music bus for pumping effect
2. **Progressive Filter Sweeps**: Arpeggio opens from 400Hz to 5200Hz over arrangement
3. **Bitcrushed Arp**: Pulse wave arp with bitcrusher for lo-fi grit
4. **Saturated Bass**: Sawtooth sub bass with saturation for warmth
5. **Metallic Hats**: MetalSynth for authentic techno hat character
6. **Noise Swells**: Pink noise risers for transitions

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 86;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [4, 4];

  // === BUSES & DUCKING ===
  const master = new Tone.Gain(1).toDestination();
  const duckBus = new Tone.Gain(1).connect(master);
  const musicBus = new Tone.Gain(1).connect(duckBus);

  // Sidechain emulation: dip duckBus on each kick
  function triggerDuck() {
    const now = Tone.now();
    duckBus.gain.cancelAndHoldAtTime(now);
    duckBus.gain.setTargetAtTime(0.6, now, 0.005);   // fast down
    duckBus.gain.setTargetAtTime(1.0, now + 0.12, 0.05); // recover
  }

  // === FX ===
  const bassSaturator = new Tone.Distortion({ distortion: 0.35, wet: 0.35 }).connect(musicBus);
  const arpCrusher = new Tone.BitCrusher({ bits: 6, wet: 0.25 }).connect(musicBus);
  const plate = new Tone.Reverb({ decay: 1.1, wet: 0.25, preDelay: 0.01 }).connect(musicBus);
  await plate.generate();

  // === KICK (bypasses ducking) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0.0, release: 0.03 }
  }).connect(master);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      triggerDuck();
    }
  }, "4n");

  // === SUB BASS (saturated saw) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { type: "lowpass", frequency: 160, rolloff: -24 },
    filterEnvelope: { attack: 0.002, decay: 0.12, sustain: 0.0, release: 0.05, baseFrequency: 80, octaves: 2 },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.0, release: 0.05 }
  }).connect(bassSaturator);

  const bassPattern = ["A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8) {
      bass.triggerAttackRelease(bassPattern[bassIdx % bassPattern.length], "8n", time, 0.9);
      bassIdx++;
    }
  }, "8n");

  // === ARP (pulse + bitcrush) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 400, rolloff: -24 }).connect(arpCrusher);
  const arp = new Tone.Synth({
    oscillator: { type: "pulse", width: 0.25 },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.0, release: 0.04 }
  }).connect(arpFilter);

  const arpNotes = ["A3","C4","E4","A4","G4","E4","C4","A3",
                    "A3","D4","F4","A4","F4","D4","C4","A3"];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    arp.set({ detune: (Math.random() * 8 - 4) }); // tiny drift
    arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], "16n", time, 0.8);
    arpIdx++;
  }, "16n");

  // === PAD (detuned dual-voice via Chorus) ===
  const padHPF = new Tone.Filter({ type: "highpass", frequency: 180, rolloff: -12 }).connect(musicBus);
  const padChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 3.5, depth: 0.6, wet: 0.3 }).connect(padHPF).start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: 6,
    envelope: { attack: 0.6, decay: 0.3, sustain: 0.6, release: 1.2 }
  }).connect(padChorus);

  const padChords = [
    ["A3","E4","A4"], // i
    ["F3","C4","F4"], // VI
    ["G3","D4","G4"], // VII
    ["A3","E4","A4"], // i
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, 0.5);
    padIdx++;
  }, "2m");

  // === HATS (metallic) ===
  const hat = new Tone.MetalSynth({
    frequency: 350,
    envelope: { attack: 0.001, decay: 0.12, release: 0.03 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000
  }).connect(plate);

  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 12 && hatStep % 2 === 1) {
      hat.triggerAttackRelease("16n", time, 0.5);
    }
    hatStep++;
  }, "8n");

  // === NOISE (risers) ===
  const noise = new Tone.Noise("pink").start();
  const noiseEnv = new Tone.AmplitudeEnvelope({
    attack: 0.4, decay: 0.2, sustain: 0.0, release: 0.6
  }).connect(plate);
  const noiseHPF = new Tone.Filter({ type: "highpass", frequency: 500 }).connect(noiseEnv);
  noise.connect(noiseHPF);

  // === ARRANGEMENT AUTOMATION ===
  function scheduleArrangement() {
    // 0-8 bars: Intro (pad + filtered arp, no drums)
    padLoop.start("0:0");
    arpLoop.start("0:0");
    arpFilter.frequency.value = 400; // closed

    // 7-8 bars: Noise swell
    Tone.Transport.schedule((time) => {
      noiseEnv.triggerAttackRelease(1.5, time);
    }, "7:0:0");

    // 8-16 bars: Kick + bass enter
    bassLoop.start("8:0");
    kickLoop.start("8:0");

    // 12-16 bars: Hats enter
    hatLoop.start("12:0");

    // 16-24 bars: Open arp filter
    Tone.Transport.schedule((time) => {
      arpFilter.frequency.linearRampToValueAtTime(2200, time + Tone.Time("8m").toSeconds());
    }, "16:0:0");

    // 24-32 bars: Full open
    Tone.Transport.schedule((time) => {
      arpFilter.frequency.linearRampToValueAtTime(4800, time + Tone.Time("4m").toSeconds());
    }, "24:0:0");

    // 32-40 bars: Breakdown (kill kick, close filters)
    kickLoop.stop("32:0");
    hatLoop.stop("32:0");
    Tone.Transport.schedule((time) => {
      bass.filter.frequency.setValueAtTime(100, time);
      arpFilter.frequency.linearRampToValueAtTime(800, time + Tone.Time("2m").toSeconds());
    }, "32:0:0");

    // 31:3:2: Noise swell before drop
    Tone.Transport.schedule((time) => {
      noiseEnv.triggerAttackRelease(1.2, time);
    }, "31:3:2");

    // 40-48 bars: Drop back in (brighter)
    kickLoop.start("40:0");
    hatLoop.start("40:0");
    Tone.Transport.schedule((time) => {
      bass.filter.frequency.setValueAtTime(160, time);
      arpFilter.frequency.linearRampToValueAtTime(5200, time + Tone.Time("4m").toSeconds());
    }, "40:0:0");

    // 48-56 bars: Final section with outro noise
    Tone.Transport.schedule((time) => {
      noiseEnv.triggerAttackRelease(1.0, time);
    }, "55:2:0");
  }

  scheduleArrangement();

  // === START ===
  Tone.Transport.start();

  return {
    stop: () => {
      Tone.Transport.stop();
      padLoop.stop();
      arpLoop.stop();
      bassLoop.stop();
      kickLoop.stop();
      hatLoop.stop();
      noise.stop();
    }
  };
};
```

### Common Mistakes

- Too complex arrangement - Detroit techno is about minimalism and hypnotic repetition
- No sidechain ducking - pumping effect is essential for techno groove
- Static filters - progressive filter sweeps create tension and release
- Missing bitcrush on arp - lo-fi grit is part of classic Detroit sound
- Weak bass - needs saturation/distortion for warmth and power

### Arrangement Tips

- **Intro (0-8 bars)**: Pad + heavily filtered arp ghost, establish mood
- **Build (8-16 bars)**: Kick + bass enter, foundation locked in
- **Drop (16-24 bars)**: Open arp filter progressively, hats added
- **Peak (24-32 bars)**: Full frequency range, maximum energy
- **Breakdown (32-40 bars)**: Strip to essentials, close filters, build tension
- **Final Drop (40-48 bars)**: Return with even brighter filter sweep
- **Outro (48-56 bars)**: Maintain energy, noise swell for closure

### Mixing Approach

- Kick: 1.0 gain, bypass ducking (direct to master)
- Bass: 0.9 gain, saturation for warmth
- Arp: 0.8 gain, bitcrush + filter automation
- Pad: 0.5 gain, chorus + HPF for space
- Hats: 0.5 gain, plate reverb for depth
- Noise: Envelope-controlled, HPF at 500Hz for risers only
- Sidechain: Duck to 0.6 gain, 5ms attack, 50ms release
