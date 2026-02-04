---
category: experimental
energy: medium
tags: [art-rock, glitchy, emotional]
---
## Radiohead (Experimental Electronic)

**Tempo**: 70-95 BPM (varies, often unconventional)
**Time Signature**: 4/4 (but with polyrhythmic elements, odd groupings)
**Key**: Modal ambiguity (often Dorian, Phrygian, or ambiguous tonality)
**Instruments**: Arpeggiated synths, ambient pads, glitchy beats, bass, Ondes Martenot-style swooping synths, textural layers
**Structure**: Unconventional - loops build gradually, tension/release, minimal development, circular structures
**Vibe**: Melancholic, atmospheric, experimental - beautiful tension through dissonance and space. Think "Kid A", "Everything In Its Right Place", "Idioteque" - haunting, otherworldly, emotionally complex.

### Reference Tracks

1. **Radiohead - Everything In Its Right Place** (iconic arpeggio, layered textures)
2. **Radiohead - Idioteque** (glitchy electronic beats, urgent energy)
3. **Radiohead - Kid A** (Ondes Martenot-style synths, ambient, haunting)
4. **Radiohead - Pyramid Song** (unusual time feel, piano-driven, atmospheric)
5. **Radiohead - Weird Fishes/Arpeggi** (polyrhythmic arpeggios, building layers)

## Musical Characteristics

### Tempo
- **Range**: 70-95 BPM (often slower, contemplative)
- **Feel**: Unconventional, polyrhythmic, not straightforward dance grooves
- **Timing**: Can be quantized or slightly loose, organic feel

### Instrumentation

**Core Elements**:
- **Arpeggiated Synths**: Central to Radiohead's electronic sound
  - Use PolySynth with simple triads or ambiguous voicings
  - Repeating patterns that shift subtly over time
  - Often in unusual groupings (5s, 7s) over 4/4
  - Warm, analog-style synth tones
- **Ambient Pads**: Atmospheric foundation
  - Long, evolving textures
  - Often dissonant or modal
  - Heavy reverb and space
  - Create emotional depth
- **Glitchy Beats**: Unconventional drum programming
  - Not straightforward 4/4 house beats
  - Stuttering, fragmented patterns
  - Use NoiseSynth for snares with unusual envelopes
  - Sparse kick patterns
- **Bass**: Deep, simple, hypnotic
  - MonoSynth with sine or triangle wave
  - Root notes or simple patterns
  - Anchors the ambiguity above
- **Ondes Martenot-style Swoops**: Signature Radiohead texture
  - Use MonoSynth with portamento/glide
  - Slow pitch bends and swoops
  - Haunting, vocal-like quality

### Effects & Production

**Atmospheric Space**:
- **Reverb**: Generous but tasteful (2-4s decay)
  - Apply to pads and arps for depth
  - Creates sense of vast space
  - Not overwhelming, just present
- **Delay**: Rhythmic delays for complexity
  - 1/4 or dotted 1/8 note timing
  - Moderate feedback (0.3-0.5)
  - Adds polyrhythmic interest

**Textural Effects**:
- **Chorus/Phaser**: Warm analog modulation
  - Adds movement to static pads
  - Vintage, warm character
- **Bit Crushing**: Subtle lo-fi texture
  - On glitchy beats or pads
  - Adds grit and character
- **Filtering**: Slow filter automation
  - Creates gradual evolution
  - Avoids static, boring textures

**Production Philosophy**:
- **Space and Silence**: Don't overcrowd
- **Tension Through Dissonance**: Use modal ambiguity
- **Organic Within Electronic**: Warm, human feel
- **Gradual Evolution**: Textures shift slowly

### Harmonic & Melodic Approach

**Keys & Scales**:
- Modal ambiguity (Dorian, Phrygian, Lydian)
- Avoid strong V-I resolutions
- Floating, uncertain tonality
- Use suspended chords, added 2nds/9ths
- Embrace dissonance as beauty

**Chord Progressions**:
- Unconventional, non-functional harmony
- Examples:
  - C - Csus2 - Fmaj7 - Fsus2 (ambiguous, floating)
  - Dm - Dsus2 - Am7 - Asus2 (modal interchange)
  - Em - D/E - Cmaj7 - Bm (stepwise bass motion)
- Sustained or arpeggiated
- Minimal changes (2-3 chords often)

**Melodies**:
- Arpeggiated patterns (not traditional melodies)
- Repeating with subtle variations
- Polyrhythmic groupings (5 notes over 4 beats, etc.)
- Emphasis on texture over hooks
- Haunting, memorable through repetition

### Structural Approach

**Intro (0-30%)**:
- Start with single element (arp or pad)
- Establish hypnotic loop
- Minimal, draw listener in
- Set emotional tone

**Build (30-60%)**:
- Add layers gradually, one at a time
- Introduce glitchy beats
- Add bass for grounding
- Slow filter opening or texture evolution

**Peak (60-80%)**:
- All elements present but restrained
- Not a traditional "drop" - maintain tension
- Maximum textural complexity
- Emotional intensity through layering

**Resolution/Wind-down (80-100%)**:
- Strip back to opening elements
- Remove glitchy beats first
- Return to pad/arp foundation
- Close filters, reduce complexity
- Circular structure (ends where it began)

### Production Tips

**Embrace Imperfection**:
- Slight detuning on synths
- Subtle timing variations (but not swing)
- Lo-fi textures and artifacts
- Warmth over pristine digital

**Build Gradually**:
- Don't rush the evolution
- Let textures breathe and develop
- Patience in layering
- Trust the hypnotic power of repetition

**Modal Ambiguity**:
- Avoid strong tonal centers
- Use suspended chords
- Floating, uncertain harmony
- Creates emotional complexity

**Polyrhythmic Interest**:
- 5 or 7-note patterns over 4/4 time
- Delays creating rhythmic complexity
- Beats that don't sit on obvious grid
- Subtle, not jarring

**Seamless Looping**:
- Return to opening texture in final portion
- Match opening filter settings
- Circular structure (loop feels natural)
- Remove late-entering elements

## Genre Tags

experimental electronic, art rock, ambient, glitch, IDM, atmospheric, avant-garde, melancholic

## Mood Keywords

melancholic, atmospheric, experimental, haunting, beautiful, tense, otherworldly, introspective, complex, hypnotic, uncertain, emotional

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  // Set tempo - contemplative, slower
  Tone.Transport.bpm.value = 82;

  // ============================================================================
  // INSTRUMENTS
  // ============================================================================

  // Ambient pad - atmospheric foundation
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    filter: { type: "lowpass", frequency: 600, Q: 1, rolloff: -12 },
    envelope: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 4.0 }
  }).toDestination();

  // Arpeggiated synth - signature Radiohead texture (like "Everything In Its Right Place")
  const arp = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.8 }
  }).toDestination();

  // Bass - deep, simple, grounding
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    filter: { type: "lowpass", frequency: 180 },
    envelope: { attack: 0.03, decay: 0.2, sustain: 0.7, release: 0.5 }
  }).toDestination();

  // Glitchy kick - sparse, unconventional
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.3 }
  }).toDestination();

  // Glitchy snare/noise - stuttering, fragmented
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.002, decay: 0.15, sustain: 0 }
  }).toDestination();

  // Swooping synth - Ondes Martenot-style
  const swoop = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    portamento: 0.3, // Glide between notes
    envelope: { attack: 0.5, decay: 0.3, sustain: 0.6, release: 1.5 }
  }).toDestination();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reverb for atmospheric space
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).toDestination();
  pad.connect(reverb);
  arp.connect(reverb);
  swoop.connect(reverb);

  // Rhythmic delay for complexity
  const delay = new Tone.PingPongDelay({ delayTime: "8n", feedback: 0.4, wet: 0.25 }).toDestination();
  arp.connect(delay);

  // Chorus for warmth
  const chorus = new Tone.Chorus({ frequency: 0.5, delayTime: 4, depth: 0.6, wet: 0.3 }).start().toDestination();
  pad.connect(chorus);

  // Limiter
  const limiter = new Tone.Limiter(-3).toDestination();

  // ============================================================================
  // PATTERNS
  // ============================================================================

  // Pad chords - modal ambiguity (Csus2 - Fmaj7 - Fsus2)
  const padChords = [
    ["C3", "D3", "G3"],      // Csus2
    ["C3", "E3", "F3", "A3"], // Fmaj7
    ["F3", "G3", "C4"]       // Fsus2
  ];
  let padIndex = 0;

  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 82) / 4);

    // Enter at bar 0, play throughout
    if (bar >= 0) {
      pad.triggerAttackRelease(
        padChords[padIndex % padChords.length],
        "2n",
        time,
        0.4
      );
      padIndex++;
    }
  }, "2n").start(0);

  // Arp pattern - polyrhythmic (5 notes over 4 beats, like "Weird Fishes")
  const arpNotes = ["C4", "D4", "G4", "F4", "E4"]; // 5-note pattern
  let arpIndex = 0;

  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 82) / 4);

    // Enter at bar 2, exit at bar 14 (wind-down)
    if (bar >= 2 && bar < 14) {
      arp.triggerAttackRelease(arpNotes[arpIndex % arpNotes.length], "8n", time, 0.6);
      arpIndex++;
    }
  }, "8n").start(0);

  // Bass pattern - simple root notes
  const bassNotes = ["C1", "F1", "F1"];
  let bassIndex = 0;

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 82) / 4);

    // Enter at bar 4
    if (bar >= 4) {
      bass.triggerAttackRelease(bassNotes[bassIndex % bassNotes.length], "2n", time, 0.7);
      bassIndex++;
    }
  }, "2n").start(0);

  // Glitchy kick - unconventional pattern (not straight 4/4)
  const kickPattern = [0, 3, 7, 10]; // Offbeat placement
  let kickStep = 0;

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 82) / 4);

    // Enter at bar 6, exit at bar 14
    if (bar >= 6 && bar < 14) {
      const step = kickStep % 16;
      if (kickPattern.includes(step)) {
        kick.triggerAttackRelease("C1", "16n", time, 0.6);
      }
    }
    kickStep++;
  }, "16n").start(0);

  // Glitchy snare - stuttering pattern
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / 82) / 4);

    // Enter at bar 8, exit at bar 14
    if (bar >= 8 && bar < 14) {
      // Random stuttering (30% chance to trigger)
      if (Math.random() < 0.3) {
        snare.triggerAttackRelease("32n", time, 0.4);
      }
    }
  }, "16n").start(0);

  // Swooping synth - occasional haunting swoops
  Tone.Transport.schedule((time) => {
    swoop.triggerAttackRelease("A3", "2n", time, 0.5);
  }, "10:0:0");

  Tone.Transport.schedule((time) => {
    swoop.triggerAttackRelease("F4", "2n", time, 0.5);
  }, "12:2:0");

  // ============================================================================
  // AUTOMATION (Gradual evolution)
  // ============================================================================

  // Open pad filter during build (bars 4-10)
  Tone.Transport.schedule((time) => {
    pad.filter.frequency.linearRampToValueAtTime(1200, time + 24 * (60 / 82));
  }, "4:0:0");

  // Close pad filter for wind-down (bars 14-16)
  Tone.Transport.schedule((time) => {
    pad.filter.frequency.linearRampToValueAtTime(600, time + 8 * (60 / 82));
  }, "14:0:0");

  // ============================================================================
  // CLEANUP REFERENCES (REQUIRED)
  // ============================================================================

  window.toneJsInstruments = {
    pad,
    arp,
    bass,
    kick,
    snare,
    swoop,
    reverb,
    delay,
    chorus,
    limiter
  };

  window.toneJsParts = {
    padLoop,
    arpLoop,
    bassLoop,
    kickLoop,
    snareLoop
  };
};
```

### Common Mistakes to Avoid

❌ **Too conventional**: Radiohead defies standard song structures
- Avoid typical verse/chorus structures
- Don't use standard chord progressions (I-IV-V-I)
- Embrace modal ambiguity and dissonance
- Create circular, hypnotic structures

❌ **Overly clean production**: Needs warmth and imperfection
- Add subtle detuning on synths
- Use lo-fi textures (bit crushing, noise)
- Embrace analog-style warmth
- Space and reverb are essential

❌ **Straightforward beats**: Glitchy, unconventional rhythms
- Not four-on-the-floor house beats
- Sparse, fragmented patterns
- Polyrhythmic elements (5s over 4s)
- Stuttering, unexpected placements

❌ **Too busy**: Space is compositional
- Don't overcrowd the mix
- Let textures breathe and evolve
- Patience in development
- Less is more

❌ **Missing arpeggios**: Central to electronic Radiohead sound
- Signature texture from "Everything In Its Right Place"
- Repeating patterns with subtle variations
- Often polyrhythmic or unusual groupings
- Warm, analog-style synth tones

### Mixing Approach

- **Pad**: 0.4 velocity, very long attack (2s), generous reverb (3.5s decay, 35% wet)
- **Arp**: 0.6 velocity, polyrhythmic patterns, reverb + delay for space
- **Bass**: 0.7 velocity, sine wave, low-passed at 180Hz, anchors the ambiguity
- **Kick**: 0.6 velocity, unconventional pattern (not 4/4), sparse placement
- **Snare**: 0.4 velocity, glitchy/stuttering, random triggering
- **Swoop**: 0.5 velocity, occasional swoops with portamento, haunting texture
- **Reverb**: 3.5s decay, 35% wet (atmospheric space)
- **Delay**: 8th note, 40% feedback, 25% wet (rhythmic complexity)

### Structural Blueprint (60s @ 82 BPM ≈ 16 bars)

- **Bars 0-2 (Intro)**: Pad only
  - Establish modal ambiguity (Csus2 - Fmaj7 - Fsus2)
  - Pad filter starts closed at 600Hz
  - Atmospheric, draw listener in

- **Bars 2-6 (Build)**: Add arpeggiated synth
  - Polyrhythmic 5-note pattern enters
  - Creates hypnotic, shifting texture
  - Bass enters at bar 4
  - Pad filter begins opening

- **Bars 6-14 (Peak)**: Full arrangement
  - Glitchy kick enters at bar 6 (unconventional pattern)
  - Stuttering snare enters at bar 8
  - Swooping synth at bars 10-12 (haunting)
  - Pad filter fully open at 1200Hz
  - Maximum textural complexity

- **Bars 14-16 (Wind-down)**: Return to opening
  - Kick and snare exit at bar 14
  - Arp exits at bar 14
  - Pad filter closes back to 600Hz
  - Bass and pad continue for smooth loop
  - Circular structure

**Looping**: Track ends at bar 16 and loops back to bar 0, matching intro texture.

### Tonal Characteristics

- **Harmonic**: Modal ambiguity (Dorian, Phrygian), suspended chords, non-functional harmony, floating tonality
- **Melodic**: Arpeggiated patterns over melodies, polyrhythmic groupings (5 over 4), repetitive with variations
- **Rhythmic**: Unconventional, glitchy beats, not straight 4/4 grooves, sparse kick placements, stuttering textures
- **Textural**: Ambient pads, arpeggios, swooping synths, lo-fi warmth, generous reverb/delay
- **Dynamic**: Gradual evolution, tension through dissonance, slow filter automation, circular structures
- **Production**: Space and silence, warm imperfection, atmospheric depth, emotional complexity through ambiguity
