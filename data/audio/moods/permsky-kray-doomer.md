---
category: industrial
energy: low
tags: [doomer, dark, russian]
---
## Permsky Kray (Russian Doomer)

**Tempo**: 70-85 BPM
**Key**: Minor (melancholic, existential)
**Instruments**: Lo-fi subdued synths, deep muted bass, minimal drums, atmospheric pads, urban noise textures
**Structure**: Sparse intro → Minimal groove → Contemplative layers → Emotional peak → Fade to silence
**Vibe**: Deeply introspective, melancholic, urban isolation - late-night existential contemplation. Post-Soviet internet culture aesthetic. Think PERMSKY KRAY, молчат дома (Molchat Doma), Ploho. Emphasis on emotional depth over energy, lo-fi production, and atmospheric emptiness.

### Key Characteristics

1. **Subdued Energy**: Low-to-moderate energy throughout, never aggressive
2. **Lo-fi Aesthetic**: Slightly degraded sound quality, imperfect textures
3. **Sparse Arrangements**: Minimal instrumentation, lots of space and silence
4. **Urban Atmosphere**: Background textures suggesting city ambience, isolation
5. **Emotional Depth**: Contemplative sadness, not dramatic despair
6. **Post-Electronic**: Electronic instrumentation but organic, human feel

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;

  // === FX ===
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.40 }).toDestination();
  await reverb.generate();

  const chorus = new Tone.Chorus({ frequency: 0.5, depth: 0.4, wet: 0.35 }).connect(reverb).start();
  const bitCrusher = new Tone.BitCrusher({ bits: 10 }).connect(chorus); // Lo-fi degradation

  // === ATMOSPHERIC PAD (muted, distant) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 0.8 }).connect(bitCrusher);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    detune: -8,
    envelope: { attack: 1.2, decay: 0.8, sustain: 0.6, release: 2.5 }
  }).connect(padFilter);

  // Melancholic minor progression: Dm → Bb → F → C
  const chords = [
    ["D3", "F3", "A3"],  // Dm
    ["Bb2", "D3", "F3"], // Bb
    ["F2", "A2", "C3"],  // F
    ["C3", "E3", "G3"]   // C
  ];
  let chordIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 1 && bar < 18) { // Enter early, exit before end
      pad.triggerAttackRelease(chords[chordIndex % chords.length], "1m", time, 0.20);
      chordIndex++;
    }
  }, "1m").start(0);

  // === DEEP MUTED BASS (subdued, minimal movement) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 180, Q: 0.5 }).connect(reverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.15, release: 0.20 }
  }).connect(bassFilter);

  const bassNotes = ["D1", "D1", "D1", "Bb0", "Bb0", "F1", "F1", "C1"];
  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 18) { // Start after intro
      bass.triggerAttackRelease(bassNotes[bassIndex % bassNotes.length], "8n", time, 0.45);
      bassIndex++;
    }
  }, "4n").start(0);

  // === MINIMAL MELODIC ELEMENT (sparse, contemplative) ===
  const melodyFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 0.6 }).connect(reverb);
  const melodyDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.35, wet: 0.40 }).connect(melodyFilter);
  const melody = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.20, sustain: 0.10, release: 0.15 }
  }).connect(melodyDelay);

  const melodyNotes = ["D4", null, "F4", null, "A4", null, "F4", null, "D4", null, null, null];
  let melodyIdx = 0;
  const melodyLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const note = melodyNotes[melodyIdx % melodyNotes.length];
    if (note && bar >= 6 && bar < 16) { // Mid-section only
      melody.triggerAttackRelease(note, "8n", time, 0.30);
    }
    melodyIdx++;
  }, "4n").start(0);

  // === MINIMAL DRUMS (very sparse, subdued) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.08 }
  }).connect(reverb);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 16) { // Limited presence
      kick.triggerAttackRelease("C1", "8n", time, 0.55);
    }
  }, "4n").start(0);

  // Minimal snare (very soft, distant)
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0 }
  }).connect(reverb);

  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 14) {
      snare.triggerAttackRelease("8n", time, 0.35);
    }
  }, "2n").start(0);

  // === URBAN ATMOSPHERE TEXTURE (optional background noise) ===
  const noiseFilter = new Tone.Filter({ type: "bandpass", frequency: 400, Q: 2.0 }).connect(reverb);
  const atmosphere = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.5, decay: 0, sustain: 1.0, release: 1.0 }
  }).connect(noiseFilter);

  Tone.Transport.schedule((time) => {
    atmosphere.triggerAttackRelease(8.0, time); // Long ambient wash
  }, "0:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, bass, melody, kick, snare, atmosphere };
  window.toneJsParts = { padLoop, bassLoop, melodyLoop, kickLoop, snareLoop };
};
```

### Common Mistakes to Avoid

❌ **Too energetic**: Doomer music is subdued and introspective
- Keep BPM 70-85 (not 100+)
- Avoid driving four-on-floor beats
- Minimize rhythmic complexity

❌ **Too polished**: This aesthetic requires lo-fi imperfection
- Use bit crushing or subtle degradation
- Keep filter cutoffs low (200-800 Hz)
- Don't over-produce or make it too clean

❌ **Too dense**: Space and emptiness are crucial
- Sparse instrumentation (3-4 elements maximum)
- Use lots of silence and rests in patterns
- Long reverb tails create atmospheric space

❌ **Too dramatic**: Avoid cinematic crescendos
- Emotional depth comes from subtlety
- No huge builds or epic drops
- Keep dynamics relatively flat

### Mood Guidelines

**Emotional Tone:**
- Melancholic but not depressive
- Contemplative, not despairing
- Urban isolation, not rural nostalgia
- Post-Soviet cultural references appropriate

**Production Quality:**
- Lo-fi but intentional, not sloppy
- Slightly degraded, not heavily distorted
- Muted frequencies, minimal brightness
- Reverb-heavy for atmospheric depth

**Instrumentation:**
- Simple synthesizers (sine, triangle waves preferred)
- Minimal drums (kick, snare, maybe hi-hat)
- Atmospheric pads and textures
- Optional urban ambience (distant traffic, etc.)

### Structural Approach

For a 60-90 second composition:

1. **Intro (0-10s)**: Atmospheric pad or ambient texture, establish mood
2. **Foundation (10-25s)**: Add bass and minimal chords, sparse rhythm
3. **Development (25-50s)**: Add melodic element, drums if used, maintain restraint
4. **Peak (50-65s)**: All elements present but still subdued, emotional depth
5. **Outro (65-90s)**: Strip back to opening atmosphere, fade to near-silence

**Loop-Friendly Ending:**
- Final 12-15 seconds should reduce to opening instrumentation
- Fade atmospheric elements
- Return to sparse, contemplative state matching intro
- Consider fading to near-silence or single pad/texture

### Mixing Approach

- **Bass**: 0.40-0.50 volume, very muted and low (150-200 Hz cutoff)
- **Pads**: 0.15-0.25 volume, distant and atmospheric
- **Melody**: 0.25-0.35 volume, sparse with space
- **Drums**: 0.35-0.55 volume, minimal presence
- **Atmosphere**: 0.10-0.20 volume, barely audible texture
- **Overall**: Heavy reverb (3-4s decay), low-pass filtering, lo-fi degradation

### Reference Characteristics

**PERMSKY KRAY - Дорогой Человек:**
- Subdued tempo (70-85 BPM)
- Minimal electronic instrumentation
- Melancholic minor key progressions
- Lo-fi production aesthetic
- Contemplative, not aggressive
- Urban isolation themes
- Post-electronic sensibility (electronic tools, organic feel)
