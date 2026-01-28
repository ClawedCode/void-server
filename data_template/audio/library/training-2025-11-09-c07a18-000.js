window.initToneJsEngine = async function() {
  const bpm = 92;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 1.8, wet: 0.22 }).toDestination();
  await masterReverb.generate();

  const compressor = new Tone.Compressor({
    threshold: -24,
    ratio: 12,
    attack: 0.003,
    release: 0.18
  }).connect(masterReverb);

  // === 4-ON-FLOOR KICK (drives sidechain) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.035,
    octaves: 5.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      compressor.threshold.setValueAtTime(-34, time);
      compressor.threshold.exponentialRampToValueAtTime(-24, time + 0.18);
    }
  }, "4n").start(0);

  // === HEAVY SIDECHAINED BASS (sawtooth, grinding) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 180, Q: 1.1 }).connect(compressor);
  const bassDistortion = new Tone.Distortion({ distortion: 0.38, wet: 0.32 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(bassDistortion);

  const bassSectionA = ["G1", "G1", "Eb1", "Eb1"];
  const bassSectionB = ["G1", "Bb1", "Eb1", "F1", "G1", "Eb1"];
  const bassSectionC = ["G1", "G1", "Eb1", "Eb1"];

  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let pattern;
    if (bar < 2) pattern = [];
    else if (bar < 6) pattern = bassSectionA;
    else if (bar < 14) pattern = bassSectionB;
    else pattern = bassSectionC;

    if (pattern.length > 0) {
      bass.triggerAttackRelease(pattern[bassIndex % pattern.length], "8n", time, 0.88);
      bassIndex++;
    }
  }, "8n").start(0);

  // === DRAMATIC STRINGS (cinematic swells) ===
  const stringsChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 4.0, depth: 0.4, wet: 0.28 }).connect(compressor);
  stringsChorus.start();
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.6, decay: 0.35, sustain: 0.85, release: 2.2 }
  }).connect(stringsChorus);

  const stringChords = [
    ["G3", "Bb3", "D4", "G4"],
    ["Eb3", "G3", "Bb3", "Eb4"],
    ["F3", "Ab3", "C4", "F4"],
    ["D3", "F3", "A3", "D4"]
  ];

  let stringIndex = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let velocity = 0.48;
    if (bar >= 2 && bar < 6) velocity = 0.54;
    else if (bar >= 6 && bar < 14) velocity = 0.68;
    else if (bar >= 14) velocity = 0.50;

    strings.triggerAttackRelease(stringChords[stringIndex % stringChords.length], "1m", time, velocity);
    stringIndex++;
  }, "1m").start(0);

  // === AGGRESSIVE SQUARE LEAD (retro synth) ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.28, wet: 0.24 }).connect(masterReverb);
  const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 2200, Q: 1.4 }).connect(leadDelay);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.006, decay: 0.14, sustain: 0, release: 0.12 }
  }).connect(leadFilter);

  const leadMelody = ["G4", "F4", "Eb4", "Bb3", "D4", "Eb4", "F4", "G4"];
  let leadIndex = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 6 && bar < 14) {
      const velocity = [0.82, 0.78, 0.84, 0.88, 0.80, 0.82, 0.78, 0.84][leadIndex % 8];
      lead.triggerAttackRelease(leadMelody[leadIndex % leadMelody.length], "4n", time, velocity);
      leadIndex++;
    }
  }, "4n").start(0);

  // === GATED REVERB SNARE ===
  const snareReverb = new Tone.Reverb({ decay: 0.7, wet: 0.68 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.004, decay: 0.09, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.88);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS (driving 16ths) ===
  const hat = new Tone.MetalSynth({
    frequency: 310,
    envelope: { attack: 0.001, decay: 0.09, release: 0.025 },
    harmonicity: 4.8,
    modulationIndex: 28,
    resonance: 3400
  }).connect(masterReverb);

  const hatPattern = [0.68, 0.38, 0.58, 0.32, 0.68, 0.38, 0.58, 0.42];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 15) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.48);
      hatStep++;
    }
  }, "16n").start(0);

  // === FILTER AUTOMATION ===
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(320, time + 4 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(4200, time + 4 * (60 / bpm) * 4);
  }, "8:0:0");

  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(180, time + 2 * (60 / bpm) * 4);
    leadFilter.frequency.linearRampToValueAtTime(2200, time + 2 * (60 / bpm) * 4);
  }, "14:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, strings, lead, snare, hat };
  window.toneJsParts = { kickLoop, bassLoop, stringsLoop, leadLoop, snareLoop, hatLoop };
};