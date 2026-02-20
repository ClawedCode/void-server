---
category: neoclassical
energy: medium
tags: [orchestral, strings, cinematic, emotional, modern-classical]
---
## Max Richter (Recomposed / Postclassical)

**Tempo**: 76 BPM (unhurried, stately, with a sense of inevitability)
**Time Signature**: 4/4 (steady pulse from the strings, not percussion)
**Key**: D minor (the key of lament - Dm → Bb → Gm → A, classical gravity)
**Instruments**: Violin section (PolySynth, high sawtooth, 0.3s attack), viola section (PolySynth, mid sawtooth, 0.5s attack), cello section (PolySynth, low sawtooth, 0.7s attack), sub-bass drone (sine, very quiet), piano countermelody (sine, delicate), subtle electronic pulse (filtered click pattern)
**Structure**: Solo cello line → Viola harmony joins → Full string section → Piano countermelody weaves in → Peak emotional swell → Strings thin to cello alone
**Vibe**: The opening credits of a film about loss and grace. Strings swell like tide water - the cellos pulling at something deep below the surface, the violas holding the middle ground with quiet resolve, the violins reaching upward as if trying to touch something just out of reach. This is "On the Nature of Daylight" territory - music that makes strangers cry on public transport, that makes the mundane feel sacred. Max Richter strips classical orchestration to its emotional core: long bowing, legato phrasing, patient harmonic movement. The sub-bass drone anchors everything to the earth while the strings try to lift away from it. No drums, no rhythm section - the pulse comes from the bowing patterns themselves. When the piano enters, it's not a new voice but a ghost of the strings, tracing their shapes in a different register. The electronic pulse is almost subliminal - a quiet digital heartbeat that marks Richter as contemporary, not period.

### Key Characteristics

1. **Layered String Sections**: Three distinct string voices (violin, viola, cello) with different attack times simulating bowing weight
2. **Legato Phrasing**: Long attack envelopes (0.3-0.7s) and sustained notes - nothing is percussive or plucked
3. **Emotional Swells**: Volume automation on strings creates breathing crescendos and diminuendos
4. **Concert Hall Reverb**: Warm, large-space reverb (3.0-3.5s decay) placing the instruments in a real acoustic space
5. **No Drums**: Rhythm comes entirely from the bowing patterns and harmonic rhythm of the strings
6. **Piano as Ghost Voice**: Delicate piano countermelody that echoes the string lines, never leads
7. **Sub-Bass Drone**: Barely audible sine drone anchoring the harmonic foundation below the cellos
8. **Subliminal Electronic Pulse**: Filtered click pattern at the threshold of perception, the only "modern" element

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 76;
  Tone.Transport.bpm.value = bpm;

  // Humanization for natural string feel
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.78).toDestination();
  const limiter = new Tone.Limiter({ threshold: -3 }).connect(master);

  // === REVERBS ===
  // Concert hall reverb for strings (warm, spacious)
  const hallVerb = new Tone.Reverb({
    decay: 3.2,
    preDelay: 0.025,
    wet: 0.36
  });
  await hallVerb.generate();
  hallVerb.connect(limiter);

  // Intimate reverb for piano (closer, less wash)
  const pianoVerb = new Tone.Reverb({
    decay: 2.0,
    preDelay: 0.01,
    wet: 0.3
  });
  await pianoVerb.generate();
  pianoVerb.connect(limiter);

  // Chorus for string vibrato simulation
  const stringChorus = new Tone.Chorus({
    frequency: 4.5,
    delayTime: 3.5,
    depth: 0.12,
    wet: 0.3
  }).connect(hallVerb);
  stringChorus.start();

  // === VIOLIN SECTION (high strings, fast attack for expressiveness) ===
  const violinFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 4500,
    Q: 0.7
  }).connect(stringChorus);

  const violins = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.3,
      decay: 0.4,
      sustain: 0.8,
      release: 2.0
    },
    volume: -14
  }).connect(violinFilter);

  // === VIOLA SECTION (mid strings, medium attack) ===
  const violaFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 3500,
    Q: 0.6
  }).connect(stringChorus);

  const violas = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.5,
      decay: 0.5,
      sustain: 0.75,
      release: 2.5
    },
    volume: -15
  }).connect(violaFilter);

  // === CELLO SECTION (low strings, slow attack for deep bowing) ===
  const celloFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 2500,
    Q: 0.5
  }).connect(stringChorus);

  const cellos = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.7,
      decay: 0.6,
      sustain: 0.7,
      release: 3.0
    },
    volume: -12
  }).connect(celloFilter);

  // === PIANO (delicate countermelody, ghost voice) ===
  const piano = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.006,
      decay: 1.8,
      sustain: 0.08,
      release: 2.5
    },
    volume: -13
  }).connect(pianoVerb);

  // === SUB-BASS DRONE (barely audible anchor) ===
  const drone = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 5.0,
      decay: 2.0,
      sustain: 0.4,
      release: 6.0
    },
    volume: -24
  }).connect(limiter);

  // === ELECTRONIC PULSE (filtered click, subliminal) ===
  const pulseFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 2000,
    Q: 3
  }).connect(new Tone.Gain(0.08).connect(pianoVerb));

  const pulse = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.012,
      sustain: 0
    },
    volume: -20
  }).connect(pulseFilter);

  // === CELLO MELODY (solo opening line, D minor) ===
  const celloPart = new Tone.Part((time, ev) => {
    cellos.triggerAttackRelease(ev.notes, ev.dur, time + H(10), ev.vel);
  }, [
    { time: "0:0:0", notes: ["D3"], dur: "2n.", vel: 0.4 },
    { time: "0:3:0", notes: ["E3"], dur: "4n", vel: 0.35 },
    { time: "1:0:0", notes: ["F3"], dur: "2n", vel: 0.45 },
    { time: "1:2:0", notes: ["E3"], dur: "4n", vel: 0.38 },
    { time: "1:3:0", notes: ["D3"], dur: "4n", vel: 0.4 },
    { time: "2:0:0", notes: ["A2"], dur: "2n.", vel: 0.42 },
    { time: "2:3:0", notes: ["Bb2"], dur: "4n", vel: 0.35 },
    { time: "3:0:0", notes: ["A2"], dur: "1m", vel: 0.4 }
  ]);
  celloPart.loop = true;
  celloPart.loopEnd = "4m";

  // === VIOLA HARMONY (enters bar 3, adds warmth) ===
  const violaPart = new Tone.Part((time, ev) => {
    violas.triggerAttackRelease(ev.notes, ev.dur, time + H(8), ev.vel);
  }, [
    { time: "0:0:0", notes: ["A3", "D4"], dur: "2m", vel: 0.3 },
    { time: "2:0:0", notes: ["Bb3", "D4"], dur: "2n", vel: 0.35 },
    { time: "2:2:0", notes: ["G3", "Bb3"], dur: "2n", vel: 0.3 },
    { time: "3:0:0", notes: ["A3", "C#4"], dur: "1m", vel: 0.32 }
  ]);
  violaPart.loop = true;
  violaPart.loopEnd = "4m";

  // === VIOLIN LINE (enters bar 6, soaring above) ===
  const violinPart = new Tone.Part((time, ev) => {
    violins.triggerAttackRelease(ev.notes, ev.dur, time + H(8), ev.vel);
  }, [
    { time: "0:0:0", notes: ["D5", "F5"], dur: "2n.", vel: 0.32 },
    { time: "0:3:0", notes: ["E5"], dur: "4n", vel: 0.28 },
    { time: "1:0:0", notes: ["F5", "A5"], dur: "2n", vel: 0.38 },
    { time: "1:2:0", notes: ["E5", "G5"], dur: "2n", vel: 0.35 },
    { time: "2:0:0", notes: ["D5", "F5"], dur: "2n.", vel: 0.4 },
    { time: "2:3:0", notes: ["C5"], dur: "4n", vel: 0.3 },
    { time: "3:0:0", notes: ["D5"], dur: "1m", vel: 0.35 }
  ]);
  violinPart.loop = true;
  violinPart.loopEnd = "4m";

  // === PIANO COUNTERMELODY (ghost of the strings) ===
  const pianoPart = new Tone.Part((time, ev) => {
    piano.triggerAttackRelease(ev.note, ev.dur, time + H(15), ev.vel);
  }, [
    { time: "0:0:0", note: "D5", dur: "2n", vel: 0.35 },
    { time: "0:2:0", note: "A4", dur: "4n", vel: 0.3 },
    { time: "1:0:0", note: "F4", dur: "2n", vel: 0.38 },
    { time: "1:3:0", note: "G4", dur: "4n", vel: 0.28 },
    { time: "2:0:0", note: "Bb4", dur: "4n.", vel: 0.32 },
    { time: "2:2:0", note: "A4", dur: "4n", vel: 0.3 },
    { time: "3:0:0", note: "D4", dur: "2n", vel: 0.25 },
    { time: "3:2:0", note: "E4", dur: "2n", vel: 0.32 }
  ]);
  pianoPart.loop = true;
  pianoPart.loopEnd = "4m";

  // === SUB-BASS DRONE (very slow root movement) ===
  const dronePart = new Tone.Part((time, ev) => {
    drone.triggerAttackRelease(ev.note, ev.dur, time, 0.2);
  }, [
    { time: "0:0:0", note: "D1", dur: "8m" },
    { time: "8:0:0", note: "A0", dur: "8m" }
  ]);
  dronePart.loop = true;
  dronePart.loopEnd = "16m";

  // === ELECTRONIC PULSE PATTERN (subtle, quarter note click) ===
  const pulsePart = new Tone.Loop((time) => {
    if (Math.random() > 0.25) {
      pulse.triggerAttackRelease("64n", time + H(6), 0.3 + Math.random() * 0.1);
    }
  }, "4n");

  // === VOLUME SWELLS (emotional breathing on strings) ===
  // Violins swell: quiet → full → quiet over 4 bars
  const violinSwell = new Tone.Loop((time) => {
    violins.volume.linearRampToValueAtTime(-10, time + Tone.Time("2m").toSeconds());
    violins.volume.linearRampToValueAtTime(-14, time + Tone.Time("4m").toSeconds());
  }, "4m");

  // Cellos swell: parallel breathing
  const celloSwell = new Tone.Loop((time) => {
    cellos.volume.linearRampToValueAtTime(-9, time + Tone.Time("2m").toSeconds());
    cellos.volume.linearRampToValueAtTime(-12, time + Tone.Time("4m").toSeconds());
  }, "4m");

  // === ARRANGEMENT (60s @ 76 BPM = ~13 bars) ===

  // Bars 0-3: Solo cello line + sub-drone (exposed, vulnerable)
  celloPart.start("0:0:0");
  dronePart.start("0:0:0");

  // Bars 3-5: Viola harmony enters
  Tone.Transport.schedule((t) => {
    violaPart.start(t);
  }, "3:0:0");

  // Bars 5-7: Full string section (violins join)
  Tone.Transport.schedule((t) => {
    violinPart.start(t);
    violinSwell.start(t);
    celloSwell.start(t);
  }, "5:0:0");

  // Bars 7-9: Piano countermelody weaves in + electronic pulse
  Tone.Transport.schedule((t) => {
    pianoPart.start(t);
    pulsePart.start(t);
  }, "7:0:0");

  // Bars 9-11: Peak emotional swell (all voices, maximum expression)
  Tone.Transport.schedule((t) => {
    violins.volume.linearRampToValueAtTime(-9, t + Tone.Time("2m").toSeconds());
    violas.volume.linearRampToValueAtTime(-11, t + Tone.Time("2m").toSeconds());
    cellos.volume.linearRampToValueAtTime(-8, t + Tone.Time("2m").toSeconds());
  }, "9:0:0");

  // Bars 11-13: Strip back (strings thin, return to cello)
  Tone.Transport.schedule((t) => {
    violinPart.stop(t + Tone.Time("1m").toSeconds());
    violinSwell.stop(t);
    pianoPart.stop(t + Tone.Time("1m").toSeconds());
    pulsePart.stop(t + Tone.Time("1m").toSeconds());
    violins.volume.linearRampToValueAtTime(-14, t + Tone.Time("1m").toSeconds());
    violas.volume.linearRampToValueAtTime(-15, t + Tone.Time("1m").toSeconds());
    cellos.volume.linearRampToValueAtTime(-12, t + Tone.Time("1m").toSeconds());
  }, "11:0:0");

  Tone.Transport.schedule((t) => {
    violaPart.stop(t + Tone.Time("1m").toSeconds());
    celloSwell.stop(t);
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { violins, violinFilter, violas, violaFilter, cellos, celloFilter, piano, drone, pulse, pulseFilter, stringChorus, hallVerb, pianoVerb, limiter };
  window.toneJsParts = { celloPart, violaPart, violinPart, pianoPart, dronePart, pulsePart, violinSwell, celloSwell };
};
```

### Common Mistakes to Avoid

- **Strings too bright/buzzy**: Sawtooth needs heavy lowpass filtering
  - Violins at 4500Hz, violas at 3500Hz, cellos at 2500Hz
  - Without filtering, sawtooth sounds like a synthesizer, not strings
  - The filter removes harshness while preserving the bowing character

- **Same attack time on all strings**: Different instruments bow differently
  - Violins: 0.3s attack (light, responsive bow)
  - Violas: 0.5s attack (heavier bow, more weight)
  - Cellos: 0.7s attack (slow, deep bow pressure)
  - This differentiation creates realistic orchestral layering

- **Adding drums or percussion**: There are NO drums in this style
  - The pulse comes from string bowing patterns and harmonic rhythm
  - The only percussive element is the subliminal electronic click (barely audible)
  - If you hear a beat, you've broken the spell

- **Not enough reverb / wrong reverb character**: This needs concert hall warmth
  - 3.0-3.5s decay places the strings in a real acoustic space
  - 36% wet keeps clarity while adding depth
  - Not a cathedral (too vast) and not a room (too small) - a concert hall

- **Piano too loud or too present**: Piano is a ghost, not a soloist
  - -13dB, velocity 0.25-0.38 - always underneath the strings
  - It traces the string melodies in a different register
  - If you notice the piano before the strings, it's too loud

- **Missing volume swells**: Strings need to breathe
  - Volume automation creates crescendo/diminuendo within phrases
  - Without this, strings sound static and mechanical
  - The emotional weight lives in the dynamic shaping

- **Flat harmonic rhythm**: Chords should move with classical gravity
  - Dm → Bb → Gm → A progression has natural voice-leading tension
  - Each chord change should feel inevitable, not arbitrary
  - The A major chord (dominant) creates yearning to resolve back to D minor

### Mixing Approach

- **Violins**: -14dB (swells to -9dB at peak), sawtooth lowpassed at 4500Hz, chorus for vibrato, hall reverb
- **Violas**: -15dB (swells to -11dB), sawtooth lowpassed at 3500Hz, same chorus and reverb chain
- **Cellos**: -12dB (swells to -8dB at peak), sawtooth lowpassed at 2500Hz, deepest voice carries the melody
- **Piano**: -13dB, sine with fast attack/long decay, velocity 0.25-0.38, piano reverb (2.0s, drier)
- **Sub-Drone**: -24dB, sine, 5s attack, barely perceptible harmonic anchor
- **Electronic Pulse**: -20dB into 0.08 gain, white noise bandpass at 2kHz, quarter-note click (75% probability)

**Effects:**
- Hall Reverb: 3.2s decay, 36% wet (concert hall scale, warm, for all strings)
- Piano Reverb: 2.0s decay, 30% wet (closer, more intimate, for piano + pulse)
- String Chorus: 4.5Hz rate, 30% wet (simulates natural vibrato/bowing inconsistency)
- Limiter: -3dB threshold (transparent peak control)

### Reference Tracks

1. **Max Richter - On the Nature of Daylight** - The definitive string lament, layered sections building to emotional peak
2. **Max Richter - November** - Solo piano and strings, devastating simplicity, breathe and swell
3. **Max Richter - Recomposed: Vivaldi - Spring 1** - Classical reimagined with electronic subtexts, looping string patterns
4. **Max Richter - Dream 3 (from Sleep)** - Ultra-slow, sustained strings, the sound of letting go
5. **Max Richter - The Leftovers Theme (Departure)** - Piano and strings in perfect emotional balance, restrained grief

### Structural Blueprint (60s @ 76 BPM = ~13 bars)

- **Bars 0-3 (Solo Cello)**: Cello melody alone with sub-drone
  - Exposed, vulnerable single voice
  - Slow 0.7s attack gives each note weight and intention
  - Sub-drone barely audible, anchoring the D minor root
  - The simplest possible statement of the theme

- **Bars 3-5 (Viola Harmony)**: Violas add harmonic depth
  - Two-note chords supporting the cello line
  - Medium 0.5s attack blends with the cello bowing
  - Warmth increases without adding brightness
  - The harmony makes the cello melody feel less alone

- **Bars 5-7 (Full String Section)**: Violins enter with high counterpoint
  - Three-layer string texture now complete
  - Volume swells begin (breathing crescendos)
  - Chorus vibrato creates natural ensemble feel
  - Concert hall reverb fully activated

- **Bars 7-9 (Piano + Pulse)**: Piano countermelody and electronic heartbeat
  - Piano traces the string shapes in a higher register
  - Electronic pulse adds subliminal rhythmic grounding
  - Maximum textural richness without maximum volume
  - The contemporary element reveals itself

- **Bars 9-13 (Peak and Return)**: Emotional climax, then strip to cello
  - All voices at peak intensity (volume swells to maximum)
  - Bars 11-13: violins and piano recede, violas thin
  - Returns to cello + drone for seamless loop
  - The arc feels like a complete emotional breath

### Tonal Characteristics

- **Harmonic**: D minor (Dm → Bb → Gm → A), classical voice-leading with dominant tension
- **Melodic**: Cello carries the primary theme, violins provide high counterpoint, piano echoes both
- **Rhythmic**: No percussion - rhythm emerges from bowing patterns, half-note and dotted-half phrasing
- **Textural**: Layered filtered sawtooth strings with chorus vibrato, sine piano as contrast, sine drone as foundation
- **Dynamic**: Breathing volume swells on strings create the emotional arc, peak at 70-80% of duration
- **Production**: Concert hall warmth (3.2s reverb), distinct string sections with different attacks, piano mixed behind strings