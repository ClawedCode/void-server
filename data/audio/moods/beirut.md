---
category: ballad
energy: medium
tags: [world, brass, romantic]
---
## Beirut (Balkan Brass Indie Folk)

**Tempo**: 96-118 BPM (3/4 or 6/8 lilting parade)
**Key**: Minor with bittersweet lifts (D minor, G minor, modal IV or VI for hope)
**Instruments**: Trumpet/flugelhorn lead, accordion drones, ukulele or mandolin strums, tuba/upright bass pulses, brushed snare with tambourine, glockenspiel bells
**Structure**: Horn or accordion prelude → Waltz groove → Call-and-response brass hooks → Nostalgic bridge → Street-parade outro
**Vibe**: Dusk on a cobblestone street, travelogue postcards, romantic but weathered, Eastern European cafe warmth wrapped in indie melancholy

### Key Characteristics

1. **Waltz or 6/8 Pulse**: Accented beat 1 with lighter 2 and 3; rolling rather than straight 4/4
2. **Brass Call-and-Response**: Trumpet/flugelhorn hooks that answer each other, often climbing to a communal shout
3. **Accordion Drones**: Sustained chords that glue everything together, slightly detuned for cafe grit
4. **Offbeat Strums**: Ukulele/mandolin chops on the upbeats to keep the sway moving
5. **Tuba/Upright Bass Pump**: Root-heavy pulses on beat 1 with fifth or octave pickups on beats 2 and 3
6. **Roomy Reverb, Not Stadium**: Sounds like a small hall or plaza, with tambourine wash on choruses

### Reference Tracks

- 'Postcards From Italy' — brass fanfare over wistful uke strums
- 'Elephant Gun' — waltz pulse with triumphant horn answers
- 'Nantes' — accordion drone, brushed drums, mournful trumpet melody

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 112;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [3, 4]; // Waltz feel

  // === FX BUSES (roomy, not huge) ===
  const hall = new Tone.Reverb({ decay: 3.2, wet: 0.32 }).toDestination();
  await hall.generate();
  const slapDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.2, wet: 0.18 }).connect(hall);

  // === ACCORDION DRONE ===
  const accordionFilter = new Tone.Filter({ type: 'lowpass', frequency: 1200, Q: 0.9 }).connect(hall);
  const accordion = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.08, decay: 0.4, sustain: 0.78, release: 2.4 }
  }).connect(accordionFilter);

  const accordionChords = [
    ['D3', 'F3', 'A3'],   // Dm
    ['Bb2', 'D3', 'F3'],  // Bb
    ['G2', 'Bb2', 'D3'],  // Gm
    ['A2', 'E3', 'A3']    // A (lift)
  ];
  let accordionIdx = 0;
  const accordionLoop = new Tone.Loop((time) => {
    accordion.triggerAttackRelease(accordionChords[accordionIdx % accordionChords.length], '2m', time, 0.28);
    accordionIdx++;
  }, '2m').start(0);

  // === WALTZ BASS (tuba/upright) ===
  const tuba = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.24, sustain: 0.28, release: 0.38 },
    filter: { Q: 1 },
    filterEnvelope: { attack: 0.01, decay: 0.14, sustain: 0.22, baseFrequency: 110, octaves: 2.6 }
  }).connect(hall);

  const bassRoots = ['D2', 'Bb1', 'G1', 'A1'];
  const bassFifths = ['A2', 'F2', 'D2', 'E2'];
  let bassStep = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(bassStep / 3);
    const beat = bassStep % 3;
    const root = bassRoots[bar % bassRoots.length];
    const pickup = bassFifths[bar % bassFifths.length];
    const note = beat === 0 ? root : pickup;
    const velocity = beat === 0 ? 0.78 : 0.55;
    tuba.triggerAttackRelease(note, '4n', time, velocity);
    bassStep++;
  }, '4n').start(0);

  // === UKE/MANDOLIN STRUMS (offbeats) ===
  const uke = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.006, decay: 0.22, sustain: 0.18, release: 0.32 }
  }).connect(hall);

  const ukeChords = [
    ['A3', 'D4', 'F4'],   // Dm voicing
    ['F3', 'Bb3', 'D4'],  // Bb
    ['D3', 'G3', 'Bb3'],  // Gm
    ['E3', 'A3', 'C#4']   // A
  ];
  let ukeStep = 0;
  const ukeLoop = new Tone.Loop((time) => {
    const bar = Math.floor(ukeStep / 6);
    const subBeat = ukeStep % 6; // 0-5 across 3/4 (8th notes)
    if (subBeat === 1 || subBeat === 3 || subBeat === 5) {
      const chord = ukeChords[bar % ukeChords.length];
      uke.triggerAttackRelease(chord, '8n', time, 0.32 + (subBeat === 5 ? 0.05 : 0));
    }
    ukeStep++;
  }, '8n').start(0);

  // === BRUSHED SNARE + TAMBOURINE WASH ===
  const brushFilter = new Tone.Filter({ type: 'highpass', frequency: 1500, Q: 0.5 }).connect(hall);
  const brushes = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0 }
  }).connect(brushFilter);

  let brushStep = 0;
  const brushesLoop = new Tone.Loop((time) => {
    const beat = brushStep % 3;
    if (beat > 0) {
      brushes.triggerAttackRelease('16n', time, 0.26 + (beat * 0.04));
    }
    brushStep++;
  }, '4n').start(0);

  const tamb = new Tone.MetalSynth({
    frequency: 6200,
    envelope: { attack: 0.001, decay: 0.2, release: 0.05 },
    harmonicity: 4.5,
    modulationIndex: 22,
    resonance: 5000
  }).connect(hall);

  let tambStep = 0;
  const tambLoop = new Tone.Loop((time) => {
    const bar = Math.floor(tambStep / 3);
    if (bar >= 2 && tambStep % 3 === 0) {
      tamb.triggerAttackRelease('8n', time, 0.18);
    }
    tambStep++;
  }, '4n').start(0);

  // === TRUMPET/FLUGELHORN MELODY ===
  const trumpet = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.24, sustain: 0.35, release: 0.6 }
  }).connect(slapDelay);

  const leadMelody = ['A4', 'Bb4', 'C5', 'A4', 'G4', 'A4', null, 'Bb4', 'C5', 'D5', 'C5', 'Bb4', 'A4', null, 'E5', 'D5', 'C5'];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const note = leadMelody[leadIdx % leadMelody.length];
    const bar = Math.floor(leadIdx / 3);
    if (note && bar >= 2) {
      trumpet.triggerAttackRelease(note, '4n', time, 0.7);
    }
    leadIdx++;
  }, '4n').start(0);

  // === GLOCKENSPIEL ACCENTS ===
  const glock = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.12 }
  }).connect(hall);

  const glockNotes = ['D5', null, 'A5', null, 'F5', null];
  let glockIdx = 0;
  const glockLoop = new Tone.Loop((time) => {
    const note = glockNotes[glockIdx % glockNotes.length];
    if (note) {
      glock.triggerAttackRelease(note, '8n', time, 0.4);
    }
    glockIdx++;
  }, '8n').start('2m'); // Sprinkle after intro

  // === STORE REFERENCES ===
  window.toneJsInstruments = {
    accordion,
    tuba,
    uke,
    brushes,
    tamb,
    trumpet,
    glock
  };
  window.toneJsParts = {
    accordionLoop,
    bassLoop,
    ukeLoop,
    brushesLoop,
    tambLoop,
    leadLoop,
    glockLoop
  };
};
```

### Arrangement Tips

- Keep the parade sway: accent beat 1, let 2 and 3 breathe with lighter touches.
- Introduce horns as a reply to the groove instead of leading immediately; save the shout chorus for later.
- Let accordion drone through sections to glue harmonic shifts; ride filter slightly for motion.
- Use tambourine and room reverb to place the band in a plaza, not a dry studio.
