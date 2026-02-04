---
category: synthwave
energy: low
tags: [noir, dreamy, dark]
---
## Chromatics (Cherry Noir)

**Tempo**: 112-118 BPM (straight 4-on-the-floor)
**Key**: Minor with wistful major lifts (F# minor/D major palette)
**Instruments**: 909 kick/hat/clap, rubbery analog bass, Juno-style detuned pads, string swells, shimmering arps, chorus-drenched leads, tape-smeared reverb/delay
**Structure**: Pad/arp curtain rise → Kick pumps in → Clap/hat add gloss → Lead hook answers arp → Late-night dissolve
**Vibe**: Neon freeway at midnight, bittersweet romance, Italo-disco pulse wrapped in noir melancholy, the ache and lift of 'Cherry'

### Key Characteristics

1. **Motorik Pulse**: Unbroken 4-on-the-floor with sidechain pump
2. **Arp + Pad Bed**: Shimmering 8th-note arp over warm Juno pads
3. **Breathy Space**: Plate reverb + tape delay, long tails without washing out groove
4. **Chorus Detune**: Slightly wobbly analog width on pads and lead
5. **String Lift**: Quiet string layer rising in choruses for cinematic ache
6. **Minimal Harmonic Motion**: Cycling i-VI-III-VII (F#m → D → A → E) with patient repetition

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 116;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.08; // Subtle human feel

  // === FX BUSES ===
  const plate = new Tone.Reverb({ decay: 4.5, wet: 0.38 }).toDestination();
  await plate.generate();
  const tapeDelay = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.42, wet: 0.28 }).connect(plate);
  const chorus = new Tone.Chorus({ frequency: 0.8, depth: 0.55, delayTime: 2.8, wet: 0.45 }).connect(tapeDelay).start();

  // === SIDECHAIN BUS (gentle pump) ===
  const pumpBus = new Tone.Gain(1).connect(plate);
  const pump = new Tone.LFO('4n', 0.55, 1).start();
  pump.connect(pumpBus.gain);

  // === DEEP BASS (hypnotic groove) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { type: 'lowpass', frequency: 220, Q: 0.8 },
    envelope: { attack: 0.015, decay: 0.2, sustain: 0.65, release: 0.3 }
  }).connect(pumpBus);
  bass.volume.value = -7;

  // F#m progression: F# → D → A → E (i-VI-III-VII)
  const bassPattern = ['F#2', 'F#2', 'D2', 'D2', 'A1', 'A1', 'E2', 'E2'];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const velocity = 0.82;
    bass.triggerAttackRelease(bassPattern[bassIdx % bassPattern.length], '8n', time, velocity);
    bassIdx++;
  }, '8n');

  // === Juno PAD (warm bed) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.9, release: 3.5 }
  }).connect(chorus);
  pad.volume.value = -16;

  const padChords = [
    ['F#3', 'A3', 'C#4', 'F#4'], // F#m
    ['D3', 'F#3', 'A3', 'D4'],   // D
    ['A2', 'E3', 'A3', 'C#4'],   // A
    ['E3', 'G#3', 'B3', 'E4']    // E
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.35 : 0.55;
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], '1m', time, velocity);
    padIdx++;
  }, '1m');

  // === ARP (shimmer bed) ===
  const arp = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    filter: { type: 'lowpass', frequency: 1800, Q: 1.0 },
    envelope: { attack: 0.005, decay: 0.16, sustain: 0.4, release: 0.2 }
  }).connect(tapeDelay);
  arp.volume.value = -14;

  const arpNotes = ['C#5', 'B4', 'A4', 'F#4', 'A4', 'B4', 'C#5', 'E5'];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      const vel = 0.32 + (Math.random() * 0.06);
      arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], '8n', time, vel);
      arpIdx++;
    }
  }, '8n');

  // === LEAD (chorus-drenched hook) ===
  const lead = new Tone.MonoSynth({
    oscillator: { type: 'square' },
    filter: { type: 'lowpass', frequency: 1600, Q: 0.9 },
    envelope: { attack: 0.06, decay: 0.24, sustain: 0.62, release: 0.75 }
  }).connect(chorus);
  lead.volume.value = -11;

  const leadMelody = [
    'C#5', 'B4', 'A4', 'F#4', 'E4', null, 'A4', 'B4',
    'C#5', null, 'B4', 'A4', 'F#4', 'E4', null, 'D4'
  ];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8) { // Lead waits until after groove forms
      const velocity = 0.68;
      const note = leadMelody[leadIdx % leadMelody.length];
      if (note) {
        lead.triggerAttackRelease(note, '4n', time, velocity);
      }
      leadIdx++;
    }
  }, '4n');

  // === STEADY PULSE (minimal drums) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.22 }
  }).connect(pumpBus);
  kick.volume.value = -6;

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) { // Kick enters after pad/arp bed
      kick.triggerAttackRelease('C1', '8n', time, 0.95);
    }
  }, '4n');

  const clapFilter = new Tone.Filter({ type: 'highpass', frequency: 1500 }).connect(plate);
  const clap = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(clapFilter);
  clap.volume.value = -14;

  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      clap.triggerAttackRelease('16n', time, 0.65);
    }
  }, '2n');

  const hat = new Tone.MetalSynth({
    frequency: 8500,
    envelope: { attack: 0.001, decay: 0.12, release: 0.04 },
    harmonicity: 8,
    modulationIndex: 12,
    resonance: 7000
  }).toDestination();
  hat.volume.value = -18;

  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6) {
      hat.triggerAttackRelease('16n', time, 0.38);
    }
  }, '8n');

  // === STRING LIFT (late gloss) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 1.6, decay: 0.7, sustain: 0.85, release: 3.8 }
  }).connect(plate);
  strings.volume.value = -20;

  const stringChords = padChords;
  let stringIdx = 0;
  const stringLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 12) {
      strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], '2m', time, 0.35);
      stringIdx++;
    }
  }, '2m');

  // === START ===
  bassLoop.start(0);
  padLoop.start(0);
  arpLoop.start(0);
  leadLoop.start(0);
  kickLoop.start(0);
  snareLoop.start(0);
  hatLoop.start(0);
  stringLoop.start(0);

  Tone.Transport.start();

  return {
    stop: () => {
      Tone.Transport.stop();
      bassLoop.stop();
      padLoop.stop();
      arpLoop.stop();
      leadLoop.stop();
      kickLoop.stop();
      snareLoop.stop();
      hatLoop.stop();
      stringLoop.stop();
    }
  };
};
```

### Common Mistakes
- Losing the pulse: keep unwavering 4-on-the-floor; avoid syncopated kicks
- Dry mix: Cherry lives in plate reverb + tape delay; keep tails but maintain clarity
- Over-harmony: stay on i-VI-III-VII; avoid busy chord changes
- Too much brightness: use filters/chorus to keep edges soft and analog
- Overcrowding: let arp/pad breathe; lead enters late so the groove can hypnotize

### Arrangement Tips
- **Intro (4 bars)**: Pad + bass, no drums
- **Groove (4 bars)**: Kick joins; arp starts shimmering
- **Verse (8 bars)**: Clap on 2/4, hats layer in; keep vocals space if needed
- **Chorus (8 bars)**: Lead hook + string lift; subtle pump feels strongest here
- **Outro (4 bars)**: Drop drums, ride pad/arp into tape-delay tail

### Mixing Approach
- Bass: -7dB, sidechain with kick for gentle pump
- Pad: -16dB, chorus into plate; keep mid-heavy warmth
- Arp: -14dB, filtered triangle with tape delay for shimmer
- Lead: -11dB, chorus + plate; leave pre-delay for breathiness
- Drums: Kick -6dB, clap -14dB, hats -18dB; avoid harsh transients
- Strings: -20dB lift only in later sections to avoid mud
