---
category: synthwave
energy: high
tags: [retro, 80s, driving]
---
## Kavinsky (Nightcall)

**Tempo**: 85-90 BPM (typically ~87)
**Key**: F minor
**Instruments**: Linn-style drums, pulsing saw bass (sidechain ducked), Juno-60 pads with chorus, saw lead with portamento
**Structure**: Intro (16 bars) → Verse (16 bars) → Chorus (16 bars) → Verse 2 → Bridge (drop-out + pads) → Chorus + Outro
**Vibe**: Iconic 80s synthwave with pumping sidechain bass, gated reverb drums, stereo chorus pads, bittersweet cinematic tension

### Key Characteristics

1. **Pumping Sidechain Bass**: Eighth-note ostinato (root → 5th → flat 7 → root) with strong ducking to kick
2. **Linn-Style Drums**: 808/Linn LM-1 type kick, gated clap snare, steady 16th hats
3. **Juno-60 Pads**: Two detuned saws with stereo chorus, slow filter LFO movement
4. **Bittersweet Progression**: Fm → D♭ → E♭ → Cm creates cinematic tension
5. **Lead with Portamento**: Saw wave monosynth with ~80ms glide, sparse long notes
6. **Gated Reverb**: 0.6-0.9s plate on snare, 1.2-1.8s hall on pads/leads

### Example Tone.js Code

```javascript
window.initToneJsEngine = async function() {
  const bpm = 87;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [4, 4];

  // === GLOBAL BUS & SIDECHAIN ===
  const master = new Tone.Gain(1).toDestination();
  const duckBus = new Tone.Gain(1).connect(master);

  // Sidechain emulation: strong pump on kick
  function sidechainDuck() {
    const t = Tone.now();
    duckBus.gain.cancelAndHoldAtTime(t);
    duckBus.gain.setTargetAtTime(0.55, t, 0.005);   // fast down to 55%
    duckBus.gain.setTargetAtTime(1.0, t + 0.18, 0.08); // slower recover
  }

  // === FX ===
  const hallReverb = new Tone.Reverb({ decay: 1.5, wet: 0.30 }).connect(duckBus);
  await hallReverb.generate();

  const plateReverb = new Tone.Reverb({ decay: 0.75, wet: 0.35 }).connect(duckBus);
  await plateReverb.generate();

  // === KICK (Linn LM-1 style) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 }
  }).connect(master); // bypass ducking

  const kickSeq = new Tone.Sequence((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 0) { // kicks from start
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      sidechainDuck();
    }
  }, [1, null, 1, null, 1, null, 1, null], "8n");

  // === SNARE (gated 80s clap) ===
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.05 }
  }).connect(plateReverb);

  const snareSeq = new Tone.Sequence((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 0) {
      snare.triggerAttackRelease("16n", time, 0.80);
    }
  }, [null, null, null, 1, null, null, null, 1], "8n");

  // === HATS (16th steady) ===
  const hat = new Tone.MetalSynth({
    frequency: 350,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 5,
    modulationIndex: 30,
    resonance: 6000
  }).connect(duckBus);
  hat.volume.value = -18;

  const hatSeq = new Tone.Sequence((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) { // hats enter after intro
      const velocity = 0.35 + (Math.random() * 0.10); // light variance
      hat.triggerAttackRelease("32n", time, velocity);
    }
  }, new Array(16).fill(1), "16n");

  // === BASS (pulsing ostinato with strong ducking) ===
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { type: "lowpass", frequency: 140, Q: 0.6 },
    filterEnvelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.05, baseFrequency: 80, octaves: 2 },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.2, release: 0.05 }
  }).connect(duckBus);
  bass.volume.value = -6;

  // F minor pattern: F → C → Eb → F (root → 5th → flat 7 → root)
  const bassNotes = ["F1", "F1", "Db1", "Db1", "Eb1", "Eb1", "C1", "C1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 0) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "8n", time, 0.9);
      bassIdx++;
    }
  }, "8n");

  // === PAD (Juno-60 style with chorus) ===
  const padChorus = new Tone.Chorus({ frequency: 0.3, delayTime: 2.5, depth: 0.6, wet: 0.60 }).connect(hallReverb).start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: 8, // detuned saws
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 2.0 }
  }).connect(padChorus);
  pad.volume.value = -14;

  // Fm → D♭ → E♭ → Cm (bittersweet progression)
  const padChords = [
    ["F3", "Ab3", "C4"],   // Fm
    ["Db3", "F3", "Ab3"],  // D♭
    ["Eb3", "G3", "Bb3"],  // E♭
    ["C3", "Eb3", "G3"]    // Cm
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, 0.40);
    padIdx++;
  }, "2m");

  // === LEAD (saw with portamento) ===
  const lead = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { type: "lowpass", frequency: 1800, Q: 0.5 },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
    portamento: 0.08 // 80ms glide
  }).connect(hallReverb);
  lead.volume.value = -10;

  // Simple lead motif (sparse, long notes)
  const leadMelody = [
    { time: "16:2:0", note: "C5", dur: "4n" },
    { time: "17:0:0", note: "Ab4", dur: "2n" },
    { time: "18:0:0", note: "F4", dur: "2n" },
    { time: "20:2:0", note: "Eb4", dur: "4n" },
    { time: "21:0:0", note: "C5", dur: "2n" }
  ];
  const leadPart = new Tone.Part((time, ev) => {
    lead.triggerAttackRelease(ev.note, ev.dur, time, 0.75);
  }, leadMelody);

  // === FILTER AUTOMATION (slow LFO movement on pads) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 2000, Q: 0.3 }).connect(padChorus);
  pad.disconnect();
  pad.connect(padFilter);

  const filterLFO = new Tone.LFO({ frequency: "8m", min: 1500, max: 2500 }).start();
  filterLFO.connect(padFilter.frequency);

  // === ARRANGEMENT AUTOMATION ===
  function scheduleArrangement() {
    // Intro (0-16 bars): Pads + bass + minimal drums
    padLoop.start("0:0");
    bassLoop.start("0:0");
    kickSeq.start("0:0");
    snareSeq.start("0:0");

    // 4 bars: Add hats
    hatSeq.start("4:0");

    // 16 bars: Verse 1 with lead enters
    leadPart.start("16:0");

    // 32-40 bars: Bridge (optional breakdown - reduce bass filter)
    Tone.Transport.schedule((time) => {
      bass.filter.frequency.linearRampToValueAtTime(80, time + Tone.Time("2m").toSeconds());
    }, "32:0:0");

    // 40 bars: Return to full
    Tone.Transport.schedule((time) => {
      bass.filter.frequency.linearRampToValueAtTime(140, time + Tone.Time("1m").toSeconds());
    }, "40:0:0");
  }

  scheduleArrangement();

  // === START ===
  Tone.Transport.start();

  return {
    stop: () => {
      Tone.Transport.stop();
      padLoop.stop();
      bassLoop.stop();
      kickSeq.stop();
      snareSeq.stop();
      hatSeq.stop();
      filterLFO.stop();
    }
  };
};
```

### Quick-Tweak Knobs

| Parameter | Typical Range | Effect |
|-----------|---------------|--------|
| Duck depth | 0.50 → 0.65 | More or less pump |
| Pad chorus depth | 0.40 → 0.70 | Wider stereo |
| Filter cutoff (lead/bass) | 1-2 kHz | Brighter/darker tone |
| BPM | 85-90 | Groove change |
| Reverb wet | 0.25 → 0.40 | 80s atmosphere |

### Common Mistakes

- Weak sidechain - needs strong pump (duck to 55%, not 75%)
- Missing gated reverb on snare - essential 80s character
- Static pads - needs stereo chorus and slow filter LFO movement
- Too complex bassline - keep it simple eighth-note ostinato
- No portamento on lead - glide between notes is signature
- Dry mix - needs hall reverb (1.2-1.8s) for atmospheric depth

### Arrangement Tips

- **Intro (16 bars)**: Pads + bass establish mood, add hats at bar 4
- **Verse 1 (16 bars)**: Lead melody enters with vocals
- **Chorus (16 bars)**: Full energy, all elements present
- **Verse 2 (16 bars)**: Return to verse texture
- **Bridge (8 bars)**: Drop-out with pads breathing, close bass filter
- **Chorus + Outro (16+ bars)**: Build back to full intensity

### Mixing Approach

- Kick: 1.0 gain, bypass ducking (direct to master), 60Hz fundamental + 2kHz click
- Bass: -6dB, strong sidechain duck (to 55%), low-pass at 140Hz
- Pads: -14dB, heavy stereo chorus (depth 0.6), hall reverb
- Lead: -10dB, portamento 80ms, hall reverb, sparse phrasing
- Snare: 0.8 gain, gated plate reverb (0.75s decay)
- Hats: -18dB, light velocity variance, no swing
- Master: Gentle bus compression (2:1 ratio), analog-style limiter, tape saturation
