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

  // === 4-ON-FLOOR KICK (sidechain trigger) ===
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
      compressor.threshold.setValueAtTime(-38, time);
      compressor.threshold.exponentialRampToValueAtTime(-24, time + 0.18);
    }
  }, "4n").start(0);

  // === HEAVY SIDECHAINED BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 180, Q: 1.0 }).connect(compressor);
  const bassDistortion = new Tone.Distortion({ distortion: 0.25, wet: 0.3 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(bassDistortion);

  const section1Bass = ["D1", "D1", "A0", "A0"];
  const section2Bass = ["Bb0", "Bb0", "F1", "F1"];
  const section3Bass = ["D1", "C1", "Bb0", "A0"];
  let bassIdx = 0;

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let pattern;
    if (bar < 2) return; // Intro silence
    else if (bar < 6) pattern = section1Bass;
    else if (bar < 10) pattern = section2Bass;
    else if (bar < 15) pattern = section3Bass;
    else if (bar < 18) pattern = section1Bass;
    else pattern = section1Bass; // Wind down to opening

    bass.triggerAttackRelease(pattern[bassIdx % pattern.length], "8n", time, 0.85);
    bassIdx++;
  }, "8n").start(0);

  // === AGGRESSIVE SQUARE LEAD ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.28, wet: 0.22 }).connect(masterReverb);
  const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 1200, Q: 1.2 }).connect(leadDelay);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.004, decay: 0.14, sustain: 0, release: 0.09 }
  }).connect(leadFilter);

  const leadPhrase1 = ["D4", "C4", "Bb3", "A3", "Bb3", "C4"];
  const leadPhrase2 = ["F4", "Eb4", "D4", "C4", "D4"];
  const leadPhrase3 = ["A4", "G4", "F4", "D4"];
  let leadIdx = 0;

  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 6 && bar < 10) {
      lead.triggerAttackRelease(leadPhrase1[leadIdx % leadPhrase1.length], "4n", time, 0.82);
      leadIdx++;
    } else if (bar >= 10 && bar < 14) {
      lead.triggerAttackRelease(leadPhrase2[leadIdx % leadPhrase2.length], "4n", time, 0.88);
      leadIdx++;
    } else if (bar >= 14 && bar < 16) {
      lead.triggerAttackRelease(leadPhrase3[leadIdx % leadPhrase3.length], "4n", time, 0.78);
      leadIdx++;
    }
  }, "4n").start(0);

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(2800, time + 4 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(1200, time + 2 * (60 / bpm) * 4);
  }, "16:0:0");

  // === DRAMATIC STRINGS ===
  const stringsChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 4.0, depth: 0.6, wet: 0.35 }).connect(compressor);
  stringsChorus.start();
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.6, decay: 0.35, sustain: 0.88, release: 2.8 }
  }).connect(stringsChorus);

  const stringChords = [
    ["D3", "F3", "A3", "D4"],  // Dm
    ["Bb2", "D3", "F3", "Bb3"], // Bb
    ["C3", "E3", "G3", "C4"],  // C
    ["A2", "C3", "E3", "A3"]   // Am
  ];
  let stringIdx = 0;

  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let velocity = 0.48;
    if (bar >= 6 && bar < 10) velocity = 0.58;
    else if (bar >= 10 && bar < 15) velocity = 0.68;
    else if (bar >= 15 && bar < 18) velocity = 0.52;
    else if (bar >= 18) velocity = 0.45; // Wind down
    
    strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], "1m", time, velocity);
    stringIdx++;
  }, "1m").start(0);

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
    if (bar >= 2 && bar < 18 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.92);
    }
    snareStep++;
  }, "4n").start(0);

  // === DRIVING HI-HATS ===
  const hat = new Tone.MetalSynth({
    frequency: 310,
    envelope: { attack: 0.001, decay: 0.075, release: 0.025 },
    harmonicity: 4.8,
    modulationIndex: 28,
    resonance: 3400
  }).connect(masterReverb);

  const hatPattern = [0.68, 0.38, 0.58, 0.32, 0.68, 0.38, 0.58, 0.42];
  let hatStep = 0;

  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 18) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.52);
    }
    hatStep++;
  }, "16n").start(0);

  // === ARPEGGIATED ACCENT ===
  const arpFilter = new Tone.Filter({ type: "highpass", frequency: 600 }).connect(masterReverb);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0, release: 0.06 }
  }).connect(arpFilter);

  const arpNotes = ["D5", "F5", "A5", "C6", "A5", "F5"];
  let arpIdx = 0;

  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10 && bar < 14) {
      arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], "16n", time, 0.62);
      arpIdx++;
    }
  }, "16n").start(0);

  // === NOISE RISER ===
  const noiseHPF = new Tone.Filter({ type: "highpass", frequency: 800 }).connect(masterReverb);
  const noise = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.5, decay: 0.25, sustain: 0, release: 0.7 }
  }).connect(noiseHPF);

  Tone.Transport.schedule((time) => {
    noiseHPF.frequency.linearRampToValueAtTime(3500, time + 1.2);
    noise.triggerAttackRelease(1.2, time);
  }, "5:2:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, lead, strings, snare, hat, arp, noise };
  window.toneJsParts = { kickLoop, bassLoop, leadLoop, stringsLoop, snareLoop, hatLoop, arpLoop };
};