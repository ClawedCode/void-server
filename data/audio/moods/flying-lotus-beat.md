---
category: experimental
energy: medium
tags: [wonky, jazz, beat-music, psychedelic, off-grid]
---
## Flying Lotus (Experimental Beat Music)

**Tempo**: 80-160 BPM (tempo-fluid, often half-time feel over fast hi-hats)
**Time Signature**: 4/4 but heavily syncopated (off-grid, swing pushed to extremes)
**Key**: Minor 7th / jazz voicings (Dm9, Cm11 - rich, extended harmonics)
**Instruments**: Off-grid kick and snare, jazzy Rhodes/Wurlitzer chords, wobbly bass, pitched vocal texture, glitchy hi-hats, warm sub-bass, detuned synth lead, vinyl texture
**Structure**: Jazz chord intro → Wonky beat drops → Layers stack → Psychedelic breakdown → Groove returns → Fade to static
**Vibe**: A fever dream in a jazz club that exists between dimensions. Wonky beats that feel drunk but are meticulously placed, jazz harmonics filtered through a psychedelic digital lens, bass that wobbles like reality itself is unstable. FlyLo's Cosmogramma-meets-Los Angeles sound - Coltrane and J Dilla meeting in a wormhole. Beats that make your head nod sideways instead of up and down.

### Key Characteristics

1. **Off-Grid Beats**: Kicks and snares placed BETWEEN grid lines - nothing quantized
2. **Jazz Harmonics**: Extended chords (9ths, 11ths, 13ths) - not simple triads
3. **Wobbly Bass**: Frequency modulation on bass creating unstable, organic movement
4. **Tempo Fluidity**: Half-time feel sections over fast hi-hat patterns
5. **Layered Textures**: Vinyl crackle, pitched vocals, glitch fragments all coexisting
6. **Dynamic Swing**: Extreme humanization on timing - each hit slightly different
7. **Psychedelic Breaks**: Moments where rhythm dissolves into texture
8. **Warm Production**: Despite digital techniques, overall sound is warm and enveloping

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 88;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.4; // Heavy swing

  // Aggressive humanization
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.82).toDestination();

  const glue = new Tone.Compressor({
    ratio: 3,
    threshold: -16,
    attack: 0.008,
    release: 0.2
  }).connect(master);

  // === WARM REVERB ===
  const warmVerb = new Tone.Reverb({
    decay: 2.8,
    preDelay: 0.02,
    wet: 0.28
  });
  await warmVerb.generate();
  warmVerb.connect(glue);

  // Phaser for psychedelic moments
  const phaser = new Tone.Phaser({
    frequency: 0.3,
    octaves: 3,
    baseFrequency: 350,
    wet: 0.15
  }).connect(warmVerb);

  // Chorus for Rhodes warmth
  const rhodesChorus = new Tone.Chorus({
    frequency: 1.2,
    delayTime: 4.5,
    depth: 0.5,
    wet: 0.3
  }).connect(warmVerb);
  rhodesChorus.start();

  // Clean bus
  const cleanBus = new Tone.Gain(1).connect(master);

  // === VINYL TEXTURE ===
  const vinyl = new Tone.Noise("brown");
  const vinylFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 1800,
    Q: 0.8
  }).connect(new Tone.Gain(0.04).connect(glue));
  vinyl.connect(vinylFilter);
  vinyl.start();

  // === RHODES/WURLITZER (jazz chords) ===
  const rhodes = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 2,
    modulationIndex: 1.2,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 0.008,
      decay: 1.2,
      sustain: 0.3,
      release: 1.5
    },
    volume: -10
  }).connect(rhodesChorus);

  // === WOBBLY BASS (FM modulated) ===
  const bassLFO = new Tone.LFO({
    frequency: 2.5,
    min: 0.8,
    max: 3.5,
    type: "sine"
  });

  const bass = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 2,
    oscillator: { type: "sine" },
    modulation: { type: "triangle" },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.5,
      release: 0.3
    },
    volume: -5
  }).connect(cleanBus);
  bassLFO.connect(bass.modulationIndex);
  bassLFO.start();

  // === DETUNED SYNTH LEAD ===
  const lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.3,
      release: 0.8
    },
    volume: -14
  }).connect(phaser);

  // === PITCHED VOCAL TEXTURE (synth approximation) ===
  const vocalTex = new Tone.FMSynth({
    harmonicity: 3,
    modulationIndex: 6,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 0.1,
      decay: 0.6,
      sustain: 0.2,
      release: 1.5
    },
    volume: -18
  }).connect(warmVerb);

  // === OFF-GRID KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 5,
    envelope: {
      attack: 0.001,
      decay: 0.35,
      sustain: 0
    },
    volume: -4
  }).connect(cleanBus);

  // === SNARE (warm, not snappy) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: {
      attack: 0.002,
      decay: 0.15,
      sustain: 0
    },
    volume: -8
  }).connect(warmVerb);

  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 3,
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0
    },
    volume: -12
  }).connect(warmVerb);

  // === GLITCHY HI-HAT ===
  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: {
      attack: 0.001,
      decay: 0.04,
      release: 0.02
    },
    harmonicity: 5.3,
    modulationIndex: 25,
    resonance: 5500,
    volume: -16
  }).connect(glue);

  // === JAZZ CHORD PROGRESSION (extended voicings) ===
  const chordProg = [
    { time: "0:0:0", chord: ["D3", "F3", "A3", "C4", "E4"] },    // Dm9
    { time: "2:0:0", chord: ["Bb2", "D3", "F3", "A3", "C4"] },   // Bbmaj9
    { time: "4:0:0", chord: ["G2", "Bb2", "D3", "F3", "A3"] },   // Gm9
    { time: "6:0:0", chord: ["A2", "C#3", "E3", "G3", "B3"] }    // A9 (tension)
  ];
  const chordPart = new Tone.Part((time, ev) => {
    rhodes.triggerAttackRelease(ev.chord, "2m", time + H(15), 0.5);
  }, chordProg);
  chordPart.loop = true;
  chordPart.loopEnd = "8m";

  // === OFF-GRID KICK PATTERN (wonky, displaced) ===
  const kickEvents = [
    { time: "0:0:0.5", vel: 0.85 },
    { time: "0:1:3", vel: 0.65 },
    { time: "0:3:1", vel: 0.8 },
    { time: "1:0:0.3", vel: 0.9 },
    { time: "1:2:2.5", vel: 0.7 },
    { time: "1:3:1.5", vel: 0.6 }
  ];
  const kickPart = new Tone.Part((time, ev) => {
    kick.triggerAttackRelease("D1", "8n", time + H(12), ev.vel);
  }, kickEvents);
  kickPart.loop = true;
  kickPart.loopEnd = "2m";

  // === SNARE (off-grid, jazzy) ===
  const snareEvents = [
    { time: "0:1:1", vel: 0.75 },
    { time: "0:3:2", vel: 0.7 },
    { time: "1:1:0.5", vel: 0.8 },
    { time: "1:2:3.5", vel: 0.5 },
    { time: "1:3:1", vel: 0.65 }
  ];
  const snarePart = new Tone.Part((time, ev) => {
    snare.triggerAttackRelease("16n", time + H(15), ev.vel);
    snareBody.triggerAttackRelease("C4", "32n", time + H(8), ev.vel * 0.5);
  }, snareEvents);
  snarePart.loop = true;
  snarePart.loopEnd = "2m";

  // === GLITCHY HAT PATTERN (fast, irregular) ===
  const hatSeq = new Tone.Sequence((time, hit) => {
    if (hit && Math.random() > 0.2) {
      const vel = 0.2 + Math.random() * 0.25;
      hat.triggerAttackRelease("64n", time + H(10), vel);
    }
  }, [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0], "16n");
  hatSeq.loop = true;
  hatSeq.loopEnd = "1m";

  // === WOBBLY BASS PATTERN ===
  const bassNotes = [
    { time: "0:0:0", note: "D2", dur: "4n" },
    { time: "0:1:2", note: "F2", dur: "8n" },
    { time: "0:2:0", note: "D2", dur: "4n" },
    { time: "0:3:1", note: "A1", dur: "8n" },
    { time: "1:0:0", note: "Bb1", dur: "4n" },
    { time: "1:2:0", note: "G1", dur: "4n" },
    { time: "1:3:2", note: "A1", dur: "8n" }
  ];
  const bassPart = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.note, ev.dur, time + H(8), 0.8);
  }, bassNotes);
  bassPart.loop = true;
  bassPart.loopEnd = "2m";

  // === SPARSE LEAD FRAGMENTS ===
  const leadPart = new Tone.Part((time, ev) => {
    lead.triggerAttackRelease(ev.note, ev.dur, time + H(12), 0.45);
  }, [
    { time: "2:0:0", note: "A4", dur: "4n" },
    { time: "4:2:0", note: "F4", dur: "8n" },
    { time: "6:0:0", note: "D5", dur: "4n" },
    { time: "9:3:0", note: "C5", dur: "8n" },
    { time: "12:0:0", note: "E4", dur: "4n" }
  ]);
  leadPart.loop = true;
  leadPart.loopEnd = "16m";

  // === VOCAL TEXTURE (occasional, ethereal) ===
  const vocalPart = new Tone.Part((time, ev) => {
    vocalTex.triggerAttackRelease(ev.note, ev.dur, time, 0.3);
  }, [
    { time: "3:0:0", note: "D4", dur: "2n" },
    { time: "7:0:0", note: "F4", dur: "2n" },
    { time: "11:0:0", note: "A4", dur: "2n" }
  ]);
  vocalPart.loop = true;
  vocalPart.loopEnd = "16m";

  // === ARRANGEMENT (60s @ 88 BPM = ~14 bars) ===

  // Bars 0-2: Jazz chords + vinyl only
  chordPart.start("0:0:0");

  // Bars 2-4: Wonky beat drops
  Tone.Transport.schedule((t) => {
    kickPart.start(t);
    snarePart.start(t);
    bassPart.start(t);
  }, "2:0:0");

  // Bars 4-6: Hats + lead fragments
  Tone.Transport.schedule((t) => {
    hatSeq.start(t);
    leadPart.start(t);
    vocalPart.start(t);
  }, "4:0:0");

  // Bars 8-10: Psychedelic breakdown - increase phaser
  Tone.Transport.schedule((t) => {
    phaser.wet.linearRampToValueAtTime(0.45, t + Tone.Time("2m").toSeconds());
  }, "8:0:0");

  // Bars 10-12: Return from breakdown
  Tone.Transport.schedule((t) => {
    phaser.wet.linearRampToValueAtTime(0.15, t + Tone.Time("2m").toSeconds());
  }, "10:0:0");

  // Bars 12-14: Wind down
  Tone.Transport.schedule((t) => {
    hatSeq.stop(t + Tone.Time("1m").toSeconds());
    leadPart.stop(t + Tone.Time("1m").toSeconds());
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { rhodes, bass, bassLFO, lead, vocalTex, kick, snare, snareBody, hat, vinyl, warmVerb, phaser, rhodesChorus };
  window.toneJsParts = { chordPart, kickPart, snarePart, hatSeq, bassPart, leadPart, vocalPart };
};
```

### Common Mistakes to Avoid

- **Quantized beats**: FlyLo beats are NEVER on the grid
  - Every kick and snare displaced by fractions of a 16th
  - Use heavy humanization (H(12-15) ms)
  - If it sounds metronomic, it's wrong

- **Simple chords**: Jazz harmonics are essential
  - Use 9ths, 11ths, 13ths - NOT simple triads
  - Dm9, Bbmaj9, Gm9 - rich, extended voicings
  - The harmony should feel like it's melting

- **Clean bass**: Bass needs FM wobble
  - LFO on modulation index creates organic movement
  - Not dubstep wobble - subtle, warm instability
  - The bass should breathe and shift

- **Standard drum patterns**: This is NOT boom-bap or 4-on-floor
  - Kicks between grid lines
  - Snares displaced and syncopated
  - Hi-hats irregular and glitchy
  - The groove should feel tipsy, not drunk

- **Missing warmth**: Despite the glitch, FlyLo is WARM
  - Pink noise snare (not white)
  - Rhodes chorus for analog feel
  - Vinyl texture throughout
  - Overall tone is amber, not clinical

- **Too much phaser/effect**: Psychedelic moments are brief
  - Phaser increases for 2-4 bars then returns
  - Effects serve the groove, not the other way around
  - Most of the track is about the BEAT

### Mixing Approach

- **Rhodes**: -10dB, FM synth through chorus (1.2Hz, 30% wet), warm reverb
- **Wobbly Bass**: -5dB, FM synth with LFO on mod index (2.5Hz), clean bus
- **Detuned Lead**: -14dB, sawtooth through phaser (0.3Hz, 15% wet), sparse
- **Vocal Texture**: -18dB, FM synth, occasional ethereal hits through reverb
- **Kick**: -4dB, off-grid placement, extended pitch decay, clean bus
- **Snare**: -8dB, pink noise + body, off-grid, warm reverb
- **Hi-Hat**: -16dB, glitchy irregular pattern, 80% hit rate
- **Vinyl**: 0.04 gain, bandpass at 1800Hz, constant

**Effects:**
- Warm Reverb: 2.8s decay, 28% wet
- Phaser: 0.3Hz, 15% wet (increases to 45% in breakdown)
- Rhodes Chorus: 1.2Hz, 30% wet
- Glue Compression: 3:1, -16dB threshold

### Reference Tracks

1. **Flying Lotus - Zodiac Shit** - Wonky beats, jazz harmonics, psychedelic textures
2. **Flying Lotus - Never Catch Me** - Off-grid drums, Thundercat bass, kinetic energy
3. **Flying Lotus - Coronus, The Terminator** - Dark, textural, off-kilter groove
4. **Flying Lotus - Do the Astral Plane** - Glitchy, playful, tempo-fluid
5. **Thundercat - Them Changes** - Bass-driven jazz-funk, warm production (FlyLo-adjacent)

### Structural Blueprint (60s @ 88 BPM = ~14 bars)

- **Bars 0-2 (Jazz Intro)**: Rhodes chords + vinyl texture
  - Extended jazz voicings establish the harmonic world
  - Vinyl crackle provides warmth
  - No rhythm yet - head-nodding anticipation

- **Bars 2-4 (Beat Drops)**: Wonky kick + snare + bass enter
  - Off-grid drums create the groove
  - Wobbly FM bass adds harmonic depth
  - Lopsided feel - hip-hop meets jazz

- **Bars 4-8 (Full Stack)**: Hats + lead fragments + vocal textures
  - Maximum groove density
  - Glitchy hats fill the high end
  - Lead and vocal fragments add color
  - This is where heads nod

- **Bars 8-10 (Psychedelic Breakdown)**: Phaser increases, groove becomes watery
  - Phaser wet increases (15% → 45%)
  - Beat continues but sounds submerged
  - Brief cosmic detour

- **Bars 10-12 (Return)**: Phaser recedes, groove refocuses
  - Return to clarity
  - Beat hits with renewed impact
  - Harmonic cycle continues

- **Bars 12-14 (Fade to Static)**: Strip hats + lead, return to chords
  - Thin back to Rhodes + bass + kick
  - Matches opening energy
  - Seamless loop back to jazz intro

### Tonal Characteristics

- **Harmonic**: Jazz voicings in D minor (Dm9 → Bbmaj9 → Gm9 → A9), rich and extended
- **Melodic**: Sparse detuned lead fragments, vocal textures, not traditional melody
- **Rhythmic**: Off-grid beats with heavy swing (0.4), everything displaced
- **Textural**: Vinyl warmth, FM wobble, phaser psychedelia, Rhodes chorus
- **Dynamic**: Groove-focused with brief psychedelic departures
- **Production**: Warm, amber-toned, analog-feeling despite digital precision
