---
category: synthwave
energy: high
tags: [dramatic, 80s, action]
---
## Stranger Things (Soldier)

**Tempo**: 80 BPM
**Key**: C minor (i-bVI-iv-V progression)
**Instruments**: Wide analog saw pad, punchy mono bass, plucky triangle arp, pink noise drone
**Structure**: Full band from start → constant tension with arpeggio motion → noise swell
**Vibe**: Tense, driving, militaristic synthwave with 80s horror undertones

### Key Characteristics

1. **Saw Pad Foundation**: Wide analog sawtooth pad with chorus, primary harmonic bed
2. **Pulsing Bass**: Punchy sawtooth mono bass on 8th notes, filtered low
3. **Plucky Arp**: Triangle wave lead playing textural ostinato patterns
4. **Noise Tension**: Pink noise with bandpass filter for constant underlying dread
5. **Heavy Effects**: Master reverb, dotted 8th delay, compression chain
6. **No Drums**: Let the bass pulse and arp carry the rhythm

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 80;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [4, 4];

  // === MASTER FX CHAIN ===
  const masterReverb = new Tone.Reverb({
    decay: 4.5,
    preDelay: 0.15,
    wet: 0.4
  }).toDestination();
  await masterReverb.generate();

  const masterDelay = new Tone.FeedbackDelay({
    delayTime: "8n.",
    feedback: 0.35,
    wet: 0.25
  }).connect(masterReverb);

  const masterCompressor = new Tone.Compressor({
    threshold: -18,
    ratio: 3,
    attack: 0.01,
    release: 0.3
  }).connect(masterDelay);

  // === PAD (wide analog saw pad, side of mix) ===
  const padFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1400,
    Q: 0.8
  }).connect(masterCompressor);

  const padChorus = new Tone.Chorus({
    frequency: 0.25,
    delayTime: 7,
    depth: 0.5,
    wet: 0.35
  }).connect(padFilter).start();

  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 1.2,
      decay: 0.8,
      sustain: 0.7,
      release: 4.0
    }
  }).connect(padChorus);

  // === BASS (mono analog bass, center) ===
  const bassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 500,
    Q: 0.9
  }).connect(masterCompressor);

  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: {
      type: "lowpass",
      frequency: 1200,
      Q: 1.0
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.4
    },
    filterEnvelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.0,
      release: 0.2,
      baseFrequency: 200,
      octaves: 2
    }
  }).connect(bassFilter);

  // === ARP / LEAD (plucky top line) ===
  const arpFilter = new Tone.Filter({
    type: "highpass",
    frequency: 300,
    Q: 0.7
  }).connect(masterCompressor);

  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.005,
      decay: 0.25,
      sustain: 0.2,
      release: 0.4
    }
  }).connect(arpFilter);

  // === CHORD BED (Cm progression) ===
  const padPattern = [
    ["0:0:0", ["C3", "Eb3", "G3"]],
    ["2:0:0", ["Ab2", "C3", "Eb3"]],
    ["4:0:0", ["F2", "Ab2", "C3"]],
    ["6:0:0", ["G2", "Bb2", "D3"]]
  ];

  padPattern.forEach(([time, chord]) => {
    new Tone.Part((time, notes) => {
      pad.triggerAttackRelease(notes, "4m", time);
    }, [[time, chord]]).start(0);
  });

  // === BASS PATTERN (simple pulse) ===
  const bassNotes = [
    "C2", "C2", "C2", "C2",
    "Ab1", "Ab1", "Ab1", "Ab1",
    "F1", "F1", "F1", "F1",
    "G1", "G1", "G1", "G1"
  ];

  const bassSeq = new Tone.Sequence((time, note) => {
    if (note) {
      bass.triggerAttackRelease(note, "8n", time);
    }
  }, bassNotes, "8n").start(0);
  bassSeq.probability = 0.95;

  // === ARP PATTERN (light textural ostinato) ===
  const arpNotes = [
    "G4", null, "Eb4", null,
    "C4", null, "D4", null,
    "G4", "Bb4", null, "Eb4",
    "C4", null, "D4", null
  ];

  const arpSeq = new Tone.Sequence((time, note) => {
    if (note) {
      arp.triggerAttackRelease(note, "16n", time);
    }
  }, arpNotes, "16n").start("1m");

  // === NOISE DRONE (tension) ===
  const noise = new Tone.Noise("pink");
  const noiseFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 800,
    Q: 3
  }).connect(masterCompressor);

  const noiseEnv = new Tone.AmplitudeEnvelope({
    attack: 3,
    decay: 1,
    sustain: 0.2,
    release: 5
  }).connect(noiseFilter);

  noise.connect(noiseEnv);
  noise.start();
  noiseEnv.triggerAttackRelease("16m", "0:0:0");

  // === TRANSPORT LOOP ===
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = "0:0:0";
  Tone.Transport.loopEnd = "8:0:0";

  Tone.Transport.stop();
  Tone.Transport.position = 0;
  Tone.Transport.start("+0.1");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, bass, arp, noise };
  window.toneJsParts = { bassSeq, arpSeq };
};
```

### Common Mistakes to Avoid

❌ **Adding drums**: This mood uses bass pulse as the rhythm
- The 8th note bass pattern provides all the drive needed
- No kick, snare, or hi-hats

❌ **Too slow**: This is driving tension, not atmospheric
- Keep BPM at 80 (not 60-70 like atmospheric variant)
- Bass pulses on 8th notes for forward motion

❌ **Forgetting the noise drone**: Essential for sustained tension
- Pink noise with bandpass creates underlying dread
- Long envelope swell over 16 bars

❌ **Skipping the effects chain**: The sound relies on heavy processing
- Master reverb (4.5s decay) for space
- Dotted 8th delay for rhythmic interest
- Compressor to glue everything together

### Arrangement Tips

1. **Pad enters first** (bar 0): Establish harmonic foundation with wide saw chords
2. **Bass joins** (bar 0): Immediate pulse, no intro buildup
3. **Arp enters** (bar 1): Light textural motion on top
4. **Noise swells throughout**: Constant underlying tension
5. **No breakdowns**: Maintain intensity throughout

### Mixing Approach

- **Pad**: 0.60 volume, wide stereo image via chorus
- **Bass**: 0.65 volume, center, punchy low end
- **Arp**: 0.45 volume, high-passed to sit above pad
- **Noise**: 0.20 volume, bandpass for texture, not dominance
- **Effects**: Generous reverb and delay for that 80s synth sound
