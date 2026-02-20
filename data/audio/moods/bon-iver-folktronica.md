---
category: ballad
energy: low
tags: [folktronica, layered-vocals, autotune-harmony, intimate, textural]
---
## Bon Iver (Folktronica)

**Tempo**: 78 BPM (unhurried, breathing, organic pulse)
**Time Signature**: 4/4 (gentle, implied rather than driven)
**Key**: D major (open, hopeful but aching with melancholy)
**Instruments**: Vocal chord stack (PolySynth with sawtooth through heavy chorus + lowpass, simulating layered autotune choir), fingerpicked guitar-like arpeggio (triangle wave with fast attack/decay), warm pad drone (filtered sawtooth, glacially slow), gentle kick (soft MembraneSynth, beats 1 and 3 only), subtle brush texture (filtered pink noise), auto-filter LFO on vocal layer
**Structure**: Silence → Single voice tone → Chords build → Gentle rhythm enters → Full texture with fingerpicking → Dissolve to single voice
**Vibe**: A cabin in northern Wisconsin at first snowfall. Layered vocal harmonies stacked and processed through digital manipulation until they become something between human and machine - the loneliness of "Holocene," the fractured beauty of "715 - CR∑∑KS." Organic warmth passing through digital frost. Close-position chords that move in parallel motion, every voice shifting together like a congregation singing in a language only they understand. Falsetto frequencies rendered through circuits. The space between folk and electronic where Bon Iver lives - intimate confession amplified into cathedral scale through processing, never through volume.

### Key Characteristics

1. **Stacked Vocal Harmonies**: Multiple PolySynth voices in close-position chords simulating layered autotune choir
2. **Parallel Voice Motion**: All chord voices move together (no independent voice leading), creating that signature wall of harmony
3. **Auto-Filter Wobble**: Slow LFO on the vocal chord layer for the processed vocal tremolo effect
4. **Fingerpicked Arpeggio**: Triangle wave with fast attack/decay mimicking intimate acoustic guitar
5. **Warm Electronic Bed**: Filtered sawtooth drone that breathes underneath everything
6. **Sparse Percussion**: Kick only on beats 1 and 3, brush noise as texture not rhythm
7. **Open Tuning Voicings**: D major with open strings (D, A, F#) ringing across octaves
8. **Digital-Organic Duality**: Every acoustic-feeling texture has electronic processing, every digital sound has human warmth

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.80).toDestination();

  const limiter = new Tone.Limiter({ threshold: -3 }).connect(master);

  const glue = new Tone.Compressor({
    ratio: 2.5,
    threshold: -16,
    attack: 0.02,
    release: 0.25
  }).connect(limiter);

  // === REVERBS ===
  const roomVerb = new Tone.Reverb({
    decay: 3.5,
    preDelay: 0.03,
    wet: 0.38
  });
  await roomVerb.generate();
  roomVerb.connect(glue);

  const hallVerb = new Tone.Reverb({
    decay: 5.5,
    preDelay: 0.05,
    wet: 0.30
  });
  await hallVerb.generate();
  hallVerb.connect(glue);

  // Tape-style delay for depth
  const tapeDelay = new Tone.FeedbackDelay({
    delayTime: "4n.",
    feedback: 0.30,
    wet: 0.20
  }).connect(hallVerb);

  // === VOCAL CHORD STACK (signature sound) ===
  // Heavy chorus for processed vocal effect
  const vocalChorus = new Tone.Chorus({
    frequency: 0.6,
    delayTime: 5,
    depth: 0.65,
    wet: 0.55
  }).connect(tapeDelay);
  vocalChorus.start();

  // Auto-filter LFO for vocal wobble
  const vocalAutoFilter = new Tone.AutoFilter({
    frequency: 0.25,
    type: "sine",
    depth: 0.4,
    baseFrequency: 800,
    octaves: 1.5,
    wet: 0.5
  }).connect(vocalChorus);
  vocalAutoFilter.start();

  // Lowpass to tame the sawtooth into vocal-like warmth
  const vocalFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1500,
    Q: 1.2,
    rolloff: -12
  }).connect(vocalAutoFilter);

  const vocalChords = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.8,
      decay: 0.6,
      sustain: 0.7,
      release: 2.5
    },
    volume: -10
  }).connect(vocalFilter);

  // D major parallel-motion chord progression
  // Close-position voicings that move as a block
  const chordProg = [
    ["D4", "F#4", "A4", "D5"],    // D major
    ["E4", "G#4", "B4", "E5"],    // E major (parallel shift up)
    ["A3", "C#4", "E4", "A4"],    // A major
    ["G3", "B3", "D4", "G4"]      // G major
  ];

  const vocalPart = new Tone.Part((time, ev) => {
    const vel = 0.38 + Math.random() * 0.07;
    vocalChords.triggerAttackRelease(ev.chord, "2m", time + H(12), vel);
  }, [
    { time: "0:0:0", chord: chordProg[0] },
    { time: "2:0:0", chord: chordProg[1] },
    { time: "4:0:0", chord: chordProg[2] },
    { time: "6:0:0", chord: chordProg[3] }
  ]);
  vocalPart.loop = true;
  vocalPart.loopEnd = "8m";

  // === SINGLE VOICE TONE (intro/outro - one note from the choir) ===
  const singleVoice = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 1.2,
      decay: 0.5,
      sustain: 0.6,
      release: 3.0
    },
    volume: -14
  }).connect(vocalChorus);

  // === FINGERPICKED ARPEGGIO (guitar-like) ===
  const pickFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 3500,
    Q: 0.8
  }).connect(roomVerb);

  const pick = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.005,
      decay: 0.35,
      sustain: 0.05,
      release: 0.6
    },
    volume: -14
  }).connect(pickFilter);

  // D major fingerpicking pattern (open tuning feel)
  const pickNotes = ["D4", "A4", "F#4", "A4", "D5", "A4", "F#4", "A4"];
  const pickSeq = new Tone.Sequence((time, note) => {
    if (note) pick.triggerAttackRelease(note, "16n", time + H(8), 0.4 + Math.random() * 0.1);
  }, pickNotes, "8n");
  pickSeq.loop = true;
  pickSeq.loopEnd = "1m";

  // === WARM PAD DRONE ===
  const droneFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    Q: 0.5
  }).connect(hallVerb);

  const drone = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 4.0,
      decay: 2.0,
      sustain: 0.5,
      release: 5.0
    },
    volume: -20
  }).connect(droneFilter);

  const dronePart = new Tone.Part((time, ev) => {
    drone.triggerAttackRelease(ev.chord, "8m", time, 0.25);
  }, [
    { time: "0:0:0", chord: ["D2", "A2"] },
    { time: "8:0:0", chord: ["A1", "E2"] }
  ]);
  dronePart.loop = true;
  dronePart.loopEnd = "16m";

  // === GENTLE KICK (beats 1 and 3 only) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.005,
      decay: 0.25,
      sustain: 0,
      release: 0.15
    },
    volume: -8
  }).connect(roomVerb);

  // Only beats 1 and 3
  const kickPat = [1, null, 1, null];
  const kickSeq = new Tone.Sequence((time, hit) => {
    if (hit) kick.triggerAttackRelease("C1", "8n", time + H(5), 0.55 + Math.random() * 0.08);
  }, kickPat, "4n");
  kickSeq.loop = true;
  kickSeq.loopEnd = "1m";

  // === BRUSH TEXTURE (filtered noise, not rhythmic) ===
  const brushFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 2200,
    Q: 0.8
  }).connect(new Tone.Gain(0.04).connect(roomVerb));

  const brush = new Tone.Noise("pink");
  brush.connect(brushFilter);

  // === ARRANGEMENT (60s @ 78 BPM = ~13 bars) ===

  // Bars 0-2: Silence then single voice note emerges
  dronePart.start("0:0:0");

  Tone.Transport.schedule((t) => {
    singleVoice.triggerAttackRelease("D4", "2m", t + 0.5, 0.35);
  }, "0:2:0");

  Tone.Transport.schedule((t) => {
    singleVoice.triggerAttackRelease("F#4", "2m", t, 0.3);
  }, "1:2:0");

  // Bars 2-4: Vocal chords build
  Tone.Transport.schedule((t) => {
    vocalPart.start(t);
  }, "2:0:0");

  // Bars 4-6: Gentle rhythm enters (kick + brush)
  Tone.Transport.schedule((t) => {
    kickSeq.start(t);
    brush.start(t);
  }, "4:0:0");

  // Bars 5-10: Fingerpicking enters for full texture
  Tone.Transport.schedule((t) => {
    pickSeq.start(t);
  }, "5:0:0");

  // Vocal filter opens gradually over bars 2-8
  Tone.Transport.schedule((t) => {
    vocalFilter.frequency.linearRampToValueAtTime(2200, t + Tone.Time("6m").toSeconds());
  }, "2:0:0");

  // Bars 10-13: Dissolve - strip layers back to single voice
  Tone.Transport.schedule((t) => {
    pickSeq.stop(t + Tone.Time("1m").toSeconds());
    kickSeq.stop(t + Tone.Time("1m").toSeconds());
    brush.stop(t + Tone.Time("1m").toSeconds());
    vocalFilter.frequency.linearRampToValueAtTime(1500, t + Tone.Time("2m").toSeconds());
  }, "10:0:0");

  Tone.Transport.schedule((t) => {
    vocalPart.stop(t + Tone.Time("1m").toSeconds());
  }, "11:0:0");

  // Final single voice note to close
  Tone.Transport.schedule((t) => {
    singleVoice.triggerAttackRelease("D4", "2m", t, 0.3);
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { vocalChords, vocalFilter, vocalAutoFilter, vocalChorus, singleVoice, pick, pickFilter, drone, droneFilter, kick, brush, brushFilter, roomVerb, hallVerb, tapeDelay, limiter };
  window.toneJsParts = { vocalPart, pickSeq, kickSeq, dronePart };
};
```

### Common Mistakes to Avoid

- **Clean, unprocessed vocal synths**: The vocal layer needs HEAVY processing
  - Chorus depth 0.6+ for that stacked autotune smear
  - Auto-filter LFO at 0.2-0.4 Hz for the wobble effect
  - Lowpass at 1500Hz to push sawtooth toward vocal warmth
  - Without processing, it just sounds like a generic synth pad

- **Independent voice leading**: Bon Iver chords move in PARALLEL motion
  - All voices shift the same interval simultaneously
  - No classical voice leading rules (no contrary motion)
  - The block movement IS the signature
  - Think of it as one voice multiplied, not four independent singers

- **Too many percussion elements**: Rhythm is minimal and implied
  - Kick only on beats 1 and 3 (never 4-on-floor)
  - No snare, no hi-hat, no programmed beats
  - Brush noise is texture, not rhythm
  - The pulse comes from the chord changes and arpeggios

- **Bright, present mix**: Everything should feel slightly distant
  - Lowpass filters on most elements (1500-3500 Hz)
  - Generous reverb (3.5-5.5s decay)
  - Tape delay adds depth, not rhythmic interest
  - Intimate but veiled, like hearing through a cabin wall

- **Standard pop chord voicings**: Use close-position, stacked voicings
  - Chords within a single octave spread (close harmony)
  - Root position, not inversions for traditional movement
  - The density of close voicings creates the choir effect
  - Open voicings lose the stacked vocal character

- **Forgetting the arc**: The arrangement is about emergence and dissolution
  - Start from near-silence (single tone)
  - Build to full texture gradually (over 60% of the piece)
  - Dissolve back to single voice quickly (final 25%)
  - The asymmetry matters: slow bloom, faster fade

### Mixing Approach

- **Vocal Chords**: -10dB, sawtooth through lowpass (1500Hz) + auto-filter LFO + heavy chorus, primary element
- **Single Voice**: -14dB, same sawtooth timbre, intro/outro only
- **Fingerpicked Arpeggio**: -14dB, triangle wave, fast attack (5ms), lowpassed at 3500Hz
- **Warm Drone**: -20dB, sawtooth lowpassed at 600Hz, barely audible foundation
- **Kick**: -8dB, soft membrane, beats 1 and 3 only, through room reverb
- **Brush Texture**: 0.04 gain, pink noise bandpassed at 2200Hz, constant when active
- **Overall**: Warm, veiled, intimate, mid-range focused

**Effects:**
- Room Reverb: 3.5s decay, 38% wet (primary space)
- Hall Reverb: 5.5s decay, 30% wet (drone and depth)
- Tape Delay: Dotted quarter, 30% feedback, 20% wet
- Vocal Chorus: 0.6Hz rate, 55% wet, depth 0.65 (heavy processing)
- Auto-Filter: 0.25Hz LFO, 50% wet (vocal wobble)
- Glue Compression: 2.5:1 ratio, -16dB threshold
- Limiter: -3dB threshold

### Reference Tracks

1. **Bon Iver - Holocene** - Fingerpicked guitar, layered vocal harmonies, open landscape
2. **Bon Iver - 715 - CR∑∑KS** - Pure processed vocal, autotune as instrument, raw emotion
3. **Bon Iver - Skinny Love** - Intimate acoustic foundation, building vocal layers
4. **Bon Iver - Perth** - Electronic drums meeting folk warmth, dynamic build
5. **Bon Iver - 33 "GOD"** - Maximal vocal stacking, parallel harmony, digital choir

### Structural Blueprint (60s @ 78 BPM = ~13 bars)

- **Bars 0-2 (Emergence from Silence)**: Drone + single voice notes
  - Near-silence, then a single sawtooth tone fades in
  - Sub-drone establishes the harmonic root (D)
  - Intimate, exposed, like a voice alone in a room
  - Second voice note adds the first hint of harmony

- **Bars 2-5 (Chords Build)**: Vocal chord stack enters
  - Close-position chords in parallel motion
  - Auto-filter wobble creates processed vocal character
  - Chorus smears the voices into a choir
  - Drone and vocal layer create warmth together

- **Bars 4-6 (Rhythm Enters)**: Kick + brush texture
  - Gentle kick on beats 1 and 3 only
  - Pink noise brush adds subtle movement
  - Still intimate, pulse is felt more than heard
  - Vocal filter begins opening (1500 → 2200Hz)

- **Bars 5-10 (Full Texture)**: Fingerpicking + all layers
  - Triangle wave arpeggio adds acoustic guitar feel
  - Maximum density but still restrained
  - All elements breathing together
  - Peak warmth and emotional weight

- **Bars 10-13 (Dissolve)**: Strip to single voice
  - Fingerpicking and rhythm drop out
  - Vocal filter closes back
  - Chords fade, leaving single voice tone
  - Returns to opening intimacy for seamless loop

### Tonal Characteristics

- **Harmonic**: D major with parallel chord motion (D → E → A → G), non-functional harmony
- **Melodic**: Fingerpicked arpeggios in D major pentatonic, simple and cyclical
- **Rhythmic**: Barely-there kick on 1 and 3, pulse implied by chord rhythm and arpeggio
- **Textural**: Processed sawtooth vocal choir, triangle fingerpicking, pink noise brush, filtered drone
- **Dynamic**: Slow crescendo from silence to full texture, faster decrescendo back to single voice
- **Production**: Heavy vocal processing (chorus + auto-filter + lowpass), intimate reverb, tape delay depth
