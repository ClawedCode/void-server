---
category: ambient
energy: low
tags: [uk-garage, dubstep, crackle, 2-step, liminal]
---
## Burial (UK Garage / Dubstep)

**Tempo**: 130-140 BPM (half-time feel at ~65-70, shuffled 2-step)
**Time Signature**: 4/4 with 2-step shuffle (swung 16ths, ghost notes between beats)
**Key**: Minor (often A minor, C minor, dark and yearning)
**Instruments**: Vinyl crackle layer, pitched-down vocal chops (FM bell approximation), 2-step kick pattern, shuffled snare/clap, rain-like filtered noise, deep sub-bass (sine), distant pad washes, metallic percussion
**Structure**: Rain + crackle intro → Sub emerges → 2-step shuffle enters → Vocal chops appear → Full groove → Strip back to rain
**Vibe**: 3am bus shelter in the rain. Urban loneliness distilled into sound - the crackle of a well-worn record, half-remembered vocal fragments pitching down into the dark, 2-step rhythms shuffling through empty streets. South London melancholia. The sonic equivalent of liminal spaces - not quite here, not quite gone. Untrue-era atmosphere where the city breathes through the speakers.

### Key Characteristics

1. **Vinyl Crackle**: Constant filtered noise layer simulating worn vinyl - the foundation of texture
2. **2-Step Shuffle**: Not straight 4/4 - displaced kicks and shuffled snares creating a lopsided groove
3. **Pitched-Down Vocal Chops**: Fragments of melody pitched down, smeared with reverb (use FM synth)
4. **Deep Sub-Bass**: Sine wave sub that rumbles underneath, appearing and disappearing
5. **Rain Textures**: Filtered white noise that evokes urban rainfall
6. **Cavernous Reverb**: Long decay (3-5s) with heavy wet mix - everything sounds distant
7. **Ghost Notes**: Barely-there percussion hits between main beats, creating shuffle feel
8. **Negative Space**: What ISN'T playing matters as much as what is

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 136;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.3; // 2-step shuffle

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.82).toDestination();

  const glue = new Tone.Compressor({
    ratio: 3,
    threshold: -18,
    attack: 0.01,
    release: 0.25
  }).connect(master);

  // === CAVERNOUS REVERB ===
  const caveReverb = new Tone.Reverb({
    decay: 4.5,
    preDelay: 0.04,
    wet: 0.42
  });
  await caveReverb.generate();
  caveReverb.connect(glue);

  // Short verb for percussion
  const percVerb = new Tone.Reverb({ decay: 1.0, wet: 0.2 });
  await percVerb.generate();
  percVerb.connect(glue);

  // Delay for vocal chops
  const chorusDelay = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.4,
    wet: 0.3
  }).connect(caveReverb);

  // Clean bus for sub
  const cleanBus = new Tone.Gain(1).connect(master);

  // === VINYL CRACKLE ===
  const crackle = new Tone.Noise("brown");
  const crackleFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 2000,
    Q: 0.5
  }).connect(new Tone.Gain(0.06).connect(glue));
  crackle.connect(crackleFilter);
  crackle.start();

  // === RAIN TEXTURE ===
  const rain = new Tone.Noise("white");
  const rainFilter = new Tone.Filter({
    type: "highpass",
    frequency: 3000
  }).connect(new Tone.Gain(0.03).connect(caveReverb));
  rain.connect(rainFilter);
  rain.start();

  // === DEEP SUB-BASS (sine rumble) ===
  const sub = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.08,
      decay: 0.4,
      sustain: 0.7,
      release: 0.8
    },
    volume: -4
  }).connect(cleanBus);

  // === PITCHED-DOWN VOCAL CHOPS (FM bell approximation) ===
  const vocalChop = new Tone.FMSynth({
    harmonicity: 1.5,
    modulationIndex: 4,
    oscillator: { type: "sine" },
    modulation: { type: "triangle" },
    envelope: {
      attack: 0.02,
      decay: 0.8,
      sustain: 0.15,
      release: 2.5
    },
    modulationEnvelope: {
      attack: 0.05,
      decay: 0.4,
      sustain: 0.1,
      release: 1.0
    },
    volume: -12
  }).connect(chorusDelay);

  // === DISTANT PAD ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 2.0,
      decay: 1.0,
      sustain: 0.6,
      release: 4.0
    },
    volume: -16
  }).connect(new Tone.Filter({ frequency: 1800, type: "lowpass" }).connect(caveReverb));

  // === 2-STEP KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0
    },
    volume: -5
  }).connect(percVerb);

  // === SHUFFLED SNARE/CLAP ===
  const clap = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: {
      attack: 0.003,
      decay: 0.12,
      sustain: 0
    },
    volume: -10
  }).connect(percVerb);

  // === METALLIC PERCUSSION ===
  const perc = new Tone.MetalSynth({
    frequency: 180,
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.02
    },
    harmonicity: 3.5,
    modulationIndex: 18,
    resonance: 4000,
    volume: -22
  }).connect(percVerb);

  // === SUB-BASS PATTERN ===
  const subNotes = [
    { time: "0:0:0", note: "A1", dur: "2n" },
    { time: "0:2:2", note: "A1", dur: "4n" },
    { time: "1:0:0", note: "C2", dur: "2n" },
    { time: "1:2:0", note: "G1", dur: "4n" }
  ];
  const subPart = new Tone.Part((time, ev) => {
    sub.triggerAttackRelease(ev.note, ev.dur, time + H(8), 0.85);
  }, subNotes);
  subPart.loop = true;
  subPart.loopEnd = "2m";

  // === 2-STEP KICK PATTERN (displaced, not 4-on-floor) ===
  const kickEvents = [
    { time: "0:0:0", vel: 0.9 },
    { time: "0:1:2", vel: 0.6 },
    { time: "0:2:3", vel: 0.75 },
    { time: "1:0:0", vel: 0.85 },
    { time: "1:2:2", vel: 0.7 }
  ];
  const kickPart = new Tone.Part((time, ev) => {
    kick.triggerAttackRelease("C1", "8n", time + H(5), ev.vel);
  }, kickEvents);
  kickPart.loop = true;
  kickPart.loopEnd = "2m";

  // === SHUFFLED CLAP (on 2 and 4 with ghost hits) ===
  const clapEvents = [
    { time: "0:1:0", vel: 0.75 },
    { time: "0:2:3", vel: 0.3 },
    { time: "0:3:0", vel: 0.8 },
    { time: "1:1:0", vel: 0.7 },
    { time: "1:3:0", vel: 0.75 },
    { time: "1:3:2", vel: 0.25 }
  ];
  const clapPart = new Tone.Part((time, ev) => {
    clap.triggerAttackRelease("16n", time + H(10), ev.vel);
  }, clapEvents);
  clapPart.loop = true;
  clapPart.loopEnd = "2m";

  // === GHOST PERCUSSION (barely-there metallic ticks) ===
  const percSeq = new Tone.Sequence((time, i) => {
    if (Math.random() > 0.55) {
      perc.triggerAttackRelease("64n", time + H(12), 0.15 + Math.random() * 0.15);
    }
  }, new Array(16).fill(0).map((_, i) => i), "16n");
  percSeq.loop = true;
  percSeq.loopEnd = "1m";

  // === VOCAL CHOP FRAGMENTS (sparse, pitched-down) ===
  const chopNotes = ["A3", "E3", "C3", "G3", "D3"];
  const chopPart = new Tone.Part((time, ev) => {
    vocalChop.triggerAttackRelease(ev.note, "4n", time + H(15), 0.5);
  }, [
    { time: "2:2:0", note: chopNotes[0] },
    { time: "5:0:0", note: chopNotes[1] },
    { time: "7:3:0", note: chopNotes[2] },
    { time: "10:1:0", note: chopNotes[3] },
    { time: "13:2:0", note: chopNotes[4] }
  ]);
  chopPart.loop = true;
  chopPart.loopEnd = "16m";

  // === PAD PROGRESSION ===
  const padChords = [
    ["A2", "C3", "E3"],
    ["F2", "A2", "C3"],
    ["G2", "B2", "D3"],
    ["E2", "G2", "B2"]
  ];
  const padPart = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.chord, "2m", time, 0.3);
  }, [
    { time: "0:0:0", chord: padChords[0] },
    { time: "2:0:0", chord: padChords[1] },
    { time: "4:0:0", chord: padChords[2] },
    { time: "6:0:0", chord: padChords[3] }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "8m";

  // === ARRANGEMENT (60s @ 136 BPM = ~18 bars) ===

  // Bars 0-4: Rain + crackle + pad only
  padPart.start("0:0:0");

  // Bars 4-8: Sub emerges + 2-step groove
  Tone.Transport.schedule((t) => {
    subPart.start(t);
    kickPart.start(t);
    clapPart.start(t);
  }, "4:0:0");

  // Bars 8-12: Ghost percussion + vocal chops
  Tone.Transport.schedule((t) => {
    percSeq.start(t);
    chopPart.start(t);
  }, "8:0:0");

  // Bars 12-14: Full groove, increase reverb
  Tone.Transport.schedule((t) => {
    caveReverb.wet.linearRampToValueAtTime(0.55, t + Tone.Time("2m").toSeconds());
  }, "12:0:0");

  // Bars 14-18: Wind down - reduce to rain + crackle
  Tone.Transport.schedule((t) => {
    caveReverb.wet.linearRampToValueAtTime(0.42, t + Tone.Time("2m").toSeconds());
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { sub, vocalChop, pad, kick, clap, perc, crackle, rain, caveReverb, chorusDelay };
  window.toneJsParts = { subPart, kickPart, clapPart, percSeq, chopPart, padPart };
};
```

### Common Mistakes to Avoid

- **Standard 4-on-floor kick**: Burial uses displaced 2-step patterns
  - Kick NOT on every beat
  - Syncopated, shuffled placement
  - Ghost kicks between main hits

- **Too clean/digital**: Burial's sound is analog and worn
  - Vinyl crackle is essential, not optional
  - Everything should feel like it's heard through old speakers
  - Rain/ambient texture always present

- **Straight timing**: 2-step demands shuffle
  - Use `Tone.Transport.swing = 0.3` or manual displacement
  - Ghost notes between main hits
  - Lopsided groove, never quantized

- **Too many vocal chops**: Less is more
  - 4-6 fragments per minute maximum
  - Pitched DOWN, not up
  - Smeared with reverb and delay, not crisp

- **Missing negative space**: Burial breathes
  - Gaps between elements matter
  - Sub-bass appears and disappears
  - Let the crackle and rain carry sections alone

- **Too energetic**: This is melancholic, not dance
  - Half-time FEEL despite 130+ BPM
  - Weight and sadness, not energy
  - Urban loneliness, not club euphoria

### Mixing Approach

- **Vinyl Crackle**: 0.06 gain, bandpass at 2kHz, constant texture layer
- **Rain**: 0.03 gain, highpassed at 3kHz, constant background
- **Sub-Bass**: -4dB, clean sine, appears/disappears with long attack (80ms)
- **Vocal Chops**: -12dB, FM synth through dotted 8th delay + cavernous reverb
- **Pad**: -16dB, triangle wave, slow attack (2s), lowpassed at 1800Hz
- **Kick**: -5dB, 2-step displaced pattern, short reverb (1s)
- **Clap**: -10dB, pink noise, shuffled placement with ghost hits
- **Ghost Percussion**: -22dB, metallic ticks, 45% hit rate for sparse shuffle

**Effects:**
- Cavernous Reverb: 4.5s decay, 42% wet (peaks at 55%)
- Chorus Delay: Dotted 8th ping-pong, 40% feedback, 30% wet
- Glue Compression: 3:1 ratio, -18dB threshold

### Reference Tracks

1. **Burial - Archangel** - Pitched-down vocal chops, 2-step shuffle, cavernous reverb
2. **Burial - Untrue** - Vinyl crackle, urban atmosphere, ghostly fragments
3. **Burial - Ghost Hardware** - Minimal 2-step, metallic percussion, deep sub
4. **Burial - Near Dark** - Rain textures, liminal atmosphere, distant pads
5. **Burial - Kindred** - Heavier sub-bass, darker mood, same crackle foundation

### Structural Blueprint (60s @ 136 BPM = ~18 bars)

- **Bars 0-4 (Rain + Crackle)**: Vinyl noise + rain texture + distant pad only
  - Establish the lonely urban atmosphere
  - Pad emerges slowly (2s attack)
  - No rhythm yet - pure texture

- **Bars 4-8 (2-Step Emerges)**: Sub-bass + displaced kick + shuffled clap
  - 2-step groove enters with half-time feel
  - Sub-bass rumbles underneath
  - Displaced kick pattern, NOT 4-on-floor

- **Bars 8-12 (Vocal Fragments)**: Ghost percussion + pitched-down vocal chops
  - Sparse FM chops through heavy delay/reverb
  - Metallic ghost percussion fills the shuffle
  - Full groove but still restrained

- **Bars 12-14 (Peak)**: Reverb opens up, maximum atmosphere
  - Reverb wetness increases (42% -> 55%)
  - All elements active but still breathing
  - Yearning, not climactic

- **Bars 14-18 (Return to Rain)**: Strip back to opening atmosphere
  - Reverb returns to opening level
  - Elements thin out
  - Return to crackle + rain for seamless loop

### Tonal Characteristics

- **Harmonic**: A minor modal (Am -> F -> G -> Em), simple and yearning
- **Melodic**: Sparse FM vocal chops, not melodic in traditional sense
- **Rhythmic**: 2-step garage shuffle at 136 BPM with half-time feel (~68 BPM perceived)
- **Textural**: Vinyl crackle, rain noise, cavernous reverb, analog warmth
- **Dynamic**: Elements appear and disappear, negative space is active compositional tool
- **Production**: Everything filtered, distant, heard through walls - never pristine
