---
category: neoclassical
energy: medium
tags: [piano, felt, minimalist, intimate, electronic-classical]
---
## Nils Frahm (Felt Piano + Electronics)

**Tempo**: 112-120 BPM (steady pulse that builds momentum)
**Time Signature**: 4/4 (steady, driving in later sections)
**Key**: A minor (melancholic, yearning, with moments of major-key release)
**Instruments**: Felt-dampened piano (sine, fast decay, muted overtones), warm analog pad (sawtooth through heavy lowpass), sub-bass synth, soft electronic kick (enters midway), shimmering arpeggio synth, subtle breath noise texture
**Structure**: Intimate piano solo → Pad swells underneath → Bass + kick establish pulse → Arpeggio builds and drives → Full electronic wash → Strip to piano
**Vibe**: A cavernous Berlin concert hall at 2am. The felt-dampened piano speaks in whispered percussive tones - each note more texture than sustain, the hammers muted by fabric so overtones die before they bloom. Then warmth seeps in from below: an analog pad so heavily filtered it's more feeling than sound, opening slowly like a door letting in light. By the second half the synth arpeggio has taken over, towering and relentless, while the piano still flickers underneath like a heartbeat refusing to stop. This is the moment in "Says" at Funkhaus Berlin where 3,000 people hold their breath as delicate keys give way to a wall of analog electricity. Nils Frahm's genius is making the intimate and the monumental coexist in the same breath.

### Key Characteristics

1. **Felt Piano Tone**: Sine oscillator with very fast decay and low sustain - mimics the muted, percussive quality of felt-dampened strings
2. **Warm Analog Pad**: Sawtooth through aggressive lowpass filter that automates open over the build (400Hz to 2000Hz)
3. **Patient Layering**: Electronic elements enter one at a time across the full 60 seconds, never rushing
4. **Humanized Timing**: Heavy H(15) on piano for natural, breathing feel - each note slightly early or late
5. **Arpeggio as Climax**: The synth arpeggio IS the crescendo - it drives the second half with relentless repetition
6. **Filter Automation**: The emotional arc lives in the pad filter sweep, not in volume changes
7. **Soft Electronic Kick**: Not a dance kick - more of a felt thump that enters to anchor the pulse
8. **Dynamic Contrast**: From solo piano whisper to full electronic wash, but the piano never disappears

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 116;
  Tone.Transport.bpm.value = bpm;

  // Heavy humanization for natural piano feel
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.80).toDestination();
  const limiter = new Tone.Limiter({ threshold: -3 }).connect(master);

  // === REVERBS ===
  // Intimate room reverb for piano (close, warm)
  const roomVerb = new Tone.Reverb({
    decay: 2.2,
    preDelay: 0.01,
    wet: 0.28
  });
  await roomVerb.generate();
  roomVerb.connect(limiter);

  // Larger hall reverb for pad and arpeggio (spacious, enveloping)
  const hallVerb = new Tone.Reverb({
    decay: 3.8,
    preDelay: 0.04,
    wet: 0.38
  });
  await hallVerb.generate();
  hallVerb.connect(limiter);

  // Delay for arpeggio shimmer
  const arpDelay = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.28,
    wet: 0.22
  }).connect(hallVerb);

  // === FELT PIANO (muted, percussive sine tone) ===
  const feltPiano = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.005,
      decay: 0.55,
      sustain: 0.06,
      release: 1.2
    },
    volume: -7
  }).connect(roomVerb);

  // Felt piano left hand (bass register, slightly longer decay)
  const feltPianoLH = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.008,
      decay: 0.8,
      sustain: 0.08,
      release: 1.5
    },
    volume: -10
  }).connect(roomVerb);

  // === WARM ANALOG PAD (sawtooth through heavy lowpass) ===
  const padFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 400,
    Q: 1.5,
    rolloff: -24
  }).connect(hallVerb);

  const analogPad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 2.5,
      decay: 1.0,
      sustain: 0.7,
      release: 3.5
    },
    volume: -14
  }).connect(padFilter);

  // === SUB-BASS SYNTH ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.05,
      decay: 0.4,
      sustain: 0.5,
      release: 0.6
    },
    volume: -10
  }).connect(limiter);

  // === SOFT ELECTRONIC KICK (felt thump, not dance kick) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 3,
    envelope: {
      attack: 0.001,
      decay: 0.25,
      sustain: 0,
      release: 0.3
    },
    volume: -12
  }).connect(limiter);

  // === ARPEGGIO SYNTH (triangle, bright and shimmering) ===
  const arpSynth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.003,
      decay: 0.18,
      sustain: 0.1,
      release: 0.35
    },
    volume: -11
  }).connect(arpDelay);

  // === BREATH NOISE TEXTURE (very subtle) ===
  const breathNoise = new Tone.Noise("pink");
  const breathFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 1200,
    Q: 0.8
  }).connect(new Tone.Gain(0.018).connect(roomVerb));
  breathNoise.connect(breathFilter);
  breathNoise.start();

  // === PIANO RIGHT HAND MELODY (A minor, felt-percussive) ===
  const pianoRH = new Tone.Part((time, ev) => {
    feltPiano.triggerAttackRelease(ev.note, ev.dur, time + H(15), ev.vel);
  }, [
    { time: "0:0:0", note: "A4", dur: "8n", vel: 0.5 },
    { time: "0:1:0", note: "E4", dur: "8n", vel: 0.4 },
    { time: "0:2:0", note: "C5", dur: "4n", vel: 0.55 },
    { time: "0:3:0", note: "B4", dur: "8n", vel: 0.35 },
    { time: "1:0:0", note: "A4", dur: "4n", vel: 0.45 },
    { time: "1:2:0", note: "G4", dur: "8n", vel: 0.4 },
    { time: "1:3:0", note: "E4", dur: "4n", vel: 0.5 },
    { time: "2:0:0", note: "F4", dur: "4n", vel: 0.45 },
    { time: "2:2:0", note: "E4", dur: "8n", vel: 0.35 },
    { time: "2:3:0", note: "D4", dur: "8n", vel: 0.4 },
    { time: "3:0:0", note: "C4", dur: "4n", vel: 0.38 },
    { time: "3:2:0", note: "E4", dur: "2n", vel: 0.5 }
  ]);
  pianoRH.loop = true;
  pianoRH.loopEnd = "4m";

  // === PIANO LEFT HAND (root notes, sparse) ===
  const pianoLHPart = new Tone.Part((time, ev) => {
    feltPianoLH.triggerAttackRelease(ev.note, ev.dur, time + H(12), ev.vel);
  }, [
    { time: "0:0:0", note: "A2", dur: "2n", vel: 0.45 },
    { time: "1:0:0", note: "F2", dur: "2n", vel: 0.4 },
    { time: "2:0:0", note: "C3", dur: "2n", vel: 0.45 },
    { time: "3:0:0", note: "G2", dur: "2n", vel: 0.38 }
  ]);
  pianoLHPart.loop = true;
  pianoLHPart.loopEnd = "4m";

  // === PAD PROGRESSION (Am → F → C → G, slow swells) ===
  const padPart = new Tone.Part((time, ev) => {
    analogPad.triggerAttackRelease(ev.chord, ev.dur, time, ev.vel);
  }, [
    { time: "0:0:0", chord: ["A3", "C4", "E4"], dur: "4m", vel: 0.3 },
    { time: "4:0:0", chord: ["F3", "A3", "C4"], dur: "4m", vel: 0.35 },
    { time: "8:0:0", chord: ["C3", "E3", "G3"], dur: "4m", vel: 0.3 },
    { time: "12:0:0", chord: ["G3", "B3", "D4"], dur: "4m", vel: 0.35 }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "16m";

  // === SUB-BASS PATTERN (follows root, pulsing 8th notes) ===
  const bassNotes = ["A1", null, "A1", null, "F1", null, "F1", null,
                     "C2", null, "C2", null, "G1", null, "G1", null];
  const bassPart = new Tone.Sequence((time, note) => {
    if (note) subBass.triggerAttackRelease(note, "8n", time + H(5), 0.65);
  }, bassNotes, "4n");
  bassPart.loop = true;
  bassPart.loopEnd = "4m";

  // === KICK PATTERN (quarter notes, soft felt thump) ===
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 0.55);
  }, "4n");

  // === ARPEGGIO PATTERN (16th notes, driving, ascending/descending) ===
  const arpNotes = ["A4", "C5", "E5", "A5", "E5", "C5", "A4", "E4",
                    "F4", "A4", "C5", "F5", "C5", "A4", "F4", "C4"];
  const arpSeq = new Tone.Sequence((time, note) => {
    arpSynth.triggerAttackRelease(note, "32n", time + H(4), 0.5 + Math.random() * 0.12);
  }, arpNotes, "16n");
  arpSeq.loop = true;
  arpSeq.loopEnd = "2m";

  // === ARRANGEMENT (60s @ 116 BPM = ~16 bars) ===

  // Bars 0-3: Piano alone (intimate, exposed, felt-dampened)
  pianoRH.start("0:0:0");
  pianoLHPart.start("0:0:0");

  // Bars 3-6: Pad swells in underneath, filter still closed
  Tone.Transport.schedule((t) => {
    padPart.start(t);
  }, "3:0:0");

  // Bars 5-7: Sub-bass + soft kick establish pulse
  Tone.Transport.schedule((t) => {
    bassPart.start(t);
    kickLoop.start(t);
  }, "5:0:0");

  // Bars 5-12: Pad filter opens (400Hz → 2000Hz) - the emotional arc
  Tone.Transport.schedule((t) => {
    padFilter.frequency.linearRampToValueAtTime(2000, t + Tone.Time("7m").toSeconds());
  }, "5:0:0");

  // Bars 7-12: Arpeggio enters and drives the second half
  Tone.Transport.schedule((t) => {
    arpSeq.start(t);
  }, "7:0:0");

  // Bars 12-14: Peak - all elements together, pad fully open
  // Everything already playing - maximum density and warmth

  // Bars 14-16: Strip back for seamless loop
  Tone.Transport.schedule((t) => {
    arpSeq.stop(t + Tone.Time("1m").toSeconds());
    kickLoop.stop(t + Tone.Time("1m").toSeconds());
    bassPart.stop(t + Tone.Time("1:2:0").toSeconds());
    padFilter.frequency.linearRampToValueAtTime(400, t + Tone.Time("2m").toSeconds());
  }, "14:0:0");

  Tone.Transport.schedule((t) => {
    padPart.stop(t + Tone.Time("1m").toSeconds());
  }, "15:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { feltPiano, feltPianoLH, analogPad, padFilter, subBass, kick, arpSynth, breathNoise, breathFilter, roomVerb, hallVerb, arpDelay, limiter };
  window.toneJsParts = { pianoRH, pianoLHPart, padPart, bassPart, kickLoop, arpSeq };
};
```

### Common Mistakes to Avoid

- **Normal piano sound**: Felt piano is NOT a regular piano
  - Fast decay (0.55s) and very low sustain (0.06) are critical
  - Notes should be percussive thumps that die quickly, not ringing tones
  - Sine oscillator only - no harmonics, no brightness

- **Pad filter stays static**: The filter sweep IS the composition
  - Must automate from 400Hz to 2000Hz over the build section
  - Without this, the pad is just a quiet hum that never evolves
  - The filter opening is what creates the sensation of warmth flooding in

- **Arpeggio too early**: It should feel earned
  - Piano alone for the first 30% of the piece
  - Each new element adds a layer of anticipation
  - The arpeggio arriving should feel like a dam breaking

- **Too much reverb on piano**: Felt piano is intimate and dry
  - 2.2s decay, 28% wet - close-mic, room scale
  - The muted character comes from the envelope, not from drowning it in space
  - Contrast with the hall reverb on the pad and arpeggio

- **Kick too aggressive**: This is a felt thump, not a club kick
  - Low pitchDecay (0.04), only 3 octaves
  - -12dB, velocity 0.55 - it's a pulse, not an impact
  - Should feel like a heartbeat beneath the music

- **Robotic arpeggio**: Needs subtle humanization and velocity variation
  - H(4) for timing, plus random velocity offset (0.5 + random * 0.12)
  - Slight imperfection makes it feel like fingers, not a sequencer
  - The delay and reverb smooth out the imperfections into shimmer

- **Missing the breath texture**: The pink noise layer adds life
  - Very quiet (0.018 gain) bandpass filtered noise
  - Simulates the ambient sound of a room, of breathing, of felt
  - Without it the digital instruments sound sterile

### Mixing Approach

- **Felt Piano RH**: -7dB, sine wave, fast decay (0.55s), velocity 0.35-0.55, room reverb (2.2s)
- **Felt Piano LH**: -10dB, sine wave, bass register roots, same reverb
- **Analog Pad**: -14dB, sawtooth through -24dB/oct lowpass (400-2000Hz automation), hall reverb (3.8s)
- **Sub-Bass**: -10dB, sine MonoSynth, pulsing 8th-note pattern, clean through limiter
- **Kick**: -12dB, MembraneSynth, felt thump character (low pitchDecay), quarter notes
- **Arpeggio**: -11dB, triangle wave, 16th notes, dotted 8th ping-pong delay (28% feedback)
- **Breath Texture**: 0.018 gain, pink noise bandpass at 1200Hz, constant

**Effects:**
- Room Reverb: 2.2s decay, 28% wet (piano - intimate, close)
- Hall Reverb: 3.8s decay, 38% wet (pad, arpeggio - spacious, enveloping)
- Arp Delay: Dotted 8th ping-pong, 28% feedback, 22% wet (shimmer and depth)
- Limiter: -3dB threshold (glue and protection)

### Reference Tracks

1. **Nils Frahm - Says (Live at Funkhaus)** - The definitive felt-piano-to-synth-arpeggio build, towering climax
2. **Nils Frahm - Hammers** - Repetitive piano patterns building through electronic layering
3. **Nils Frahm - Felt** - Pure felt piano intimacy, the muted tone that defines the instrument
4. **Nils Frahm - All Melody** - Piano and synth intertwined, analog warmth meets acoustic fragility
5. **Nils Frahm - My Friend the Forest** - Gentle electronic pulse underneath contemplative piano

### Structural Blueprint (60s @ 116 BPM = ~16 bars)

- **Bars 0-3 (Felt Piano Solo)**: Piano melody + left hand alone
  - Exposed, percussive, muted tones
  - Heavy humanization creates breathing, rubato-like phrasing
  - Breath noise texture barely audible beneath
  - Each note a soft thump that decays quickly

- **Bars 3-5 (Pad Emerges)**: Analog pad swells in underneath
  - Filter still at 400Hz - just warmth, no definition
  - Pad sits below the piano, felt more than heard
  - The sense of space begins to expand
  - Piano continues uninterrupted

- **Bars 5-7 (Pulse Establishes)**: Sub-bass + kick enter
  - Soft electronic kick anchors the tempo
  - Sub-bass pulses on 8th notes, adding weight
  - Pad filter begins its slow sweep upward (400 → 2000Hz)
  - Transition from intimate to expansive begins

- **Bars 7-14 (Arpeggio Drives)**: Synth arpeggio takes over
  - 16th-note triangle arpeggio with delay creates shimmering wall
  - Pad filter continues opening - full warmth arrives
  - All elements present at maximum density
  - Piano still flickers underneath the electronic wash

- **Bars 14-16 (Return to Intimacy)**: Elements recede
  - Arpeggio and kick stop
  - Sub-bass fades
  - Pad filter closes back to 400Hz
  - Return to piano alone for seamless loop

### Tonal Characteristics

- **Harmonic**: A minor (Am → F → C → G), simple and cyclical, gives the arpeggio room to soar
- **Melodic**: Felt piano melody with percussive articulation, arpeggio provides harmonic motion
- **Rhythmic**: Begins rubato (piano humanization), gains steady pulse (kick + bass), ends with driving 16ths (arpeggio)
- **Textural**: Muted sine piano → warm filtered sawtooth → shimmering triangle arpeggio, layered density
- **Dynamic**: Intimate whisper to towering electronic wash, driven by filter automation not volume
- **Production**: Close-mic piano with room reverb contrasted against spacious hall reverb on electronics