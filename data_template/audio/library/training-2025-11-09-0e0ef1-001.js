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

  // === 4-ON-FLOOR KICK (triggers sidechain) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.038,
    octaves: 5.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.04 }
  }).toDestination();

  let kickStartBar = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= kickStartBar) {
      kick.triggerAttackRelease("C1", "8n", time, 0.95);
      // Aggressive sidechain pump
      compressor.threshold.setValueAtTime(-38, time);
      compressor.threshold.exponentialRampToValueAtTime(-24, time + 0.18);
    }
  }, "4n").start(0);

  // === HEAVY SIDECHAINED BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 1.0 }).connect(compressor);
  const bassDistortion = new Tone.Distortion({ distortion: 0.3, wet: 0.25 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.008, decay: 0.14, sustain: 0, release: 0.08 }
  }).connect(bassDistortion);

  const bassSection1 = ["E1", "E1", "C2", "C2"];
  const bassSection2 = ["E1", "C2", "D2", "B1"];
  const bassSection3 = ["E1", "E1", "C2", "C2"];

  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let pattern;
    if (bar < 4) return; // Silent intro
    else if (bar < 9) pattern = bassSection1;
    else if (bar < 14) pattern = bassSection2;
    else pattern = bassSection3; // Return to opening for loop

    bass.triggerAttackRelease(pattern[bassIdx % pattern.length], "8n", time, 0.82);
    bassIdx++;
  }, "8n").start(0);

  // === DRAMATIC STRINGS ===
  const stringsChorus = new Tone.Chorus({ frequency: 0.2, delayTime: 3.0, depth: 0.4, wet: 0.25 }).connect(compressor);
  stringsChorus.start();
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.45, decay: 0.25, sustain: 0.85, release: 2.2 }
  }).connect(stringsChorus);

  const stringChords = [
    ["E3", "G3", "B3", "E4"],   // Em
    ["C3", "E3", "G3", "C4"],   // C
    ["D3", "F#3", "A3", "D4"],  // D
    ["B2", "D3", "F#3", "B3"]   // Bm
  ];

  let stringIdx = 0;
  const stringsLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.48 : (bar >= 9 ? 0.65 : 0.55);
    strings.triggerAttackRelease(stringChords[stringIdx % stringChords.length], "1m", time, velocity);
    stringIdx++;
  }, "1m").start(0);

  // === AGGRESSIVE SQUARE LEAD ===
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.22, wet: 0.18 }).connect(masterReverb);
  const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 1800, Q: 1.2 }).connect(leadDelay);
  const lead = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.004, decay: 0.12, sustain: 0, release: 0.09 }
  }).connect(leadFilter);

  const leadMelody = ["E4", "D4", "C4", "B3", "G3", "B3", "C4", "D4"];
  const leadVelocities = [0.88, 0.82, 0.85, 0.90, 0.78, 0.82, 0.85, 0.88];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 14) {
      lead.triggerAttackRelease(
        leadMelody[leadIdx % leadMelody.length],
        "4n",
        time,
        leadVelocities[leadIdx % leadVelocities.length] * 0.75
      );
      leadIdx++;
    }
  }, "4n").start(0);

  // Filter automation: open during peak, close before loop
  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(3200, time + 4 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(1800, time + 2 * (60 / bpm) * 4);
  }, "14:0:0");

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
    if (bar >= 4 && bar < 16 && snareStep % 2 === 1) {
      snare.triggerAttackRelease("16n", time, 0.88);
    }
    snareStep++;
  }, "4n").start(0);

  // === HI-HATS (16th note groove) ===
  const hat = new Tone.MetalSynth({
    frequency: 310,
    envelope: { attack: 0.001, decay: 0.075, release: 0.02 },
    harmonicity: 5.2,
    modulationIndex: 28,
    resonance: 3500
  }).connect(masterReverb);

  const hatPattern = [0.72, 0.38, 0.58, 0.32, 0.72, 0.38, 0.62, 0.35];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 16) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.48);
      hatStep++;
    }
  }, "16n").start(0);

  // === DARK ARP (add texture in middle section) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 1.5 }).connect(compressor);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.002, decay: 0.06, sustain: 0, release: 0.04 }
  }).connect(arpFilter);

  const arpNotes = ["E5", "G5", "B5", "D5", "B5", "G5"];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 9 && bar < 14) {
      arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], "16n", time, 0.45);
      arpIdx++;
    }
  }, "16n").start(0);

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, strings, lead, snare, hat, arp };
  window.toneJsParts = { kickLoop, bassLoop, stringsLoop, leadLoop, snareLoop, hatLoop, arpLoop };
};