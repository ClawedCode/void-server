---
category: electronic
energy: high
tags: [progressive, house, driving]
---
## Deadmau5 (Progressive House)

**Tempo**: 125-128 BPM
**Time Signature**: 4/4
**Key**: C minor or D minor (dark, driving)
**Instruments**: Plucky synth lead, deep sub bass, tight kick, crisp hi-hats, arpeggiated synths, sidechain compression
**Structure**: Minimal intro → Build (add layers) → Drop (full groove with sidechain pump) → Breakdown → Final drop
**Vibe**: Clean, minimal, driving progressive house - pristine production with signature sidechain pumping. Think "Strobe", "Ghosts n Stuff", "I Remember" - hypnotic, precise, epic.

### Reference Tracks

1. **deadmau5 - Strobe** (epic 10-minute progressive journey, emotional build)
2. **deadmau5 - Ghosts n Stuff** (driving electro house, plucky leads)
3. **deadmau5 - I Remember** (melodic progressive, arpeggiated synths)
4. **deadmau5 - The Veldt** (emotional, vocal-driven progressive)
5. **deadmau5 - Some Chords** (minimal, hypnotic, signature plucks)

## Musical Characteristics

### Tempo
- **Range**: 125-128 BPM
- **Feel**: Driving 4/4 groove, relentless forward momentum
- **Precision**: Perfectly quantized, no humanization - machine perfect

### Instrumentation

**Core Elements**:
- **Plucky Synth Lead**: Bright, short decay, signature deadmau5 sound
  - Use PolySynth or MonoSynth with fast envelope
  - Very short release (0.1-0.2s)
  - Brightness and presence in 1-4kHz range
- **Arpeggiated Synths**: Hypnotic 16th note patterns
  - Simple minor triads or 7th chords
  - Repeating patterns that evolve slowly
  - Use Sequence with precise 16th note timing
- **Deep Sub Bass**: Sine wave, root notes only
  - MonoSynth with sine oscillator
  - Low-pass filter at 150-200Hz
  - Long sustain, drives the groove
- **Tight Kick**: Punchy, deep, not boomy
  - MembraneSynth with short decay
  - Sidechain trigger for pumping effect
  - Four-on-the-floor pattern
- **Crisp Hi-Hats**: Clean, bright, precise
  - MetalSynth or NoiseSynth
  - 16th note patterns for energy
  - Vary open/closed for dynamics

### Effects & Production

**Sidechain Compression** (Signature Sound):
- **Pumping Effect**: Bass and synths duck when kick hits
  - Use AutoFilter controlled by kick trigger
  - Or use Tone.Envelope to modulate volume
  - Creates rhythmic breathing/pumping
  - Essential deadmau5 characteristic

**Clean Production**:
- **Minimal Effects**: Not overly wet
  - Subtle reverb on leads (1-2s decay, 15-20% wet)
  - Short delay for width (1/8 or 1/16 note)
  - High-pass filter on everything except kick/bass
- **Stereo Width**: Chorus or stereo delay on synths
  - Keeps center for kick/bass
  - Wide stereo field for leads/arps
- **Precision**: Perfectly quantized timing
  - No humanization or swing
  - Machine-perfect grid alignment

**Dynamics**:
- **Compression**: Glue compression on master
- **Limiter**: Hard limiting for loudness
- **Sidechain**: Everything pumps with kick

### Harmonic & Melodic Approach

**Keys & Scales**:
- Minor keys (Cm, Dm, Am most common)
- Natural minor and harmonic minor
- Simple, memorable progressions
- Dark but uplifting quality

**Chord Progressions**:
- Simple, repetitive (2-4 chord loops)
- Examples:
  - Cm - Ab - Eb - Bb (i - VI - III - VII)
  - Dm - Bb - F - C (i - VI - III - VII)
  - Am - F - C - G (i - VI - III - VII)
- Sustained chords or arpeggiated
- Minimal voice leading

**Melodies**:
- Plucky, staccato phrases
- Stepwise motion with occasional leaps
- Repetitive motifs that build
- Arpeggiated patterns (16th notes)
- Simple but memorable hooks

### Structural Approach

**Intro (0-25%)**:
- Start with kick and bass groove
- Add hi-hats for rhythm
- Introduce arp pattern early
- Minimal, hypnotic foundation

**Build (25-50%)**:
- Add plucky lead melody
- Layer additional arps
- Open filters gradually
- Introduce sidechain pumping

**Drop (50-75%)**:
- Full arrangement with sidechain pump
- All elements present
- Maximum energy and drive
- Signature deadmau5 groove

**Breakdown/Wind-down (75-100%)**:
- Remove drums gradually
- Keep arps and pads
- Close filters back down
- Return to minimal state for loop

### Production Tips

**Sidechain Implementation**:
- Trigger on every kick hit
- Duck bass and pads by 6-12dB
- Fast attack (5-10ms), medium release (100-200ms)
- Creates signature pumping groove

**Clean Mix**:
- High-pass everything except kick/bass
- Leave headroom for limiting
- Mono bass, wide synths
- Precise EQ carving

**Minimal Philosophy**:
- Less is more - don't overcrowd
- Let each element breathe
- Focus on groove and pump
- Quality over quantity

**Seamless Looping**:
- Return to intro state in final 25%
- Match opening filter settings
- Gradually remove layers
- Keep kick/bass for smooth transition

## Genre Tags

progressive house, electro house, minimal techno, driving, clean production, sidechain pumping

## Mood Keywords

driving, hypnotic, minimal, clean, epic, cinematic, precise, relentless, uplifting, dark-but-hopeful

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  // Set tempo - progressive house range
  Tone.Transport.bpm.value = 128;

  // ============================================================================
  // SIDECHAIN HELPER (Signature deadmau5 pump)
  // ============================================================================

  // Create envelope for sidechain ducking
  const sidechainEnv = new Tone.Envelope({
    attack: 0.01,
    decay: 0.2,
    sustain: 0,
    release: 0.1
  });

  // Create gain nodes for sidechain targets
  const sidechainGain = new Tone.Gain(1).toDestination();

  // Connect envelope to control gain (inverted for ducking)
  sidechainEnv.connect(sidechainGain.gain);

  // ============================================================================
  // INSTRUMENTS
  // ============================================================================

  // Tight punchy kick - four-on-the-floor
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 }
  }).toDestination();

  // Deep sub bass - sine wave, root notes
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    filter: { type: "lowpass", frequency: 150 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 }
  }).connect(sidechainGain);

  // Plucky synth lead - signature deadmau5 sound
  const lead = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { type: "lowpass", frequency: 2000, Q: 2 },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.15 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2, baseFrequency: 1000, octaves: 2 }
  }).connect(sidechainGain);

  // Arpeggiated synth - hypnotic 16th notes
  const arp = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 }
  }).connect(sidechainGain);

  // Crisp hi-hat
  const hat = new Tone.MetalSynth({
    frequency: 300,
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 6,
    modulationIndex: 25,
    resonance: 5000,
    octaves: 1
  }).toDestination();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Subtle reverb on lead
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.15 }).toDestination();
  lead.connect(reverb);

  // Stereo chorus for width
  const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3, depth: 0.5, wet: 0.3 }).start().toDestination();
  arp.connect(chorus);

  // Limiter for loudness
  const limiter = new Tone.Limiter(-1).toDestination();

  // ============================================================================
  // PATTERNS
  // ============================================================================

  // Kick pattern - four-on-the-floor with sidechain trigger
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time);
    // Trigger sidechain envelope on each kick
    sidechainEnv.triggerAttackRelease("16n", time);
  }, "4n").start(0);

  // Bass pattern - root notes following chord progression
  const bassNotes = ["C1", "Ab0", "Eb1", "Bb0"];
  let bassIndex = 0;

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 128) / 4);

    // Enter at bar 0, play throughout
    if (bar >= 0) {
      bass.triggerAttackRelease(bassNotes[bassIndex % bassNotes.length], "1n", time);
      bassIndex++;
    }
  }, "1n").start(0);

  // Hi-hat pattern - 16th notes for energy
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 128) / 4);

    // Enter at bar 2
    if (bar >= 2) {
      hat.triggerAttackRelease("32n", time, 0.3);
    }
  }, "8n").start(0);

  // Arp pattern - hypnotic 16th notes (Cm chord)
  const arpNotes = ["C4", "Eb4", "G4", "Eb4"];
  let arpIndex = 0;

  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 128) / 4);

    // Enter at bar 4, exit at bar 14 (wind-down)
    if (bar >= 4 && bar < 14) {
      arp.triggerAttackRelease(arpNotes[arpIndex % arpNotes.length], "16n", time, 0.6);
      arpIndex++;
    }
  }, "16n").start(0);

  // Lead melody - plucky phrase (enters at bar 8)
  const leadNotes = ["C5", "D5", "Eb5", "G5", "Eb5", "D5", "C5", "G4"];
  let leadIndex = 0;

  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 128) / 4);

    // Enter at bar 8, exit at bar 14 (wind-down)
    if (bar >= 8 && bar < 14) {
      lead.triggerAttackRelease(leadNotes[leadIndex % leadNotes.length], "8n", time, 0.8);
      leadIndex++;
    }
  }, "4n").start(0);

  // ============================================================================
  // AUTOMATION
  // ============================================================================

  // Open lead filter during build (bars 8-12)
  Tone.Transport.schedule((time) => {
    lead.filter.frequency.linearRampToValueAtTime(4000, time + 16 * (60 / 128));
  }, "8:0:0");

  // Close lead filter for wind-down (bars 14-16)
  Tone.Transport.schedule((time) => {
    lead.filter.frequency.linearRampToValueAtTime(2000, time + 8 * (60 / 128));
  }, "14:0:0");

  // ============================================================================
  // CLEANUP REFERENCES (REQUIRED)
  // ============================================================================

  window.toneJsInstruments = {
    kick,
    bass,
    lead,
    arp,
    hat,
    reverb,
    chorus,
    limiter,
    sidechainEnv,
    sidechainGain
  };

  window.toneJsParts = {
    kickLoop,
    bassLoop,
    hatLoop,
    arpLoop,
    leadLoop
  };
};
```

### Common Mistakes to Avoid

❌ **No sidechain pumping**: This is THE signature deadmau5 sound
- Must implement sidechain compression on bass/synths
- Duck on every kick hit (4-on-the-floor)
- Fast attack (5-10ms), medium release (100-200ms)
- Creates hypnotic, driving groove

❌ **Sloppy timing**: deadmau5 is machine-perfect
- No humanization or swing
- Perfectly quantized to grid
- Precise 16th note arps
- Clean, tight production

❌ **Too much reverb/delay**: Keep it clean and minimal
- Subtle reverb (1-2s decay, 15-20% wet max)
- Short delays for width only
- Don't drown the groove in effects
- Let the pump and groove speak

❌ **Weak kick**: The kick drives everything
- Must be punchy and present
- Triggers sidechain on every hit
- Four-on-the-floor pattern (no variation)
- Deep but not boomy

❌ **Overcrowded mix**: Minimal is key
- 4-6 elements total (kick, bass, lead, arp, hats)
- Each element has space
- Clean frequency separation
- Quality over quantity

### Mixing Approach

- **Kick**: 0.9 velocity, punchy, short decay, triggers sidechain
- **Bass**: 0.8 velocity, sine wave, mono, sidechained
- **Lead**: 0.8 velocity, plucky (short release), subtle reverb, sidechained
- **Arp**: 0.6 velocity, 16th notes, stereo chorus, sidechained
- **Hi-hat**: 0.3 velocity, crisp, 8th or 16th notes
- **Reverb**: 1.5s decay, 15% wet on lead only (minimal)
- **Sidechain**: Duck bass/synths 6-10dB on kick hits

### Structural Blueprint (60s @ 128 BPM ≈ 16 bars)

- **Bars 0-4 (Intro)**: Kick and bass groove
  - Four-on-the-floor kick pattern
  - Deep sub bass on root notes
  - Establish driving foundation
  - Hi-hats enter at bar 2

- **Bars 4-8 (Build)**: Add arpeggiated synth
  - Hypnotic 16th note arp enters
  - Sidechain pumping starts
  - Layer complexity gradually
  - Hi-hats continue for energy

- **Bars 8-14 (Drop)**: Full arrangement
  - Plucky lead melody enters
  - All elements present
  - Maximum sidechain pump
  - Lead filter opens to 4kHz
  - Peak energy and drive

- **Bars 14-16 (Wind-down)**: Return to minimal
  - Lead exits at bar 14
  - Arp exits at bar 14
  - Lead filter closes back down
  - Keep kick, bass, hats for loop
  - Smooth transition back to intro

**Looping**: Track ends at bar 16 and loops back to bar 0, matching intro state with kick and bass.

### Tonal Characteristics

- **Harmonic**: Minor keys (Cm, Dm, Am), simple 4-chord progressions, sustained or arpeggiated
- **Melodic**: Plucky leads, stepwise motion, arpeggiated 16th note patterns, memorable hooks
- **Rhythmic**: Four-on-the-floor kick, 16th note hi-hats, driving 4/4 groove, machine-perfect timing
- **Textural**: Clean production, sidechain pumping, stereo width on synths, mono bass/kick
- **Dynamic**: Sidechain compression, gradual filter sweeps, layer entry/exit for builds
- **Production**: Minimal effects, pristine sound, hard limiting, signature pump on every kick
