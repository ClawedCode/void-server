---
category: experimental
energy: medium
tags: [synth, horror, atmospheric]
---
## Disasterpeace (Dark Melodic Synthwave)

**Tempo**: 80-92 BPM
**Key**: Minor (melancholic progressions, often i-bVII-VI-V or i-VI-iv-VII)
**Instruments**: Emotional lead melodies, pulsing arpeggios, deep bass, ambient pad textures, minimal percussion
**Structure**: Ambient intro → Melodic build → Driving section with full instrumentation → Emotional climax → Fade to ambience
**Vibe**: Dystopian yet beautiful, like the Hyper Light Drifter soundtrack - melancholic exploration through ruined landscapes, heavy reverb creating sense of vast empty spaces, driving but never aggressive

### Key Characteristics

1. **Heavy Reverb**: Creates vast, empty spaces (decay 2.5-3.5s)
2. **Emotional Lead Melodies**: Portamento for expressive sliding between notes
3. **Pulsing Arpeggios**: Up-down 16th note patterns with delay
4. **Ambient Pad Textures**: Long sustained chords, heavy chorus
5. **Minimal Percussion**: Driving but not aggressive, 8th note hats
6. **Melancholic Progressions**: i-bVII-VI-V or i-VI-iv-VII

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 86;
  Tone.Transport.bpm.value = bpm;

  // === HEAVY REVERB (vast empty spaces) ===
  const masterReverb = new Tone.Reverb({ decay: 3.0, wet: 0.35 }).toDestination();
  await masterReverb.generate();

  // === AMBIENT PAD (always present, creates atmosphere) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 1200, Q: 0.5 }).connect(masterReverb);
  const padChorus = new Tone.Chorus({ frequency: 1.2, depth: 0.80, wet: 0.60 }).connect(padFilter).start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.5, decay: 0.8, sustain: 0.6, release: 3.0 }
  }).connect(padChorus);

  // Em → D → C → B (i-bVII-VI-V)
  const padChords = [
    ["E3", "G3", "B3"],  // Em
    ["D3", "F#3", "A3"], // D
    ["C3", "E3", "G3"],  // C
    ["B2", "D#3", "F#3"] // B
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, 0.25);
    padIdx++;
  }, "2m").start(0);

  // === EMOTIONAL LEAD (with portamento for expressive slides) ===
  const leadReverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 }).toDestination();
  await leadReverb.generate();
  const lead = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.20 },
    portamento: 0.08 // Expressive slides between notes
  }).connect(leadReverb);

  const leadMelody = ["E4", "G4", "B4", "A4", "G4", "E4"];
  const leadVelocities = [0.75, 0.80, 0.85, 0.80, 0.75, 0.70];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5 && bar < 24) { // Build through climax
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "2n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.75
      );
      leadIdx++;
    }
  }, "2n").start(0);

  // === PULSING ARPEGGIO (up-down 16th notes with delay) ===
  const arpDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.45, wet: 0.40 }).connect(masterReverb);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.10, sustain: 0, release: 0.08 }
  }).connect(arpDelay);

  const arpPattern = ["E4", "G4", "B4", "G4"]; // Up and down
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 5 ? 0.30 : (bar >= 18 ? 0.50 : 0.45);
    arp.triggerAttackRelease(arpPattern[arpIdx % arpPattern.length], "16n", time, velocity);
    arpIdx++;
  }, "16n").start(0);

  // === DEEP BASS (filtered, pulsing) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 0.8 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.10 }
  }).connect(bassFilter);

  const bassNotes = ["E1", "D1", "C1", "B0"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "8n", time, 0.65);
      bassIdx++;
    }
  }, "8n").start(0);

  // === MINIMAL DRUMS (driving but not aggressive) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.08 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5) {
      kick.triggerAttackRelease("C1", "8n", time, 0.85);
    }
  }, "4n").start(0);

  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0 }
  }).connect(masterReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.75);
    }
    snareStep++;
  }, "4n").start(0);

  // Minimal 8th note hats (not driving 16ths)
  const hat = new Tone.MetalSynth({
    frequency: 300,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 4.5,
    modulationIndex: 24,
    resonance: 3400
  }).connect(masterReverb);

  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5) {
      hat.triggerAttackRelease("16n", time, 0.40);
    }
  }, "8n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, lead, arp, bass, kick, snare, hat };
  window.toneJsParts = { padLoop, leadLoop, arpLoop, bassLoop, kickLoop, snareLoop, hatLoop };
};
```

### Common Mistakes to Avoid

❌ **Not enough reverb**: This style needs vast, empty spaces
- Use long decay (2.5-3.5s) on lead and pads
- High wet mix (0.30-0.40)
- Creates sense of desolate, beautiful landscapes

❌ **Too aggressive**: Disasterpeace is melancholic, not intense
- Keep drums at 0.75-0.85 volume (not 1.0)
- Use 8th note hats, not driving 16ths
- Restrained energy, emotional rather than pumping

❌ **Missing portamento on lead**: Expressive slides are signature
- Set portamento to 0.05-0.10 for smooth note transitions
- Creates human, emotional quality
- Essential for melodic expressiveness

❌ **Weak arpeggio**: Pulsing arps are core to this sound
- Use delay with 0.40-0.50 wet mix for depth
- 16th note patterns create hypnotic pulse
- Keep volume moderate (0.40-0.50)

### Arrangement Tips

1. **Intro (5 bars)**: Ambient pads + quiet arpeggio, establish atmosphere
2. **Build (6 bars)**: Add emotional lead melody, increase arp volume
3. **Drive (7 bars)**: Full instrumentation, drums enter, maintain momentum
4. **Climax (6 bars)**: Peak emotional intensity, all elements at max
5. **Fade (4 bars)**: Return to ambience, pads + arp only

### Mixing Approach

- **Pads**: 0.20-0.30 volume, heavy chorus and reverb, always present
- **Lead**: 0.70-0.80 volume, emotional focus, portamento essential
- **Arp**: 0.40-0.50 volume, pulsing foundation, delay for depth
- **Bass**: 0.60-0.70 volume, low-pass filtered, subtle presence
- **Drums**: 0.75-0.85 volume, driving but restrained, 8th note hats
