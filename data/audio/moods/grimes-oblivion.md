---
category: experimental
energy: medium
tags: [art-pop, ethereal, dark]
---
## Grimes (Oblivion Ethereal)

**Tempo**: 116-124 BPM
**Key**: Major with ethereal quality (often I-IV-vi-V or I-V-vi-IV)
**Instruments**: Layered breathy vocals, bright crystalline synths, punchy sidechain bass, crisp programmed drums, shimmering arpeggios
**Structure**: Hypnotic loop → Vocal entry → Build with layers → Drop with full sidechaining → Airy breakdown → Final chorus
**Vibe**: Ethereal yet punchy, dreamy but driving, crystalline pop with electronic edge - bright, vulnerable, otherworldly femininity with aggressive production

### Key Characteristics

1. **Crystalline Synth Arpeggios**: Fast 16th-note sequences, bright and glassy, cutting through the mix
2. **Breathy Layered Vocals**: Multiple vocal harmonies (when vocals enabled), ethereal and intimate
3. **Punchy Sidechain**: Aggressive pumping on bass and pads (6-8 dB duck), creates breathing rhythm
4. **Bright Major Key**: Major progressions with dreamy quality, hopeful yet detached
5. **Programmed Drums**: Crisp digital drums with snappy snares and claps, modern pop production
6. **Shimmering Pads**: Detuned wide stereo pads with reverb, create spacious atmosphere
7. **Melodic Hooks**: Catchy, repetitive melodic phrases that stick in your head

### Example Tone.js Code (60-Second Dynamic Production Sample)

**Key Techniques Demonstrated:**
- Crystalline arpeggios with fast note patterns
- Bright major key progressions (C major - C-F-Am-G)
- Aggressive sidechain compression for pumping effect
- Layered shimmering pads with detuning and chorus
- Programmed drums with snappy snare and claps
- Loop-friendly ending that returns to opening state

```javascript
window.initToneJsEngine = async function() {
const bpm = 120;
Tone.Transport.bpm.value = bpm;

// === FX BUSES ===
const masterReverb = new Tone.Reverb({ decay: 2.2, wet: 0.35 }).toDestination();
await masterReverb.generate();

const brightDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.40, wet: 0.25 }).connect(masterReverb);
const crystalChorus = new Tone.Chorus({ frequency: 2.5, delayTime: 2.5, depth: 0.5, wet: 0.30 }).connect(masterReverb).start();

const compressor = new Tone.Compressor({ threshold: -22, ratio: 6, attack: 0.003, release: 0.15 }).toDestination();

// === CRYSTALLINE ARPEGGIO ===
const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 6000, Q: 1.2 }).connect(brightDelay);
const arp = new Tone.FMSynth({
  modulationIndex: 12,
  harmonicity: 3,
  oscillator: { type: "sine" },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.05 },
  modulation: { type: "square" },
  modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.1 }
}).connect(arpFilter);

// Bright major key arpeggio patterns (C major)
const arpPatterns = [
  ["C5", "E5", "G5", "C6", "E5", "G5", "C5", "G5"], // Simple I
  ["F5", "A5", "C6", "F6", "A5", "C6", "F5", "C6"], // IV
  ["A4", "C5", "E5", "A5", "C5", "E5", "A4", "E5"], // vi
  ["G4", "B4", "D5", "G5", "B4", "D5", "G4", "D5"]  // V
];

let arpIdx = 0;
let arpPatternIdx = 0;
const arpLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  // Rotate through patterns every 4 bars
  arpPatternIdx = Math.floor(bar / 4) % arpPatterns.length;
  const pattern = arpPatterns[arpPatternIdx];

  if (bar >= 0 && bar < 58) {
    const velocity = bar < 4 ? 0.60 : (bar >= 16 && bar < 48 ? 0.75 : 0.65);
    arp.triggerAttackRelease(
      pattern[arpIdx % pattern.length],
      "16n",
      time,
      velocity
    );
  }
  arpIdx++;
}, "16n").start(0);

// Filter automation for brightness
Tone.Transport.schedule((time) => {
  arpFilter.frequency.exponentialRampToValueAtTime(9000, time + 8);
}, "12:0:0");

Tone.Transport.schedule((time) => {
  arpFilter.frequency.exponentialRampToValueAtTime(6000, time + 4);
}, "48:0:0");

// === PUNCHY SIDECHAINED BASS ===
const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 250, Q: 1.5 }).connect(compressor);
const bass = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.15 },
  filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.3, baseFrequency: 200, octaves: 2.5 }
}).connect(bassFilter);

const bassProg = ["C2", "C2", "F2", "F2", "A1", "A1", "G2", "G2"]; // I-IV-vi-V
let bassIdx = 0;
const bassLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  if (bar >= 4 && bar < 58) {
    const velocity = bar >= 16 && bar < 48 ? 0.85 : 0.70;
    bass.triggerAttackRelease(bassProg[bassIdx % bassProg.length], "4n", time, velocity);
  }
  bassIdx++;
}, "4n").start(0);

// === DRIVING KICK (triggers sidechain) ===
const kick = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 6,
  oscillator: { type: "sine" },
  envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.05 }
}).toDestination();

let kickStep = 0;
const kickLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  if (bar >= 4 && bar < 58) {
    const velocity = bar >= 16 && bar < 48 ? 0.95 : 0.80;
    kick.triggerAttackRelease("C1", "8n", time, velocity);

    // Trigger sidechain pump
    compressor.threshold.setValueAtTime(-32, time);
    compressor.threshold.exponentialRampToValueAtTime(-22, time + 0.15);
  }
  kickStep++;
}, "4n").start(0);

// === SNAPPY SNARE/CLAP ===
const snare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.10, sustain: 0, release: 0.05 }
}).connect(masterReverb);

let snareStep = 0;
const snareLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
  const beat = snareStep % 16;

  if (bar >= 8 && bar < 58 && (beat === 4 || beat === 12)) {
    const velocity = bar >= 16 && bar < 48 ? 0.85 : 0.70;
    snare.triggerAttackRelease("16n", time, velocity);
  }
  snareStep++;
}, "4n").start(0);

// === CRISP HI-HATS ===
const hihat = new Tone.MetalSynth({
  frequency: 220,
  envelope: { attack: 0.001, decay: 0.06, release: 0.03 },
  harmonicity: 5.5,
  modulationIndex: 32,
  resonance: 4000
}).toDestination();

let hihatStep = 0;
const hihatLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
  const beat = hihatStep % 32;

  if (bar >= 8 && bar < 58) {
    const accentedBeat = beat % 8 === 0;
    const velocity = accentedBeat ? 0.55 : 0.30;
    hihat.triggerAttackRelease("32n", time, velocity);
  }
  hihatStep++;
}, "16n").start(0);

// === SHIMMERING PAD CHORDS ===
const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.8, decay: 0.3, sustain: 0.85, release: 2.0 },
  detune: 8
}).connect(crystalChorus);

const chordProg = [
  ["C4", "E4", "G4"],  // C (I)
  ["F3", "A3", "C4"],  // F (IV)
  ["A3", "C4", "E4"],  // Am (vi)
  ["G3", "B3", "D4"]   // G (V)
];

let padIdx = 0;
const padLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  if (bar >= 8 && bar < 56) {
    const velocity = bar >= 16 && bar < 48 ? 0.45 : 0.35;
    pad.triggerAttackRelease(
      chordProg[padIdx % chordProg.length],
      "1m",
      time,
      velocity
    );
  }
  padIdx++;
}, "1m").start(0);

// === MELODIC LEAD (hook) ===
const leadDelay = new Tone.PingPongDelay({ delayTime: "16n", feedback: 0.35, wet: 0.20 }).connect(masterReverb);
const lead = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.4 },
  portamento: 0.03
}).connect(leadDelay);

const leadMelody = [
  { notes: ["C5", "E5", "G5", "E5", "C5", null, "D5", "E5"], vels: [0.75, 0.70, 0.78, 0.68, 0.72, 0, 0.70, 0.75] },
  { notes: ["F5", "A5", "C6", "A5", "F5", null, "G5", "A5"], vels: [0.78, 0.73, 0.80, 0.70, 0.74, 0, 0.72, 0.76] },
];

let leadIdx = 0;
let leadMelodyIdx = 0;
const leadLoop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  if (bar >= 20 && bar < 48) {
    leadMelodyIdx = Math.floor((bar - 20) / 4) % leadMelody.length;
    const melody = leadMelody[leadMelodyIdx];
    const note = melody.notes[leadIdx % melody.notes.length];
    const velocity = melody.vels[leadIdx % melody.vels.length];

    if (note) {
      lead.triggerAttackRelease(note, "8n", time, velocity * 0.65);
    }
  }
  leadIdx++;
}, "8n").start(0);

// === SECONDARY ARPEGGIO (doubling for richness) ===
const arp2 = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.002, decay: 0.15, sustain: 0.05, release: 0.08 }
}).connect(brightDelay);

arp2.volume.value = -8; // Quieter layer

let arp2Idx = 0;
const arp2Loop = new Tone.Loop((time) => {
  const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

  if (bar >= 12 && bar < 52) {
    const patternIdx = Math.floor(bar / 4) % arpPatterns.length;
    const pattern = arpPatterns[patternIdx];
    arp2.triggerAttackRelease(pattern[arp2Idx % pattern.length], "32n", time, 0.45);
  }
  arp2Idx++;
}, "16n").start(0);

// === STORE REFERENCES ===
window.toneJsInstruments = { arp, arp2, bass, kick, snare, hihat, pad, lead };
window.toneJsParts = { arpLoop, arp2Loop, bassLoop, kickLoop, snareLoop, hihatLoop, padLoop, leadLoop };
};
```

### Common Mistakes to Avoid

❌ **Too dark**: Grimes' "Oblivion" is bright and ethereal, not moody
- Use major keys (not minor)
- Keep synths crystalline and shimmering (not warm and analog)
- Bright, hopeful quality even with aggressive production

❌ **Not enough sidechain**: The pumping is essential to the sound
- Apply 6-8 dB sidechain ducking to bass and pads
- Creates breathing, pulsing rhythm
- Aggressive but musical compression

❌ **Missing the crystalline quality**: Synths must be glassy and bright
- Use FM synthesis for bell-like tones
- High-pass filters and bright modulation
- Chorus and delay for shimmer and width

❌ **Too slow**: This is upbeat dream pop, not downtempo
- Keep BPM 116-124 (not 90-100)
- Driving 4-on-floor kick with energy
- Fast 16th-note arpeggios for momentum

❌ **Production too soft**: Needs punch despite ethereal quality
- Programmed drums should be crisp and present
- Snares/claps should snap (not muddy)
- Clear separation between ethereal pads and punchy rhythm

### Arrangement Tips (60-Second Structure)

For a full 60-second composition (≈30 bars at 120 BPM):

1. **Intro (0-8s, bars 0-4)**: Crystalline arpeggio alone, ethereal opening
2. **Build 1 (8-16s, bars 4-8)**: Kick and bass enter, drums establish groove
3. **Verse (16-24s, bars 8-12)**: Snare enters, building layers, pads swell
4. **Pre-Chorus (24-32s, bars 12-16)**: Secondary arpeggio layer, filter opens
5. **Chorus (32-48s, bars 16-24)**: Lead melody enters, full sidechain pumping, peak energy
6. **Breakdown (48-52s, bars 24-26)**: Strip to arp and pads, create space
7. **Final Build (52-56s, bars 26-28)**: Return of kick and bass, building back
8. **Outro (56-60s, bars 28-30)**: Return to opening state (arp alone), loop-friendly

### Mixing Approach

**Core Elements:**
- **Kick**: 0.80-0.95 volume, driving 4-on-floor pulse, triggers sidechain
- **Bass**: 0.70-0.85 volume, punchy but sidechained (6-8 dB duck)
- **Crystalline Arp**: 0.60-0.75 volume, bright and cutting through

**Melodic Elements:**
- **Lead**: 0.50-0.60 volume (×0.65), memorable hook in chorus
- **Pads**: 0.35-0.45 volume, sidechained, create space without dominating
- **Secondary Arp**: -8dB quieter, doubling layer for richness

**Percussion:**
- **Snare/Clap**: 0.70-0.85 volume, crisp and snappy
- **Hi-hats**: 0.30-0.55 volume, adding texture

### Advanced Production Techniques

**Sidechain Compression:**
```javascript
// Create pumping on every kick hit
const compressor = new Tone.Compressor({ threshold: -22, ratio: 6 }).toDestination();
// In kick loop:
compressor.threshold.setValueAtTime(-32, time);
compressor.threshold.exponentialRampToValueAtTime(-22, time + 0.15);
```

**Crystalline Synthesis:**
- FM synthesis with high modulation index (12+) for bell tones
- Bright filter frequencies (6000-9000 Hz)
- Fast attack/decay envelopes for percussive quality

**Stereo Width:**
- Chorus on pads (wet: 0.30) for width and movement
- Ping-pong delay on leads for stereo bounce
- Detuned pads (8 cents) for natural width

**Ethereal Space:**
- Long reverb (2.2s decay) with moderate wet (0.35)
- Bright delays (8n timing) for rhythmic space
- Layer multiple arpeggio parts (main + quieter double)

**Loop-Friendly Design:**
- Last 4 bars (bars 28-30): Return to opening arpeggio only
- Remove drums, bass, pads in final bars
- Match opening energy and instrumentation
- Smooth transition back to bar 0

### Harmonic and Melodic Direction

**Chord Progressions:**
- I-IV-vi-V (C-F-Am-G) - Bright and hopeful
- I-V-vi-IV (C-G-Am-F) - Alternative pop progression
- Stay in major key for ethereal brightness

**Melodic Characteristics:**
- Simple, catchy phrases that repeat
- Stepwise motion with occasional leaps
- Use upper register (octave 5-6) for crystalline quality
- Portamento on leads (0.03s) for smooth gliding

**Arpeggio Patterns:**
- Fast 16th notes in upper registers
- Triadic patterns (root-third-fifth-octave)
- Rotate through chord tones each bar
- Maintain perpetual motion for hypnotic quality
