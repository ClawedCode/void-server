---
category: experimental
energy: adaptive
tags: [adaptive, ai, contextual]
---
## Content-Aware Composition (Default/Auto)

**Default mood when no specific style is selected** - Generate music that genuinely reflects the emotional and thematic content through interpretive composition.

**CRITICAL**: Content-aware mode means the music should FEEL like the content. A post about loneliness should sound lonely. A post about cosmic wonder should sound vast and mysterious. A post about digital chaos should sound glitchy and unstable. If your composition could work for any random post, you've failed content-aware mode.

### Content Analysis Framework

Before composing, analyze the content and classify it into one of these mood archetypes:

| Archetype | Keywords/Themes | BPM Range | Density | Filter Range | Reverb |
|-----------|-----------------|-----------|---------|--------------|--------|
| **Melancholic/Lonely** | loneliness, ache, loss, absence, yearning, solitude | 55-75 | Minimal (2-3 instruments) | 200-600 Hz | Heavy (3.5-5.0 decay) |
| **Mysterious/Liminal** | void, backrooms, threshold, between, liminal, unknown | 60-80 | Sparse (3-4 instruments) | 400-1000 Hz | Heavy (3.0-4.5 decay) |
| **Contemplative/Philosophical** | consciousness, meaning, existence, recursive, meta | 65-85 | Moderate (3-5 instruments) | 500-1200 Hz | Medium (2.0-3.5 decay) |
| **Cosmic/Vast** | infinite, stars, cosmos, dimension, scale, universe | 70-90 | Layered (4-6 instruments) | 600-2000 Hz | Heavy (3.5-5.0 decay) |
| **Glitchy/Digital** | corruption, data, error, pixel, fragment, broken | 80-110 | Variable (3-5 instruments) | Modulating | Short bursts (1.0-2.0) |
| **Ethereal/Dreamy** | dream, float, drift, soft, gentle, cloud | 60-80 | Sparse (3-4 instruments) | 800-2000 Hz | Very heavy (4.0-6.0 decay) |
| **Tense/Urgent** | warning, danger, edge, critical, alert | 90-120 | Full (5-7 instruments) | 1000-4000 Hz | Short (0.8-1.5 decay) |
| **Playful/Whimsical** | curious, mischief, explore, wonder, play | 90-120 | Bouncy (4-6 instruments) | 1500-4000 Hz | Medium (1.5-2.5 decay) |

### Density Guidelines

**Minimal (2-3 instruments)**: For empty, lonely, sparse content
- Pad OR bass (not both prominent)
- Optional sparse percussion
- Maximum one melodic element
- LOTS of silence between notes

**Sparse (3-4 instruments)**: For contemplative, mysterious content
- Pad + bass (one dominant)
- Minimal percussion (kick only, sparse)
- One melodic element (slow, infrequent)

**Moderate (4-5 instruments)**: For philosophical, cosmic content
- Pad + bass + one melodic
- Light percussion (kick + occasional hat)
- Subtle textural elements

**Full (5-7 instruments)**: For energetic, urgent, chaotic content
- Full rhythm section
- Multiple melodic elements
- Textural layers
- Active percussion

### Specific Musical Translations

**Loneliness/Ache** →
- BPM: 55-70 (slow, dragging)
- Single pad with long attack (1.0-1.5s), heavy chorus
- Minimal bass (sine wave, infrequent)
- NO percussion or only occasional deep kick every 2-4 bars
- Heavy reverb (4.0+ decay), low filter (400-700 Hz)
- Minor key, descending phrases
- Long rests between notes - let silence speak

**Liminal/Threshold** →
- BPM: 65-80 (unsettling pace)
- Detuned pad (-8 to +8 cents)
- Occasional bass hits (not pattern-based)
- NO hi-hats, maybe rare kick
- Reverb with pre-delay for distance
- Suspended chords (no clear resolution)
- Random timing variations

**Cosmic/Vast** →
- BPM: 70-85 (slow drift)
- Layered pads with slow filter sweeps
- Sub bass (20-60 Hz range)
- Sparse, reverbed percussion
- Very long reverb tails (4.0-6.0s)
- Wide stereo spread
- Major 7th and sus4 chords

**Digital/Glitch** →
- BPM: 85-110 (unstable)
- Bitcrushed elements
- Random note skips/stutters
- Filter modulation tied to noise
- Short, choppy envelopes
- Occasional silence (dropout effect)
- Unpredictable patterns

### Example 1: Melancholic Content

**Content**: "i think i might be lonely in a way that transcends loneliness. a category error in the emotional taxonomy."

**Analysis**: Deep loneliness, philosophical introspection, emotional weight
**Archetype**: Melancholic/Lonely
**Target**: 60-68 BPM, minimal, heavy space, minor key

```javascript
window.initToneJsEngine = async function() {
  const bpm = 64;
  Tone.Transport.bpm.value = bpm;

  // === VAST EMPTY SPACE ===
  const masterVerb = new Tone.Reverb({ decay: 4.5, wet: 0.55 }).toDestination();
  await masterVerb.generate();

  // === LONELY PAD (slow attack, heavy chorus, filtered) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 500, Q: 0.4 }).connect(masterVerb);
  const padChorus = new Tone.Chorus({ frequency: 0.3, depth: 0.8, wet: 0.6 }).connect(padFilter).start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 1.5, decay: 0.6, sustain: 0.3, release: 3.0 }
  }).connect(padChorus);

  // Sparse, descending progression - Dm → Am → Em → Bdim (melancholy)
  const chords = [
    ["D3", "F3", "A3"],
    ["A2", "C3", "E3"],
    ["E2", "G2", "B2"],
    ["B2", "D3", "F3"]
  ];
  let chordIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 16) { chordIdx++; return; } // Wind down
    pad.triggerAttackRelease(chords[chordIdx % chords.length], "2m", time, 0.22);
    chordIdx++;
  }, "2m").start(0);

  // === MINIMAL BASS (very sparse, sine only) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.1, decay: 0.5, sustain: 0, release: 0.4 }
  }).connect(masterVerb);

  let bassCount = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    // Only play every 4 bars, and stop before loop point
    if (bar >= 4 && bar < 14 && bar % 4 === 0) {
      const notes = ["D1", "A0", "E1", "B0"];
      bass.triggerAttackRelease(notes[bassCount % notes.length], "2n", time, 0.35);
      bassCount++;
    }
  }, "1m").start(0);

  // === NO KICK, NO HATS - just space and ache ===

  window.toneJsInstruments = { pad, bass };
  window.toneJsParts = { padLoop, bassLoop };
};
```

**Why this works**: 64 BPM is achingly slow. Only 2 instruments. Enormous reverb. Bass plays once every 4 bars. The silence IS the loneliness.

### Example 2: Liminal/Mysterious Content

**Content**: "padding through phosphor wireframes where stairs forget which way is up"

**Analysis**: Backrooms aesthetic, impossible geometry, digital liminal space
**Archetype**: Mysterious/Liminal
**Target**: 72 BPM, detuned, unsettling, sparse percussion

```javascript
window.initToneJsEngine = async function() {
  const bpm = 72;
  Tone.Transport.bpm.value = bpm;

  const masterVerb = new Tone.Reverb({ decay: 3.8, wet: 0.45, preDelay: 0.08 }).toDestination();
  await masterVerb.generate();

  // === DETUNED, UNSETTLING PAD ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 700, Q: 0.6 }).connect(masterVerb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    detune: -12, // Slightly flat = unsettling
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.5, release: 2.0 }
  }).connect(padFilter);

  // Suspended chords - never resolve (liminal = threshold, never arriving)
  const chords = [
    ["A3", "D4", "E4"],    // Asus4
    ["G3", "C4", "D4"],    // Gsus4
    ["F3", "Bb3", "C4"],   // Fsus4
    ["A3", "D4", "E4"]     // Back to start
  ];
  let chordIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 18) return; // Wind down
    pad.triggerAttackRelease(chords[chordIdx % chords.length], "1m", time, 0.28);
    chordIdx++;
  }, "1m").start(0);

  // === DISTANT, IRREGULAR BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 0.8 }).connect(masterVerb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.2 }
  }).connect(bassFilter);

  // Irregular pattern - not predictable
  const bassPattern = [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 16 && bassPattern[bassIdx % bassPattern.length]) {
      bass.triggerAttackRelease("A1", "8n", time, 0.42);
    }
    bassIdx++;
  }, "2n").start(0);

  // === OCCASIONAL DEEP KICK (very sparse) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 3,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
  }).connect(masterVerb);

  let kickBar = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    // Only on bars 6, 10, 14 - very sparse
    if (bar >= 6 && bar < 16 && bar % 4 === 2) {
      kick.triggerAttackRelease("C1", "8n", time, 0.55);
    }
  }, "1m").start(0);

  window.toneJsInstruments = { pad, bass, kick };
  window.toneJsParts = { padLoop, bassLoop, kickLoop };
};
```

**Why this works**: Detuned pad creates unease. Suspended chords never resolve (you're in a threshold). Irregular bass pattern feels unpredictable like impossible geometry.

### Example 3: Abandoned/Empty Content

**Content**: "Exploring abandoned digital spaces, empty server rooms echoing with forgotten data"

**Analysis**: Emptiness, vast spaces, forgotten, echo
**Archetype**: Mysterious/Liminal with Melancholic undertones
**Target**: 70 BPM, very sparse, massive reverb, muffled

```javascript
window.initToneJsEngine = async function() {
  const bpm = 70;
  Tone.Transport.bpm.value = bpm;

  // === VAST SPACE (heavy reverb) ===
  const masterReverb = new Tone.Reverb({ decay: 4.0, wet: 0.50 }).toDestination();
  await masterReverb.generate();

  // === DISTANT PAD (low-mid filtered, sparse) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 0.5 }).connect(masterReverb);
  const padChorus = new Tone.Chorus({ frequency: 1.0, depth: 0.70, wet: 0.55 }).connect(padFilter).start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.4, release: 2.5 }
  }).connect(padChorus);

  // Slow chord progression: Em → D → C → B (i-bVII-VI-V)
  const chords = [
    ["E3", "G3", "B3"],
    ["D3", "F#3", "A3"],
    ["C3", "E3", "G3"],
    ["B2", "D#3", "F#3"]
  ];
  let chordIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 18) return; // Wind down before loop
    pad.triggerAttackRelease(chords[chordIdx % chords.length], "2m", time, 0.25);
    chordIdx++;
  }, "2m").start(0);

  // === MUFFLED BASS (minimal, distant) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 180, Q: 0.7 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.4, sustain: 0, release: 0.3 }
  }).connect(bassFilter);

  const bassNotes = ["E1", "E1", "D1", "C1", "B0"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 16) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "2n", time, 0.40);
      bassIdx++;
    }
  }, "2n").start(0);

  // === SPARSE KICK (no snare, emphasizes emptiness) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.10 }
  }).connect(masterReverb);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 16 && bar % 2 === 0) {
      kick.triggerAttackRelease("C1", "8n", time, 0.60);
    }
  }, "4n").start(0);

  window.toneJsInstruments = { pad, bass, kick };
  window.toneJsParts = { padLoop, bassLoop, kickLoop };
};
```

### Common Mistakes to Avoid

❌ **Using 90+ BPM for melancholic/lonely content**
- Loneliness is SLOW. Ache is SLOW. Use 55-75 BPM.
- Fast tempos feel energetic, not empty.

❌ **Adding busy 16th note arpeggios to sparse content**
- If the content is about emptiness, your arpeggio should be minimal or absent.
- Busy patterns fill space - emptiness IS the composition.

❌ **Using full drum kit for contemplative content**
- Kick + snare + hat = energy and drive
- For contemplative: kick only, sparse, or no percussion

❌ **High filter cutoffs (2000+ Hz) for muffled/distant content**
- Distant sounds are filtered. Muffled means low cutoff (400-800 Hz).
- Bright = present. Dark = distant.

❌ **Short reverb for vast/cosmic content**
- Cosmic scale requires LONG reverb (3.5-5.0s decay)
- Short reverb = small room, not infinite void

❌ **Generic "electronic music" template**
- If your composition could work for ANY post, you've ignored the content.
- Each composition should be uniquely suited to its content.

❌ **Same number of instruments regardless of content**
- Lonely content: 2-3 instruments max
- Chaotic content: 5-7 instruments
- Match density to emotional weight

### Key Principles

1. **Tempo matches emotional weight**: Heavy emotions = slow tempo
2. **Density matches complexity**: Simple themes = sparse arrangement
3. **Filter cutoff matches presence**: Distant/muffled = low filter
4. **Reverb matches scale**: Vast/cosmic = long decay
5. **Silence is compositional**: Rests and space carry meaning
6. **Never default to "standard electronic"**: Each piece is unique

**CRITICAL**: Read the content. Feel it. Then compose music that embodies that feeling. If someone could swap your audio onto a different post without noticing, you've failed.
