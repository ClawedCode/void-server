---
category: triphop
energy: low
tags: [trip-hop, cinematic, emotional]
---
## Portishead (Roads Trip-Hop)

**Tempo**: 80-84 BPM
**Time Signature**: 6/8 (triplet feel - crucial for authentic trip-hop)
**Key**: E minor (dark, melancholic)
**Instruments**: Rhodes keys with tremolo, lush strings, vinyl hiss, deep bass, lo-fi drums, sparse lead
**Structure**: Intro (strings + filtered keys) → Verse (drums enter) → Bridge (pull back) → Finale (build)
**Vibe**: Dark, cinematic, deeply emotional - like Beth Gibbons floating over a film score. Vintage 90s production with tape effects, vinyl hiss, and dramatic filter automation. Think orchestral trip-hop noir.

### Key Characteristics

1. **6/8 Time Signature**: Triplet feel grid (6 eighth notes per bar) - essential for authentic trip-hop groove
2. **Rhodes Keys with Tremolo**: Triangle-based polysynth with tremolo effect for shimmer
3. **Tape Effects Chain**: Chorus, compression, tilt filter for vintage 90s warmth and wobble
4. **Vinyl Hiss Layer**: Pink noise filtered and enveloped for analog texture
5. **Filter Automation**: Rhodes filter opens and closes throughout sections for dynamics
6. **Humanization**: Random timing variations (±10ms) on all events for organic feel
7. **Jazz Harmony**: Minor 7th chords (Em7 → Cmaj7 → Am7 → Bm7)
8. **Arrangement Sections**: Intro → Verse → Bridge/Drop → Finale with distinct dynamics

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 84;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [6, 8];  // CRITICAL: 6/8 triplet feel

  // Humanization helper (±ms)
  const H = ms => (Math.random() * (ms * 2) - ms) / 1000;

  // === MASTER & TAPE EFFECTS CHAIN ===
  const master = new Tone.Gain(0.9).toDestination();

  // Tape glue compression
  const glue = new Tone.Compressor({
    ratio: 2,
    threshold: -18,
    attack: 0.01,
    release: 0.25
  }).connect(master);

  // Tilt filter for vintage roll-off
  const tiltLP = new Tone.Filter({
    type: "lowpass",
    frequency: 11000,
    Q: 0.2
  }).connect(glue);

  // Vintage chorus wobble
  const wobble = new Tone.Chorus({
    frequency: 0.25,
    delayTime: 3.2,
    depth: 0.35,
    wet: 0.35
  }).connect(tiltLP);
  await wobble.start();

  // Hall reverb
  const hall = new Tone.Reverb({
    decay: 3.6,
    preDelay: 0.02,
    wet: 0.32
  });
  await hall.generate();
  hall.connect(wobble);

  // Reverb bus
  const reverbBus = new Tone.Gain(1).connect(hall);

  // === VINYL HISS (pink noise bed) ===
  const hiss = new Tone.Noise("pink");
  const hissHP = new Tone.Filter({
    type: "highpass",
    frequency: 600
  }).connect(new Tone.Gain(0.05).connect(wobble));
  hiss.connect(hissHP);
  hiss.start();

  // === RHODES KEYS (triangle + tremolo) ===
  const trem = new Tone.Tremolo({
    frequency: 4.5,
    depth: 0.35,
    spread: 180,
    wet: 0.35
  }).start().connect(reverbBus);

  const rhodesLP = new Tone.Filter({
    type: "lowpass",
    frequency: 1800,
    rolloff: -12
  }).connect(reverbBus);

  const rhodes = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.35,
      decay: 1.2,
      sustain: 0.85,
      release: 2.4
    },
    volume: -8
  });
  rhodes.connect(trem);
  rhodes.connect(rhodesLP);

  // === STRINGS PAD ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 1.2,
      decay: 0.9,
      sustain: 0.7,
      release: 3.8
    },
    volume: -14
  }).connect(new Tone.Gain(0.6).connect(hall));

  // === BASS (warm sub) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    filter: { type: "lowpass", frequency: 180 },
    envelope: {
      attack: 0.02,
      decay: 0.25,
      sustain: 0.65,
      release: 0.45
    },
    volume: -6
  }).connect(new Tone.Gain(0.9).connect(reverbBus));

  // === DRUMS (lo-fi trip-hop) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4.5,
    envelope: {
      attack: 0.001,
      decay: 0.28,
      sustain: 0
    },
    volume: -6
  }).connect(new Tone.Gain(0.9).connect(wobble));

  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.002,
      decay: 0.22,
      sustain: 0
    },
    volume: -10
  });
  const snareHP = new Tone.Filter({
    type: "highpass",
    frequency: 2200
  }).connect(new Tone.Gain(0.7).connect(hall));
  snare.connect(snareHP);

  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: {
      attack: 0.001,
      decay: 0.06,
      release: 0.02
    },
    harmonicity: 5,
    modulationIndex: 20,
    resonance: 6000,
    volume: -20
  }).connect(new Tone.Gain(0.3).connect(reverbBus));

  // === SPARSE LEAD ===
  const lead = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    filter: { type: "lowpass", frequency: 1500 },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8
    },
    volume: -14
  }).connect(new Tone.Gain(0.5).connect(hall));

  // === CHORD PROGRESSION (Em7 → Cmaj7 → Am7 → Bm7) ===
  const chords = [
    ["E3", "G3", "B3", "D4"],   // Em7
    ["C3", "E3", "G3", "B3"],   // Cmaj7
    ["A2", "C3", "E3", "G3"],   // Am7
    ["B2", "D3", "F#3", "A3"]   // Bm7
  ];

  // Rhodes progression (2 bars per chord in 6/8)
  const rhodesEvents = [];
  for (let i = 0; i < 4; i++) {
    rhodesEvents.push({ time: `${i * 2}:0:0`, chord: chords[i] });
  }

  const rhodesPart = new Tone.Part((time, ev) => {
    rhodes.triggerAttackRelease(ev.chord, "2m", time + H(12), 0.6);
  }, rhodesEvents);
  rhodesPart.loop = true;
  rhodesPart.loopEnd = "8m";

  // Strings hold full 8 bars
  const stringsPart = new Tone.Part((time) => {
    strings.triggerAttackRelease(["E4", "G4", "B4", "D5"], "8m", time, 0.35);
  }, [{ time: "0:0:0" }]);
  stringsPart.loop = true;
  stringsPart.loopEnd = "8m";

  // Bass roots (6 eighth notes per bar in 6/8)
  const bassSeq = new Tone.Sequence((time, step) => {
    const bar = Math.floor(step / 6);
    const barIn8 = bar % 8;
    const progIdx = Math.floor(barIn8 / 2) % 4;
    const root = ["E1", "C1", "A1", "B1"][progIdx];

    if (step % 6 === 0) {  // Beat 1 of each bar
      bass.triggerAttackRelease(root, "4n.", time + H(8), 0.9);
    }
  }, new Array(6 * 8).fill(1), "8n");
  bassSeq.loop = true;
  bassSeq.loopEnd = "8m";

  // Drum pattern: 6/8 — K on beat 1, Sn on beat 4, hats each 8th
  const drumSeq = new Tone.Sequence((time, i) => {
    const beat = i % 6; // 0..5

    if (beat === 0) {
      kick.triggerAttackRelease("C1", "8n", time + H(6), 0.85);
    }
    if (beat === 3) {
      snare.triggerAttackRelease("16n", time + H(10), 0.7);
    }
    // Very subtle hats
    hat.triggerAttackRelease("64n", time + H(4), 0.2);
  }, new Array(6).fill(0).map((_, k) => k), "8n");
  drumSeq.loop = true;
  drumSeq.loopEnd = "1m";

  // Sparse lead fragments
  const leadPart = new Tone.Part((time, ev) => {
    lead.triggerAttackRelease(ev.note, ev.dur, time + H(14), 0.6);
  }, [
    { time: "10:0:0", note: "G4", dur: "4n." },
    { time: "12:3:0", note: "B4", dur: "4n" },
    { time: "15:0:0", note: "D5", dur: "4n." }
  ]);

  // === ARRANGEMENT (60s ≈ 18 bars in 6/8 @ 84 BPM) ===
  // Intro: Bars 0-8 (strings + filtered rhodes, no drums)
  // Verse: Bars 8-16 (drums enter, filter opens)
  // Finale: Bars 16-18 (fade out)

  // Start parts
  rhodesPart.start("0:0:0");
  stringsPart.start("0:0:0");
  bassSeq.start("8:0:0");      // Enter at verse
  leadPart.start("10:0:0");

  // Intro: darker rhodes filter
  Tone.Transport.schedule((t) => {
    rhodesLP.frequency.setValueAtTime(1200, t);
  }, "0:0:0");

  // Verse: drums enter, open filter
  Tone.Transport.schedule((t) => {
    drumSeq.start(t);
    rhodesLP.frequency.linearRampToValueAtTime(2200, t + Tone.Time("8m").toSeconds());
  }, "8:0:0");

  // Finale: sustain
  Tone.Transport.schedule((t) => {
    hall.wet.linearRampTo(0.42, "+4m");
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { rhodes, strings, bass, kick, snare, hat, lead, hall, wobble, rhodesLP, trem, hiss };
  window.toneJsParts = { rhodesPart, stringsPart, bassSeq, drumSeq, leadPart };
};
```

### Common Mistakes to Avoid

❌ **Wrong time signature**: 6/8 is CRITICAL
- Don't use 4/4 - it will sound like house/techno, not trip-hop
- 6/8 creates the triplet feel essential to Portishead's groove
- Beat 1 = kick, beat 4 = snare (not beats 1 & 3 / 2 & 4 like 4/4)

❌ **Missing vintage production**: Portishead is 90s sampled aesthetic
- Must include vinyl hiss layer (pink noise, highpassed)
- Tape effects chain: chorus wobble + compression + tilt filter
- Filter automation on Rhodes (opens and closes throughout)
- Humanization: ±10ms timing variations on all events

❌ **Too clean/digital**: This needs lo-fi warmth
- Use tremolo on Rhodes for vintage shimmer
- Chorus with 0.35 wet for analog wobble
- Compression for "tape glue" (ratio 2:1, threshold -18dB)
- Highpass filtered snare (2200Hz) for tinny 90s sound

❌ **No dynamic arrangement**: Static mixes sound boring
- Intro: filtered Rhodes + strings only
- Verse: drums enter, filter opens gradually
- Bridge: pull drums, increase reverb
- Finale: bring everything back with more space

❌ **Poor looping**: Critical for seamless playback
- Return to intro texture in final bars
- Match opening filter settings and instrumentation
- Fade reverb wet parameter to create smooth loop point

### Mixing Approach

- **Master**: 0.9 gain to leave headroom for tape compression
- **Rhodes**: 0.6 velocity, -8dB, through tremolo + lowpass filter (animated 1200-2200Hz)
- **Strings**: 0.35 velocity, -14dB, slow attack (1.2s), heavy hall reverb
- **Bass**: 0.9 velocity, -6dB, sine wave, lowpass at 180Hz for sub focus
- **Kick**: 0.85 velocity, -6dB, on beat 1 of each bar (6/8)
- **Snare**: 0.7 velocity, -10dB, highpassed at 2200Hz, on beat 4 (6/8)
- **Hat**: 0.2 velocity, -20dB, extremely subtle each 8th note
- **Lead**: 0.6 velocity, -14dB, very sparse (3-4 notes across entire track)
- **Vinyl Hiss**: 0.05 gain, highpassed at 600Hz, constant throughout

**Effects Levels:**
- Hall Reverb: 3.6s decay, 32% wet (increase to 42% in finale)
- Chorus Wobble: 0.35 wet, 0.25Hz for slow analog drift
- Compression: 2:1 ratio, -18dB threshold for gentle glue
- Tilt LP Filter: 11kHz cutoff for vintage top-end roll-off

### Reference Tracks

1. **Portishead - Roads** - The definitive example
2. **Portishead - The Rip** - Similar cinematic strings, sparse drums
3. **Massive Attack - Teardrop** - Minimal trip-hop with orchestral elements
4. **Burial - Archangel** - Dark atmospheric space (more electronic)
5. **Portishead - Machine Gun** - Slow-building cinematic tension

### Structural Blueprint (60s @ 84 BPM in 6/8 ≈ 18 bars)

**Note**: In 6/8, each bar has 6 eighth notes. Bar duration ≈ 2.14s @ 84 BPM.

- **Bars 0-8 (Intro)**: Strings + filtered Rhodes (no drums)
  - Rhodes filter starts at 1200Hz (dark, muffled)
  - Strings hold Em7 voicing across full 8 bars
  - Vinyl hiss present from start
  - No bass or drums - create space and anticipation

- **Bars 8-16 (Verse)**: Full arrangement
  - Drums enter: kick on beat 1, snare on beat 4, subtle hats throughout
  - Bass enters on root notes (E → C → A → B progression)
  - Rhodes filter opens gradually from 1200Hz → 2200Hz
  - Sparse lead melody fragments (bar 10+)
  - Full trip-hop groove established

- **Bars 16-18 (Finale)**: Sustain and fade
  - Maintain groove but increase hall reverb to 42% wet
  - Rhodes filter stays open at 2200Hz
  - Create spacious ending that loops back smoothly

**Looping**: Track ends at bar 18 and loops back to bar 0, matching intro texture.

### Tonal Characteristics

- **Harmonic**: Minor 7th chords (Em7 → Cmaj7 → Am7 → Bm7), 2 bars per chord in 6/8
- **Melodic**: Sparse, haunting lead fragments, stepwise motion, avoid busy runs
- **Rhythmic**: 6/8 triplet feel - kick on beat 1, snare on beat 4 (not 2 & 4!), subtle hats each 8th
- **Textural**: Rhodes with tremolo + strings + vinyl hiss, tape wobble, filtered and compressed
- **Dynamic**: Filter automation creates dramatic movement (closed → open → spacious)
- **Production**: Humanized timing (±10ms), lo-fi 90s aesthetic, analog warmth throughout
