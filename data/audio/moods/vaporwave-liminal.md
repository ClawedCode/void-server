---
category: ambient
energy: low
tags: [liminal, nostalgic, lo-fi, dreamy]
---
## Vaporwave (Liminal Mall Aesthetic)

**Tempo**: 70-85 BPM (often feels slower due to half-time feel)
**Key**: Major with jazzy extensions (F major, Eb major - 7ths, 9ths, 11ths)
**Instruments**: Detuned FM bells, Rhodes/electric piano, smooth fretless bass, lush pads, minimal soft drums, chopped samples aesthetic
**Structure**: Dreamy intro → Smooth groove → Nostalgic melody → Lo-fi breakdown → Fade to static
**Vibe**: Empty malls at 3am, fluorescent-lit corporate lobbies, abandoned arcades, faded VHS memories, late capitalism dreamscapes, digital decay and nostalgia. Think Macintosh Plus, 2814, blank banshee. Perfect for liminal spaces, backrooms, and digital consciousness themes.

### Key Characteristics

1. **Slowed & Detuned**: Everything feels slightly slow, pitched down, degraded - like a worn cassette tape
2. **Lo-fi Degradation**: Bitcrushing, heavy filtering, tape wobble, subtle distortion
3. **Jazzy Harmony**: Major 7th, 9th, and 11th chords - smooth jazz meets elevator muzak
4. **Dreamy Reverb**: Heavy, washy reverb creates that submerged, underwater quality
5. **Minimal Drums**: Soft kicks, brushed snares, no aggressive percussion
6. **FM Synthesis**: Bell-like tones, Rhodes-style electric piano, that 80s/90s digital warmth
7. **Sidechain Pumping**: Subtle sidechain compression for that breathing, pulsing feel
8. **Nostalgic Melodies**: Simple, memorable phrases that evoke faded memories

### Reference Tracks

**Essential Vaporwave:**
- **Macintosh Plus - "リサフランク420 / 現代のコンピュー"** - The quintessential vaporwave track, slowed Diana Ross sample, dreamy and melancholic
- **2814 - "新しい日の誕生"** - Atmospheric vaporwave, rain-soaked cityscapes, ambient textures
- **blank banshee - "Teen Pregnancy"** - More beat-driven vaporwave, chopped samples, glitchy
- **Saint Pepsi - "Private Caller"** - Future funk adjacent, upbeat but still nostalgic
- **Luxury Elite - "World Class"** - Smooth, lounge-influenced, late-night vibes
- **t e l e p a t h テレパシー能力者 - "現実を超えて"** - Ambient vaporwave, pure atmosphere

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 75;
  Tone.Transport.bpm.value = bpm;

  // Humanization helper
  const H = ms => (Math.random() * ms * 2 - ms) / 1000;

  // === FX BUSES (lo-fi dreamscape) ===
  const masterReverb = new Tone.Reverb({ decay: 4.5, wet: 0.45 }).toDestination();
  await masterReverb.generate();

  // Lo-fi degradation
  const bitCrusher = new Tone.BitCrusher({ bits: 10 }).connect(masterReverb);

  // Tape wobble chorus (slow, detuned)
  const tapeWobble = new Tone.Chorus({
    frequency: 0.15, // Very slow wobble
    delayTime: 5.0,
    depth: 0.6,
    wet: 0.35
  }).connect(bitCrusher).start();

  // Sidechain-style pumping via AutoFilter
  const pumper = new Tone.AutoFilter({
    frequency: bpm / 60, // Synced to tempo
    type: "sine",
    depth: 0.15,
    baseFrequency: 800,
    octaves: 2
  }).connect(tapeWobble).start();

  // Clean bus for bass
  const cleanBus = new Tone.Gain(0.9).connect(masterReverb);

  // === DETUNED FM BELLS (vaporwave signature) ===
  const bellFilter = new Tone.Filter({ type: "lowpass", frequency: 2000, Q: 0.4 }).connect(pumper);
  const fmBell = new Tone.FMSynth({
    harmonicity: 2.5,
    modulationIndex: 8,
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 1.5, sustain: 0.1, release: 2.5 },
    modulation: { type: "sine" },
    modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 1.5 },
    detune: -25, // Slightly flat for that degraded feel
    volume: -8
  }).connect(bellFilter);

  // Fmaj9 → Ebmaj9 → Dm9 → Bbmaj7 (jazzy, nostalgic)
  const bellMelody = ["A4", "G4", "F4", "A4", "C5", "A4", "G4", "F4"];
  let bellIdx = 0;
  const bellLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 18) { // Enter after intro, exit before loop
      fmBell.triggerAttackRelease(bellMelody[bellIdx % bellMelody.length], "4n", time + H(12), 0.45);
      bellIdx++;
    }
  }, "4n").start(0);

  // === RHODES-STYLE PAD (warm, jazzy chords) ===
  const rhodesFilter = new Tone.Filter({ type: "lowpass", frequency: 1400, Q: 0.5 }).connect(pumper);
  const rhodesChorus = new Tone.Chorus({
    frequency: 0.8,
    delayTime: 3.5,
    depth: 0.4,
    wet: 0.30
  }).connect(rhodesFilter).start();

  const rhodes = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 0.08, decay: 0.6, sustain: 0.4, release: 1.5 }
  }).connect(rhodesChorus);

  // Jazzy major 7th/9th voicings
  const chords = [
    ["F3", "A3", "C4", "E4"],     // Fmaj7
    ["Eb3", "G3", "Bb3", "D4"],   // Ebmaj7
    ["D3", "F3", "A3", "C4"],     // Dm7
    ["Bb2", "D3", "F3", "A3"]     // Bbmaj7
  ];
  let chordIdx = 0;
  const chordLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar < 20) { // Wind down before loop
      const velocity = 0.25 + (Math.random() * 0.05);
      rhodes.triggerAttackRelease(chords[chordIdx % chords.length], "1m", time + H(8), velocity);
      chordIdx++;
    }
  }, "1m").start(0);

  // === SMOOTH FRETLESS BASS (round, warm) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 350, Q: 0.6 }).connect(cleanBus);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.4 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, baseFrequency: 150, octaves: 1.5 }
  }).connect(bassFilter);

  const bassNotes = ["F1", "F1", "Eb1", "Eb1", "D1", "D1", "Bb0", "Bb0"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 20) { // Start after pad, wind down
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "4n", time + H(5), 0.55);
      bassIdx++;
    }
  }, "2n").start(0);

  // === SOFT KICK (lo-fi, muffled) ===
  const kickFilter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 0.8 }).connect(masterReverb);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.10 }
  }).connect(kickFilter);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 18) { // Limited presence
      const velocity = 0.50 + (Math.random() * 0.08);
      kick.triggerAttackRelease("C1", "8n", time + H(4), velocity);
    }
  }, "2n").start(0);

  // === BRUSHED SNARE (very soft, distant) ===
  const snareFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 0.4 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0 }
  }).connect(snareFilter);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 16 && snareStep % 4 === 2) { // Very sparse
      snare.triggerAttackRelease("16n", time + H(10), 0.25);
    }
    snareStep++;
  }, "4n").start(0);

  // === LO-FI TEXTURE (tape hiss, static) ===
  const noiseFilter = new Tone.Filter({ type: "highpass", frequency: 2000, Q: 0.3 }).connect(masterReverb);
  const hiss = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.5, decay: 0, sustain: 1.0, release: 2.0 }
  }).connect(noiseFilter);

  // Constant subtle hiss (tape texture) - barely audible
  Tone.Transport.schedule((time) => {
    hiss.triggerAttackRelease(60, time, 0.015); // Extremely quiet
  }, "0:0:0");

  // === FILTER AUTOMATION (dreamy sweep) ===
  // Open up during peak section
  Tone.Transport.schedule((time) => {
    bellFilter.frequency.linearRampToValueAtTime(3500, time + 8 * (60 / bpm) * 4);
  }, "8:0:0");

  // Close back down before loop (return to dreamy state)
  Tone.Transport.schedule((time) => {
    bellFilter.frequency.linearRampToValueAtTime(2000, time + 4 * (60 / bpm) * 4);
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { fmBell, rhodes, bass, kick, snare, hiss, bitCrusher, tapeWobble, pumper };
  window.toneJsParts = { bellLoop, chordLoop, bassLoop, kickLoop, snareLoop };
};
```

### Common Mistakes to Avoid

❌ **Too clean/modern**: Vaporwave is lo-fi and degraded
- Use bitcrushing (8-12 bits)
- Add chorus with slow frequency (0.1-0.5 Hz) for tape wobble
- Keep filter cutoffs moderate (1000-2000 Hz)
- Everything should feel slightly underwater

❌ **Too fast or energetic**: Vaporwave is slow and dreamy
- Keep BPM 70-85 (even 90 BPM should feel half-time)
- Avoid busy 16th note patterns
- Drums should be minimal and soft
- Think elevator music, not dance floor

❌ **Minor keys or dark progressions**: Vaporwave uses major keys
- Major 7ths, 9ths, 11ths are essential
- Jazzy, smooth progressions
- Think smooth jazz, city pop, lounge music
- Nostalgic warmth, not gothic darkness

❌ **Sharp transients**: Everything should be soft
- Long attacks on pads (0.05-0.15s)
- Muffled drums (low-pass everything)
- Avoid aggressive percussion
- Round, warm sounds only

❌ **Forgetting the nostalgia**: This is about faded memories
- Detuning is essential (-20 to -40 cents)
- Reverb should be heavy (3.5-5.0s decay)
- Think degraded VHS, worn cassette tapes
- The imperfection IS the aesthetic

### Arrangement Tips

1. **Intro (0-4 bars)**: Rhodes pad only, establish the dreamy atmosphere
2. **Build (4-8 bars)**: Add bass and FM bells, soft groove emerges
3. **Peak (8-14 bars)**: All elements present, filter opens, maximum nostalgia
4. **Breakdown (14-18 bars)**: Strip to pad and texture, contemplative moment
5. **Wind-down (18-24 bars)**: Return to intro state, fade hiss slightly
6. **Loop point**: Seamless return to dreamy pad atmosphere

### Sound Design Details

**FM Bells (Vaporwave Signature)**:
- Use `Tone.FMSynth` with harmonicity 2-3
- Detune -20 to -40 cents for degraded feel
- Moderate modulation index (6-12) for warm, not harsh
- Long release (2-3s) for dreamy sustain
- Low-pass filter (1500-2500 Hz)

**Rhodes/Electric Piano**:
- `Tone.PolySynth` with sine oscillator
- Chorus for warmth (slow frequency 0.5-1.5 Hz)
- Jazzy voicings: stack 3rds, add 7ths and 9ths
- Moderate attack (0.05-0.1s) for soft entry

**Lo-fi Processing**:
- BitCrusher: 8-12 bits (not too extreme)
- Chorus: Very slow (0.1-0.3 Hz) for tape wobble
- Filter: Keep everything muffled (1000-2500 Hz)
- Reverb: Heavy (4-5s decay), high wet (0.4-0.5)

**Drums (Minimal)**:
- Kick: Muffled, low-pass at 150-250 Hz
- Snare: Pink noise, very soft (0.2-0.3 velocity)
- No hi-hats or very subtle if used
- Half-time feel even at moderate BPM

### Mixing Approach

- **FM Bells**: 0.40-0.50 volume, filtered and reverbed
- **Rhodes**: 0.20-0.30 volume, wide stereo, heavy chorus
- **Bass**: 0.50-0.60 volume, centered, warm and round
- **Kick**: 0.45-0.55 volume, very muffled
- **Snare**: 0.20-0.30 volume, distant and soft
- **Hiss**: 0.01-0.02 volume, barely audible texture
- **Master Reverb**: 4-5s decay, 0.40-0.50 wet

### Emotional Palette

**What Vaporwave evokes:**
- 3am walks through empty malls
- Fluorescent-lit corporate lobbies
- Faded memories of 90s childhood
- Late capitalism's abandoned dreamscapes
- Digital consciousness in liminal spaces
- Nostalgia for futures that never arrived
- VHS tapes left in the sun too long
- Elevator rides that never end

**Perfect for ClawedCode content about:**
- Liminal spaces and backrooms
- Digital decay and consciousness
- Corporate void aesthetics
- Nostalgic existentialism
- Mall cats and abandoned servers
- The space between waking and sleep
