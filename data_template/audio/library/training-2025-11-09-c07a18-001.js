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

  // === 4-ON-FLOOR KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.038,
    octaves: 5.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      compressor.threshold.setValueAtTime(-36, time);
      compressor.threshold.exponentialRampToValueAtTime(-24, time + 0.18);
    }
  }, "4n").start(0);

  // === HEAVY SIDECHAINED BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 1.0 }).connect(compressor);
  const bassDistortion = new Tone.Distortion({ distortion: 0.35, wet: 0.28 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.14, sustain: 0, release: 0.08 }
  }).connect(bassDistortion);

  const section1Bass = ["F1", "F1", "Db2", "Db2"];
  const section2Bass = ["Ab1", "Ab1", "Eb2", "Eb2"];
  const section3Bass = ["F1", "Db2", "Ab1", "Eb2"];
  let bassIdx = 0;

  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let pattern;
    if (bar < 3) pattern = [];
    else if (bar < 9) pattern = section1Bass;
    else if (bar < 14) pattern = section3Bass;
    else if (bar < 17) pattern = section2Bass;
    else pattern = section1Bass;

    if (pattern.length > 0) {
      bass.triggerAttackRelease(pattern[bassIdx % pattern.length], "8n", time, 0.82);
    }
    bassIdx++;
  }, "8n").start(0);

  // === DRAMATIC STRINGS ===
  const stringsChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 4.5, depth: 0.4, wet: 0.25 }).connect(compressor);
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
  let stringIdx = 0;

  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 3 ? 0.48 : (bar >= 9 && bar < 14 ? 0.68 : 0.58);
    strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], "1m", time, velocity);
    stringIdx++;
  }, "1m").start(0);

  // === AGGRESSIVE SQUARE LEAD ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.22, wet: 0.18 }).connect(masterReverb);
  const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 1800, Q: 0.8 }).connect(leadDelay);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.004, decay: 0.18, sustain: 0, release: 0.12 }
  }).connect(leadFilter);

  const leadPhrase1 = ["F4", "Eb4", "Db4", "Ab3"];
  const leadPhrase2 = ["Db4", "Eb4", "F4", "Ab4"];
  const leadPhrase3 = ["Ab4", "G4", "F4", "Eb4"];
  let leadIdx = 0;

  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let phrase;
    if (bar < 6 || bar >= 17) phrase = [];
    else if (bar < 9) phrase = leadPhrase1;
    else if (bar < 14) phrase = leadPhrase2;
    else phrase = leadPhrase3;

    if (phrase.length > 0) {
      const velocity = 0.75 + Math.random() * 0.08;
      lead.triggerAttackRelease(phrase[leadIdx % phrase.length], "4n", time, velocity);
    }
    leadIdx++;
  }, "2n").start(0);

  // === GATED REVERB SNARE ===
  const snareReverb = new Tone.Reverb({ decay: 0.65, wet: 0.68 }).toDestination();
  await snareReverb.generate();
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.004, decay: 0.075, sustain: 0 }
  }).connect(snareReverb);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3 && snareStep % 2 === 1) {
      const velocity = 0.85 + Math.random() * 0.08;
      snare.triggerAttackRelease("16n", time, velocity);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS ===
  const hat = new Tone.MetalSynth({
    frequency: 310,
    envelope: { attack: 0.001, decay: 0.075, release: 0.025 },
    harmonicity: 4.8,
    modulationIndex: 28,
    resonance: 3400
  }).connect(masterReverb);

  const hatPattern = [0.68, 0.38, 0.58, 0.34, 0.68, 0.38, 0.58, 0.34];
  let hatStep = 0;

  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 17) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.48);
    }
    hatStep++;
  }, "16n").start(0);

  // === ARP (adds texture in middle section) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 1.1 }).connect(compressor);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.002, decay: 0.06, sustain: 0, release: 0.04 }
  }).connect(arpFilter);

  const arpNotes = ["F4", "Ab4", "C5", "F5", "C5", "Ab4"];
  let arpIdx = 0;

  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 9 && bar < 14) {
      arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], "16n", time, 0.48);
    }
    arpIdx++;
  }, "16n").start(0);

  // === FILTER AUTOMATION ===
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(320, time + 4 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(3200, time + 2 * (60 / bpm) * 4);
  }, "9:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(1600, time + 2 * (60 / bpm) * 4);
  }, "9:0:0");

  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(200, time + 2 * (60 / bpm) * 4);
  }, "14:0:0");

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(1800, time + 1 * (60 / bpm) * 4);
  }, "16:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, strings, lead, snare, hat, arp };
  window.toneJsParts = { kickLoop, bassLoop, stringsLoop, leadLoop, snareLoop, hatLoop, arpLoop };
};