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

  // === LAYERED ARPEGGIOS (3 layers at different octaves) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 280, Q: 1.5 }).connect(compressor);
  
  const arp1 = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(arpFilter);

  const arp2 = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    detune: -7,
    envelope: { attack: 0.006, decay: 0.11, sustain: 0, release: 0.09 }
  }).connect(arpFilter);

  const arp3 = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.004, decay: 0.10, sustain: 0, release: 0.07 }
  }).connect(arpFilter);

  // Filter automation: gradual opening through track, closes at end
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(1800, time + 8 * (60 / bpm) * 4);
  }, "0:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(3200, time + 4 * (60 / bpm) * 4);
  }, "8:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(480, time + 3 * (60 / bpm) * 4);
  }, "12:0:0");

  // Em → C → G → D (i-VI-III-VII)
  const arpPatterns = [
    ["E3", "G3", "B3", "E4"],
    ["C3", "E3", "G3", "C4"],
    ["G3", "B3", "D4", "G4"],
    ["D3", "F#3", "A3", "D4"]
  ];

  let arpChordIdx = 0;
  let arpNoteIdx = 0;
  
  const arpLoop1 = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 2 ? 0.25 : (bar < 10 ? 0.48 : 0.52);
    
    const chord = arpPatterns[arpChordIdx % arpPatterns.length];
    arp1.triggerAttackRelease(chord[arpNoteIdx % chord.length], "16n", time, velocity);
    
    arpNoteIdx++;
    if (arpNoteIdx % 8 === 0) arpChordIdx++;
  }, "16n").start(0);

  let arp2NoteIdx = 0;
  const arpLoop2 = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 13) {
      const chordIdx = Math.floor(arp2NoteIdx / 8) % arpPatterns.length;
      const chord = arpPatterns[chordIdx];
      const noteIdx = (arp2NoteIdx + 2) % chord.length;
      arp2.triggerAttackRelease(chord[noteIdx], "16n", time, 0.38);
    }
    arp2NoteIdx++;
  }, "16n").start(0);

  let arp3NoteIdx = 0;
  const arpLoop3 = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 12) {
      const chordIdx = Math.floor(arp3NoteIdx / 16) % arpPatterns.length;
      const chord = arpPatterns[chordIdx];
      const octaveShift = 12;
      const midiNote = Tone.Frequency(chord[arp3NoteIdx % chord.length]).toMidi() + octaveShift;
      arp3.triggerAttackRelease(Tone.Frequency(midiNote, "midi"), "32n", time, 0.32);
    }
    arp3NoteIdx++;
  }, "32n").start(0);

  // === CINEMATIC STRINGS ===
  const stringsChorus = new Tone.Chorus({ frequency: 0.8, delayTime: 4.2, depth: 0.4, wet: 0.25 }).connect(compressor);
  stringsChorus.start();
  
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.7, decay: 0.5, sustain: 0.88, release: 2.8 }
  }).connect(stringsChorus);

  const stringChords = [
    ["E3", "G3", "B3", "E4"],
    ["C3", "E3", "G3", "C4"],
    ["G2", "B2", "D3", "G3"],
    ["D3", "F#3", "A3", "D4"]
  ];
  
  let stringChordIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 13) {
      const velocity = bar >= 8 ? 0.72 : 0.45;
      strings.triggerAttackRelease(stringChords[stringChordIdx % stringChords.length], "1m", time, velocity);
      stringChordIdx++;
    }
  }, "1m").start(0);

  // === BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 320, Q: 1.1 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.18, sustain: 0, release: 0.12 },
    filterEnvelope: { attack: 0.008, decay: 0.12, sustain: 0, baseFrequency: 120, octaves: 1.8 }
  }).connect(bassFilter);

  const bassNotes = ["E1", "E1", "C1", "C1", "G1", "G1", "D1", "D1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 13) {
      bass.triggerAttackRelease(bassNotes[bassIdx % bassNotes.length], "8n", time, 0.72);
      bassIdx++;
    }
  }, "8n").start(0);

  // === SUB BASS ===
  const subBass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.25, sustain: 0, release: 0.18 }
  }).connect(compressor);

  let subBassIdx = 0;
  const subBassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 13) {
      const velocity = bar >= 10 ? 0.78 : 0.65;
      subBass.triggerAttackRelease(bassNotes[subBassIdx % bassNotes.length], "8n", time, velocity);
      subBassIdx++;
    }
  }, "8n").start(0);

  // === KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.035,
    octaves: 6.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 13) {
      kick.triggerAttackRelease("C1", "8n", time, 0.95);
      compressor.threshold.setValueAtTime(-32, time);
      compressor.threshold.exponentialRampToValueAtTime(-22, time + 0.18);
    }
  }, "4n").start(0);

  // === SNARE ===
  const snareReverb = new Tone.Reverb({ decay: 0.9, wet: 0.55 }).toDestination();
  await snareReverb.generate();
  
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.004, decay: 0.15, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 13 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.82);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS ===
  const hat = new Tone.MetalSynth({
    frequency: 360,
    envelope: { attack: 0.001, decay: 0.09, release: 0.025 },
    harmonicity: 5.2,
    modulationIndex: 30,
    resonance: 3900
  }).connect(masterReverb);

  const hatPattern = [0.68, 0.38, 0.58, 0.33, 0.68, 0.38, 0.58, 0.33];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 13) {
      hat.triggerAttackRelease("16n", time, hatPattern[hatStep % hatPattern.length] * 0.52);
      hatStep++;
    }
  }, "16n").start(0);

  // === LEAD MELODY (final section) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.38, wet: 0.32 }).connect(masterReverb);
  const lead = new Tone.MonoSynth({
    oscillator: { type: "square" },
    envelope: { attack: 0.008, decay: 0.22, sustain: 0.15, release: 0.18 },
    portamento: 0.04
  }).connect(leadDelay);

  const leadMelody = ["E4", "G4", "B4", "D5", "B4", "G4"];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10 && bar < 13) {
      lead.triggerAttackRelease(leadMelody[leadIdx % leadMelody.length], "4n", time, 0.68);
      leadIdx++;
    }
  }, "4n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { arp1, arp2, arp3, strings, bass, subBass, kick, snare, hat, lead };
  window.toneJsParts = { arpLoop1, arpLoop2, arpLoop3, stringsLoop, bassLoop, subBassLoop, kickLoop, snareLoop, hatLoop, leadLoop };
};