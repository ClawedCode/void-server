---
category: cinematic
energy: low
tags: [film-score, tension, drone, textural, eerie]
---
## Trent Reznor & Atticus Ross (Film Score)

**Tempo**: 70-90 BPM (slow, deliberate, tension-building)
**Time Signature**: 4/4 (implied rather than stated - often feels free-time)
**Key**: Minor or chromatic (D minor, F# minor - dissonant, unsettled)
**Instruments**: Processed piano (filtered, distant), evolving drone layers, metallic textures, tape-degraded pads, subtle pulse (not a beat), granular fragments, resonant feedback tones
**Structure**: Drone emerges → Piano fragment → Textures accumulate → Tension peak → Decay to drone
**Vibe**: The moment before something terrible happens. Reznor & Ross film scores are tension incarnate - not the explosion, but the fuse burning. Processed piano notes that sound like they're being heard through walls, evolving drones that shift like anxiety, metallic textures that glint like a knife in peripheral vision. Think The Social Network's cold digital alienation, Gone Girl's domestic unease, or The Girl with the Dragon Tattoo's Scandinavian dread. This is NOT Nine Inch Nails - it's quieter, more restrained, more unsettling.

### Key Characteristics

1. **Processed Piano**: Piano notes filtered, degraded, or played backwards - never clean
2. **Evolving Drones**: Sustained tones that slowly shift in timbre through filter automation
3. **Metallic Textures**: High-frequency resonant tones, bowed metal sounds
4. **Tape Degradation**: Filters and bitcrushing simulating worn magnetic tape
5. **Implied Pulse**: A rhythmic element so subtle it's felt more than heard
6. **Granular Fragments**: Tiny splinters of sound, like reality glitching
7. **Negative Space**: Extended silences that amplify the tension
8. **Dissonance**: Minor 2nds, tritones, unresolved harmonics

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.75).toDestination();

  // === DARK REVERB (large, dark space) ===
  const darkVerb = new Tone.Reverb({
    decay: 5.5,
    preDelay: 0.06,
    wet: 0.4
  });
  await darkVerb.generate();
  darkVerb.connect(master);

  // Short metallic reverb
  const metalVerb = new Tone.Reverb({
    decay: 1.8,
    wet: 0.3
  });
  await metalVerb.generate();
  metalVerb.connect(master);

  // Tape degradation filter
  const tapeFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    Q: 1
  }).connect(darkVerb);

  // Subtle bitcrusher for tape wobble
  const tapeCrush = new Tone.BitCrusher({ bits: 12 }).connect(tapeFilter);

  // === PROCESSED PIANO (filtered, distant) ===
  const pianoFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1200,
    Q: 2,
    rolloff: -24
  }).connect(tapeCrush);

  const piano = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.015,
      decay: 3.0,
      sustain: 0.05,
      release: 4.0
    },
    volume: -10
  }).connect(pianoFilter);

  // Second piano voice (slightly detuned for unease)
  const pianoGhost = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.5,
      decay: 2.5,
      sustain: 0.1,
      release: 3.5
    },
    detune: 15,
    volume: -18
  }).connect(darkVerb);

  // === EVOLVING DRONE LAYER 1 ===
  const droneFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    Q: 3
  }).connect(darkVerb);

  const drone1 = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 4.0,
      decay: 2.0,
      sustain: 0.6,
      release: 5.0
    },
    volume: -14
  }).connect(droneFilter);

  // === EVOLVING DRONE LAYER 2 (dissonant) ===
  const drone2 = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 3.5,
      decay: 1.5,
      sustain: 0.7,
      release: 4.0
    },
    volume: -16
  }).connect(droneFilter);

  // === METALLIC TEXTURE (high-frequency resonance) ===
  const metalFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 3500,
    Q: 8
  }).connect(metalVerb);

  const metalTex = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 1.0,
      decay: 2.0,
      sustain: 0.3,
      release: 3.0
    },
    volume: -20
  }).connect(metalFilter);

  // === RESONANT FEEDBACK TONE ===
  const feedback = new Tone.FMSynth({
    harmonicity: 7,
    modulationIndex: 15,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 2.0,
      decay: 1.0,
      sustain: 0.4,
      release: 3.0
    },
    modulationEnvelope: {
      attack: 1.0,
      decay: 0.5,
      sustain: 0.6,
      release: 2.0
    },
    volume: -22
  }).connect(darkVerb);

  // === GRANULAR FRAGMENTS ===
  const granular = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0
    },
    volume: -26
  }).connect(new Tone.Filter({ frequency: 3000, type: "highpass" }).connect(metalVerb));

  // === SUBTLE PULSE (felt, not heard) ===
  const pulse = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.05,
      decay: 0.4,
      sustain: 0,
      release: 0.3
    },
    volume: -20
  }).connect(new Tone.Filter({ frequency: 200, type: "lowpass" }).connect(master));

  // === PROCESSED PIANO PHRASES (sparse, fragmented) ===
  const pianoPart = new Tone.Part((time, ev) => {
    piano.triggerAttackRelease(ev.note, ev.dur, time + H(20), ev.vel);
    // Ghost note (delayed, detuned echo)
    if (Math.random() > 0.4) {
      pianoGhost.triggerAttackRelease(ev.note, "2n", time + 0.3 + H(15), ev.vel * 0.4);
    }
  }, [
    { time: "0:0:0", note: "D4", dur: "2n", vel: 0.4 },
    { time: "1:2:0", note: "F4", dur: "4n", vel: 0.3 },
    { time: "3:0:0", note: "A4", dur: "2n", vel: 0.45 },
    { time: "4:2:0", note: "E4", dur: "4n", vel: 0.35 },
    { time: "6:0:0", note: "C#4", dur: "2n.", vel: 0.5 },
    { time: "7:3:0", note: "D4", dur: "4n", vel: 0.3 }
  ]);
  pianoPart.loop = true;
  pianoPart.loopEnd = "8m";

  // === DRONE EVENTS (slow-shifting dissonance) ===
  const dronePart = new Tone.Part((time, ev) => {
    drone1.triggerAttackRelease(ev.note1, ev.dur, time, 0.35);
    drone2.triggerAttackRelease(ev.note2, ev.dur, time, 0.3);
  }, [
    { time: "0:0:0", note1: "D2", note2: "Eb2", dur: "8m" },     // Minor 2nd = tension
    { time: "8:0:0", note1: "A1", note2: "Eb2", dur: "8m" }      // Tritone = dread
  ]);
  dronePart.loop = true;
  dronePart.loopEnd = "16m";

  // === METALLIC TEXTURE EVENTS ===
  const metalPart = new Tone.Part((time, ev) => {
    metalTex.triggerAttackRelease(ev.note, ev.dur, time, 0.25);
  }, [
    { time: "4:0:0", note: "F#5", dur: "2m" },
    { time: "10:0:0", note: "G5", dur: "2m" },
    { time: "14:0:0", note: "D#5", dur: "1m" }
  ]);
  metalPart.loop = true;
  metalPart.loopEnd = "16m";

  // === FEEDBACK TONE (rare, unsettling) ===
  const feedbackPart = new Tone.Part((time, ev) => {
    feedback.triggerAttackRelease(ev.note, ev.dur, time, 0.2);
  }, [
    { time: "6:0:0", note: "A4", dur: "2m" },
    { time: "12:0:0", note: "C5", dur: "2m" }
  ]);
  feedbackPart.loop = true;
  feedbackPart.loopEnd = "16m";

  // === GRANULAR FRAGMENTS (random, rare) ===
  const granLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.88) {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        Tone.Transport.scheduleOnce((t) => {
          granular.triggerAttackRelease("128n", t, 0.2 + Math.random() * 0.15);
        }, time + (i * 0.04));
      }
    }
  }, "4n");

  // === SUBTLE PULSE (heartbeat-like) ===
  const pulseLoop = new Tone.Loop((time) => {
    pulse.triggerAttackRelease("D1", "8n", time, 0.35);
  }, "2n");

  // === ARRANGEMENT (60s @ 78 BPM = ~14 bars) ===

  // Bars 0-2: Drone emerges from silence
  dronePart.start("0:0:0");

  // Bars 2-4: Piano fragments appear
  Tone.Transport.schedule((t) => {
    pianoPart.start(t);
  }, "2:0:0");

  // Bars 4-6: Pulse + metallic textures
  Tone.Transport.schedule((t) => {
    pulseLoop.start(t);
    metalPart.start(t);
    granLoop.start(t);
  }, "4:0:0");

  // Bars 6-10: Full texture, tension builds
  Tone.Transport.schedule((t) => {
    feedbackPart.start(t);
    // Drone filter slowly opens
    droneFilter.frequency.linearRampToValueAtTime(1200, t + Tone.Time("4m").toSeconds());
  }, "6:0:0");

  // Bars 10-12: Tension peak - piano filter closes for distortion
  Tone.Transport.schedule((t) => {
    pianoFilter.frequency.linearRampToValueAtTime(600, t + Tone.Time("2m").toSeconds());
  }, "10:0:0");

  // Bars 12-14: Decay - elements recede, drone filter closes
  Tone.Transport.schedule((t) => {
    feedbackPart.stop(t);
    metalPart.stop(t);
    granLoop.stop(t);
    pulseLoop.stop(t + Tone.Time("1m").toSeconds());
    droneFilter.frequency.linearRampToValueAtTime(600, t + Tone.Time("2m").toSeconds());
    pianoFilter.frequency.linearRampToValueAtTime(1200, t + Tone.Time("1m").toSeconds());
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { piano, pianoGhost, pianoFilter, drone1, drone2, droneFilter, metalTex, metalFilter, feedback, granular, pulse, tapeCrush, darkVerb, metalVerb };
  window.toneJsParts = { pianoPart, dronePart, metalPart, feedbackPart, granLoop, pulseLoop };
};
```

### Common Mistakes to Avoid

- **Confusing with NIN**: This is NOT industrial rock
  - No distorted guitars, no aggressive drums, no screaming
  - Restraint and subtlety, not aggression
  - Tension through absence, not assault

- **Clean piano**: The piano should sound PROCESSED
  - Lowpass filter (1200Hz) for distant, muffled quality
  - Slight bitcrushing (12-bit) for tape degradation
  - Ghost notes (delayed, detuned) for eerie echo

- **Missing dissonance**: Harmony should be UNSETTLED
  - Minor 2nds (D + Eb) for grinding tension
  - Tritones (A + Eb) for dread
  - Never fully resolved chords

- **Too busy**: Film score is about restraint
  - Piano: 4-6 notes per 8 bars
  - Long gaps between melodic events
  - Drones do the heavy lifting

- **Standard rhythm**: The pulse should be SUBLIMINAL
  - Sine wave half-note pulse at -20dB
  - Felt in the body, not heard by the ears
  - Never a beat, always a heartbeat

- **Bright production**: Everything should sound DARK
  - Lowpass filters on almost everything (600-2000Hz)
  - Long reverb decay (5.5s) in dark space
  - Metallic textures are the only high-frequency content

### Mixing Approach

- **Processed Piano**: -10dB, sine through lowpass (1200Hz, Q: 2) + 12-bit crush + reverb
- **Piano Ghost**: -18dB, detuned +15 cents, delayed 300ms, reverb only
- **Drone Layer 1**: -14dB, sawtooth through automatable lowpass (600-1200Hz, Q: 3)
- **Drone Layer 2**: -16dB, triangle, dissonant interval from drone 1
- **Metallic Texture**: -20dB, sine through bandpass (3500Hz, Q: 8), rare events
- **Resonant Feedback**: -22dB, FM synth (harmonicity: 7), unsettling overtones
- **Granular**: -26dB, white noise highpassed at 3kHz, tiny random bursts
- **Subtle Pulse**: -20dB, sine lowpassed at 200Hz, half-note heartbeat

**Effects:**
- Dark Reverb: 5.5s decay, 40% wet (large dark space)
- Metal Reverb: 1.8s decay, 30% wet (resonant, tight)
- Tape Filter: Lowpass 2kHz + 12-bit crush (degradation)

### Reference Tracks

1. **Reznor & Ross - Hand Covers Bruise** (The Social Network) - Cold, digital alienation
2. **Reznor & Ross - In Motion** (The Social Network) - Building tension, processed piano
3. **Reznor & Ross - What Have We Done to Each Other** (Gone Girl) - Domestic dread
4. **Reznor & Ross - Immigrant Song** (Dragon Tattoo) - Dark, textural reimagining
5. **Reznor & Ross - Bird Box** (Bird Box) - Pure tension, evolving drones

### Structural Blueprint (60s @ 78 BPM = ~14 bars)

- **Bars 0-2 (Emergence)**: Drone fades in from silence
  - Minor 2nd interval (D + Eb) establishes tension
  - Slow attack (4 seconds) - tension is patient
  - Nothing else - just the drone breathing

- **Bars 2-4 (Piano Fragment)**: Processed piano notes appear
  - Sparse, filtered, ghostly
  - Notes sound like they're heard through a wall
  - Ghost echoes (detuned, delayed) add unease

- **Bars 4-6 (Texture Build)**: Pulse + metallic textures + granular
  - Subliminal half-note pulse (felt, not heard)
  - High-frequency metallic resonance
  - Granular fragments glitch between elements

- **Bars 6-10 (Tension Accumulation)**: All elements present
  - Drone filter opens (600 → 1200Hz)
  - Feedback tone adds unsettling overtones
  - Maximum textural density
  - Something terrible is about to happen

- **Bars 10-12 (Peak Tension)**: Piano filter closes for darker sound
  - Piano becomes more degraded (600Hz filter)
  - Tension at maximum without release
  - No climax - just sustained dread

- **Bars 12-14 (Decay)**: Elements recede to drone
  - Feedback, metal, granular stop
  - Pulse fades
  - Drone filter closes back to 600Hz
  - Return to opening drone for seamless loop

### Tonal Characteristics

- **Harmonic**: Dissonant (minor 2nds, tritones), unresolved, chromatic
- **Melodic**: Sparse processed piano fragments, not melodic in traditional sense
- **Rhythmic**: Subliminal pulse only - heartbeat, not beat
- **Textural**: Filtered drones, tape-degraded piano, metallic resonance, granular glitch
- **Dynamic**: Slow accumulation of tension, never released - sustained dread
- **Production**: Dark, filtered, degraded, everything sounds like it's decaying
