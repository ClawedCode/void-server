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
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      compressor.threshold.setValueAtTime(-36, time);
      compressor.threshold.exponentialRampToValueAtTime(-24, time + 0.18);
    }
  }, "4n").start(0);

  // === HEAVY SIDECHAINED BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 1.0 }).connect(compressor);
  const bassDistortion = new Tone.Distortion({ distortion: 0.3, wet: 0.25 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(bassDistortion);

  const section1Bass = ["F1", "F1", "Db2", "Db2"];
  const section2Bass = ["Ab1", "Ab1", "Eb2", "F1"];
  const section3Bass = ["F1", "Db2", "Ab1", "Eb2"];
  const section4Bass = ["F1", "F1", "Db2", "Db2"];

  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let pattern;
    if (bar < 4) pattern = [];
    else if (bar < 8) pattern = section1Bass;
    else if (bar < 12) pattern = section2Bass;
    else if (bar < 16) pattern = section3Bass;
    else pattern = section4Bass;

    if (pattern.length > 0) {
      bass.triggerAttackRelease(pattern[bassIndex % pattern.length], "8n", time, 0.82);
    }
    bassIndex++;
  }, "8n").start(0);

  // === DRAMATIC STRINGS ===
  const stringsChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 3.0, depth: 0.4, wet: 0.25 }).connect(compressor);
  stringsChorus.start();
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.55, decay: 0.35, sustain: 0.88, release: 2.2 }
  }).connect(stringsChorus);

  const stringChords = [
    ["F3", "Ab3", "C4", "F4"],
    ["Db3", "F3", "Ab3", "Db4"],
    ["Ab2", "C3", "Eb3", "Ab3"],
    ["Eb3", "G3", "Bb3", "Eb4"]
  ];
  
  let stringIndex = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    let velocity = 0.48;
    if (bar >= 4 && bar < 8) velocity = 0.58;
    else if (bar >= 8 && bar < 16) velocity = 0.68;
    else if (bar >= 16) velocity = 0.52;

    strings.triggerAttackRelease(stringChords[stringIndex % stringChords.length], "1m", time, velocity);
    stringIndex++;
  }, "1m").start(0);

  // === AGGRESSIVE SQUARE LEAD ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.22, wet: 0.18 }).connect(masterReverb);
  const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 3200, Q: 0.8 }).connect(leadDelay);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.004, decay: 0.14, sustain: 0, release: 0.12 }
  }).connect(leadFilter);

  const leadMelodyA = ["F4", "Eb4", "Db4", "Ab3"];
  const leadMelodyB = ["Ab3", "Db4", "Eb4", "F4", "Ab4", "F4"];
  const leadMelodyC = ["F4", "Ab4", "C5", "Ab4", "F4", "Eb4"];

  let leadIndex = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let melody;
    let noteValue;
    if (bar >= 6 && bar < 10) {
      melody = leadMelodyA;
      noteValue = "2n";
    } else if (bar >= 10 && bar < 14) {
      melody = leadMelodyB;
      noteValue = "4n";
    } else if (bar >= 14 && bar < 17) {
      melody = leadMelodyC;
      noteValue = "4n";
    } else {
      melody = [];
    }

    if (melody.length > 0) {
      const velocity = 0.78 + (Math.random() * 0.06 - 0.03);
      lead.triggerAttackRelease(melody[leadIndex % melody.length], noteValue, time, velocity);
    }
    leadIndex++;
  }, "4n").start(0);

  // === GATED REVERB SNARE ===
  const snareReverb = new Tone.Reverb({ decay: 0.65, wet: 0.72 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.004, decay: 0.075, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 18 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.88);
    }
    snareStep++;
  }, "4n").start(0);

  // === DRIVING HI-HATS ===
  const hat = new Tone.MetalSynth({
    frequency: 310,
    envelope: { attack: 0.001, decay: 0.085, release: 0.025 },
    harmonicity: 5.2,
    modulationIndex: 28,
    resonance: 3800
  }).connect(masterReverb);

  const hatPattern = [0.72, 0.38, 0.62, 0.34, 0.72, 0.38, 0.62, 0.34, 0.72, 0.42, 0.58, 0.32, 0.68, 0.40, 0.60, 0.36];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 18) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.48);
    }
    hatStep++;
  }, "16n").start(0);

  // === ATMOSPHERIC PAD (low in mix) ===
  const padHPF = new Tone.Filter({ type: "highpass", frequency: 180 }).connect(compressor);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    detune: -6,
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.65, release: 1.8 }
  }).connect(padHPF);

  const padChords = [
    ["F2", "Ab2", "C3"],
    ["Db2", "F2", "Ab2"],
    ["Ab2", "C3", "Eb3"],
    ["Eb2", "G2", "Bb2"]
  ];

  let padIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 18) {
      pad.triggerAttackRelease(padChords[padIndex % padChords.length], "1m", time, 0.32);
    }
    padIndex++;
  }, "1m").start(0);

  // === FILTER AUTOMATION ===
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(320, time + 4 * (60 / bpm) * 4);
  }, "8:0:0");

  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(180, time + 2 * (60 / bpm) * 4);
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, strings, lead, snare, hat, pad };
  window.toneJsParts = { kickLoop, bassLoop, stringsLoop, leadLoop, snareLoop, hatLoop, padLoop };
};