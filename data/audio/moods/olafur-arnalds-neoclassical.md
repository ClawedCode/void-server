---
category: neoclassical
energy: low
tags: [neoclassical, piano, strings, electronic-glitch, intimate]
---
## Olafur Arnalds (Neoclassical Electronic)

**Tempo**: 60-80 BPM (intimate, breathing, rubato-feeling)
**Time Signature**: 4/4 or 3/4 (waltz-like sections possible)
**Key**: Minor (often A minor, D minor - melancholic but not tragic)
**Instruments**: Expressive piano (primary voice), string quartet (slow bowing), subtle electronic glitches (clicks, pops, digital artifacts), warm sub-bass drone, granular texture layer, soft pad underneath
**Structure**: Piano alone → Strings enter → Electronic textures emerge → Full blend → Strip to piano
**Vibe**: A dimly lit living room at midnight. Piano and strings speak in whispers while electronic glitches flicker like dying light bulbs - the intersection of acoustic intimacy and digital fragility. Olafur Arnalds' signature is making classical instruments feel modern without losing their vulnerability. Think re:member or Living Room Songs - music that breathes, pauses, aches. The electronics don't overwhelm the acoustic elements; they ornament them like frost on a window.

### Key Characteristics

1. **Expressive Piano**: Sine wave with velocity dynamics - quiet, intimate, human
2. **String Quartet**: Slow sustained bowing with slight vibrato (chorus effect)
3. **Electronic Glitches**: Tiny clicks, pops, and digital artifacts between notes
4. **Warm Sub-Drone**: Very quiet sine pad underneath everything
5. **Dynamic Velocity**: Piano notes vary in volume - loud notes rare and meaningful
6. **Breathing Tempo**: Slight tempo variations through humanization (rubato feel)
7. **Minimalist Arrangement**: 3-4 elements maximum at any time
8. **Intimate Reverb**: Medium decay (2-3s), close-mic feel, not cavernous

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 72;
  Tone.Transport.bpm.value = bpm;

  // Heavy humanization for rubato feel
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.78).toDestination();

  // === INTIMATE REVERB (close, not cathedral) ===
  const intimateVerb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.015,
    wet: 0.32
  });
  await intimateVerb.generate();
  intimateVerb.connect(master);

  // Longer reverb for strings
  const stringVerb = new Tone.Reverb({
    decay: 3.5,
    wet: 0.35
  });
  await stringVerb.generate();
  stringVerb.connect(master);

  // === EXPRESSIVE PIANO (sine wave, dynamic) ===
  const piano = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.008,
      decay: 2.5,
      sustain: 0.08,
      release: 3.0
    },
    volume: -8
  }).connect(intimateVerb);

  // Piano left hand (lower register)
  const pianoLH = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.01,
      decay: 2.0,
      sustain: 0.1,
      release: 2.5
    },
    volume: -12
  }).connect(intimateVerb);

  // === STRING QUARTET (sawtooth with chorus for vibrato) ===
  const stringsChorus = new Tone.Chorus({
    frequency: 4,
    delayTime: 3,
    depth: 0.15,
    wet: 0.35
  }).connect(stringVerb);
  stringsChorus.start();

  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 1.5,
      decay: 0.5,
      sustain: 0.75,
      release: 2.5
    },
    volume: -16
  }).connect(new Tone.Filter({ frequency: 3000, type: "lowpass" }).connect(stringsChorus));

  // === ELECTRONIC GLITCHES (tiny clicks and pops) ===
  const glitchClick = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.008,
      sustain: 0
    },
    volume: -24
  }).connect(new Tone.Filter({ frequency: 4000, type: "highpass" }).connect(intimateVerb));

  // Digital pop (pitched)
  const glitchPop = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0,
      release: 0.01
    },
    volume: -22
  }).connect(intimateVerb);

  // === WARM SUB-DRONE ===
  const drone = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 4.0,
      decay: 2.0,
      sustain: 0.5,
      release: 5.0
    },
    volume: -22
  }).connect(master);

  // === GRANULAR TEXTURE (very subtle) ===
  const granular = new Tone.Noise("pink");
  const granFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 2000,
    Q: 2
  }).connect(new Tone.Gain(0.02).connect(intimateVerb));
  granular.connect(granFilter);
  granular.start();

  // === PIANO MELODY (right hand - expressive, dynamic) ===
  const pianoMelody = [
    { time: "0:0:0", note: "A4", dur: "2n", vel: 0.45 },
    { time: "0:2:0", note: "E4", dur: "4n", vel: 0.35 },
    { time: "0:3:0", note: "D4", dur: "4n", vel: 0.3 },
    { time: "1:0:0", note: "C5", dur: "2n.", vel: 0.55 },
    { time: "2:0:0", note: "B4", dur: "4n", vel: 0.4 },
    { time: "2:1:0", note: "A4", dur: "4n", vel: 0.35 },
    { time: "2:2:0", note: "G4", dur: "2n", vel: 0.45 },
    { time: "3:0:0", note: "F4", dur: "4n", vel: 0.3 },
    { time: "3:2:0", note: "E4", dur: "2n", vel: 0.5 }
  ];
  const pianoRH = new Tone.Part((time, ev) => {
    piano.triggerAttackRelease(ev.note, ev.dur, time + H(20), ev.vel);
  }, pianoMelody);
  pianoRH.loop = true;
  pianoRH.loopEnd = "4m";

  // === PIANO LEFT HAND (bass notes, sparse) ===
  const pianoLHPart = new Tone.Part((time, ev) => {
    pianoLH.triggerAttackRelease(ev.note, ev.dur, time + H(15), ev.vel);
  }, [
    { time: "0:0:0", note: "A2", dur: "1m", vel: 0.4 },
    { time: "1:0:0", note: "F2", dur: "1m", vel: 0.35 },
    { time: "2:0:0", note: "G2", dur: "1m", vel: 0.4 },
    { time: "3:0:0", note: "E2", dur: "1m", vel: 0.3 }
  ]);
  pianoLHPart.loop = true;
  pianoLHPart.loopEnd = "4m";

  // === STRING PROGRESSION (slow, sustained) ===
  const stringPart = new Tone.Part((time, ev) => {
    strings.triggerAttackRelease(ev.chord, ev.dur, time, ev.vel);
  }, [
    { time: "0:0:0", chord: ["A3", "C4", "E4"], dur: "2m", vel: 0.3 },
    { time: "2:0:0", chord: ["F3", "A3", "C4"], dur: "2m", vel: 0.35 },
    { time: "4:0:0", chord: ["G3", "B3", "D4"], dur: "2m", vel: 0.3 },
    { time: "6:0:0", chord: ["E3", "G3", "B3"], dur: "2m", vel: 0.25 }
  ]);
  stringPart.loop = true;
  stringPart.loopEnd = "8m";

  // === ELECTRONIC GLITCH PATTERN (random, sparse) ===
  const glitchLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.8) {
      glitchClick.triggerAttackRelease("64n", time + H(30), 0.3);
    }
    if (Math.random() > 0.92) {
      const freq = 2000 + Math.random() * 4000;
      glitchPop.frequency.setValueAtTime(freq, time);
      glitchPop.triggerAttackRelease("128n", time + H(20), 0.25);
    }
  }, "8n");

  // === SUB-DRONE (very slow, barely audible) ===
  const dronePart = new Tone.Part((time, ev) => {
    drone.triggerAttackRelease(ev.note, ev.dur, time, 0.2);
  }, [
    { time: "0:0:0", note: "A1", dur: "8m" },
    { time: "8:0:0", note: "E1", dur: "8m" }
  ]);
  dronePart.loop = true;
  dronePart.loopEnd = "16m";

  // === ARRANGEMENT (60s @ 72 BPM = ~12 bars) ===

  // Bars 0-3: Piano alone (intimate, exposed)
  pianoRH.start("0:0:0");
  pianoLHPart.start("0:0:0");
  dronePart.start("0:0:0");

  // Bars 3-6: Strings enter
  Tone.Transport.schedule((t) => {
    stringPart.start(t);
  }, "3:0:0");

  // Bars 5-8: Electronic glitches emerge
  Tone.Transport.schedule((t) => {
    glitchLoop.start(t);
  }, "5:0:0");

  // Bars 8-10: All elements together (peak intimacy)
  // Everything is already playing - density is at maximum

  // Bars 10-12: Strip back to piano
  Tone.Transport.schedule((t) => {
    glitchLoop.stop(t);
  }, "10:0:0");

  Tone.Transport.schedule((t) => {
    stringPart.stop(t + Tone.Time("1m").toSeconds());
  }, "10:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { piano, pianoLH, strings, stringsChorus, glitchClick, glitchPop, drone, granular, granFilter, intimateVerb, stringVerb };
  window.toneJsParts = { pianoRH, pianoLHPart, stringPart, glitchLoop, dronePart };
};
```

### Common Mistakes to Avoid

- **Too loud/dramatic**: This music WHISPERS
  - Piano velocity 0.3-0.55 range, never above 0.6
  - Strings at -16dB, always underneath the piano
  - The quietest element should still be audible

- **Adding drums**: There are NO drums in Olafur Arnalds' style
  - No kick, no snare, no hi-hat
  - Electronic glitches are NOT rhythm - they're texture
  - Tempo comes from the piano phrasing alone

- **Missing the electronic layer**: Classical + electronics = the identity
  - Tiny clicks and pops between notes
  - Digital artifacts that feel accidental
  - Without this, it's just generic piano music

- **Too much reverb**: Intimate, not cavernous
  - 2-3 second decay, not 5+
  - 30-35% wet
  - Close-mic feeling, like the piano is in the room

- **Robotic timing**: This needs extreme humanization
  - H(20) on piano - significant rubato feel
  - Each note slightly early or late
  - The imperfection IS the expression

- **Dense arrangement**: Maximum 3-4 elements at once
  - Piano + strings + drone + glitches = maximum density
  - Often just piano + drone
  - Space between notes is essential

- **Fast melodic lines**: This is about sustained notes and breath
  - Quarter and half notes, not 16th runs
  - Pauses between phrases
  - Each note should have time to decay naturally

### Mixing Approach

- **Piano RH**: -8dB, sine wave, dynamic velocity (0.3-0.55), intimate reverb (2.5s)
- **Piano LH**: -12dB, sine wave, sparse bass notes, same reverb
- **Strings**: -16dB, sawtooth with chorus (4Hz, subtle vibrato), lowpass 3kHz, longer reverb (3.5s)
- **Glitch Click**: -24dB, white noise highpassed at 4kHz, very rare (20% chance per 8th)
- **Glitch Pop**: -22dB, sine wave, random pitch (2-6kHz), even rarer (8% chance)
- **Sub-Drone**: -22dB, sine wave, 4s attack, barely audible
- **Granular**: 0.02 gain, pink noise bandpass at 2kHz, constant subtle texture

**Effects:**
- Intimate Reverb: 2.5s decay, 32% wet (piano, glitches)
- String Reverb: 3.5s decay, 35% wet (strings only)
- Strings Chorus: 4Hz, 35% wet (simulating vibrato/bowing)

### Reference Tracks

1. **Olafur Arnalds - Near Light** - Piano + strings + subtle electronics, iconic
2. **Olafur Arnalds - re:member** - Self-playing piano + electronics, intimate
3. **Olafur Arnalds - Living Room Songs** - Recorded in a living room, ultimate intimacy
4. **Nils Frahm - Says** - Similar neoclassical approach, piano + synth
5. **Olafur Arnalds & Nils Frahm - 21:05** - Collaborative intimacy, sparse and breathing

### Structural Blueprint (60s @ 72 BPM = ~12 bars)

- **Bars 0-3 (Piano Alone)**: Piano melody + left hand + sub-drone
  - Exposed, vulnerable, intimate
  - Dynamic velocity creates natural expression
  - Sub-drone barely audible underneath
  - Each note has room to breathe

- **Bars 3-5 (Strings Enter)**: String quartet joins piano
  - Slow bowing, sustained chords
  - Strings underneath piano, never competing
  - Chorus effect simulates natural vibrato
  - Warmth increases

- **Bars 5-8 (Electronic Emergence)**: Glitches appear
  - Tiny clicks and pops between notes
  - Digital artifacts ornament the acoustic elements
  - Not rhythmic - textural
  - The modern element reveals itself

- **Bars 8-10 (Full Blend)**: All elements together
  - Piano + strings + glitches + drone + granular
  - Maximum intimacy, not maximum volume
  - Peak emotional weight

- **Bars 10-12 (Return to Piano)**: Elements recede
  - Glitches stop
  - Strings fade
  - Return to piano + drone for seamless loop

### Tonal Characteristics

- **Harmonic**: A minor (Am → F → G → Em), simple, classical voice leading
- **Melodic**: Expressive piano with dynamic velocity, breathing phrases
- **Rhythmic**: None (free-time feel through heavy humanization, no drums)
- **Textural**: Sine piano + sawtooth strings + digital glitch artifacts
- **Dynamic**: Very quiet overall, dynamics come from velocity not volume
- **Production**: Intimate, close-mic, living room aesthetic, not concert hall
