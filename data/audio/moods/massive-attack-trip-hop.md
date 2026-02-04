---
category: triphop
energy: low
tags: [trip-hop, cinematic, dub]
---
## Massive Attack (Trip-Hop / Bristol Sound)

**Tempo**: 70-85 BPM (slow, heavy groove, hypnotic)
**Time Signature**: 4/4 (half-time feel, weight on beats 1 and 3)
**Key**: Minor (often D minor, G minor, dark and brooding)
**Instruments**: Deep sine sub-bass, filtered mid-bass, vast atmospheric pads (2s+ attack), sparse Rhodes through ping-pong delay, half-time drums, subtle 8th note hats, string swells, vinyl hiss layer
**Structure**: Vast space intro → Sub emerges → Half-time groove → Build with strings → Cinematic peak → Sparse ending
**Vibe**: Cinematic darkness meets Bristol dub. Like being underwater in a dimly lit cathedral. Deep sub-bass you feel in your chest, vast reverberant spaces, and sparse melodic elements that hang in the air. The sonic equivalent of film noir - mysterious, sensual, menacing. Mezzanine-era weight and atmosphere.

### Key Characteristics

1. **Deep Sub-Bass**: Sine wave foundation that rumbles beneath everything
2. **Dub Delays**: Dotted 8th ping-pong delays (Mezzanine signature)
3. **Cinematic Reverb**: 4-5s decay times, 35%+ wet for vast spaces
4. **Half-Time Drums**: Slow, heavy - kick on 1, snare on 3 (not 2 & 4)
5. **Sparse Rhodes**: Clean electric piano hits through heavy delay/reverb
6. **Vinyl Texture**: Constant hiss layer for analog warmth
7. **String Swells**: Orchestral elements for emotional peaks
8. **Slow Attacks**: Pads with 2s+ attacks for gradual emergence

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === MASTER CHAIN ===
  const master = new Tone.Gain(0.85).toDestination();

  // Gentle compression for glue
  const glue = new Tone.Compressor({
    ratio: 2.5,
    threshold: -16,
    attack: 0.02,
    release: 0.3
  }).connect(master);

  // === VAST REVERB (cinematic 4.5s decay) ===
  const vastReverb = new Tone.Reverb({
    decay: 4.5,
    preDelay: 0.03,
    wet: 0.38
  });
  await vastReverb.generate();
  vastReverb.connect(glue);

  // === DUB DELAY (dotted 8th ping-pong) ===
  const dubDelay = new Tone.PingPongDelay({
    delayTime: "8n.",
    feedback: 0.45,
    wet: 0.35
  }).connect(vastReverb);

  // Short reverb for drums
  const drumVerb = new Tone.Reverb({
    decay: 1.2,
    wet: 0.18
  });
  await drumVerb.generate();
  drumVerb.connect(glue);

  // Clean bus (for sub)
  const cleanBus = new Tone.Gain(1).connect(master);

  // === VINYL HISS ===
  const hiss = new Tone.Noise("pink");
  const hissFilter = new Tone.Filter({
    type: "highpass",
    frequency: 800
  }).connect(new Tone.Gain(0.045).connect(glue));
  hiss.connect(hissFilter);
  hiss.start();

  // === DEEP SUB-BASS (sine foundation) ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.03,
      decay: 0.3,
      sustain: 0.85,
      release: 0.6
    },
    volume: -2
  }).connect(cleanBus);

  // === FILTERED MID-BASS (for definition) ===
  const midBassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 400,
    Q: 1.5
  }).connect(glue);

  const midBass = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.02,
      decay: 0.25,
      sustain: 0.4,
      release: 0.3
    },
    volume: -10
  }).connect(midBassFilter);

  // === VAST ATMOSPHERIC PAD ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 2.5,  // Very slow attack for gradual emergence
      decay: 1.0,
      sustain: 0.7,
      release: 4.0
    },
    volume: -14
  }).connect(new Tone.Filter({ frequency: 2000, type: "lowpass" }).connect(vastReverb));

  // === SPARSE RHODES ===
  const rhodes = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 2,
    modulationIndex: 1.5,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: {
      attack: 0.01,
      decay: 1.5,
      sustain: 0.2,
      release: 2.0
    },
    volume: -12
  }).connect(dubDelay);

  // === STRING SWELLS ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 1.8,
      decay: 0.8,
      sustain: 0.65,
      release: 3.5
    },
    volume: -16
  }).connect(new Tone.Filter({ frequency: 3500, type: "lowpass" }).connect(vastReverb));

  // === HALF-TIME DRUMS ===
  // Kick - heavy, on beat 1
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 5,
    envelope: {
      attack: 0.001,
      decay: 0.35,
      sustain: 0
    },
    volume: -4
  }).connect(drumVerb);

  // Snare - on beat 3 (half-time feel)
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.002,
      decay: 0.22,
      sustain: 0
    },
    volume: -8
  });
  const snareHP = new Tone.Filter({
    type: "highpass",
    frequency: 1800
  }).connect(drumVerb);
  snare.connect(snareHP);

  // Snare body
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 3,
    envelope: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0
    },
    volume: -14
  }).connect(drumVerb);

  // Subtle hi-hat
  const hat = new Tone.MetalSynth({
    frequency: 250,
    envelope: {
      attack: 0.001,
      decay: 0.06,
      release: 0.02
    },
    harmonicity: 4.5,
    modulationIndex: 22,
    resonance: 5500,
    volume: -20
  }).connect(drumVerb);

  // === BASS PATTERN (sparse, heavy) ===
  const bassNotes = [
    { time: "0:0:0", note: "D1", dur: "2n" },
    { time: "0:2:0", note: "D1", dur: "4n" },
    { time: "1:0:0", note: "F1", dur: "2n" },
    { time: "1:2:0", note: "C1", dur: "4n" }
  ];
  const bassPart = new Tone.Part((time, ev) => {
    subBass.triggerAttackRelease(ev.note, ev.dur, time + H(6), 0.9);
    midBass.triggerAttackRelease(Tone.Frequency(ev.note).transpose(12).toNote(), ev.dur, time + H(8), 0.5);
  }, bassNotes);
  bassPart.loop = true;
  bassPart.loopEnd = "2m";

  // === HALF-TIME DRUM PATTERN ===
  // Kick on 1, snare on 3 (half-time)
  const drumPart = new Tone.Part((time, ev) => {
    if (ev.type === 'kick') {
      kick.triggerAttackRelease("D1", "4n", time + H(5), 0.85);
    } else if (ev.type === 'snare') {
      snare.triggerAttackRelease("8n", time + H(10), 0.75);
      snareBody.triggerAttackRelease("C4", "16n", time + H(6), 0.5);
    }
  }, [
    { time: "0:0:0", type: 'kick' },
    { time: "0:2:0", type: 'snare' },
    { time: "1:0:0", type: 'kick' },
    { time: "1:2:0", type: 'snare' }
  ]);
  drumPart.loop = true;
  drumPart.loopEnd = "2m";

  // === SUBTLE 8TH NOTE HATS ===
  const hatSeq = new Tone.Sequence((time, i) => {
    if (Math.random() > 0.3) {  // 70% hit rate for sparse feel
      const vel = 0.2 + Math.random() * 0.15;
      hat.triggerAttackRelease("64n", time + H(8), vel);
    }
  }, new Array(8).fill(0).map((_, i) => i), "8n");
  hatSeq.loop = true;
  hatSeq.loopEnd = "1m";

  // === PAD PROGRESSION ===
  const padChords = [
    ["D3", "F3", "A3", "C4"],     // Dm7
    ["Bb2", "D3", "F3", "A3"],    // Bbmaj7
    ["G2", "Bb2", "D3", "F3"],    // Gm7
    ["A2", "C#3", "E3", "G3"]     // A7 (dominant tension)
  ];
  const padPart = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.chord, "2m", time, 0.35);
  }, [
    { time: "0:0:0", chord: padChords[0] },
    { time: "2:0:0", chord: padChords[1] },
    { time: "4:0:0", chord: padChords[2] },
    { time: "6:0:0", chord: padChords[3] }
  ]);
  padPart.loop = true;
  padPart.loopEnd = "8m";

  // === SPARSE RHODES HITS ===
  const rhodesHits = [
    { time: "2:0:0", notes: ["A4", "D5"], dur: "2n" },
    { time: "5:2:0", notes: ["F4", "Bb4"], dur: "4n." },
    { time: "10:0:0", notes: ["D4", "G4"], dur: "2n" },
    { time: "13:2:0", notes: ["C5", "E5"], dur: "4n" }
  ];
  const rhodesPart = new Tone.Part((time, ev) => {
    rhodes.triggerAttackRelease(ev.notes, ev.dur, time + H(12), 0.55);
  }, rhodesHits);
  rhodesPart.loop = true;
  rhodesPart.loopEnd = "16m";

  // === STRING SWELLS (for cinematic peaks) ===
  const stringPart = new Tone.Part((time, ev) => {
    strings.triggerAttackRelease(ev.chord, ev.dur, time, 0.4);
  }, [
    { time: "8:0:0", chord: ["D4", "F4", "A4"], dur: "4m" },
    { time: "12:0:0", chord: ["G4", "Bb4", "D5"], dur: "4m" }
  ]);
  stringPart.loop = true;
  stringPart.loopEnd = "16m";

  // === ARRANGEMENT ===
  // 60s @ 78 BPM = ~16 bars

  // Bars 0-4: Vast space - pad + vinyl hiss only
  padPart.start("0:0:0");

  // Bars 4-8: Sub emerges + half-time groove
  Tone.Transport.schedule((t) => {
    bassPart.start(t);
    drumPart.start(t);
  }, "4:0:0");

  // Bars 8-12: Add hats + rhodes
  Tone.Transport.schedule((t) => {
    hatSeq.start(t);
    rhodesPart.start(t);
    stringPart.start(t);
  }, "8:0:0");

  // Bars 12-16: Cinematic peak - increase reverb wetness
  Tone.Transport.schedule((t) => {
    vastReverb.wet.linearRampToValueAtTime(0.48, t + Tone.Time("2m").toSeconds());
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { subBass, midBass, pad, rhodes, strings, kick, snare, snareBody, hat, vastReverb, dubDelay, hiss };
  window.toneJsParts = { bassPart, drumPart, hatSeq, padPart, rhodesPart, stringPart };
};
```

### Common Mistakes to Avoid

- **Too fast**: Massive Attack is SLOW (70-85 BPM)
- Half-time feel is essential
- Weight and space, not energy

- **Wrong drum pattern**: Half-time, not standard rock/house
- Kick on beat 1, snare on beat 3 (not 2 & 4)
- Very sparse - let the space breathe

- **Missing dub elements**: Dotted 8th delays are signature
- Ping-pong delay at 8n. with 40-50% feedback
- Rhodes and melodic elements through heavy delay

- **Insufficient space**: Need cinematic reverb
- 4-5 second decay times
- 35-50% wet for vast atmosphere
- Slow pad attacks (2s+) for gradual emergence

- **Too busy**: Massive Attack is about restraint
- Sparse Rhodes hits (4-6 per minute)
- Let the sub-bass carry the track
- Space between elements is as important as the elements

- **Missing vinyl texture**: Analog warmth is essential
- Pink noise highpassed at 800Hz
- Constant subtle hiss throughout

### Mixing Approach

- **Sub-Bass**: -2dB, clean sine, the foundation of everything
- **Mid-Bass**: -10dB, triangle wave filtered at 400Hz, adds definition
- **Pad**: -14dB, slow attack (2.5s), heavy reverb (4.5s decay, 38% wet)
- **Rhodes**: -12dB, sparse hits through ping-pong delay (45% feedback) + reverb
- **Strings**: -16dB, slow swells for emotional peaks only
- **Kick**: -4dB, on beat 1 only, short reverb (1.2s)
- **Snare**: -8dB, on beat 3 only (half-time), highpassed
- **Hat**: -20dB, subtle 8th notes with 30% dropout rate
- **Vinyl Hiss**: 0.045 gain, highpassed at 800Hz, constant

**Effects:**
- Vast Reverb: 4.5s decay, 38% wet (increases to 48% in peak)
- Dub Delay: Dotted 8th, 45% feedback, 35% wet
- Glue Compression: 2.5:1 ratio, -16dB threshold

### Reference Tracks

1. **Massive Attack - Teardrop** - Sparse, atmospheric, iconic
2. **Massive Attack - Angel** - Heavy sub-bass, cinematic strings
3. **Massive Attack - Mezzanine** - Dark, dub-influenced, vast spaces
4. **Massive Attack - Dissolved Girl** - Slow groove, ethereal vocals
5. **Portishead - Roads** - Similar aesthetic, different energy

### Structural Blueprint (60s @ 78 BPM = ~16 bars)

- **Bars 0-4 (Vast Space)**: Atmospheric pad + vinyl hiss only
  - Pad emerges slowly (2.5s attack)
  - Establish the vast reverberant space
  - No rhythm yet - pure atmosphere

- **Bars 4-8 (Sub Emerges)**: Bass + half-time drums enter
  - Deep sub-bass foundation (D → F → C progression)
  - Half-time drums: kick on 1, snare on 3
  - Groove establishes slowly

- **Bars 8-12 (Build)**: Rhodes + hats + strings
  - Sparse Rhodes hits through dub delay
  - Subtle 8th note hats (70% density)
  - String swells begin for emotional build

- **Bars 12-16 (Cinematic Peak)**: Full arrangement
  - Increase reverb wetness (38% → 48%)
  - String swells at full intensity
  - Maximum atmospheric depth

### Tonal Characteristics

- **Harmonic**: D minor modal (Dm7 → Bbmaj7 → Gm7 → A7)
- **Melodic**: Sparse Rhodes hits through heavy delay, minimal melodic content
- **Rhythmic**: Half-time 4/4 (kick on 1, snare on 3), extremely slow and heavy
- **Textural**: Deep sub-bass, vast reverb spaces, vinyl warmth, dub delays
- **Dynamic**: Gradual emergence (slow attacks), cinematic swells
- **Production**: Space over density, restraint over complexity, depth over width
