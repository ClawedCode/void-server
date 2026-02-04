---
category: experimental
energy: medium
tags: [synth, horror, atmospheric]
---
## Disasterpeace - Detroit Redux

**Tempo**: 66 BPM
**Key**: C Minor (Dark, dread-filled)
**Instruments**: Heavy distorted sawtooth bass, detuned square lead, hypnotic arpeggios, crushed minimal drums
**Structure**: Looming bass drone → Hypnotic arp → Haunting melody → Slow heavy groove → Dissolve into noise
**Vibe**: Lo-fi horror, creeping dread, retro-futuristic decay. Like walking through a haunted, abandoned 8-bit city. The sound of a nightmare on a broken VHS tape.

### Key Characteristics

1.  **Lo-Fi Degradation**: Heavy bitcrushing (4-6 bits) and low-pass filtering to simulate old hardware limitations.
2.  **Creeping Dread**: Slow tempo (66 BPM) and dissonant intervals create a sense of unease.
3.  **Hypnotic Repetition**: Arpeggios that repeat with slight variations, creating a trance-like state.
4.  **Distorted Weight**: Bass is heavy and distorted, taking up a lot of sonic space.
5.  **Haunting Melody**: Simple, piercing lead melodies with portamento, often using minor seconds and tritones.

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 66;
  Tone.Transport.bpm.value = bpm;

  // === MASTER EFFECTS CHAIN (The "Redux" Sound) ===
  const masterGain = new Tone.Gain(0.9).toDestination();
  const masterLimiter = new Tone.Limiter(-1).connect(masterGain);

  // Lo-fi degradation: Bitcrushing and filtering
  const masterBitcrusher = new Tone.BitCrusher({
    bits: 5, // Gritty but distinct
    wet: 0.3
  }).connect(masterLimiter);

  const masterFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 6000, // Cut off harsh highs
    Q: 0.5
  }).connect(masterBitcrusher);

  const masterReverb = new Tone.Reverb({
    decay: 5,
    preDelay: 0.1,
    wet: 0.4 // Heavy atmosphere
  }).connect(masterFilter);
  await masterReverb.generate();

  // === BASS: Heavy, distorted, looming ===
  const bassDistortion = new Tone.Distortion(0.6).connect(masterReverb);
  const bassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 400,
    Q: 1
  }).connect(bassDistortion);

  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 2 }, // Slow attack for looming feel
    volume: -2
  }).connect(bassFilter);

  // C Minor drone progression: Cm -> Ab -> Fm -> G
  const bassNotes = ["C1", "Ab0", "F0", "G0"];
  let bassIdx = 0;

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar < 16) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "1m", time);
      bassIdx++;
    }
  }, "1m").start(0);

  // === ARP: Hypnotic, repetitive ===
  const arpDelay = new Tone.FeedbackDelay({
    delayTime: "8n.",
    feedback: 0.5,
    wet: 0.3
  }).connect(masterReverb);

  const arp = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
    volume: -10
  }).connect(arpDelay);

  // Hypnotic C minor pattern
  const arpPattern = ["C3", "Eb3", "G3", "C4", "Eb4", "C4", "G3", "Eb3"];
  let arpIdx = 0;

  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 18) { // Enter after bass intro
      arp.triggerAttackRelease(arpPattern[arpIdx % arpPattern.length], "16n", time);
      arpIdx++;
    }
  }, "16n").start(0);

  // === LEAD: Haunting, detuned ===
  const leadDelay = new Tone.PingPongDelay("4n", 0.4).connect(masterReverb);
  
  const lead = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 1 },
    portamento: 0.1, // Sliding notes
    volume: -6
  }).connect(leadDelay);

  // Simple, haunting melody
  const leadMelody = [
    { time: "4:0:0", note: "G4", duration: "2n" },
    { time: "4:2:0", note: "F4", duration: "4n" },
    { time: "4:3:0", note: "Eb4", duration: "2n" },
    { time: "5:2:0", note: "D4", duration: "2n" }, // Tension
    { time: "6:0:0", note: "C4", duration: "1m" },
    
    { time: "8:0:0", note: "G4", duration: "2n" },
    { time: "8:2:0", note: "Ab4", duration: "4n" },
    { time: "8:3:0", note: "Bb4", duration: "2n" },
    { time: "9:2:0", note: "B4", duration: "2n" }, // Dissonant tritone
    { time: "10:0:0", note: "C5", duration: "1m" }
  ];

  leadMelody.forEach(({ time, note, duration }) => {
    Tone.Transport.schedule((schedTime) => {
      lead.triggerAttackRelease(note, duration, schedTime);
    }, time);
  });

  // === DRUMS: Minimal, crushed ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    volume: 0
  }).connect(masterBitcrusher);

  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    volume: -8
  }).connect(masterReverb);

  let drumStep = 0;
  const drumLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const beat = drumStep % 4;

    if (bar >= 4 && bar < 16) { // Drums enter with melody
      // Heavy, slow beat
      if (beat === 0) {
        kick.triggerAttackRelease("C1", "8n", time);
      } else if (beat === 2) {
        snare.triggerAttackRelease("8n", time);
      } 
      // Occasional ghost kick
      else if (beat === 1 && drumStep % 8 === 5) {
         kick.triggerAttackRelease("C1", "16n", time, 0.5);
      }
    }
    drumStep++;
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = {
    bass, arp, lead, kick, snare,
    masterGain, masterLimiter, masterBitcrusher, masterFilter, masterReverb,
    bassDistortion, bassFilter, arpDelay, leadDelay
  };
  window.toneJsParts = { bassLoop, arpLoop, drumLoop };
};
```

### Common Mistakes to Avoid

**Too Bright**: The "Redux" sound is defined by its lack of high frequencies.
- Use lowpass filters aggressively (cutoff around 6000Hz or lower).
- Avoid bright waveforms like pure sawtooths without filtering.

**Too Fast**: Dread needs time to breathe.
- Keep tempo slow (60-70 BPM).
- Allow long decays on reverb and release times.

**Too Clean**: This is a corrupted memory.
- Bitcrushing is essential, but don't overdo it to the point of white noise.
- Distortion on bass adds necessary weight and grit.

### Mixing Approach

- **Bass**: Dominant, centered, heavy.
- **Arp**: Stereo width (ping-pong or chorus), background texture.
- **Lead**: Piercing but distant (reverb), emotional focus.
- **Drums**: Punchy but "small" sound (bitcrushed), not big stadium rock drums.
