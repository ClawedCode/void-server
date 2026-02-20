---
category: experimental
energy: medium
tags: [jazz-electronic, textural, complex-harmony, Rhodes, organic]
---
## Floating Points (Jazz-Influenced Electronic)

**Tempo**: 102 BPM (patient, unhurried, breathing)
**Time Signature**: 4/4 (but felt as fluid pulse, not rigid grid)
**Key**: Eb major / Ab Lydian (warm, luminous, jazz-inflected)
**Instruments**: Rhodes-like electric piano (sine with slight FM, medium decay), warm sub-bass (sine), textural noise bed (pink noise through bandpass), gentle tonal kick (soft, long pitch decay), brushed hat texture (filtered noise, very short), pad wash (slow triangle), sparse melodic fragments (plucked sine)
**Structure**: Texture bed establishes → Rhodes enters with sparse extended chords → Gentle pulse begins → Organic arpeggio fragments layer in → Peak with all elements breathing together → Dissolve back to texture
**Vibe**: A single harmonic idea explored with infinite patience and textural nuance. Floating Points' genius is restraint - the willingness to sit inside one chord for minutes, letting overtones and textures do the work that most producers assign to melody and rhythm. Think Crush's 45-minute arc compressed into 60 seconds: warm Rhodes voicings suspended in space, sub-bass that hums like a room resonance, organic noise textures that breathe like a living system. Jazz harmony meets electronic patience. Extended chords (9ths, 11ths, 13ths) that shimmer and decay, arpeggio fragments that feel improvised rather than programmed. The music doesn't go anywhere - it already IS somewhere.

### Key Characteristics

1. **Extended Jazz Harmony**: 9ths, 11ths, 13ths, #11s - rich voicings that blur the line between chord and texture
2. **Infinite Patience**: One harmonic idea explored slowly - changes happen across bars, not beats
3. **Rhodes Warmth**: Sine-based FM synthesis creating electric piano character with natural decay
4. **Organic Arpeggio Fragments**: Not rigid 16th-note sequences but irregular, almost improvised note placements
5. **Textural Noise Bed**: Pink noise bandpassed to create a warm, breathing foundation under everything
6. **Filter Sweeps as Expression**: Slow filter automation on Rhodes (2000-4000Hz) as primary dynamic tool
7. **Warm Sub-Bass**: Sine sub that hums at room-resonance frequencies, felt more than heard
8. **Breathing Dynamics**: Every element fades in and out organically - nothing enters or exits abruptly

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 102;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.78).toDestination();

  const limiter = new Tone.Limiter({ threshold: -3 }).connect(master);

  const glue = new Tone.Compressor({
    ratio: 2.5,
    threshold: -16,
    attack: 0.015,
    release: 0.25
  }).connect(limiter);

  // === REVERBS ===
  const warmReverb = new Tone.Reverb({
    decay: 4.5,
    preDelay: 0.04,
    wet: 0.38
  });
  await warmReverb.generate();
  warmReverb.connect(glue);

  const shortReverb = new Tone.Reverb({
    decay: 1.8,
    wet: 0.22
  });
  await shortReverb.generate();
  shortReverb.connect(glue);

  // Subtle delay for arpeggio fragments
  const fragDelay = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.25,
    wet: 0.18
  }).connect(warmReverb);

  // Chorus for Rhodes shimmer
  const rhodesChorus = new Tone.Chorus({
    frequency: 0.6,
    delayTime: 5,
    depth: 0.35,
    wet: 0.2
  }).connect(warmReverb);
  rhodesChorus.start();

  // Clean bus for sub
  const cleanBus = new Tone.Gain(1).connect(limiter);

  // === TEXTURAL NOISE BED (pink noise through bandpass) ===
  const textureBed = new Tone.Noise("pink");
  const textureFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 1200,
    Q: 0.8
  }).connect(new Tone.Gain(0.04).connect(warmReverb));
  textureBed.connect(textureFilter);
  textureBed.start();

  // === RHODES ELECTRIC PIANO (sine + slight FM) ===
  const rhodesFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    Q: 1.5,
    rolloff: -12
  }).connect(rhodesChorus);

  const rhodes = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 2,
    modulationIndex: 0.8,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 0.01,
      decay: 1.8,
      sustain: 0.25,
      release: 2.5
    },
    modulationEnvelope: {
      attack: 0.01,
      decay: 0.8,
      sustain: 0.1,
      release: 1.5
    },
    volume: -10
  }).connect(rhodesFilter);

  // === WARM SUB-BASS (sine, felt not heard) ===
  const sub = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.06,
      decay: 0.5,
      sustain: 0.7,
      release: 0.6
    },
    volume: -6
  }).connect(cleanBus);

  // === PAD WASH (slow triangle, background warmth) ===
  const padFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1400,
    Q: 0.8
  }).connect(warmReverb);

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 3.0,
      decay: 1.5,
      sustain: 0.5,
      release: 4.0
    },
    volume: -16
  }).connect(padFilter);

  // === GENTLE TONAL KICK (soft, like Jon Hopkins but quieter) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 4,
    envelope: {
      attack: 0.002,
      decay: 0.35,
      sustain: 0.01,
      release: 0.5
    },
    volume: -8
  }).connect(shortReverb);

  // === BRUSHED HAT TEXTURE (filtered noise, very short) ===
  const hat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0
    },
    volume: -20
  }).connect(new Tone.Filter({ frequency: 6000, type: "highpass" }).connect(shortReverb));

  // === SPARSE MELODIC FRAGMENTS (plucked sine for arpeggio-like lines) ===
  const frag = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.005,
      decay: 0.6,
      sustain: 0.08,
      release: 1.2
    },
    volume: -14
  }).connect(fragDelay);

  // === RHODES CHORD PROGRESSION (extended jazz voicings) ===
  const chordPart = new Tone.Part((time, ev) => {
    rhodes.triggerAttackRelease(ev.chord, "2m", time + H(10), ev.vel);
  }, [
    { time: "0:0:0", chord: ["Eb3", "G3", "Bb3", "D4", "F4"], vel: 0.45 },     // Ebmaj9
    { time: "4:0:0", chord: ["Ab3", "C4", "Eb4", "G4", "D4"], vel: 0.40 },      // Abmaj7#11
    { time: "8:0:0", chord: ["F3", "Ab3", "C4", "Eb4", "G4"], vel: 0.42 },      // Fm11
    { time: "12:0:0", chord: ["Bb3", "Eb4", "F4", "Ab4"], vel: 0.38 }            // Bbsus4(add7)
  ]);
  chordPart.loop = true;
  chordPart.loopEnd = "16m";

  // === PAD PROGRESSION (background warmth, simpler voicings) ===
  const padPart = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.chord, "4m", time, 0.25);
  }, [
    { time: "0:0:0", chord: ["Eb2", "Bb2", "G3"] },
    { time: "8:0:0", chord: ["Ab2", "Eb3", "C3"] }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "16m";

  // === SUB-BASS PATTERN (sparse, room-resonance hum) ===
  const subPart = new Tone.Part((time, ev) => {
    sub.triggerAttackRelease(ev.note, ev.dur, time + H(5), 0.75);
  }, [
    { time: "0:0:0", note: "Eb1", dur: "1m" },
    { time: "4:0:0", note: "Ab1", dur: "1m" },
    { time: "8:0:0", note: "F1", dur: "1m" },
    { time: "12:0:0", note: "Bb1", dur: "1m" }
  ]);
  subPart.loop = true;
  subPart.loopEnd = "16m";

  // === GENTLE KICK LOOP (subtle pulse, not driving) ===
  const kickLoop = new Tone.Loop((time) => {
    const vel = 0.45 + Math.random() * 0.15;
    kick.triggerAttackRelease("Eb1", "8n", time + H(6), vel);
  }, "2n");

  // === BRUSHED HAT PATTERN (sparse, organic) ===
  const hatSeq = new Tone.Sequence((time, hit) => {
    if (hit && Math.random() > 0.35) {
      hat.triggerAttackRelease("64n", time + H(10), 0.2 + Math.random() * 0.15);
    }
  }, [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1], "16n");
  hatSeq.loop = true;
  hatSeq.loopEnd = "1m";

  // === ORGANIC ARPEGGIO FRAGMENTS (irregular, improvised feel) ===
  // Eb major pentatonic fragments with jazz extensions
  const fragPart = new Tone.Part((time, ev) => {
    frag.triggerAttackRelease(ev.note, ev.dur, time + H(15), ev.vel);
  }, [
    { time: "0:0:0", note: "Bb4", dur: "8n", vel: 0.45 },
    { time: "0:1:2", note: "G4", dur: "16n", vel: 0.35 },
    { time: "0:3:0", note: "F4", dur: "8n", vel: 0.40 },
    { time: "1:0:3", note: "Eb5", dur: "4n", vel: 0.50 },
    { time: "1:2:1", note: "D5", dur: "16n", vel: 0.30 },
    { time: "2:1:0", note: "Bb4", dur: "8n", vel: 0.42 },
    { time: "2:3:2", note: "Ab4", dur: "16n", vel: 0.35 },
    { time: "3:0:0", note: "G4", dur: "4n", vel: 0.48 },
    { time: "3:2:3", note: "F5", dur: "8n", vel: 0.38 }
  ]);
  fragPart.loop = true;
  fragPart.loopEnd = "4m";

  // === ARRANGEMENT (60s @ 102 BPM = ~17 bars) ===
  // Patience is the compositional principle

  // Bars 0-3: Texture bed + pad only (establishing space)
  padPart.start("0:0:0");

  // Bars 3-5: Rhodes enters with sparse extended chords
  Tone.Transport.schedule((t) => {
    chordPart.start(t);
  }, "3:0:0");

  // Bars 5-7: Sub-bass hum + gentle kick pulse begins
  Tone.Transport.schedule((t) => {
    subPart.start(t);
    kickLoop.start(t);
  }, "5:0:0");

  // Bars 7-9: Brushed hats add subtle motion
  Tone.Transport.schedule((t) => {
    hatSeq.start(t);
  }, "7:0:0");

  // Bars 9-13: Arpeggio fragments layer in, Rhodes filter opens
  Tone.Transport.schedule((t) => {
    fragPart.start(t);
    rhodesFilter.frequency.linearRampToValueAtTime(4000, t + Tone.Time("4m").toSeconds());
  }, "9:0:0");

  // Bars 13-15: Peak - all elements breathing together
  // Everything is already playing - peak is about filter position and density

  // Bars 15-17: Dissolve - filter closes, fragments stop, return to texture
  Tone.Transport.schedule((t) => {
    fragPart.stop(t + Tone.Time("1m").toSeconds());
    hatSeq.stop(t + Tone.Time("1m").toSeconds());
    rhodesFilter.frequency.linearRampToValueAtTime(2000, t + Tone.Time("2m").toSeconds());
  }, "15:0:0");

  // Final bar: strip to pad + texture for seamless loop
  Tone.Transport.schedule((t) => {
    kickLoop.stop(t);
    subPart.stop(t);
  }, "16:2:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { rhodes, rhodesFilter, sub, pad, padFilter, kick, hat, frag, textureBed, textureFilter, warmReverb, shortReverb, rhodesChorus, fragDelay, limiter, glue };
  window.toneJsParts = { chordPart, padPart, subPart, kickLoop, hatSeq, fragPart };
};
```

### Common Mistakes to Avoid

- **Too many chord changes**: Floating Points sits inside one chord for extended periods
  - 4 chords over 16 bars is already generous
  - The harmony is explored, not traversed
  - Let the voicing breathe and decay naturally

- **Rigid arpeggios**: The melodic fragments must feel improvised
  - Irregular timing between notes (not a steady 16th-note sequence)
  - Use a Part with varied time offsets, not a Sequence
  - Heavy humanization (H(15) ms) on every fragment

- **Simple triads**: Jazz extended harmony is essential
  - Ebmaj9, Abmaj7#11, Fm11 - not Eb, Ab, Fm
  - The 9ths, 11ths, and 13ths ARE the sound
  - Close voicings that blur into texture

- **Too much percussion**: This is not a dance track
  - Kick is a gentle pulse, not a driving force
  - Hats are barely there - brushed texture, not rhythmic
  - The groove should be felt as breathing, not as a beat

- **No filter movement**: Filter sweeps are the primary dynamic tool
  - Rhodes lowpass should evolve slowly (2000 to 4000Hz over bars)
  - This is how energy builds without adding elements
  - Static filters make the track feel dead

- **Abrupt entrances or exits**: Everything fades in and out
  - Long attack envelopes (pad: 3s, lead: slow ramp)
  - Elements should appear like they were always there
  - Nothing enters suddenly - this is the antithesis of a drop

- **Missing the noise bed**: The textural foundation is essential
  - Pink noise through bandpass creates the warm organic ground
  - Without it, the Rhodes and synths float in clinical digital space
  - It should be barely perceptible but deeply felt

### Mixing Approach

- **Texture Bed**: 0.04 gain, pink noise bandpassed at 1200Hz (Q: 0.8), constant
- **Rhodes**: -10dB, FM synth (mod index 0.8), through chorus (0.6Hz, 20% wet) + autofilter (2000-4000Hz)
- **Sub-Bass**: -6dB, pure sine, clean bus through limiter, long attack (60ms)
- **Pad Wash**: -16dB, triangle wave, very slow attack (3s), lowpassed at 1400Hz
- **Tonal Kick**: -8dB, soft pitch decay (0.06s), half-note pulse, not driving
- **Brushed Hat**: -20dB, white noise highpassed at 6kHz, sparse pattern (65% hit rate)
- **Melodic Fragments**: -14dB, sine pluck, dotted 8th delay (25% feedback, 18% wet)

**Effects:**
- Warm Reverb: 4.5s decay, 38% wet (primary space)
- Short Reverb: 1.8s decay, 22% wet (percussion clarity)
- Rhodes Chorus: 0.6Hz, 20% wet (shimmer without wash)
- Fragment Delay: Dotted 8th ping-pong, 25% feedback, 18% wet
- Limiter: -3dB threshold
- Glue: 2.5:1 ratio, -16dB threshold

### Reference Tracks

1. **Floating Points - Crush** - The definitive statement: 45 minutes of one harmonic idea, infinite patience
2. **Floating Points - Silhouettes (i, ii, iii)** - Jazz harmony meets electronic texture, Rhodes warmth
3. **Floating Points - LesAlpx** - Rhythmic patience building to ecstatic release, filter-driven dynamics
4. **Floating Points - Ratio** - Extended single-idea exploration, textural accumulation
5. **Floating Points - Last Bloom** - Organic arpeggio fragments, warm sub-bass, jazz-inflected electronic

### Structural Blueprint (60s @ 102 BPM = ~17 bars)

- **Bars 0-3 (Texture Bed)**: Pink noise + pad wash only
  - Warm noise texture establishes the acoustic space
  - Pad fades in slowly (3s attack)
  - No rhythm, no melody - just warmth and space
  - The listener settles into the environment

- **Bars 3-7 (Rhodes Enters)**: Extended jazz chords + sub-bass hum + gentle pulse
  - Ebmaj9 voicing appears through the texture
  - Sub-bass adds harmonic gravity at bar 5
  - Soft kick introduces a breathing pulse at half notes
  - Still sparse - the chord IS the composition

- **Bars 7-13 (Organic Accumulation)**: Brushed hats + arpeggio fragments layer in
  - Hat texture adds subtle high-frequency motion at bar 7
  - Arpeggio fragments begin at bar 9 with irregular timing
  - Rhodes filter slowly opens (2000 to 4000Hz)
  - Energy builds through filter position, not volume

- **Bars 13-15 (Peak Breathing)**: All elements active, maximum filter openness
  - Not a climax - a fullness
  - Every element present but restrained
  - The harmony shimmers with all overtones audible
  - Peak is about timbre, not intensity

- **Bars 15-17 (Dissolve)**: Fragments stop, filter closes, return to texture
  - Arpeggio fragments and hats fade at bar 15
  - Rhodes filter closes back to 2000Hz
  - Kick and sub exit at bar 16
  - Returns to pad + texture bed for seamless loop

### Tonal Characteristics

- **Harmonic**: Eb major with jazz extensions (Ebmaj9 → Abmaj7#11 → Fm11 → Bbsus4), warm and luminous
- **Melodic**: Irregular arpeggio fragments in Eb major pentatonic, improvised feel rather than composed line
- **Rhythmic**: Gentle half-note kick pulse, sparse brushed hats, rhythm serves texture not groove
- **Textural**: Pink noise foundation, Rhodes FM warmth, chorus shimmer, reverb as architecture
- **Dynamic**: Filter sweeps drive energy arc, elements fade in/out rather than start/stop, breathing not building
- **Production**: Warm, organic, patient - jazz club intimacy meets electronic spatial precision
