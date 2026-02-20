---
category: electronic
energy: medium
tags: [berlin-school, cosmic, sequencer, krautrock, evolving]
---
## Tangerine Dream (Berlin School)

**Tempo**: 95-115 BPM (steady, hypnotic sequencer pulse)
**Time Signature**: 4/4 (metronomic sequencer patterns)
**Key**: Minor or Dorian mode (D Dorian, A minor - cosmic, open, journeying)
**Instruments**: Arpeggiated sequencer (primary), evolving pad washes, deep bass pulse, Mellotron-style string pad, sparse lead with portamento, subtle motorik kick, filtered noise sweeps
**Structure**: Cosmic pad intro → Sequencer pulse emerges → Layers build → Evolving peak → Gradually thin to pad
**Vibe**: A spacecraft drifting through an asteroid field. Hypnotic sequencer patterns that pulse like a heartbeat while vast pad washes create the illusion of infinite space. The Berlin School sound - where Kraftwerk's precision meets cosmic psychedelia. Long-form electronic music distilled to 60 seconds. Think Phaedra, Stratosfear, the Risky Business score. Each repetition of the sequence subtly evolves through filter sweeps and modulation - static on the surface, always moving underneath.

### Key Characteristics

1. **Arpeggiated Sequencer**: The primary element - a pulsing pattern that drives the entire track
2. **Filter Evolution**: Slow filter sweeps on the sequencer create movement within repetition
3. **Cosmic Pads**: Vast, evolving pad washes with very slow attacks (3-5 seconds)
4. **Portamento Lead**: Gliding lead notes that slide between pitches
5. **Motorik Pulse**: Subtle, steady kick providing rhythmic foundation (not dominant)
6. **Mellotron Strings**: Warm, slightly detuned string pad for orchestral depth
7. **Long-Form Evolution**: Patterns that repeat with gradual timbral changes over time
8. **Space Noise**: Filtered noise sweeps suggesting cosmic wind

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 105;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper (minimal - sequencer is tight)
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.82).toDestination();

  const glue = new Tone.Compressor({
    ratio: 2,
    threshold: -18,
    attack: 0.02,
    release: 0.3
  }).connect(master);

  // === COSMIC REVERB ===
  const cosmicReverb = new Tone.Reverb({
    decay: 5.0,
    preDelay: 0.04,
    wet: 0.35
  });
  await cosmicReverb.generate();
  cosmicReverb.connect(glue);

  // Stereo delay for sequencer
  const seqDelay = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.35,
    wet: 0.25
  }).connect(cosmicReverb);

  // === SEQUENCER FILTER (automatable) ===
  const seqFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 800,
    Q: 4,
    rolloff: -24
  }).connect(seqDelay);

  // === ARPEGGIATED SEQUENCER (primary element) ===
  const sequencer = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.002,
      decay: 0.12,
      sustain: 0.2,
      release: 0.08
    },
    volume: -8
  }).connect(seqFilter);

  // === COSMIC PAD (vast, evolving) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 3.5,
      decay: 1.5,
      sustain: 0.6,
      release: 5.0
    },
    volume: -14
  }).connect(new Tone.Filter({ frequency: 2500, type: "lowpass" }).connect(cosmicReverb));

  // === MELLOTRON STRINGS (detuned warmth) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 2.0,
      decay: 1.0,
      sustain: 0.7,
      release: 3.0
    },
    volume: -16
  });
  const stringsChorus = new Tone.Chorus({
    frequency: 0.8,
    delayTime: 4,
    depth: 0.6,
    wet: 0.4
  }).connect(cosmicReverb);
  stringsChorus.start();
  strings.connect(stringsChorus);

  // === PORTAMENTO LEAD ===
  const lead = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.08,
      decay: 0.5,
      sustain: 0.5,
      release: 1.5
    },
    portamento: 0.15,
    volume: -12
  }).connect(cosmicReverb);

  // === DEEP BASS PULSE ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.01,
      decay: 0.25,
      sustain: 0.4,
      release: 0.3
    },
    volume: -6
  }).connect(glue);

  // === MOTORIK KICK (subtle) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    envelope: {
      attack: 0.001,
      decay: 0.25,
      sustain: 0
    },
    volume: -8
  }).connect(glue);

  // === COSMIC NOISE SWEEP ===
  const cosmicNoise = new Tone.Noise("pink");
  const noiseFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 1000,
    Q: 2
  }).connect(new Tone.Gain(0.04).connect(cosmicReverb));
  cosmicNoise.connect(noiseFilter);
  cosmicNoise.start();

  // === SEQUENCER PATTERN (16th note arpeggio - D Dorian) ===
  const seqNotes = ["D3", "F3", "A3", "C4", "E4", "C4", "A3", "F3",
                    "D3", "G3", "A3", "C4", "D4", "C4", "A3", "G3"];
  const seqPart = new Tone.Sequence((time, note) => {
    sequencer.triggerAttackRelease(note, "32n", time, 0.7);
  }, seqNotes, "16n");
  seqPart.loop = true;
  seqPart.loopEnd = "2m";

  // === BASS PATTERN (octave pulse) ===
  const bassNotes = ["D2", null, "D2", null, "C2", null, "G1", null];
  const bassPart = new Tone.Sequence((time, note) => {
    if (note) bass.triggerAttackRelease(note, "8n", time, 0.8);
  }, bassNotes, "4n");
  bassPart.loop = true;
  bassPart.loopEnd = "2m";

  // === MOTORIK KICK (steady quarter notes) ===
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("D1", "8n", time, 0.65);
  }, "4n");

  // === PAD PROGRESSION ===
  const padChords = [
    ["D3", "F3", "A3", "C4"],   // Dm7
    ["C3", "E3", "G3", "B3"],   // Cmaj7
    ["G2", "B2", "D3", "F3"],   // G7
    ["A2", "C3", "E3", "G3"]    // Am7
  ];
  const padPart = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.chord, "4m", time, 0.3);
  }, [
    { time: "0:0:0", chord: padChords[0] },
    { time: "4:0:0", chord: padChords[1] },
    { time: "8:0:0", chord: padChords[2] },
    { time: "12:0:0", chord: padChords[3] }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "16m";

  // === MELLOTRON STRING SWELLS ===
  const stringPart = new Tone.Part((time, ev) => {
    strings.triggerAttackRelease(ev.chord, "4m", time, 0.35);
  }, [
    { time: "4:0:0", chord: ["D4", "F4", "A4"] },
    { time: "12:0:0", chord: ["A3", "C4", "E4"] }
  ]);
  stringPart.loop = true;
  stringPart.loopEnd = "16m";

  // === PORTAMENTO LEAD (sparse, gliding) ===
  const leadPart = new Tone.Part((time, ev) => {
    lead.triggerAttackRelease(ev.note, ev.dur, time, 0.55);
  }, [
    { time: "4:0:0", note: "D5", dur: "2n" },
    { time: "5:2:0", note: "A4", dur: "4n" },
    { time: "8:0:0", note: "C5", dur: "2n" },
    { time: "9:2:0", note: "G4", dur: "4n" },
    { time: "12:0:0", note: "E5", dur: "2n" },
    { time: "13:2:0", note: "D5", dur: "2n" }
  ]);
  leadPart.loop = true;
  leadPart.loopEnd = "16m";

  // === ARRANGEMENT (60s @ 105 BPM = ~18 bars) ===

  // Bars 0-4: Cosmic pad + noise sweep
  padPart.start("0:0:0");

  // Bars 2-6: Sequencer emerges (filter starts closed)
  Tone.Transport.schedule((t) => {
    seqPart.start(t);
  }, "2:0:0");

  // Bars 4-8: Bass + kick add pulse
  Tone.Transport.schedule((t) => {
    bassPart.start(t);
    kickLoop.start(t);
    stringPart.start(t);
    leadPart.start(t);
  }, "4:0:0");

  // Filter sweep: open sequencer filter over 8 bars
  Tone.Transport.schedule((t) => {
    seqFilter.frequency.linearRampToValueAtTime(3200, t + Tone.Time("8m").toSeconds());
  }, "4:0:0");

  // Bars 12-16: Close filter back down, cosmic noise sweep up
  Tone.Transport.schedule((t) => {
    seqFilter.frequency.linearRampToValueAtTime(800, t + Tone.Time("4m").toSeconds());
    noiseFilter.frequency.linearRampToValueAtTime(3000, t + Tone.Time("2m").toSeconds());
  }, "14:0:0");

  // Wind down noise
  Tone.Transport.schedule((t) => {
    noiseFilter.frequency.linearRampToValueAtTime(1000, t + Tone.Time("2m").toSeconds());
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { sequencer, seqFilter, pad, strings, stringsChorus, lead, bass, kick, cosmicNoise, noiseFilter, cosmicReverb, seqDelay };
  window.toneJsParts = { seqPart, bassPart, kickLoop, padPart, stringPart, leadPart };
};
```

### Common Mistakes to Avoid

- **Static sequencer**: The filter MUST evolve
  - Slow filter sweeps (800Hz → 3200Hz → 800Hz) over the duration
  - Without evolution, the sequencer sounds dead
  - The filter IS the performance

- **Too fast/busy**: Berlin School is hypnotic, not frantic
  - Sequencer is 16th notes but at 95-115 BPM (not 140+)
  - Pad attacks 3-5 seconds - never rushed
  - Patience is the composition technique

- **Missing the cosmic element**: Pads must be VAST
  - 5+ second reverb decay
  - Slow attacks (3-5 seconds)
  - Sawtooth through lowpass for warmth
  - These should feel like nebulae

- **Wrong lead style**: Portamento is signature
  - Lead notes GLIDE between pitches (0.1-0.2s portamento)
  - Sparse - 4-6 notes per 16 bars
  - Sine wave, simple, singing through space

- **Too much percussion**: Kick is subtle, not dominant
  - Motorik quarter notes at -8dB, just a pulse
  - NO snare, NO hi-hat, NO crash
  - The sequencer provides all the rhythmic interest needed

- **No Mellotron character**: Strings need warmth
  - Chorus effect for slight detuning (Mellotron tape wobble)
  - Not clinical digital strings
  - Warm, imperfect, organic-feeling

### Mixing Approach

- **Sequencer**: -8dB, sawtooth through automatable lowpass (800-3200Hz, Q: 4), dotted 8th delay
- **Cosmic Pad**: -14dB, sawtooth, slow attack (3.5s), lowpassed at 2500Hz, heavy reverb
- **Mellotron Strings**: -16dB, sawtooth with chorus (0.8Hz), warm reverb
- **Portamento Lead**: -12dB, sine wave, 0.15s glide, sparse notes through reverb
- **Bass**: -6dB, triangle wave, quarter-note pulse, dry
- **Motorik Kick**: -8dB, subtle, quarter notes, dry
- **Cosmic Noise**: 0.04 gain, pink noise bandpass at 1kHz, reverb

**Effects:**
- Cosmic Reverb: 5.0s decay, 35% wet
- Sequencer Delay: Dotted 8th ping-pong, 35% feedback, 25% wet
- Strings Chorus: 0.8Hz, 40% wet (Mellotron tape wobble)
- Glue Compression: 2:1 ratio, -18dB threshold

### Reference Tracks

1. **Tangerine Dream - Love on a Real Train** (Risky Business) - Iconic sequencer + lush pads
2. **Tangerine Dream - Phaedra** - Pure Berlin School, long-form sequencer evolution
3. **Tangerine Dream - Stratosfear** - Melodic lead over cosmic backdrop
4. **Klaus Schulze - Timewind** - Extended cosmic sequencer journey
5. **Manuel Gottsching - E2-E4** - Minimalist sequencer masterpiece

### Structural Blueprint (60s @ 105 BPM = ~18 bars)

- **Bars 0-2 (Cosmic Void)**: Pad wash + filtered noise only
  - Vast reverberant space established
  - Pad fades in over 3.5 seconds
  - Sense of infinite space

- **Bars 2-4 (Sequencer Emerges)**: Arpeggiator starts with filter closed
  - Sequencer pattern begins at 800Hz cutoff
  - Pulsing underneath the pad
  - Building anticipation

- **Bars 4-8 (Full Journey)**: Bass pulse + motorik kick + strings + lead
  - All elements present
  - Filter begins opening (800 → 3200Hz over 8 bars)
  - Portamento lead glides in
  - Mellotron strings add orchestral depth

- **Bars 8-14 (Evolving Peak)**: Maximum filter opening, all layers active
  - Sequencer at full brightness
  - Lead phrases glide between notes
  - Cosmic journey at full speed

- **Bars 14-18 (Return to Void)**: Filter closes, noise sweeps, thin to pad
  - Sequencer filter returns to 800Hz
  - Cosmic noise briefly swells
  - Return to opening atmosphere for seamless loop

### Tonal Characteristics

- **Harmonic**: D Dorian (D E F G A B C) - modal, journeying, open
- **Melodic**: Portamento lead glides, sequencer arpeggios as rhythmic melody
- **Rhythmic**: 16th-note sequencer pattern + motorik quarter-note kick
- **Textural**: Analog warmth, Mellotron-style strings, cosmic reverb spaces
- **Dynamic**: Slow evolution through filter sweeps, not volume changes
- **Production**: Warm, spacious, the sequencer filter sweep IS the composition
