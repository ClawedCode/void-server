window.initToneJsEngine = async function() {
  const bpm = 116;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.swing = 0.17;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 1.8, wet: 0.22 }).toDestination();
  await masterReverb.generate();

  const chorus = new Tone.Chorus({ frequency: 1.1, depth: 0.65, wet: 0.50 }).toDestination().start();

  // === SIDECHAIN COMPRESSOR ===
  const compressor = new Tone.Compressor({
    threshold: -26,
    ratio: 9,
    attack: 0.003,
    release: 0.20
  }).connect(masterReverb);

  // === BRIGHT FILTERED ARPEGGIO (damascus patterns as musical motif) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 350, Q: 0.9 }).connect(chorus);
  const arp = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.004, decay: 0.14, sustain: 0, release: 0.09 }
  }).connect(arpFilter);

  // Filter sweep: 350Hz → 2000Hz over intro (blade emerging from darkness)
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(2000, time + 4 * (60 / bpm) * 4);
  }, "0:0:0");

  // Em → C → Am → B (i-VI-iv-V) - contemplative minor progression
  const arpPattern = [
    ["E4", "G4", "B4", "E5", "B4", "G4"],  // Em
    ["C4", "E4", "G4", "C5", "G4", "E4"],  // C
    ["A4", "C5", "E5", "A5", "E5", "C5"],  // Am
    ["B4", "D#5", "F#5", "B5", "F#5", "D#5"] // B
  ];
  let arpChordIdx = 0;
  let arpNoteIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.32 : 0.52;

    const chord = arpPattern[arpChordIdx % arpPattern.length];
    const note = chord[arpNoteIdx % chord.length];
    arp.triggerAttackRelease(note, "16n", time, velocity);

    arpNoteIdx++;
    if (arpNoteIdx % 12 === 0) arpChordIdx++;
  }, "16n").start(0);

  // === GROOVED BASS (each hammer blow) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 260, Q: 1.1 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.16, sustain: 0, release: 0.11 },
    filterEnvelope: { attack: 0.01, decay: 0.13, sustain: 0, baseFrequency: 180, octaves: 2.8 }
  }).connect(bassFilter);

  const bassSection1 = ["E1", "E1", null, "E1", "G1", "E1", null, "B1"];
  const bassSection2 = ["E1", "B0", "E1", null, "G1", "E1", "D1", "E1"];
  const bassSection3 = ["E1", "E1", null, "E1", "G1", "E1", null, "B1"];
  const bassVelocities = [0.88, 0.72, 0, 0.82, 0.92, 0.78, 0, 0.86];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let pattern;
    if (bar < 4) return;
    else if (bar < 8) pattern = bassSection1;
    else if (bar < 12) pattern = bassSection2;
    else pattern = bassSection3;

    if (pattern[bassIdx % pattern.length]) {
      bass.triggerAttackRelease(
        pattern[bassIdx % pattern.length],
        "8n",
        time,
        bassVelocities[bassIdx % bassVelocities.length] * 0.78
      );
    }
    bassIdx++;
  }, "8n").start(0);

  // === VINTAGE LEAD (sigils of permanence) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.28, wet: 0.30 }).connect(masterReverb);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.006, decay: 0.20, sustain: 0, release: 0.14 },
    detune: -7
  }).connect(leadDelay);

  const leadMelody1 = ["E5", "G5", "B5", "G5", "E5", null, "D5", "E5"];
  const leadMelody2 = ["B4", "D5", "E5", null, "G5", "F#5", "E5", "D5"];
  const leadVelocities = [0.78, 0.82, 0.86, 0.80, 0.76, 0, 0.72, 0.78];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let melody;
    if (bar < 9 || bar >= 13) return;
    else if (bar < 11) melody = leadMelody1;
    else melody = leadMelody2;

    if (melody[leadIdx % melody.length]) {
      lead.triggerAttackRelease(
        melody[leadIdx % melody.length],
        "4n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.68
      );
    }
    leadIdx++;
  }, "4n").start(0);

  // === WARM PAD (forge atmosphere) ===
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.7, decay: 0.4, sustain: 0.65, release: 1.6 }
  }).connect(chorus);

  const padChords = [
    ["E3", "G3", "B3"],  // Em
    ["C3", "E3", "G3"],  // C
    ["A3", "C4", "E4"],  // Am
    ["B3", "D#4", "F#4"] // B
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "1m", time, 0.28);
    padIdx++;
  }, "1m").start(0);

  // === 4-ON-FLOOR KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.042,
    octaves: 5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.19, sustain: 0, release: 0.05 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      kick.triggerAttackRelease("C1", "8n", time, 0.97);
      compressor.threshold.setValueAtTime(-36, time);
      compressor.threshold.exponentialRampToValueAtTime(-26, time + 0.20);
    }
  }, "4n").start(0);

  // === FUNKY SNARE ===
  const snareReverb = new Tone.Reverb({ decay: 0.8, wet: 0.38 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.006, decay: 0.11, sustain: 0 }
  }).connect(snareReverb);

  const snareVelocities = [0.32, 0.92, 0.28, 0.96];
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && snareStep % 2 === 1) {
      const vel = snareVelocities[snareStep % snareVelocities.length];
      snare.triggerAttackRelease("16n", time, vel * 0.82);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS ===
  const hat = new Tone.MetalSynth({
    frequency: 335,
    envelope: { attack: 0.001, decay: 0.09, release: 0.03 },
    harmonicity: 4.6,
    modulationIndex: 24,
    resonance: 3400
  }).connect(masterReverb);

  const hatVelocities = [0.68, 0.38, 0.58, 0.33, 0.68, 0.38, 0.58, 0.33];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 13) {
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("16n", time, vel * 0.48);
      hatStep++;
    }
  }, "16n").start(0);

  // === METALLIC ACCENT (golden engravings) ===
  const bell = new Tone.FMSynth({
    harmonicity: 3.2,
    modulationIndex: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 1.8, sustain: 0 },
    modulation: { type: "sine" }
  }).connect(masterReverb);

  const bellNotes = ["B5", null, null, null, "E6", null, null, null];
  let bellIdx = 0;
  const bellLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 5 && bar < 13 && bellNotes[bellIdx % bellNotes.length]) {
      bell.triggerAttackRelease(bellNotes[bellIdx % bellNotes.length], "4n", time, 0.45);
    }
    bellIdx++;
  }, "2n").start(0);

  // === WIND DOWN (return to opening) ===
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(350, time + 2 * (60 / bpm) * 4);
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { arp, bass, lead, pad, kick, snare, hat, bell };
  window.toneJsParts = { arpLoop, bassLoop, leadLoop, padLoop, kickLoop, snareLoop, hatLoop, bellLoop };
};