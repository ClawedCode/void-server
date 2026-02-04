---
category: ambient
energy: low
tags: [nostalgic, analog, dreamy]
---
## Boards of Canada

**Tempo**: 70-88 BPM (downtempo, unhurried)
**Key**: Major or modal (D major, A major, or mixolydian/lydian modes)
**Instruments**: Warm analog synth pads, detuned Rhodes/organs, subtle tape-warped drums, field recordings, nostalgic samples
**Structure**: Gradual evolution → Layered textures → Hypnotic loops → Analog degradation → Dreamy fade
**Vibe**: Nostalgic childhood memories, faded VHS tapes, analog warmth, mathematical beauty hidden in decay, Scottish highlands melancholy, retro-futurism from the 1970s

### Key Characteristics

1. **Analog Warmth & Tape Degradation**: Slight detuning, subtle wow/flutter, tape hiss
2. **Nostalgic Simplicity**: Simple melodies that evoke childhood, innocence, and memory
3. **Mathematical Beauty**: Hidden patterns, fibonacci sequences, sacred geometry in rhythms
4. **Field Recordings**: Nature sounds, children's voices, vintage educational films
5. **Gentle Drums**: Soft kicks, muffled snares, brushed percussion, hip-hop influenced
6. **Harmonic Warmth**: Major keys with modal flavors, open fifths, sus chords
7. **Spacious Production**: Generous reverb, tape delay, wide stereo field

### Reference Tracks

**Essential BoC Sound:**
- **"Dayvan Cowboy"** - Building from ambient to triumphant crescendo, analog synth swells
- **"Roygbiv"** - Joyful detuned Rhodes, simple melody, warm bass, nostalgic innocence
- **"Aquarius"** - Dreamy pads, mathematical drum patterns, hypnotic loops
- **"1969"** - Vintage TV samples, analog warmth, filtered drums, faded memories
- **"Telephasic Workshop"** - Detuned organs, wobbly tape effects, gentle hip-hop beat

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 75;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES (analog warmth chain) ===
  const masterReverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).toDestination();
  await masterReverb.generate();

  // Tape delay for analog warmth
  const tapeDelay = new Tone.FeedbackDelay({
    delayTime: "8n.",
    feedback: 0.35,
    wet: 0.25
  }).connect(masterReverb);

  // Subtle chorus for analog detune/wobble
  const analogChorus = new Tone.Chorus({
    frequency: 0.25, // Very slow, tape-like wobble
    delayTime: 4.5,
    depth: 0.4,
    wet: 0.30
  }).connect(tapeDelay).start();

  // === WARM PAD (detuned analog synth) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 1200, Q: 0.5 }).connect(analogChorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.5, decay: 0.8, sustain: 0.6, release: 3.0 }
  }).connect(padFilter);

  // D major progression: I-V-vi-IV (D-A-Bm-G) with open voicings
  const padChords = [
    ["D3", "F#3", "A3", "D4"],  // D major
    ["A3", "C#4", "E4", "A4"],  // A major
    ["B3", "D4", "F#4", "B4"],  // B minor
    ["G3", "B3", "D4", "G4"]    // G major
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    // Vary velocity slightly for human feel
    const velocity = 0.30 + (Math.random() * 0.05);
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, velocity);
    padIdx++;
  }, "2m").start(0);

  // === DETUNED RHODES MELODY (Roygbiv-style simplicity) ===
  const rhodesChorus = new Tone.Chorus({
    frequency: 1.2,
    delayTime: 3.5,
    depth: 0.5,
    wet: 0.40
  }).connect(analogChorus).start();
  const rhodes = new Tone.Synth({
    oscillator: { type: "sine" }, // Pure tone for Rhodes-like sound
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.8 }
  }).connect(rhodesChorus);

  // Simple, nostalgic melody in D major
  const melody = ["D4", "F#4", "A4", "F#4", "E4", "D4", "A3", "D4"];
  const melodyGates = ["8n", "8n", "4n", "8n", "8n", "4n", "8n", "2n"];
  let melodyIdx = 0;
  const melodyLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 22) { // Melody enters after intro
      const velocity = 0.55 + (Math.random() * 0.10); // Slight velocity variation
      rhodes.triggerAttackRelease(
        melody[melodyIdx % melody.length],
        melodyGates[melodyIdx % melodyGates.length],
        time,
        velocity
      );
      melodyIdx++;
    }
  }, "8n").start(0);

  // === WARM BASS (filtered, subtle) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 280, Q: 0.7 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.04, decay: 0.3, sustain: 0.2, release: 0.5 }
  }).connect(bassFilter);

  const bassNotes = ["D2", "D2", "A1", "A1", "B1", "B1", "G1", "G1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) { // Bass enters early
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "4n", time, 0.50);
      bassIdx++;
    }
  }, "4n").start(0);

  // === SOFT KICK (muffled, hip-hop influenced) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 0.30, sustain: 0, release: 0.15 }
  }).connect(masterReverb);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      // Slightly random velocity for tape-like feel
      const velocity = 0.65 + (Math.random() * 0.10);
      kick.triggerAttackRelease("C1", "8n", time, velocity);
    }
  }, "4n").start(0);

  // === MUFFLED SNARE (brushed, soft) ===
  const snareFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 0.5 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" }, // Warmer than white noise
    envelope: { attack: 0.01, decay: 0.12, sustain: 0 }
  }).connect(snareFilter);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && snareStep % 2 === 1) { // On beats 2 and 4
      const velocity = 0.35 + (Math.random() * 0.08);
      snare.triggerAttackRelease("16n", time, velocity);
    }
    snareStep++;
  }, "4n").start(0);

  // === SUBTLE HI-HATS (brushed, distant) ===
  const hatFilter = new Tone.Filter({ type: "highpass", frequency: 4000, Q: 0.3 }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 6.0,
    modulationIndex: 18,
    resonance: 4200
  }).connect(hatFilter);

  const hatVelocities = [0.20, 0.12, 0.18, 0.10, 0.22, 0.11, 0.19, 0.09];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8) { // Hats enter with melody
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("16n", time, vel * 0.40);
      hatStep++;
    }
  }, "8n").start(0);

  // === AMBIENT TEXTURE (field recording simulation) ===
  const texture = new Tone.NoiseSynth({
    noise: { type: "brown" }, // Very warm, low rumble
    envelope: { attack: 2.0, decay: 0, sustain: 1.0, release: 4.0 }
  }).connect(masterReverb);

  // Trigger ambient texture at start (sustains throughout)
  Tone.Transport.schedule((time) => {
    texture.triggerAttackRelease("1m", time, 0.08); // Very subtle
  }, "0:0:0");

  // === FILTER AUTOMATION (subtle opening) ===
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1800, time + 16 * (60 / bpm) * 4);
  }, "8:0:0");

  // Gently close filter before loop point (return to intro state)
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1200, time + 4 * (60 / bpm) * 4);
  }, "20:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, rhodes, bass, kick, snare, hat, texture };
  window.toneJsParts = { padLoop, melodyLoop, bassLoop, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Too aggressive or modern**: BoC is gentle, warm, nostalgic
- Avoid harsh synths, loud drums, aggressive compression
- Keep everything soft, rounded, muffled
- Think vintage tape recordings, not modern EDM

❌ **Too fast or energetic**: BoC is downtempo and contemplative
- Keep BPM 70-88 (not 100+)
- Avoid complex fast patterns
- Let compositions breathe and evolve slowly

❌ **Too clean or digital**: Embrace analog imperfection
- Add subtle detuning via chorus (frequency: 0.2-0.5 Hz)
- Use low-pass filters on drums (800-1200 Hz)
- Vary velocities slightly with `Math.random()` for tape-like feel
- Use pink/brown noise instead of white for warmth

❌ **Minor keys or dark progressions**: BoC uses major keys with nostalgia
- Prefer major keys (D, A, E major)
- Use modal flavors (mixolydian, lydian)
- Avoid heavy minor progressions
- Think innocent, childlike, not dark or brooding

❌ **Forgetting simplicity**: BoC melodies are beautifully simple
- Single-note or two-note melodies can be powerful
- Repetition creates hypnotic effect
- Don't overcomplicate arrangements
- Trust the warmth of sound design over complexity

### Arrangement Tips

1. **Intro (0-8 bars)**: Ambient pad only, set the nostalgic atmosphere
2. **Build (8-16 bars)**: Add bass, drums, melody enters, layers gradually
3. **Peak (16-20 bars)**: Full instrumentation, filter opens, maximum warmth
4. **Wind-down (20-24 bars)**: Strip layers, close filter, return to ambient pad
5. **Loop point**: Seamless return to intro atmosphere

### Sound Design Details

**Analog Detuning**:
- Use `Tone.Chorus` with very slow frequency (0.2-0.5 Hz)
- Higher depth (0.4-0.5) for more pronounced wobble
- Delay time 3.5-5ms creates analog warmth

**Tape-Like Drums**:
- Low-pass filter on kick (200-300 Hz)
- Low-pass filter on snare (600-1000 Hz)
- Pink/brown noise for warmer snare tone
- Random velocity variation (±10%) for human feel

**Nostalgic Melodies**:
- Simple, singable patterns
- Major keys with modal touches
- Gentle attack/release (0.02-0.08s attack, 0.5-1.0s release)
- Lower velocities (0.4-0.6) for intimate feel

**Field Recording Simulation**:
- Brown noise at very low volume (0.05-0.10) for ambient texture
- Long attack/release (2s+) for seamless sustain
- Optional: Add short sine tone bursts to simulate distant sounds

### Mixing Approach

- **Pads**: 0.30-0.40 volume, wide stereo, heavy reverb (decay 3-4s)
- **Melody**: 0.50-0.60 volume, centered, tape delay for depth
- **Bass**: 0.45-0.55 volume, centered, subtle and supportive
- **Drums**: 0.50-0.70 volume, kick centered, snare/hats slightly panned
- **Ambient**: 0.08-0.12 volume, wide stereo, constant sustain
- **Master Reverb**: Decay 3-4s, wet 0.30-0.40 for spacious warmth

### Mathematical Beauty (Optional Enhancement)

BoC often uses hidden mathematical patterns. Consider:
- **Fibonacci rhythms**: Note divisions at 1, 1, 2, 3, 5, 8 bar intervals
- **Golden ratio timing**: Key changes at 0.618 * total duration
- **Pentatonic scales**: D major pentatonic (D E F# A B) for simplicity
- **Perfect fifths**: Bass root notes separated by fifths (D-A-E-B-G-D)

### Emotional Palette

**What BoC evokes:**
- Faded childhood memories on VHS tape
- Summer days in Scottish highlands
- Educational films from the 1970s
- Mathematical beauty hidden in decay
- Innocent nostalgia tinged with melancholy
- Warm analog technology from a simpler time

**What to avoid:**
- Modern digital clarity
- Aggressive or dark emotions
- Complex jazz harmonies
- Fast-paced anxiety
- Cynicism or irony
