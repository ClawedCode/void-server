---
category: electronic
energy: high
tags: [pop, synth, upbeat]
---
## Chvrches (Pop Clarity)

**Tempo**: 120-130 BPM
**Key**: Minor with major moments
**Instruments**: Bright synth sequences, punchy lead, clean pads, driving drums with claps
**Structure**: Verse → Pre-chorus → Chorus → Bridge → Chorus
**Vibe**: Precision synth-pop - bright, punchy, infectious hooks with modern digital sheen without vintage nostalgia

### Key Characteristics

1. **Bright Punchy Sequences**: Fast 16th-note arpeggios with sharp attack, no swing
2. **Sharp Gliding Leads**: Fast portamento (0.02-0.05s), cutting through the mix
3. **Clean Production**: Minimal reverb, tight delays, crisp digital aesthetic
4. **Driving Beat with Claps**: Four-on-floor kick with snappy claps on 2 and 4
5. **Infectious Hooks**: Memorable melodic motifs, repetitive but evolving
6. **Major in Minor**: Bright major chords within minor key progressions

### Example Tone.js Code (90-Second Dynamic Production Sample)

**Key Techniques Demonstrated:**
- Longer sequence patterns (12-16 notes) to prevent repetition
- Random velocity humanization (±0.04-0.08)
- Multiple bass/melody/chord patterns that rotate every 4 bars
- Dynamic filter sweeps with dramatic automation
- Evolving drum patterns (quarters → 8ths → 16ths)
- Ghost notes and fills for natural groove
- Chorus effect for width and movement

```javascript
window.initToneJsEngine = async function() {
const bpm = 128; // Slightly faster for more energy
Tone.Transport.bpm.value = bpm;

// === FX BUSES ===
const masterReverb = new Tone.Reverb({ decay: 1.5, wet: 0.28 }).toDestination();
await masterReverb.generate();

const tightDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0.2 }).connect(masterReverb);
const pingPongDelay = new Tone.PingPongDelay({ delayTime: "16n", feedback: 0.35, wet: 0.18 }).connect(masterReverb);
const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.15 }).connect(masterReverb).start();

const compressor = new Tone.Compressor({ threshold: -20, ratio: 8, attack: 0.002, release: 0.08 }).toDestination();

// === DRIVING KICK WITH VARIATION ===
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 6,
  oscillator: { type: "sine" },
  envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.08 }
}).connect(compressor);

let kickStep = 0;
const kickLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
  const beat = kickStep % 16;

  // Varied kick patterns by section
  let shouldTrigger = true;

  if (bar < 2) {
    shouldTrigger = false; // Start silent
  } else if (bar >= 2 && bar < 8) {
    shouldTrigger = true; // Intro - steady
  } else if (bar >= 40 && bar < 44) {
    shouldTrigger = beat % 8 === 0; // Half-time breakdown
  } else if (bar >= 56 && bar < 60) {
    shouldTrigger = beat % 2 === 0; // Double kick ending
  }

  if (shouldTrigger) {
    const velocity = bar < 8 ? 0.7 : (bar >= 24 && bar < 40 ? 0.92 : 0.82);
    // Slight random velocity variation for humanization
    const randomVel = velocity + (Math.random() * 0.08 - 0.04);
    kick.triggerAttackRelease("C1", "8n", time, randomVel);

    // Sidechain pumping
    compressor.threshold.setValueAtTime(-28, time);
    compressor.threshold.exponentialRampToValueAtTime(-20, time + 0.12);
  }
  kickStep++;
}, "4n").start(0);

// === SNAPPY CLAPS WITH GHOST NOTES ===
const clap = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
}).connect(masterReverb);

let clapStep = 0;
const clapLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
  const beat = clapStep % 16;

  // Main claps on 2 and 4
  if (bar >= 8 && bar < 60 && (beat === 4 || beat === 12)) {
    const velocity = bar >= 24 && bar < 40 ? 0.88 : 0.72;
    clap.triggerAttackRelease("16n", time, velocity);
  }

  // Ghost notes for groove
  if (bar >= 16 && bar < 40 && (beat === 6 || beat === 14)) {
    clap.triggerAttackRelease("32n", time, 0.22);
  }

  clapStep++;
}, "4n").start(0);

// === DYNAMIC HI-HATS ===
const hihat = new Tone.MetalSynth({
  frequency: 200,
  envelope: { attack: 0.001, decay: 0.08, release: 0.04 },
  harmonicity: 5.3,
  modulationIndex: 36,
  resonance: 4400
}).toDestination();

let hihatStep = 0;
const hihatLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
  const beat = hihatStep % 32;

  if (bar >= 4 && bar < 60) {
    let shouldTrigger = false;

    // Varied patterns by section
    if (bar < 16) {
      shouldTrigger = beat % 4 === 0; // Quarter notes
    } else if (bar < 24) {
      shouldTrigger = beat % 2 === 0; // 8th notes
    } else if (bar < 40) {
      shouldTrigger = true; // 16th notes (full energy)
    } else if (bar < 48) {
      shouldTrigger = beat % 4 === 0; // Back to quarters
    } else {
      shouldTrigger = beat % 2 === 0; // 8ths
    }

    if (shouldTrigger) {
      const accentedBeat = beat % 16 === 0;
      const velocity = accentedBeat ? 0.62 : (0.32 + Math.random() * 0.12);
      hihat.triggerAttackRelease("32n", time, velocity);
    }
  }
  hihatStep++;
}, "16n").start(0);

// === EVOLVING BASS LINE ===
const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 220, Q: 1.8 }).connect(compressor);
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.006, decay: 0.2, sustain: 0.38, release: 0.15 },
  filterEnvelope: { attack: 0.008, decay: 0.18, sustain: 0.35, baseFrequency: 200, octaves: 2.4 }
}).connect(bassFilter);

// Longer, more varied bass patterns (12-16 notes each)
const bassPatterns = [
  // Pattern 1 - Simple foundation with rests and rhythm
  ["A1", "A1", null, "A1", "E1", null, "A1", "F1", "F1", null, "F1", "C1", null, "F1", "G1", null],

  // Pattern 2 - Octave jumps and melodic movement
  ["A1", "A2", "C2", "A1", "E1", "A1", "F1", "F2", "G1", "F1", "C1", "F1", "A1", "E1"],

  // Pattern 3 - Arpeggio-based with wider range
  ["A1", "C2", "E2", "A2", "E2", "C2", "A1", "E1", "F1", "A1", "C2", "F2", "C2", "A1", "F1", "C1"],

  // Pattern 4 - Syncopated rhythm with note holds
  ["A1", "A1", null, "E2", "A1", null, "C2", "A1", "F1", "F1", null, "C2", "F1", null, "G1", "F1"],

  // Pattern 5 - Higher register exploration
  ["A2", "E2", "C2", "A1", "G2", "D2", "B1", "G1", "F2", "C2", "A1", "F1", "E2", "C2", "A1", "E1"],

  // Pattern 6 - Walking bass with chromatic touches
  ["A1", "B1", "C2", "D2", "E2", "F2", "E2", "D2", "C2", "B1", "A1", "G1", "F1", "E1", "F1", "G1"],
];

let bassIndex = 0;
const bassLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  // Choose pattern based on section
  let patternIdx = 0;
  if (bar < 8) patternIdx = 0;
  else if (bar < 16) patternIdx = 1;
  else if (bar < 24) patternIdx = 2;
  else if (bar < 32) patternIdx = 3;
  else if (bar < 40) patternIdx = 4;
  else if (bar < 48) patternIdx = 1;
  else patternIdx = 0;

  const pattern = bassPatterns[patternIdx];
  const note = pattern[bassIndex % pattern.length];

  if (note && bar >= 4) {
    const velocity = bar >= 24 && bar < 40 ? 0.85 : 0.72;
    bass.triggerAttackRelease(note, "8n", time, velocity + (Math.random() * 0.06 - 0.03));
  }
  bassIndex++;
}, "8n").start(0);

// Animated bass filter
Tone.Transport.schedule((time) => {
  bassFilter.frequency.linearRampToValueAtTime(450, time + 12);
}, "16:0:0");

Tone.Transport.schedule((time) => {
  bassFilter.frequency.linearRampToValueAtTime(220, time + 8);
}, "48:0:0");

// === BRIGHT EVOLVING SEQUENCE ===
const seqFilter = new Tone.Filter({ type: "lowpass", frequency: 3500, Q: 2.0 }).connect(tightDelay);
const sequence = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.001, decay: 0.14, sustain: 0.18, release: 0.09 },
  filterEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.28, baseFrequency: 4200, octaves: 3.0 }
}).connect(seqFilter);

// Longer, more melodically developed sequence patterns (12-16 notes each)
const seqPatterns = [
  // Pattern 1 - Rising arpeggio with return
  ["A4", "C5", "E5", "A5", "C6", "E5", "A5", "C5", "E5", "C5", "A4", "E4"],

  // Pattern 2 - Melodic development with octave jumps
  ["A4", "E5", "C5", "G5", "F5", "E5", "D5", "C5", "A4", "C5", "E4", "A4", "C5", "E5"],

  // Pattern 3 - Cascading descent
  ["C6", "A5", "G5", "E5", "C5", "A4", "G4", "E4", "C5", "E5", "G5", "C6"],

  // Pattern 4 - Complex melodic phrase with turns
  ["A4", "C5", "E5", "G5", "F5", "E5", "D5", "E5", "C5", "D5", "E5", "C5", "A4", "G4", "A4", "C5"],

  // Pattern 5 - Rhythmic emphasis with repeated notes
  ["E5", "E5", "A5", "C6", "A5", "G5", "G5", "E5", "C5", "E5", "A5", "G5", "E5", "C5"],

  // Pattern 6 - Wide range exploration
  ["A3", "E4", "A4", "C5", "E5", "A5", "E5", "C5", "A4", "E4", "C5", "A4", "E4", "A3"],
];

let seqIdx = 0;
let currentSeqPattern = 0;
const seqLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  // Change pattern every 4 bars
  currentSeqPattern = Math.floor(bar / 4) % seqPatterns.length;
  const pattern = seqPatterns[currentSeqPattern];

  if (bar >= 0 && bar < 60) {
    const velocity = bar < 4 ? 0.55 : (bar >= 24 && bar < 40 ? 0.78 : 0.68);
    sequence.triggerAttackRelease(
      pattern[seqIdx % pattern.length],
      "16n",
      time,
      velocity + (Math.random() * 0.08 - 0.04)
    );
  }
  seqIdx++;
}, "16n").start(0);

// Dramatic filter sweeps
Tone.Transport.schedule((time) => {
  seqFilter.frequency.exponentialRampToValueAtTime(8000, time + 16);
}, "20:0:0");

Tone.Transport.schedule((time) => {
  seqFilter.frequency.exponentialRampToValueAtTime(1200, time + 4);
}, "40:0:0");

Tone.Transport.schedule((time) => {
  seqFilter.frequency.exponentialRampToValueAtTime(3500, time + 4);
}, "44:0:0");

// === DYNAMIC LEAD MELODY ===
const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 5000, Q: 1.2 }).connect(pingPongDelay);
const lead = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.025, decay: 0.22, sustain: 0.58, release: 0.3 },
  portamento: 0.04
}).connect(leadFilter);

const leadMelodies = [
  { notes: ["A5", "G5", "F5", "E5", "C5", "D5", "E5", null], vels: [0.82, 0.76, 0.71, 0.77, 0.72, 0.76, 0.82, 0] },
  { notes: ["A5", null, "G5", "F5", "E5", null, "C5", "E5"], vels: [0.88, 0, 0.80, 0.74, 0.82, 0, 0.70, 0.78] },
  { notes: ["C6", "A5", "G5", "F5", "E5", "D5", "C5", null], vels: [0.90, 0.85, 0.78, 0.74, 0.80, 0.76, 0.72, 0] },
];

let leadIdx = 0;
const leadLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  let melodyIdx = -1;
  if (bar >= 16 && bar < 24) melodyIdx = 0;
  else if (bar >= 28 && bar < 36) melodyIdx = 1;
  else if (bar >= 36 && bar < 44) melodyIdx = 2;

  if (melodyIdx >= 0) {
    const melody = leadMelodies[melodyIdx];
    const note = melody.notes[leadIdx % melody.notes.length];
    const velocity = melody.vels[leadIdx % melody.vels.length];

    if (note) {
      lead.triggerAttackRelease(note, "4n", time, velocity * 0.75);
    }
  }
  leadIdx++;
}, "4n").start(0);

// === EVOLVING PAD CHORDS ===
const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.4, decay: 0.25, sustain: 0.78, release: 1.4 },
  detune: 5
}).connect(chorus);

// Different chord progressions for sections
const progressions = [
  [["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C4", "E4", "G4"], ["G3", "B3", "D4"]], // Am-F-C-G
  [["A3", "C4", "E4"], ["D3", "F3", "A3"], ["G3", "B3", "D4"], ["C4", "E4", "G4"]], // Am-Dm-G-C
  [["C4", "E4", "G4"], ["G3", "B3", "D4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"]], // C-G-Am-F
];

let padIdx = 0;
const padLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  let progIdx = Math.floor(bar / 8) % progressions.length;
  const progression = progressions[progIdx];

  if (bar >= 8 && bar < 56) {
    const velocity = bar >= 24 && bar < 40 ? 0.42 : 0.32;
    pad.triggerAttackRelease(
      progression[padIdx % progression.length],
      "1m",
      time,
      velocity
    );
  }
  padIdx++;
}, "1m").start(0);

// === PERCUSSION FILLS ===
const snare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.09 }
}).connect(masterReverb);

// Snare fills at transitions
const addFill = (barTime, velocities) => {
  Tone.Transport.schedule((time) => {
    velocities.forEach((vel, i) => {
      if (vel > 0) {
        const offset = i * (60 / bpm) / 4;
        snare.triggerAttackRelease("16n", time + offset, vel);
      }
    });
  }, barTime);
};

addFill("15:2:0", [0, 0, 0.3, 0.35, 0.4, 0.45]);
addFill("23:3:0", [0, 0.32, 0.38, 0.42, 0.48]);
addFill("31:2:0", [0, 0, 0.35, 0.42, 0.48, 0.52]);
addFill("47:3:0", [0, 0.38, 0.44, 0.5]);

// === RISER EFFECTS ===
const riser = new Tone.NoiseSynth({
  noise: { type: "pink" },
  envelope: { attack: 0.2, decay: 0, sustain: 0.5, release: 0.3 }
}).connect(new Tone.Filter({ type: "highpass", frequency: 1200, Q: 2.5 }).connect(masterReverb));

riser.volume.value = -12; // Much quieter

Tone.Transport.schedule((time) => {
  riser.triggerAttackRelease(1.2, time);
}, "14:2:0");

Tone.Transport.schedule((time) => {
  riser.triggerAttackRelease(1.5, time);
}, "30:2:0");

// === STORE REFERENCES ===
window.toneJsInstruments = { kick, clap, hihat, bass, sequence, lead, pad, snare, riser };
window.toneJsParts = { kickLoop, clapLoop, hihatLoop, bassLoop, seqLoop, leadLoop, padLoop };
};
```

### Common Mistakes to Avoid

❌ **Too vintage**: Chvrches is modern digital, not retro
- Don't add analog warmth or tape saturation
- Keep sounds clean and precise
- Avoid lo-fi aesthetics or vintage chorus

❌ **Too slow**: This is energetic pop
- Keep BPM 120-130 (not 90-110)
- Use 16th-note sequences for drive
- Maintain momentum throughout

❌ **Muddy mix**: Production must be crystal clear
- Minimal reverb (1.5s decay max)
- Tight delays for space without wash
- Each element has its frequency range

❌ **Missing the hooks**: Chvrches is about memorable melodies
- Lead melodies must be singable and catchy
- Repetition with subtle variation
- Major moments create uplift

❌ **Too repetitive**: Avoid short 4-8 note loops
- Use 12-16 note patterns for sequences and bass
- Rotate through 6 different patterns every 4 bars
- Vary velocities and filter positions
- Add ghost notes and fills for natural feel

### Arrangement Tips (90-Second Structure)

For a full 90-second composition (≈60 bars at 128 BPM):

1. **Intro (0-8s, bars 0-4)**: Sequence and kick establish groove, gentle opening
2. **Verse 1 (8-19s, bars 4-10)**: Bass enters with simple pattern, hi-hats start, building foundation
3. **Pre-chorus (19-26s, bars 10-16)**: Pads swell, filter opens slightly, claps enter
4. **Chorus 1 (26-38s, bars 16-24)**: Lead melody enters, all elements present, brightness peaks
5. **Verse 2 (38-48s, bars 24-30)**: Drop lead, introduce bass variation, maintain energy
6. **Build-up (48-58s, bars 30-36)**: Add riser, increase filter cutoffs, layer complexity builds
7. **Peak/Chorus 2 (58-72s, bars 36-45)**: Maximum energy, all layers, counter-melodies
8. **Bridge (72-82s, bars 45-51)**: Strip back elements, create breathing space, fill transitions
9. **Outro (82-90s, bars 51-60)**: Reduce to opening elements, gentle wind-down, loop-friendly ending

### Advanced Composition Techniques

**Dynamic Variation:**
- Use 6 different bass patterns per section (rotate every 8 bars)
- Vary hi-hat patterns (straight 8ths → double-time 16ths → back to 8ths)
- Change sequence melodies between sections to avoid repetition (6 patterns rotating every 4 bars)
- Add velocity automation (quieter in verses, louder in choruses)

**Pattern Length:**
- Bass patterns: 12-16 notes each (vs 4-8 for repetitive sound)
- Sequence patterns: 12-16 notes each with melodic development
- Pattern rotation: Change every 4 bars to keep things fresh
- 36 total combinations (6 bass × 6 sequence) before exact repetition

**Filter Automation:**
- Start filters closed (220 Hz bass, 3500 Hz sequence)
- Open during builds (up to 450 Hz bass, 8000 Hz sequence at peak)
- Close before loop point (last 8 bars) to match opening state

**Transition Elements:**
- Snare fills (16th-note rolls) before major section changes
- Risers (filtered noise) 1-2 bars before drops
- Brief silences or breakdowns (drop kick for 1-2 bars)

**Loop-Friendly Ending:**
- Last 8 bars (bars 52-60): Return to opening instrumentation
- Reduce bass to simple pattern matching intro
- Lower filter cutoffs back to starting frequencies
- Keep only: kick, sequence, bass (simple pattern), hi-hats
- Final 4 bars should feel nearly identical to bars 0-4

### Mixing Approach

**Core Elements:**
- **Kick**: 0.70-0.92 volume (varies by section), driving the energy, sidechain compression
- **Bass**: 0.72-0.85 volume, punchy but not overwhelming, filtered
- **Sequence**: 0.55-0.78 volume, cutting through with bright filter
- **Claps**: 0.72-0.88 volume, crisp and present

**Melodic Elements:**
- **Lead**: 0.60-0.68 volume (×0.75), front and center in chorus
- **Pad**: 0.32-0.42 volume, subtle harmonic support

**Percussion:**
- **Hi-hats**: 0.32-0.62 volume, adding texture without dominating
- **Snare fills**: 0.40-0.85 volume, transition elements

**Supporting Elements:**
- **Risers**: Built-in scheduled, builds tension
- **Overall**: Clean separation, no muddy reverb, modern digital precision

### Professional Polish

**Sidechain Compression:**
```javascript
// Create dynamic pumping on kick hits
const compressor = new Tone.Compressor({ threshold: -20, ratio: 8 }).toDestination();
// In kick loop:
compressor.threshold.setValueAtTime(-28, time);
compressor.threshold.exponentialRampToValueAtTime(-20, time + 0.12);
```

**Multiple Delay Types:**
- Tight delay (8n) for sequences and bass (controlled space)
- Ping-pong delay (16n) for leads (stereo width and movement)

**Subtle Modulation:**
- Small detune on pads (5 cents) for width
- Fast portamento on leads (0.04s) for gliding
- Chorus on pads for movement

**Energy Management:**
- Sections with all layers = high energy
- Remove 2-3 elements for verses = medium energy
- Strip to kick + sequence for breaks = low energy
- Gradual transitions between energy levels

**Humanization:**
- Random velocity variation (±0.04-0.08) on all instruments
- Ghost notes on claps (quiet hits between main beats)
- Varied hi-hat velocities (0.32 base + random 0.12)
- Strategic rests (null notes) in bass patterns for groove
