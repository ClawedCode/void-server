window.initToneJsEngine = async function() {
  const bpm = 92;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 1.8, wet: 0.22 }).toDestination();
  await masterReverb.generate();

  const compressor = new Tone.Compressor({
    threshold: -26,
    ratio: 12,
    attack: 0.003,
    release: 0.18
  }).connect(masterReverb);

  // === 4-ON-FLOOR KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.038,
    octaves: 5.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.19, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      kick.triggerAttackRelease("C1", "8n", time, 1.0);
      compressor.threshold.setValueAtTime(-36, time);
      compressor.threshold.exponentialRampToValueAtTime(-26, time + 0.18);
    }
  }, "4n").start(0);

  // === HEAVY SIDECHAINED BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 240, Q: 1.0 }).connect(compressor);
  const bassDistortion = new Tone.Distortion({ distortion: 0.3, wet: 0.25 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.14, sustain: 0, release: 0.09 }
  }).connect(bassDistortion);

  const bassSection1 = ["E1", "E1", "C2", "C2"];
  const bassSection2 = ["E1", "C2", "D1", "C2", "E1", "D1"];
  const bassSection3 = ["E1", "E1", "C2", "C2"];

  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    let pattern;
    if (bar < 6) pattern = bassSection1;
    else if (bar < 12) pattern = bassSection2;
    else if (bar < 14) pattern = bassSection1;
    else pattern = bassSection3;

    if (bar >= 2) {
      bass.triggerAttackRelease(pattern[bassIndex % pattern.length], "8n", time, 0.82);
      bassIndex++;
    }
  }, "8n").start(0);

  // === DRAMATIC STRINGS ===
  const stringsChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 4.0, depth: 0.4, wet: 0.25 }).connect(compressor);
  stringsChorus.start();
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.55, decay: 0.35, sustain: 0.88, release: 2.2 }
  }).connect(stringsChorus);

  const stringChords = [
    ["E3", "G3", "B3", "E4"],
    ["C3", "E3", "G3", "C4"],
    ["D3", "F#3", "A3", "D4"],
    ["C3", "E3", "G3", "C4"]
  ];

  let stringIndex = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 2 ? 0.48 : (bar >= 6 && bar < 12 ? 0.68 : 0.58);
    strings.triggerAttackRelease(stringChords[stringIndex % stringChords.length], "1m", time, velocity);
    stringIndex++;
  }, "1m").start(0);

  // === AGGRESSIVE SQUARE LEAD ===
  const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 1200, Q: 1.5 }).connect(compressor);
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.28, wet: 0.18 }).connect(leadFilter);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.006, decay: 0.16, sustain: 0, release: 0.12 }
  }).connect(leadDelay);

  const leadMelody = ["E4", "D4", "C4", "G3", "C4", "D4", "E4", "B3"];
  let leadIndex = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 13) {
      const velocity = 0.78 + (Math.random() * 0.08 - 0.04);
      lead.triggerAttackRelease(leadMelody[leadIndex % leadMelody.length], "2n", time, velocity);
      leadIndex++;
    }
  }, "2n").start(0);

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(2800, time + 6 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(1200, time + 2 * (60 / bpm) * 4);
  }, "13:0:0");

  // === GATED REVERB SNARE ===
  const snareReverb = new Tone.Reverb({ decay: 0.65, wet: 0.68 }).toDestination();
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

  // === HI-HATS (16th driving groove) ===
  const hat = new Tone.MetalSynth({
    frequency: 310,
    envelope: { attack: 0.001, decay: 0.09, release: 0.025 },
    harmonicity: 4.8,
    modulationIndex: 28,
    resonance: 3400
  }).connect(masterReverb);

  const hatVelocities = [0.68, 0.38, 0.58, 0.32, 0.68, 0.38, 0.58, 0.32];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 14) {
      const vel = hatVelocities[hatStep % hatVelocities.length];
      hat.triggerAttackRelease("16n", time, vel * 0.48);
      hatStep++;
    }
  }, "16n").start(0);

  // === DARK ARPEGGIO ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 1.2 }).connect(compressor);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.004, decay: 0.1, sustain: 0, release: 0.06 }
  }).connect(arpFilter);

  const arpNotes = ["E3", "G3", "B3", "E4", "D4", "B3", "G3", "E3"];
  let arpIndex = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 14) {
      const velocity = 0.55 + (Math.random() * 0.1 - 0.05);
      arp.triggerAttackRelease(arpNotes[arpIndex % arpNotes.length], "16n", time, velocity);
      arpIndex++;
    }
  }, "16n").start(0);

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(1600, time + 4 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(600, time + 2 * (60 / bpm) * 4);
  }, "12:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, strings, lead, snare, hat, arp };
  window.toneJsParts = { kickLoop, bassLoop, stringsLoop, leadLoop, snareLoop, hatLoop, arpLoop };
};