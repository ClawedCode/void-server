window.initToneJsEngine = async function() {
  const bpm = 110;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 2.2, wet: 0.28 }).toDestination();
  await masterReverb.generate();

  const compressor = new Tone.Compressor({
    threshold: -24,
    ratio: 10,
    attack: 0.003,
    release: 0.18
  }).connect(masterReverb);

  // === PRIMARY ARPEGGIO (filtered sawtooth, dramatic automation) ===
  const arp1Filter = new Tone.Filter({ type: "lowpass", frequency: 280, Q: 1.4 }).connect(compressor);
  const arp1 = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.004, decay: 0.09, sustain: 0, release: 0.07 }
  }).connect(arp1Filter);

  // Filter automation: 280Hz → 2800Hz dramatic sweep
  Tone.Transport.schedule((time) => {
    arp1Filter.frequency.exponentialRampToValueAtTime(1200, time + 3 * (60 / bpm) * 4);
  }, "0:0:0");

  Tone.Transport.schedule((time) => {
    arp1Filter.frequency.exponentialRampToValueAtTime(2800, time + 4 * (60 / bpm) * 4);
  }, "3:0:0");

  // Am → F → C → G progression
  const arp1Pattern = [
    ["A3", "C4", "E4", "A4"],
    ["F3", "A3", "C4", "F4"],
    ["C4", "E4", "G4", "C5"],
    ["G3", "B3", "D4", "G4"]
  ];
  let arp1ChordIdx = 0;
  let arp1NoteIdx = 0;
  const arp1Loop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 3 ? 0.28 : (bar < 7 ? 0.48 : 0.62);

    const chord = arp1Pattern[arp1ChordIdx % arp1Pattern.length];
    const note = chord[arp1NoteIdx % chord.length];
    arp1.triggerAttackRelease(note, "16n", time, velocity);

    arp1NoteIdx++;
    if (arp1NoteIdx % 16 === 0) arp1ChordIdx++;
  }, "16n").start(0);

  // === SECONDARY ARPEGGIO (octave higher, delayed entry) ===
  const arp2Filter = new Tone.Filter({ type: "lowpass", frequency: 320, Q: 1.2 }).connect(compressor);
  const arp2 = new Tone.Synth({
    oscillator: { type: "sawtooth", detune: 7 },
    envelope: { attack: 0.006, decay: 0.08, sustain: 0, release: 0.06 }
  }).connect(arp2Filter);

  Tone.Transport.schedule((time) => {
    arp2Filter.frequency.exponentialRampToValueAtTime(3200, time + 5 * (60 / bpm) * 4);
  }, "5:0:0");

  let arp2ChordIdx = 0;
  let arp2NoteIdx = 0;
  const arp2Loop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5 && bar < 13) {
      const chord = arp1Pattern[arp2ChordIdx % arp1Pattern.length];
      const baseNote = chord[arp2NoteIdx % chord.length];
      const octaveUp = Tone.Frequency(baseNote).toMidi() + 12;
      arp2.triggerAttackRelease(Tone.Frequency(octaveUp, "midi"), "16n", time, 0.44);

      arp2NoteIdx++;
      if (arp2NoteIdx % 16 === 0) arp2ChordIdx++;
    }
  }, "16n").start(0);

  // === CINEMATIC STRINGS (massive orchestral swells) ===
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth", detune: -5 },
    envelope: { attack: 0.7, decay: 0.5, sustain: 0.88, release: 2.8 }
  }).connect(compressor);

  const stringChords = [
    ["A2", "C3", "E3", "A3"],
    ["F2", "A2", "C3", "F3"],
    ["C3", "E3", "G3", "C4"],
    ["G2", "B2", "D3", "G3"]
  ];
  let stringChordIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3) {
      const velocity = bar >= 7 ? 0.72 : 0.38;
      strings.triggerAttackRelease(stringChords[stringChordIdx % stringChords.length], "1m", time, velocity);
      stringChordIdx++;
    }
  }, "1m").start(0);

  // === HEAVY BASS (sidechained sawtooth) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 220, Q: 1.0 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.14, sustain: 0, release: 0.12 },
    filterEnvelope: { attack: 0.01, decay: 0.12, sustain: 0, baseFrequency: 90, octaves: 2.2 }
  }).connect(bassFilter);

  const bassNotes = ["A1", "A1", "F1", "C2", "G1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 7 && bar < 13) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "8n", time, 0.78);
      bassIdx++;
    }
  }, "8n").start(0);

  // === SUB BASS (sine, finale only) ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.22, sustain: 0, release: 0.18 }
  }).connect(compressor);

  let subBassIdx = 0;
  const subBassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 13) {
      subBass.triggerAttackRelease(bassNotes[subBassIdx % bassNotes.length], "8n", time, 0.82);
      subBassIdx++;
    }
  }, "8n").start(0);

  // === KICK (4-on-floor, triggers sidechain) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.028,
    octaves: 6.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.19, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3) {
      kick.triggerAttackRelease("C1", "8n", time, 0.98);
      compressor.threshold.setValueAtTime(-34, time);
      compressor.threshold.exponentialRampToValueAtTime(-24, time + 0.16);
    }
  }, "4n").start(0);

  // === SNARE (beats 2 and 4, gated reverb) ===
  const snareReverb = new Tone.Reverb({ decay: 0.7, wet: 0.55 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.004, decay: 0.11, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.88);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS (16th notes, robotic precision) ===
  const hat = new Tone.MetalSynth({
    frequency: 340,
    envelope: { attack: 0.001, decay: 0.075, release: 0.02 },
    harmonicity: 4.8,
    modulationIndex: 30,
    resonance: 3600
  }).connect(masterReverb);

  const hatPattern = [0.68, 0.38, 0.58, 0.32, 0.68, 0.38, 0.58, 0.42];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 7 && bar < 17) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.52);
      hatStep++;
    }
  }, "16n").start(0);

  // === DRAMATIC LEAD (finale section) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.32, wet: 0.28 }).toDestination();
  const lead = new Tone.MonoSynth({
    oscillator: { type: "square" },
    envelope: { attack: 0.006, decay: 0.18, sustain: 0, release: 0.14 },
    portamento: 0.04
  }).connect(leadDelay);

  const leadMelody = ["A4", "C5", "E5", "D5", "C5", "A4"];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 13 && bar < 17) {
      lead.triggerAttackRelease(leadMelody[leadIdx % leadMelody.length], "4n", time, 0.76);
      leadIdx++;
    }
  }, "4n").start(0);

  // === WIND DOWN (return to opening state) ===
  Tone.Transport.schedule((time) => {
    arp1Filter.frequency.exponentialRampToValueAtTime(320, time + 3 * (60 / bpm) * 4);
  }, "13:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { arp1, arp2, strings, bass, subBass, kick, snare, hat, lead };
  window.toneJsParts = { arp1Loop, arp2Loop, stringsLoop, bassLoop, subBassLoop, kickLoop, snareLoop, hatLoop, leadLoop };
};