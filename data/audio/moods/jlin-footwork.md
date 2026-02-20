---
category: experimental
energy: high
tags: [footwork, juke, polyrhythm, syncopated, Chicago]
---
## Jlin (Chicago Footwork / Abstract Rhythm)

**Tempo**: 160 BPM
**Time Signature**: 4/4 with pervasive triplet feel throughout
**Key**: Minimal harmony (percussion-focused, occasional stabs in Bb minor)
**Instruments**: Punchy kick (MembraneSynth, short and tight), snappy snare (NoiseSynth, very short decay 0.04s), rapid triplet hi-hats (MetalSynth, alternating open/closed), metallic stab (PolySynth with very short envelope, used sparingly), sub-bass hits (sine, triggered on specific beats only), rim click (high-frequency filtered noise)
**Structure**: Single kick pulse → Syncopation builds → Full polyrhythmic complexity → Dramatic negative space breakdown → Rebuild to peak
**Vibe**: Rhythm IS the composition. Black Origami-era Jlin - percussion so complex it becomes melodic, silence so deliberate it becomes rhythmic. Chicago footwork stripped to its abstract essence. The kick pattern is the entire narrative - syncopation that makes your body move in directions it did not know existed. Triplet hi-hats that start and stop like someone cutting tape with scissors. Bars where everything drops out except a single kick, and that empty space hits harder than any bass drop. Not music with drums - drums that ARE the music.

### Key Characteristics

1. **Kick-As-Composition**: The kick pattern IS the melody - complex syncopation tells the story
2. **Triplet Hi-Hats**: Rapid triplet rolls that start and stop abruptly, not continuous
3. **Dramatic Negative Space**: 1-2 beat gaps where everything drops out, silence as compositional element
4. **Sparse Tonal Elements**: Metallic stabs used like punctuation marks, not melody
5. **Sub-Bass as Accent**: Sine sub hits on specific beats only, not continuous bassline
6. **Snare Displacement**: Snare never sits on a predictable backbeat
7. **Polyrhythmic Layering**: Kick in straight time against triplet hats against displaced snare
8. **Abrupt Transitions**: Patterns start and stop without warning or fade

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 160;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const limiter = new Tone.Limiter(-2).toDestination();
  const masterComp = new Tone.Compressor({
    ratio: 4,
    threshold: -10,
    attack: 0.002,
    release: 0.08,
    knee: 3
  }).connect(limiter);
  const master = new Tone.Gain(0.9).connect(masterComp);

  // === FX ===
  // Tight room reverb (footwork is dry but needs tiny space)
  const tightRoom = new Tone.Reverb({
    decay: 0.4,
    preDelay: 0.005,
    wet: 0.1
  });
  await tightRoom.generate();
  tightRoom.connect(master);

  // Metallic reverb for stabs
  const stabVerb = new Tone.Reverb({
    decay: 1.2,
    preDelay: 0.01,
    wet: 0.25
  });
  await stabVerb.generate();
  stabVerb.connect(master);

  // Clean bus for kick and sub
  const cleanBus = new Tone.Gain(1).connect(master);

  // === PUNCHY KICK (tight, no tail) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 6,
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0
    },
    volume: -2
  }).connect(cleanBus);

  // === SNAPPY SNARE (very short, 40ms decay) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.04,
      sustain: 0
    },
    volume: -6
  }).connect(tightRoom);

  // Snare body for weight
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.005,
    octaves: 2,
    envelope: {
      attack: 0.001,
      decay: 0.04,
      sustain: 0
    },
    volume: -14
  }).connect(tightRoom);

  // === RAPID TRIPLET HI-HATS (alternating open/closed) ===
  const hatClosed = new Tone.MetalSynth({
    frequency: 400,
    envelope: {
      attack: 0.001,
      decay: 0.015,
      release: 0.005
    },
    harmonicity: 5.1,
    modulationIndex: 36,
    resonance: 7000,
    volume: -14
  }).connect(tightRoom);

  const hatOpen = new Tone.MetalSynth({
    frequency: 400,
    envelope: {
      attack: 0.001,
      decay: 0.08,
      release: 0.04
    },
    harmonicity: 5.1,
    modulationIndex: 36,
    resonance: 7000,
    volume: -16
  }).connect(tightRoom);

  // === METALLIC STAB (sparse punctuation) ===
  const stab = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.06,
      sustain: 0,
      release: 0.03
    },
    volume: -10
  }).connect(stabVerb);

  // === SUB-BASS HITS (sine, specific beats only) ===
  const sub = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.3,
      release: 0.15
    },
    volume: -4
  }).connect(cleanBus);

  // === RIM CLICK ===
  const rim = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.001,
      decay: 0.012,
      sustain: 0
    },
    volume: -12
  }).connect(new Tone.Filter({ frequency: 3500, type: "bandpass", Q: 4 }).connect(tightRoom));

  // === KICK PATTERN SYSTEM ===
  // Pattern A: Simple pulse (intro)
  const kickPatternA = [
    { time: "0:0:0", vel: 0.95 },
    { time: "0:1:0", vel: 0.85 },
    { time: "0:2:0", vel: 0.9 },
    { time: "0:3:0", vel: 0.85 }
  ];

  // Pattern B: Syncopated (building)
  const kickPatternB = [
    { time: "0:0:0", vel: 0.95 },
    { time: "0:0:3", vel: 0.7 },
    { time: "0:1:2", vel: 0.85 },
    { time: "0:2:0", vel: 0.9 },
    { time: "0:3:1", vel: 0.75 },
    { time: "0:3:3", vel: 0.65 }
  ];

  // Pattern C: Full complexity (peak)
  const kickPatternC = [
    { time: "0:0:0", vel: 0.95 },
    { time: "0:0:2", vel: 0.6 },
    { time: "0:1:0", vel: 0.85 },
    { time: "0:1:3", vel: 0.7 },
    { time: "0:2:1", vel: 0.8 },
    { time: "0:2:3", vel: 0.6 },
    { time: "0:3:0", vel: 0.9 },
    { time: "0:3:2", vel: 0.7 }
  ];

  // Pattern D: Negative space (breakdown - only 2 kicks per bar)
  const kickPatternD = [
    { time: "0:0:0", vel: 0.95 },
    { time: "0:2:0", vel: 0.8 }
  ];

  // Pattern E: Rebuild (variation on C)
  const kickPatternE = [
    { time: "0:0:0", vel: 0.95 },
    { time: "0:0:3", vel: 0.65 },
    { time: "0:1:1", vel: 0.8 },
    { time: "0:2:0", vel: 0.9 },
    { time: "0:2:2", vel: 0.55 },
    { time: "0:3:0", vel: 0.85 },
    { time: "0:3:1", vel: 0.6 },
    { time: "0:3:3", vel: 0.7 }
  ];

  function makeKickPart(pattern) {
    const p = new Tone.Part((time, ev) => {
      kick.triggerAttackRelease("C1", "16n", time + H(3), ev.vel);
    }, pattern);
    p.loop = true;
    p.loopEnd = "1m";
    return p;
  }

  const kickPartA = makeKickPart(kickPatternA);
  const kickPartB = makeKickPart(kickPatternB);
  const kickPartC = makeKickPart(kickPatternC);
  const kickPartD = makeKickPart(kickPatternD);
  const kickPartE = makeKickPart(kickPatternE);

  // === SNARE PATTERN (displaced, never predictable) ===
  const snareEvents = [
    { time: "0:1:2", vel: 0.8 },
    { time: "0:3:1", vel: 0.7 },
    { time: "1:0:3", vel: 0.75 },
    { time: "1:2:1", vel: 0.85 },
    { time: "1:3:3", vel: 0.65 }
  ];
  const snarePart = new Tone.Part((time, ev) => {
    snare.triggerAttackRelease("32n", time + H(5), ev.vel);
    snareBody.triggerAttackRelease("E3", "32n", time + H(3), ev.vel * 0.5);
  }, snareEvents);
  snarePart.loop = true;
  snarePart.loopEnd = "2m";

  // === TRIPLET HI-HAT ROLL SYSTEM ===
  // Rolls triggered at specific points, not continuous
  let hatRollActive = false;
  let hatTripletStep = 0;

  const hatTripletClock = new Tone.Loop((time) => {
    if (!hatRollActive) return;
    const isOpen = hatTripletStep % 5 === 0; // Open on every 5th = irregular feel
    if (isOpen) {
      hatOpen.triggerAttackRelease("32n", time + H(4), 0.35 + Math.random() * 0.15);
    } else {
      hatClosed.triggerAttackRelease("64n", time + H(4), 0.25 + Math.random() * 0.2);
    }
    hatTripletStep++;
  }, "8t"); // Triplet 8ths = the footwork hat sound

  // Hat roll on/off schedule (abrupt starts and stops)
  const hatGatePart = new Tone.Part((time, ev) => {
    hatRollActive = ev.on;
    if (ev.on) hatTripletStep = 0;
  }, [
    // Roll for first half of bar 1, silent second half
    { time: "0:0:0", on: true },
    { time: "0:2:0", on: false },
    // Short burst in bar 2
    { time: "1:1:0", on: true },
    { time: "1:2:0", on: false },
    // Full bar 3
    { time: "2:0:0", on: true },
    { time: "2:3:2", on: false },
    // Nothing in bar 4 (negative space)
    { time: "3:0:0", on: false }
  ]);
  hatGatePart.loop = true;
  hatGatePart.loopEnd = "4m";

  // === RIM PATTERN (sparse ghost accents) ===
  const rimPart = new Tone.Part((time, ev) => {
    if (Math.random() > 0.3) {
      rim.triggerAttackRelease("64n", time + H(6), ev.vel);
    }
  }, [
    { time: "0:0:2", vel: 0.6 },
    { time: "0:2:1", vel: 0.5 },
    { time: "1:1:3", vel: 0.55 },
    { time: "1:3:2", vel: 0.45 }
  ]);
  rimPart.loop = true;
  rimPart.loopEnd = "2m";

  // === SUB-BASS HITS (specific accents only) ===
  const subPart = new Tone.Part((time, ev) => {
    sub.triggerAttackRelease(ev.note, "8n", time + H(4), 0.85);
  }, [
    { time: "0:0:0", note: "Bb1" },
    { time: "2:2:0", note: "Bb1" },
    { time: "5:0:0", note: "Ab1" },
    { time: "7:3:0", note: "Bb1" }
  ]);
  subPart.loop = true;
  subPart.loopEnd = "8m";

  // === METALLIC STABS (punctuation, very sparse) ===
  const stabPart = new Tone.Part((time, ev) => {
    stab.triggerAttackRelease(ev.chord, "32n", time, 0.65);
  }, [
    { time: "3:0:0", chord: ["Bb3", "Db4", "F4"] },
    { time: "7:2:0", chord: ["Ab3", "Db4", "Eb4"] },
    { time: "11:0:0", chord: ["Bb3", "Db4", "Gb4"] },
    { time: "15:1:0", chord: ["Ab3", "Cb4", "Eb4"] }
  ]);
  stabPart.loop = true;
  stabPart.loopEnd = "16m";

  // === ARRANGEMENT (60s @ 160 BPM = ~20 bars) ===

  // Section 1 - Bars 0-4: Simple pulse (kick only, establishing tempo)
  kickPartA.start("0:0:0");
  kickPartA.stop("4:0:0");

  // Section 2 - Bars 4-8: Syncopation builds (add snare, hats start gating)
  Tone.Transport.schedule((t) => {
    kickPartB.start(t);
    snarePart.start(t);
    hatTripletClock.start(t);
    hatGatePart.start(t);
    rimPart.start(t);
  }, "4:0:0");
  kickPartB.stop("8:0:0");

  // Section 3 - Bars 8-12: Full polyrhythmic complexity (peak kick pattern, sub, stabs)
  Tone.Transport.schedule((t) => {
    kickPartC.start(t);
    subPart.start(t);
    stabPart.start(t);
  }, "8:0:0");
  kickPartC.stop("12:0:0");

  // Section 4 - Bars 12-15: Negative space breakdown (strip to minimal kick)
  Tone.Transport.schedule((t) => {
    kickPartD.start(t);
    // Stop hats and snare for dramatic silence
    hatRollActive = false;
    hatTripletClock.stop(t);
    hatGatePart.stop(t);
    snarePart.stop(t);
    rimPart.stop(t);
  }, "12:0:0");
  kickPartD.stop("15:0:0");

  // Section 5 - Bars 15-20: Rebuild to new peak (everything returns, new kick variation)
  Tone.Transport.schedule((t) => {
    kickPartE.start(t);
    snarePart.start(t);
    hatTripletClock.start(t);
    hatGatePart.start(t);
    rimPart.start(t);
    // Open hat slightly louder in rebuild
    hatOpen.volume.linearRampToValueAtTime(-14, t + Tone.Time("2m").toSeconds());
  }, "15:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, snare, snareBody, hatClosed, hatOpen, stab, sub, rim, tightRoom, stabVerb, masterComp, limiter };
  window.toneJsParts = { kickPartA, kickPartB, kickPartC, kickPartD, kickPartE, snarePart, hatTripletClock, hatGatePart, rimPart, subPart, stabPart };
};
```

### Common Mistakes to Avoid

- **Continuous hi-hats**: Footwork hats are NOT always running
  - Triplet rolls start and stop abruptly using a gate system
  - Full bars of silence from hats create dramatic contrast
  - The gaps between rolls matter as much as the rolls themselves

- **Simple kick patterns**: The kick IS the composition
  - Use 5+ different kick patterns that evolve through the arrangement
  - Syncopation against the triplet hat grid creates the polyrhythmic feel
  - Each pattern should tell a different rhythmic story

- **Too much melody/harmony**: This is percussion music
  - Metallic stabs appear 3-4 times per minute, not per bar
  - Sub-bass hits are accents, not a bassline
  - Tonal elements are punctuation marks in a rhythmic sentence

- **No negative space**: The empty beats are compositional
  - Include full bars with only 1-2 kicks (Pattern D)
  - Drop ALL percussion except kick for 2-4 bars in breakdown
  - The silence should feel like the floor dropped out

- **Predictable snare placement**: Snare must never be on 2 and 4
  - Every snare hit displaced to off-grid positions
  - Very short decay (40ms) - a crack, not a wash
  - Snare should surprise on every hit

- **Too much reverb/effects**: Footwork is DRY
  - Tight room reverb only (0.4s decay, 10% wet)
  - Kick and sub completely dry on clean bus
  - Only metallic stabs get noticeable reverb (1.2s, 25% wet)

- **Wrong BPM feel**: 160 BPM but NOT fast-feeling
  - The syncopation creates a half-time feel despite high tempo
  - Complexity comes from subdivision, not speed
  - Listener should feel weight, not frenzy

### Mixing Approach

- **Kick**: -2dB, tight membrane (15ms decay), direct to clean bus, NO reverb
- **Snare**: -6dB, white noise 40ms decay + body layer, tight room reverb (10% wet)
- **Closed Hat**: -14dB, 15ms decay, MetalSynth through tight room
- **Open Hat**: -16dB, 80ms decay, same routing as closed
- **Metallic Stab**: -10dB, PolySynth (square wave), very short (60ms), through stab reverb
- **Sub-Bass**: -4dB, pure sine, clean bus, accent hits only (4 per 8 bars)
- **Rim Click**: -12dB, bandpass filtered noise (3500Hz, Q: 4), sparse ghost accents

**Master Chain:**
- Compressor: 4:1 ratio, -10dB threshold, 2ms attack, 80ms release (aggressive transient punch)
- Limiter: -2dB ceiling

**Effects:**
- Tight Room: 0.4s decay, 10% wet (percussion space)
- Stab Reverb: 1.2s decay, 25% wet (metallic stab tail)
- Everything else: dry

### Reference Tracks

1. **Jlin - Black Origami** - Abstract footwork percussion, rhythmic negative space, sparse stabs
2. **Jlin - Carbon 7** - Complex kick syncopation, abrupt hat rolls, minimal tonal content
3. **DJ Rashad - Let It Go** - Classic Chicago footwork template, triplet hats, syncopated kicks
4. **RP Boo - Bangin on King Drive** - Raw footwork polyrhythm, kick-as-melody, dramatic gaps
5. **Jlin - Enigma** - Peak rhythmic complexity, percussion-as-composition, negative space mastery

### Structural Blueprint (60s @ 160 BPM = ~20 bars)

- **Bars 0-4 (Simple Pulse)**: Kick only, four-on-the-floor establishing tempo
  - Just the kick, nothing else - letting the listener lock to 160 BPM
  - Simple quarter-note pattern, clean and exposed
  - Tension from the emptiness - anticipation of what comes
  - This IS footwork restraint - building from absolute minimum

- **Bars 4-8 (Syncopation Builds)**: Syncopated kick + snare + gated triplet hats + rim
  - Kick pattern shifts from straight to syncopated (Pattern B)
  - Displaced snare enters at off-grid positions
  - Triplet hi-hat rolls gate on and off - 2 beats rolling, 2 beats silent
  - Polyrhythmic tension between straight kick, triplet hats, displaced snare

- **Bars 8-12 (Full Polyrhythmic Complexity)**: Peak pattern + sub hits + metallic stabs
  - Maximum kick complexity (Pattern C) - 8 hits per bar with syncopation
  - Sub-bass sine hits on specific accents (Bb1, Ab1) for weight
  - Rare metallic stabs punctuate the rhythm
  - All layers create interlocking polyrhythmic grid

- **Bars 12-15 (Negative Space Breakdown)**: Strip to 2 kicks per bar, total silence between
  - ALL percussion drops except kick (Pattern D - only beats 1 and 3)
  - No hats, no snare, no rim - dramatic emptiness
  - Sub-bass and stabs also absent
  - The silence is the composition - each kick hits like a statement

- **Bars 15-20 (Rebuild to New Peak)**: New kick variation, all layers return stronger
  - Kick Pattern E introduces new syncopation (variation on C)
  - All percussion layers return simultaneously
  - Open hat slightly louder than before for energy increase
  - New pattern ensures rebuild feels fresh, not repetitive

### Tonal Characteristics

- **Harmonic**: Minimal - Bb minor stabs appear 3-4 times per minute as punctuation only
- **Melodic**: Non-existent in traditional sense - kick syncopation pattern IS the melodic content
- **Rhythmic**: Polyrhythmic triplet grid (8t hats) against straight-time kick against displaced snare
- **Textural**: Dry, punchy, transient-focused - very little sustain or tail on any sound
- **Dynamic**: Extreme contrast between full polyrhythmic density and near-total silence
- **Production**: Aggressive compression (4:1, -10dB), dry mix, transient clarity prioritized over warmth
