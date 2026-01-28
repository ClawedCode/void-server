window.initToneJsEngine = async function() {
  const bpm = 94;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 2.8, wet: 0.35 }).toDestination();
  await masterReverb.generate();

  const compressor = new Tone.Compressor({ threshold: -20, ratio: 8, attack: 0.003, release: 0.18 }).toDestination();

  // === KICK (deep, punchy) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 7,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.03 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 1.0);
    compressor.threshold.setValueAtTime(-32, time);
    compressor.threshold.exponentialRampToValueAtTime(-20, time + 0.18);
  }, "4n").start(0);

  // === PLAYFUL BASS (round, bouncy) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 220, Q: 1.5 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.003, decay: 0.15, sustain: 0, release: 0.08 }
  }).connect(bassFilter);

  const bassSections = [
    ["G1", "G1", "D1", "G1"],
    ["G1", "A#1", "D2", "F1", "G1", "A#1", "D1"],
    ["G1", "G1", "D1", "G1"]
  ];

  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    let pattern;
    if (bar < 2) pattern = bassSections[0];
    else if (bar < 8) pattern = bassSections[1];
    else if (bar < 9) pattern = bassSections[0];
    else pattern = bassSections[2];

    if (bar >= 1) {
      bass.triggerAttackRelease(pattern[bassIndex % pattern.length], "8n", time, 0.85);
    }
    bassIndex++;
  }, "8n").start(0);

  // === SHIMMERY ARP (playful, bright) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 1.8 }).connect(compressor);
  const arpChorus = new Tone.Chorus({ frequency: 2.5, delayTime: 2.5, depth: 0.4, wet: 0.25 }).connect(arpFilter).start();
  const arp = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(arpChorus);

  let arpStep = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    if (bar >= 2 && bar < 8) {
      const rootMidi = Tone.Frequency("G4").toMidi();
      const scale = [0, 2, 3, 7, 10, 12, 15];
      const degree = scale[arpStep % scale.length];
      const octaveJump = Math.floor(arpStep / scale.length) % 2 === 1 ? 12 : 0;
      
      const note = Tone.Frequency(rootMidi + degree + octaveJump, "midi");
      const velocity = 0.5 + Math.random() * 0.15;
      arp.triggerAttackRelease(note, "16n", time, velocity);
    }
    arpStep++;
  }, "16n").start(0);

  // Filter sweep for arp
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(2200, time + 4 * (60 / bpm) * 4);
  }, "2:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(800, time + 1 * (60 / bpm) * 4);
  }, "7:3:0");

  // === SOFT PAD (airy, supportive) ===
  const padHPF = new Tone.Filter({ type: "highpass", frequency: 180 }).connect(compressor);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: -5,
    envelope: { attack: 0.8, decay: 0.5, sustain: 0.4, release: 1.8 }
  }).connect(padHPF);

  const padChords = [
    ["G3", "D4", "G4"],
    ["A#3", "F4", "A#4"],
    ["D3", "A3", "D4"]
  ];

  let chordIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 4 && bar < 8) {
      pad.triggerAttackRelease(padChords[chordIndex % padChords.length], "2n", time, 0.12);
    }
    chordIndex++;
  }, "2n").start(0);

  // === METALLIC HISS (hi-hat analogue) ===
  const hat = new Tone.MetalSynth({
    frequency: 380,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 6.2,
    modulationIndex: 28,
    resonance: 3800
  }).connect(masterReverb);

  let hatBeat = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const pattern = [0, 1, 0, 1, 0, 1, 1, 0];
    
    if (bar >= 3 && bar < 8 && pattern[hatBeat % pattern.length]) {
      const velocity = 0.3 + Math.random() * 0.15;
      hat.triggerAttackRelease("16n", time, velocity);
    }
    hatBeat++;
  }, "8n").start(0);

  // === PLAYFUL BELLS (FM, sparse) ===
  const bell = new Tone.FMSynth({
    harmonicity: 3.2,
    modulationIndex: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 1.2, sustain: 0 },
    modulation: { type: "sine" }
  }).connect(masterReverb);

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("G5", "4n", time, 0.4);
  }, "5:0:0");

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("D6", "4n", time, 0.35);
  }, "5:2:0");

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("G5", "4n", time, 0.3);
  }, "6:1:0");

  // === NOISE SWIRL (brief texture) ===
  const noiseFilter = new Tone.Filter({ type: "bandpass", frequency: 1200, Q: 2 }).connect(masterReverb);
  const noise = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.3, decay: 0.4, sustain: 0, release: 0.5 }
  }).connect(noiseFilter);

  Tone.Transport.schedule((time) => {
    noiseFilter.frequency.linearRampToValueAtTime(2400, time + 0.8);
    noise.triggerAttackRelease(0.8, time);
  }, "4:3:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, arp, pad, hat, bell, noise };
  window.toneJsParts = { kickLoop, bassLoop, arpLoop, padLoop, hatLoop };
};