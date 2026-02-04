---
category: cinematic
energy: high
tags: [western, orchestral, dramatic]
---
## Ennio Morricone (The Ecstasy of Gold)

**Tempo**: 84-92 BPM
**Key**: Minor center (Aeolian/Dorian), pedal-tone tension
**Instruments**: Plucked ostinato (harp/guitar), vocal/oboe lead, choir (pure vowels), brass swells, timpani rolls, tolling bells, cymbal swells
**Structure**: Haze → Ostinato ignition → Solo line enters → Choir+strings layer on → Brass swells → Percussion and bells → Apex cadence and release
**Vibe**: Morricone's signature western epic - relentless ostinato pulling uphill, soaring vocal lines, layered accumulation to overwhelming climax

### Key Characteristics

1. **Engine Room Ostinato**: Bright plucked arpeggio (harp/guitar) that starts small and becomes relentless - the treadmill pulling everything uphill
2. **Soaring Lead Line**: Vocal/oboe-like melody that climbs in staged peaks; tune isn't busy, the arrangement does the lifting
3. **Layering Strategy**: Adders, not switchers - each layer arrives and stays, thinning only near cadences
4. **Accumulation Dynamics**: Perceived loudness rises via orchestration and subtle gain ramps, not compression
5. **Tolling Bells**: Ritual markers at structural points
6. **Timpani Rolls**: Quick repeated low hits with gain ramps for dramatic swells
7. **Minimal Reverb**: Large hall with long pre-delay to keep transients present, not washy

### What gives it that Morricone rush

**Form**: Long crescendi rather than hard groove; breathes and builds
**Harmony**: Minor center with pedal-tone tension, stepwise bass moves that feel inevitable
**Color**:
- Strings: tremolo shimmer + sustained pads; chorus and hall reverb
- Choir: pure vowels ("ah/oo"), embracing fifth and octave for nobility
- Brass: broad, delayed entries; swells rather than stabs
- Percussion: timpani rolls, bass drum heartbeats, cymbal swells, tolling bells

**Space**: Large plate/hall reverb with long pre-delay (~90-120ms) to keep transients present

**Dynamics**: Masterclass in accumulation - 3-6 dB rise across a minute via orchestration and subtle gain ramps

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 90;
  Tone.Transport.bpm.value = bpm;

  // ===== Master FX chain =====
  const masterGain = new Tone.Gain(0.0).toDestination();
  const masterComp = new Tone.Compressor({ threshold: -18, ratio: 2, attack: 0.01, release: 0.2 }).connect(masterGain);
  const hall = new Tone.Reverb({ decay: 8.5, preDelay: 0.09, wet: 0.35 }).connect(masterComp);
  await hall.generate();
  const plate = new Tone.Reverb({ decay: 4.2, preDelay: 0.02, wet: 0.18 }).connect(masterComp);
  await plate.generate();
  const echo = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.3, wet: 0.18 }).connect(hall);

  // Submix buses
  const padBus = new Tone.Gain(0.7).connect(hall);
  const ostBus = new Tone.Gain(0.0).connect(echo);
  const leadBus = new Tone.Gain(0.0).connect(hall);
  const choirBus = new Tone.Gain(0.0).connect(hall);
  const percBus = new Tone.Gain(0.0).connect(hall);

  // ===== Pads / Strings (minimal haze) =====
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 1200, Q: 0.7 }).connect(padBus);
  const padTrem = new Tone.Tremolo({ frequency: 8, depth: 0.2, spread: 180 }).start().connect(padFilter);
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 2.5, decay: 1.5, sustain: 0.8, release: 4.0 }
  }).connect(padTrem);

  // Sustained modal haze (E minor center) - extended throughout
  const haze = [
    { time: "0:0:0", notes: ["E4","B4","E5"], dur: "4m", vel: 0.35 },
    { time: "4:0:0", notes: ["D4","A4","D5"], dur: "4m", vel: 0.32 },
    { time: "8:0:0", notes: ["E4","B4","E5"], dur: "4m", vel: 0.37 },
    { time: "12:0:0", notes: ["D4","A4","D5"], dur: "4m", vel: 0.35 },
    { time: "16:0:0", notes: ["E4","B4","E5"], dur: "4m", vel: 0.40 },
    { time: "20:0:0", notes: ["D4","A4","D5"], dur: "4m", vel: 0.38 },
    { time: "24:0:0", notes: ["E4","B4","E5"], dur: "4m", vel: 0.42 },
    { time: "28:0:0", notes: ["D4","A4","D5"], dur: "4m", vel: 0.40 }
  ];
  haze.forEach(ev => {
    strings.triggerAttackRelease(ev.notes, ev.dur, ev.time, ev.vel);
  });

  // ===== OSTINATO (plucked arps - the ENGINE) =====
  const pluck = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    filter: { type: "lowpass", Q: 8, frequency: 2200 },
    envelope: { attack: 0.002, decay: 0.18, sustain: 0.1, release: 0.08 },
    filterEnvelope: { attack: 0.001, decay: 0.12, sustain: 0.2, release: 0.1, baseFrequency: 800, octaves: 2.5 }
  }).connect(ostBus);

  // Pattern: propulsive arpeggio (Em → C → D → Em, pedal on E)
  const ostNotes = [
    ["E4","B4","E5","G4"], ["C4","G4","C5","E4"],
    ["D4","A4","D5","F#4"], ["E4","B4","E5","G4"]
  ];

  // Build long pattern for 90 seconds (34 measures at 90 BPM)
  const ostSchedule = [];
  for (let bar = 0; bar < 34; bar++) {
    for (let beat = 0; beat < 4; beat++) {
      const chordIdx = ((bar * 4) + beat) % 4;
      ostSchedule.push([`${bar}:${beat}:0`, ostNotes[chordIdx]]);
    }
  }

  const ostPart = new Tone.Part((time, step) => {
    // 16th-grid arpeggio over each chord cell
    step.forEach((n,i) => {
      pluck.triggerAttackRelease(n, "16n", time + Tone.Time("16n") * i, 0.6);
    });
  }, ostSchedule);
  ostPart.start(0);

  // ===== LEAD (vocal/oboe-ish) =====
  const lead = new Tone.AMSynth({
    oscillator: { type: "sine" },
    modulation: { type: "triangle" },
    harmonicity: 1.01,
    envelope: { attack: 0.18, decay: 0.4, sustain: 0.75, release: 1.4 },
    modulationEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.6 }
  }).connect(leadBus);
  const leadVibrato = new Tone.Vibrato({ frequency: 5.5, depth: 0.08 }).connect(hall);
  lead.connect(leadVibrato);

  // Climbing contour - extended for full build
  const leadPart = new Tone.Part((time, note) => {
    lead.triggerAttackRelease(note.pitch, note.dur, time, note.vel);
  }, [
    // First phrase (bars 4-8)
    { time: "4:0:0", pitch: "B4", dur: "8n",  vel: 0.7 },
    { time: "4:0:2", pitch: "C5", dur: "8n",  vel: 0.72 },
    { time: "4:1:0", pitch: "D5", dur: "4n",  vel: 0.74 },
    { time: "4:2:0", pitch: "E5", dur: "4n",  vel: 0.76 },
    { time: "4:3:0", pitch: "G5", dur: "4n.", vel: 0.78 },
    { time: "5:0:2", pitch: "F#5",dur: "8n",  vel: 0.78 },
    { time: "5:1:0", pitch: "E5", dur: "4n",  vel: 0.76 },
    { time: "5:2:0", pitch: "B4", dur: "2n",  vel: 0.74 },

    // Second phrase (bars 8-12) - climbing higher
    { time: "8:0:0", pitch: "D5", dur: "8n",  vel: 0.76 },
    { time: "8:0:2", pitch: "E5", dur: "8n",  vel: 0.78 },
    { time: "8:1:0", pitch: "G5", dur: "4n",  vel: 0.80 },
    { time: "8:2:0", pitch: "A5", dur: "4n",  vel: 0.82 },
    { time: "8:3:0", pitch: "B5", dur: "4n.", vel: 0.84 },
    { time: "9:0:2", pitch: "A5", dur: "8n",  vel: 0.82 },
    { time: "9:1:0", pitch: "G5", dur: "4n",  vel: 0.80 },
    { time: "9:2:0", pitch: "E5", dur: "2n",  vel: 0.78 },

    // Third phrase (bars 12-16) - soaring
    { time: "12:0:0", pitch: "E5", dur: "8n",  vel: 0.80 },
    { time: "12:0:2", pitch: "G5", dur: "8n",  vel: 0.82 },
    { time: "12:1:0", pitch: "A5", dur: "4n",  vel: 0.84 },
    { time: "12:2:0", pitch: "B5", dur: "4n",  vel: 0.86 },
    { time: "12:3:0", pitch: "D6", dur: "4n.", vel: 0.88 },
    { time: "13:0:2", pitch: "C6", dur: "8n",  vel: 0.86 },
    { time: "13:1:0", pitch: "B5", dur: "4n",  vel: 0.84 },
    { time: "13:2:0", pitch: "G5", dur: "2n",  vel: 0.82 },

    // Peak phrase (bars 16-20) - maximum intensity
    { time: "16:0:0", pitch: "B5", dur: "4n",  vel: 0.88 },
    { time: "16:1:0", pitch: "D6", dur: "4n",  vel: 0.90 },
    { time: "16:2:0", pitch: "E6", dur: "2n",  vel: 0.92 },
    { time: "17:0:0", pitch: "D6", dur: "4n",  vel: 0.90 },
    { time: "17:1:0", pitch: "B5", dur: "4n",  vel: 0.88 },
    { time: "17:2:0", pitch: "G5", dur: "2n",  vel: 0.85 },

    // Sustain peak (bars 20-28)
    { time: "20:0:0", pitch: "E6", dur: "1m",  vel: 0.90 },
    { time: "24:0:0", pitch: "D6", dur: "1m",  vel: 0.88 },
    { time: "28:0:0", pitch: "E6", dur: "1m",  vel: 0.85 }
  ]);
  leadPart.start(0);

  // ===== CHOIR (pure vowels) =====
  const choir = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 1.2, decay: 0.6, sustain: 0.9, release: 3.5 }
  }).connect(choirBus);
  const choirNotes = [
    { time: "6:0:0", chord: ["E4","B4","E5"], dur: "2m", vel: 0.35 },
    { time: "10:0:0", chord: ["D4","A4","D5"], dur: "2m", vel: 0.38 },
    { time: "14:0:0", chord: ["E4","B4","E5"], dur: "2m", vel: 0.42 },
    { time: "18:0:0", chord: ["D4","A4","D5"], dur: "2m", vel: 0.45 },
    { time: "22:0:0", chord: ["E4","B4","E5"], dur: "2m", vel: 0.48 },
    { time: "26:0:0", chord: ["D4","A4","D5"], dur: "2m", vel: 0.50 }
  ];
  choirNotes.forEach(ev => choir.triggerAttackRelease(ev.chord, ev.dur, ev.time, ev.vel));

  // ===== BELLS (tolling at structural points) =====
  const bell = new Tone.FMSynth({
    harmonicity: 3.5,
    modulationIndex: 8,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.8, sustain: 0.2, release: 3.2 }
  }).connect(percBus);

  const bells = new Tone.Part((time, n) => bell.triggerAttackRelease(n, "2n", time, 0.6), [
    ["4:0:0", "E6"],
    ["8:0:0", "D6"],
    ["12:0:0", "E6"],
    ["16:0:0", "D6"],
    ["20:0:0", "E6"],
    ["24:0:0", "D6"],
    ["28:0:0", "E6"]
  ]);
  bells.start(0);

  // ===== CYMBAL SWELLS =====
  const cym = new Tone.MetalSynth({
    frequency: 350,
    envelope: { attack: 0.002, decay: 2.4, release: 0.4 },
    harmonicity: 5.1,
    modulationIndex: 12,
    resonance: 6000,
    octaves: 2.5
  }).connect(percBus);

  const cymPart = new Tone.Part((time) => cym.triggerAttackRelease("8n", time, 0.4), [
    "7:3:3", "11:3:3", "15:3:3", "19:3:3", "23:3:3", "27:3:3"
  ]);
  cymPart.start(0);

  // ===== TIMPANI ROLLS =====
  const timp = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 1.6, sustain: 0.0, release: 0.8 }
  }).connect(percBus);

  // Simulate rolls with quick repeated hits + gain ramp
  const timpRoll = new Tone.Part((time, pitch) => {
    for (let i = 0; i < 8; i++) {
      timp.triggerAttackRelease(pitch, "32n", time + i * Tone.Time("32n"), 0.45 + i*0.04);
    }
  }, [
    ["10:2:0","E2"],
    ["14:2:0","D2"],
    ["18:2:0","E2"],
    ["22:2:0","D2"],
    ["26:2:0","E2"],
    ["30:2:0","D2"]
  ]);
  timpRoll.start(0);

  // ===== AUTOMATION: THE BIG SWELL =====
  // Layer entries (adders, not switchers)
  ostBus.gain.setValueAtTime(0.0, 0);
  ostBus.gain.linearRampToValueAtTime(0.7, Tone.now() + Tone.Time("4m")); // Ramp over 4 measures

  leadBus.gain.setValueAtTime(0.0, 0);
  leadBus.gain.linearRampToValueAtTime(0.8, Tone.now() + Tone.Time("8m")); // Lead enters gradually

  choirBus.gain.setValueAtTime(0.0, 0);
  choirBus.gain.linearRampToValueAtTime(0.5, Tone.now() + Tone.Time("14m")); // Choir mid-build

  percBus.gain.setValueAtTime(0.0, 0);
  percBus.gain.linearRampToValueAtTime(0.6, Tone.now() + Tone.Time("18m")); // Percussion late

  // Master crescendo (subtle, most lift comes from layers)
  masterGain.gain.setValueAtTime(0.0, 0);
  masterGain.gain.linearRampToValueAtTime(0.5, Tone.now() + Tone.Time("16m")); // Gradual rise
  masterGain.gain.linearRampToValueAtTime(0.9, Tone.now() + Tone.Time("28m")); // Peak at bar 28

  // Sustain peak then fade-out tail (90 seconds ≈ 34 measures)
  masterGain.gain.linearRampToValueAtTime(0.0, Tone.now() + Tone.Time("34m"));

  // ===== STORE REFERENCES =====
  window.toneJsInstruments = { strings, pluck, lead, choir, bell, cym, timp };
  window.toneJsParts = { ostPart, leadPart, bells, cymPart, timpRoll };
};
```

### Common Mistakes to Avoid

❌ **Heavy reverb wash**: The original uses hall reverb with long pre-delay to keep transients present
- Use decay 8-9s but keep wet 0.35 max
- Pre-delay 90-120ms keeps pluck attacks clear
- Don't drown the ostinato in reverb

❌ **Missing the ostinato engine**: The relentless plucked arpeggio is what drives everything
- Bright, percussive pluck (triangle wave with filter envelope)
- 16th-note grid, never stops once started
- This is the treadmill pulling the piece uphill

❌ **Starting everything at once**: Morricone layers strategically
- Haze → Ostinato → Lead → Choir → Percussion
- Each layer arrives and stays (adders, not switchers)
- Use gain automation for entrances, not on/off switching

❌ **Using compression for dynamics**: The crescendo comes from orchestration
- 3-6 dB rise via layering and subtle gain ramps
- Light compression to glue, not to pump
- Accumulation, not slamming

❌ **Forgetting the bells**: Tolling bells are ritual markers at structural points
- FM synth for bell tone
- Sparse hits at key moments (bar boundaries)
- Long decay and sustain

### Arrangement Tips (90 seconds ≈ 34 measures at 90 BPM)

1. **Haze (bars 0-4, 0-11 seconds)**: Minimal string pad, setting atmosphere
2. **Ostinato ignition (bars 0-4, 0-11 seconds)**: Plucked arp enters and ramps up
3. **Solo line enters (bars 4-8, 11-21 seconds)**: Vocal/oboe lead climbs over ostinato
4. **First build (bars 8-12, 21-32 seconds)**: Lead climbs higher, intensity building
5. **Choir layers (bars 6-14, 16-37 seconds)**: Pure vowel choir enters, widening the sound
6. **Second build (bars 12-16, 32-43 seconds)**: Lead soaring, timpani rolls begin
7. **Percussion (bars 10-18, 27-48 seconds)**: Timpani rolls, bells, cymbals mark structure
8. **Peak phrase (bars 16-20, 43-53 seconds)**: Lead hits E6, maximum melodic intensity
9. **Sustained climax (bars 20-28, 53-75 seconds)**: Full orchestration, sustained peak
10. **Final apex (bars 28-32, 75-85 seconds)**: Maximum dynamics, all layers at peak
11. **Fade out (bars 32-34, 85-90 seconds)**: Gradual release and fade

### Sound Design Details

**Plucked Ostinato** (the engine):
- Triangle wave for bright, clear tone
- High-Q lowpass filter (Q: 8) at 2200 Hz
- Short envelope (attack 0.002s, decay 0.18s, sustain 0.1)
- Filter envelope for percussive snap
- 16th-note arpeggio pattern, relentless
- Ramps in over 2 measures via gain automation

**Vocal/Oboe Lead**:
- AMSynth with sine oscillator for vocal quality
- Vibrato (5.5 Hz, depth 0.08) for human expression
- Climbing contour in stages (not linear)
- Velocity increases with pitch (0.70 → 0.85)
- Enters after ostinato establishes momentum

**Choir Pads**:
- Pure sine waves (vowel-like "ah/oo")
- Very slow attack (1.2s) for breath
- Fifth and octave voicings for nobility
- Sparse triggering (not constant)
- Enters mid-build for width

**Tolling Bells**:
- FM synthesis (harmonicity 3.5, mod index 8)
- Triggered at structural boundaries
- Long decay (3.2s) for ritual quality
- High register (E6, D6)

**Timpani Rolls**:
- Simulated with 8x 32nd notes
- Gain ramp across roll (0.45 → 0.77)
- Low pitch (E2, D2)
- Very short sustain, long decay

### Mixing Approach

**Submix Buses** (gain automation creates crescendo):
- **Pad Bus**: 0.7 constant (haze foundation)
- **Ostinato Bus**: 0.0 → 0.7 over 2 measures (engine ignition)
- **Lead Bus**: 0.0 → 0.8 over 3 measures (soaring line)
- **Choir Bus**: 0.0 → 0.5 at bar 14 (width and nobility)
- **Perc Bus**: 0.0 → 0.6 at bar 15 (ritual markers)

**Master Chain**:
- Light compression (threshold -18, ratio 2:1)
- Large hall reverb (decay 8.5s, pre-delay 90ms, wet 0.35)
- Plate reverb (decay 4.2s, pre-delay 20ms, wet 0.18)
- Echo delay (dotted eighth, feedback 0.3, wet 0.18)
- Master gain: 0.0 → 0.9 over ~16 bars (crescendo)

**Philosophy**: Accumulation, not compression. Each layer adds 1-2 dB perceived loudness. The mix stays dynamic and breathes.

### Tweaking for More Impact

**Bigger hall feel**:
- Increase hall decay to 10-12s
- Pre-delay ~120ms
- Keep master gain lower to avoid washout

**More grit**:
- Add gentle Chorus before hall on strings
- Sawtooth oscillator on strings (already is)

**Heavier apex**:
- Add low brass (PolySynth octave down, slow attack)
- Lengthen timpani rolls (16x 32nds instead of 8x)

**Longer build**:
- Extend ostinato Part by duplicating blocks
- Shift register +12 semitones in final pass
- Add variation to lead melody contour

### Emotional Palette

**What The Ecstasy of Gold evokes:**
- Relentless forward momentum (the ostinato treadmill)
- Staged peaks building to overwhelming climax
- Ritual and ceremony (tolling bells)
- Epic grandeur through accumulation
- Patient development, not instant gratification
- Triumph through persistence

**What to avoid:**
- Heavy reverb wash that obscures the ostinato
- Starting all layers at once
- Using compression for dynamics instead of orchestration
- Missing the structural bell tolls
- Forgetting the plucked arpeggio is the engine
- Complex harmony (keep it modal and pedal-driven)

### Technical Notes

**The Ostinato is Everything**:
The plucked arpeggio is not decoration - it's the engine pulling the entire piece uphill. Once it starts, it never stops. The perceived acceleration comes from layering, not tempo change.

**Gain Automation Creates the Crescendo**:
Don't use compression or limiting to create the build. Use gain automation on submix buses. Each layer enters at 0.0 and ramps to its target level over measures. Master gain provides final 3-6 dB lift.

**Pre-Delay Keeps It Clear**:
The large hall reverb uses 90ms pre-delay. This keeps the percussive ostinato attacks present and clear while still providing vast space. Without pre-delay, the plucks get mushy.

**Bells Mark Ritual Structure**:
The tolling bells at structural boundaries (bars 4, 8, 12) create a sense of ceremony and inevitability. They're not rhythmic - they're ritual markers.

**Layering Strategy** (Adders, Not Switchers):
Each element enters and stays. Nothing drops out until the final release. The accumulation creates the overwhelming climax. This is the opposite of EDM buildups that strip elements.
