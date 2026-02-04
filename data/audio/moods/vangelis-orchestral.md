---
category: cinematic
energy: medium
tags: [orchestral, sci-fi, atmospheric]
---
## Vangelis (Orchestral Synth)

**Tempo**: 70-90 BPM
**Key**: Minor or major (modal progressions)
**Instruments**: Strings (primary), pad (layered), bass (melodic), lead (FM-like melodies), minimal/no drums
**Structure**: Slow build → Orchestral swell → Sustained climax → Fade
**Vibe**: Epic, cinematic, sweeping, like Blade Runner or Chariots of Fire - vast sonic landscapes with emotional grandeur

### Key Characteristics

1. **Epic Strings**: Primary element with slow attack (0.8s+) and long release (3s+)
2. **Sweeping Pads**: Layered for vastness, modal progressions create grandeur
3. **Melodic Bass**: Not just rhythm - bass carries melodic lines
4. **FM-Style Lead**: Expressive saw wave melodies with portamento
5. **Minimal/No Drums**: Focus on orchestral synth elements, sparse percussion
6. **Slow Build**: Patient development over long sections (6-8 bars)

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 82;
  Tone.Transport.bpm.value = bpm;
  // NO SWING - sweeping, cinematic

  // === FX BUSES ===
  const orchestralReverb = new Tone.Reverb({ decay: 5.0, wet: 0.55 }).toDestination();
  await orchestralReverb.generate();

  const softReverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 }).toDestination();
  await softReverb.generate();

  // === EPIC STRINGS (primary element) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.95, release: 3.5 }
  }).connect(orchestralReverb);

  // Dm → Bb → F → C (i-VI-III-VII)
  const stringChords = [
    ["D3", "F3", "A3", "D4"], // Dm
    ["Bb2", "D3", "F3", "Bb3"], // Bb
    ["F3", "A3", "C4", "F4"], // F
    ["C3", "E3", "G3", "C4"]  // C
  ];
  let stringIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 6 ? 0.40 : (bar >= 14 ? 0.90 : 0.75);
    strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], "2m", time, velocity);
    stringIdx++;
  }, "2m").start(0);

  // === SWEEPING PAD (vastness) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.0, decay: 0.5, sustain: 0.90, release: 2.8 },
    detune: 5
  }).connect(orchestralReverb);

  const padChords = [
    ["D4", "F4", "A4"], // Dm
    ["Bb3", "D4", "F4"], // Bb
    ["F4", "A4", "C5"], // F
    ["C4", "E4", "G4"]  // C
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, 0.40);
    padIdx++;
  }, "2m").start(0);

  // === MELODIC BASS (expressive) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.02, decay: 0.25, sustain: 0.60, release: 0.30 },
    filterEnvelope: { attack: 0.01, decay: 0.20, sustain: 0.40, baseFrequency: 120, octaves: 2.0 }
  }).connect(softReverb);

  const bassMelody = ["D2", "E2", "F2", "G2", "F2", "E2", "D2", null];
  const bassVelocities = [0.70, 0.70, 0.75, 0.75, 0.70, 0.70, 0.65, 0];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bassMelody[bassIdx % bassMelody.length]) {
      bass.triggerAttackRelease(
        bassMelody[bassIdx % bassMelody.length],
        "2n",
        time,
        bassVelocities[bassIdx % bassVelocities.length] * 0.60
      );
    }
    bassIdx++;
  }, "2n").start(0);

  // === FM-STYLE LEAD (climax only) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "4n.", feedback: 0.20, wet: 0.25 }).connect(orchestralReverb);
  const lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.03, decay: 0.25, sustain: 0.70, release: 0.50 },
    portamento: 0.08 // Smooth glides between notes
  }).connect(leadDelay);

  const leadMelody = ["D5", "F5", "G5", "A5", "G5", "F5", "D5", null];
  const leadVelocities = [0.70, 0.75, 0.80, 0.85, 0.80, 0.75, 0.70, 0];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 14 && leadMelody[leadIdx % leadMelody.length]) { // Climax section only
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "1n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.70
      );
    }
    leadIdx++;
  }, "1n").start(0);

  // === MINIMAL KICK (sparse, only in build/climax) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.06 }
  }).toDestination();

  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    // Very minimal: only every 4 bars in build section
    if (bar >= 6 && bar < 22 && kickStep % 8 === 0) {
      kick.triggerAttackRelease("C1", "8n", time, 0.70);
    }
    kickStep++;
  }, "4n").start(0);

  // === ATMOSPHERIC CYMBAL SWELLS (sparse) ===
  const cymbal = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.05, decay: 1.5, release: 2.0 },
    harmonicity: 3.8,
    modulationIndex: 18,
    resonance: 2500
  }).connect(orchestralReverb);

  let cymbalStep = 0;
  const cymbalLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    // Very sparse: every 8 bars in climax
    if (bar >= 14 && cymbalStep % 16 === 0) {
      cymbal.triggerAttackRelease("2n", time, 0.35);
    }
    cymbalStep++;
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { strings, pad, bass, lead, kick, cymbal };
  window.toneJsParts = { stringsLoop, padLoop, bassLoop, leadLoop, kickLoop, cymbalLoop };
};
```

### Common Mistakes to Avoid

❌ **Too fast**: Vangelis is patient and sweeping
- Keep BPM 70-90 (not 110+)
- Long section durations (6-8 bars minimum)
- Allow space for sounds to breathe

❌ **Missing orchestral character**: Strings are essential
- Use slow attack times (0.8s+) on strings
- Long release (3.0s+) for sustaining swells
- Layer strings and pads for depth

❌ **Too much percussion**: This is cinematic, not dance music
- Minimal or no drums
- If drums used, very sparse patterns
- Focus on melodic/harmonic content

❌ **Not epic enough**: Vangelis is about grandeur
- Use modal progressions (i-VI-III-VII)
- Heavy reverb (5s decay) for vast space
- Dynamic build from quiet intro to massive climax

### Arrangement Tips

1. **Intro (6 bars)**: Strings and pads at low volume, establishing mood
2. **Build (8 bars)**: Strings grow, melodic bass enters, tension rises
3. **Climax (8 bars)**: Full strings, lead melody, bass active, maximum emotion
4. **Outro (6 bars)**: Gradual fade, return to strings/pads, peaceful resolution

### Mixing Approach

- **Strings**: 0.40-0.90 volume (dynamic across sections), primary emotional driver
- **Pad**: 0.35-0.45 volume, creates vastness and depth
- **Bass**: 0.55-0.65 volume, melodic element not just rhythm
- **Lead**: 0.65-0.75 volume, only in climax for maximum impact
- **Percussion**: 0.30-0.40 volume, very sparse, don't distract from orchestral elements
- **Overall**: Space and reverb are instruments - don't overcrowd the mix
