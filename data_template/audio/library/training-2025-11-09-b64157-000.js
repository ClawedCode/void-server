window.initToneJsEngine = async function() {
  const bpm = 110;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 2.2, wet: 0.28 }).toDestination();
  await masterReverb.generate();

  const compressor = new Tone.Compressor({
    threshold: -22,
    ratio: 10,
    attack: 0.003,
    release: 0.18
  }).connect(masterReverb);

  // === KICK (4-on-floor, sidechain trigger) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.028,
    octaves: 7,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.20, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      compressor.threshold.setValueAtTime(-32, time);
      compressor.threshold.exponentialRampToValueAtTime(-22, time + 0.18);
    }
  }, "4n").start(0);

  // === LAYERED ARPEGGIOS (low → high octaves) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 280, Q: 1.4 }).connect(compressor);
  const arp = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.004, decay: 0.08, sustain: 0, release: 0.06 }
  }).connect(arpFilter);

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(1400, time + 4 * (60 / bpm) * 4);
  }, "0:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(3200, time + 6 * (60 / bpm) * 4);
  }, "4:0:0");

  const arpChords = [
    ["D4", "F4", "A4", "D5"],
    ["C4", "E4", "G4", "C5"],
    ["Bb3", "D4", "F4", "Bb4"],
    ["F3", "A3", "C4", "F4"]
  ];
  let arpChordIdx = 0;
  let arpNoteIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 2 ? 0.28 : bar < 8 ? 0.42 : 0.58;

    const chord = arpChords[arpChordIdx % arpChords.length];
    const note = chord[arpNoteIdx % chord.length];
    arp.triggerAttackRelease(note, "16n", time, velocity);

    arpNoteIdx++;
    if (arpNoteIdx % 16 === 0) arpChordIdx++;
  }, "16n").start(0);

  // === HIGH OCTAVE ARP (counterpoint) ===
  const highArpFilter = new Tone.Filter({ type: "lowpass", frequency: 500, Q: 1.2 }).connect(compressor);
  const highArp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.002, decay: 0.05, sustain: 0, release: 0.04 }
  }).connect(highArpFilter);

  Tone.Transport.schedule((time) => {
    highArpFilter.frequency.exponentialRampToValueAtTime(2800, time + 4 * (60 / bpm) * 4);
  }, "6:0:0");

  const highArpNotes = ["D6", "A5", "F5", "C6", "G5", "E5"];
  let highArpIdx = 0;
  const highArpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 14) {
      highArp.triggerAttackRelease(highArpNotes[highArpIdx % highArpNotes.length], "16n", time, 0.38);
      highArpIdx++;
    }
  }, "16n").start(0);

  // === CINEMATIC STRINGS (orchestral swells) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: -4,
    envelope: { attack: 0.7, decay: 0.5, sustain: 0.88, release: 2.8 }
  }).connect(compressor);

  const stringChords = [
    ["D3", "F3", "A3", "D4"],
    ["C3", "E3", "G3", "C4"],
    ["Bb2", "D3", "F3", "Bb3"],
    ["F2", "A2", "C3", "F3"]
  ];
  let stringChordIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 14) {
      const velocity = bar >= 8 ? 0.72 : 0.48;
      strings.triggerAttackRelease(stringChords[stringChordIdx % stringChords.length], "1m", time, velocity);
      stringChordIdx++;
    }
  }, "1m").start(0);

  // === HEAVY BASS (sidechained) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 220, Q: 1.0 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.08 },
    filterEnvelope: { attack: 0.008, decay: 0.10, sustain: 0, baseFrequency: 120, octaves: 2.5 }
  }).connect(bassFilter);

  const bassNotes = ["D1", "D1", "C1", "C1", "Bb0", "Bb0", "F1", "F1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "8n", time, 0.82);
      bassIdx++;
    }
  }, "8n").start(0);

  // === SUB BASS (sine, massive) ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0.12 }
  }).connect(compressor);

  const subLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 14) {
      subBass.triggerAttackRelease("D0", "8n", time, 0.70);
    }
  }, "8n").start(0);

  // === SNARE (beats 2 and 4, gated reverb) ===
  const snareReverb = new Tone.Reverb({ decay: 0.9, wet: 0.65 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.004, decay: 0.10, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 14 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.88);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS (16th notes, precise) ===
  const hat = new Tone.MetalSynth({
    frequency: 340,
    envelope: { attack: 0.001, decay: 0.07, release: 0.02 },
    harmonicity: 4.8,
    modulationIndex: 26,
    resonance: 3600
  }).connect(masterReverb);

  const hatPattern = [0.68, 0.38, 0.58, 0.32, 0.68, 0.38, 0.58, 0.42];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 14) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.52);
      hatStep++;
    }
  }, "16n").start(0);

  // === LEAD MELODY (finale section) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.38, wet: 0.32 }).connect(masterReverb);
  const lead = new Tone.MonoSynth({
    oscillator: { type: "square" },
    envelope: { attack: 0.006, decay: 0.18, sustain: 0, release: 0.14 },
    portamento: 0.06
  }).connect(leadDelay);

  const leadMelody = ["D5", "F5", "A5", "G5", "F5", "E5", "D5", "C5"];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 14) {
      lead.triggerAttackRelease(leadMelody[leadIdx % leadMelody.length], "4n", time, 0.78);
      leadIdx++;
    }
  }, "4n").start(0);

  // === PAD (atmospheric, intro and wind-down) ===
  const padChorus = new Tone.Chorus({ frequency: 0.8, delayTime: 4.0, depth: 0.6, wet: 0.35 }).connect(compressor);
  padChorus.start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 1.2, decay: 0.6, sustain: 0.7, release: 2.0 }
  }).connect(padChorus);

  const padChords = [
    ["D3", "A3", "D4"],
    ["C3", "G3", "C4"],
    ["Bb2", "F3", "Bb3"]
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 2 || bar >= 14 ? 0.35 : 0.18;
    if (bar < 2 || bar >= 14) {
      pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2n", time, velocity);
      padIdx++;
    }
  }, "2n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, arp, highArp, strings, bass, subBass, snare, hat, lead, pad };
  window.toneJsParts = { kickLoop, arpLoop, highArpLoop, stringsLoop, bassLoop, subLoop, snareLoop, hatLoop, leadLoop, padLoop };
};