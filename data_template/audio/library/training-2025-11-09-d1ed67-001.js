window.initToneJsEngine = async function() {
  const bpm = 112;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 2.8, wet: 0.35 }).toDestination();
  await masterReverb.generate();

  const compressor = new Tone.Compressor({ threshold: -20, ratio: 8, attack: 0.003, release: 0.18 }).toDestination();

  // === KICK (punchy, cinematic) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 7,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 1.0);
    compressor.threshold.setValueAtTime(-32, time);
    compressor.threshold.exponentialRampToValueAtTime(-20, time + 0.18);
  }, "4n").start(0);

  // === ORCHESTRAL BASS (saw + sub, dramatic swells) ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 180, Q: 1.5 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.03, decay: 0.15, sustain: 0.7, release: 0.2 },
    filterEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.4, baseFrequency: 120, octaves: 2.5 }
  }).connect(bassFilter);

  const bassNotes1 = ["C2", "C2", "G1", "G1"];
  const bassNotes2 = ["C2", "D#2", "G1", "A#1"];
  const bassNotes3 = ["C2", "C2", "G1", "G1"];

  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    let pattern;
    if (bar < 4) pattern = bassNotes1;
    else if (bar < 12) pattern = bassNotes2;
    else pattern = bassNotes3;

    bass.triggerAttackRelease(pattern[bassIndex % pattern.length], "4n", time, 0.85);
    bassIndex++;
  }, "4n").start(0);

  // Bass filter evolution
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(320, time + 4 * (60 / bpm) * 4);
  }, "4:0:0");

  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(180, time + 2 * (60 / bpm) * 4);
  }, "12:0:0");

  // === TRON ARP (square/triangle hybrid, 16th notes) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 2.0 }).connect(masterReverb);
  const arpDelay = new Tone.FeedbackDelay({ delayTime: "16n", feedback: 0.25, wet: 0.2 }).connect(arpFilter);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0.2, release: 0.08 }
  }).connect(arpDelay);

  const arpScale = [0, 3, 7, 10, 12, 15, 19, 22];
  let arpStep = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 2 && bar < 12) {
      const rootMidi = 60;
      const degree = arpScale[arpStep % arpScale.length];
      const octaveShift = Math.floor(arpStep / arpScale.length) * 12;
      const note = Tone.Frequency(rootMidi + degree + (octaveShift % 24), "midi");
      
      const velocity = 0.55 + (bar >= 6 ? 0.15 : 0);
      arp.triggerAttackRelease(note, "16n", time, velocity);
    }
    arpStep++;
  }, "16n").start(0);

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(2400, time + 4 * (60 / bpm) * 4);
  }, "6:0:0");

  // === ORCHESTRAL PAD (wide, cinematic strings) ===
  const padReverb = new Tone.Reverb({ decay: 3.5, wet: 0.5 }).toDestination();
  await padReverb.generate();
  const padChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 5, depth: 0.6, wet: 0.35 }).connect(padReverb);
  padChorus.start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: -5,
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.7, release: 2.0 }
  }).connect(padChorus);

  const padChords = [
    ["C3", "G3", "C4", "E4"],
    ["D#3", "A#3", "D#4", "G4"],
    ["G2", "D3", "G3", "B3"]
  ];
  let chordIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 1) {
      const velocity = bar < 13 ? 0.2 : 0.15;
      pad.triggerAttackRelease(padChords[chordIndex % padChords.length], "1n", time, velocity);
      chordIndex++;
    }
  }, "1n").start(0);

  // === SNARE (tight, electronic) ===
  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.05 }
  }).connect(compressor);

  const snareFilter = new Tone.Filter({ type: "highpass", frequency: 300 }).connect(compressor);
  const snareTone = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 }
  }).connect(snareFilter);

  let snareCount = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 4 && bar < 14 && snareCount % 4 === 2) {
      snareNoise.triggerAttackRelease("16n", time, 0.4);
      snareTone.triggerAttackRelease("G2", "16n", time, 0.6);
    }
    snareCount++;
  }, "4n").start(0);

  // === HI-HATS (metallic, off-beat) ===
  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 6.5,
    modulationIndex: 40,
    resonance: 3000
  }).connect(masterReverb);

  let hatBeat = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 6 && bar < 13 && hatBeat % 2 === 1) {
      hat.triggerAttackRelease("32n", time, 0.35);
    }
    hatBeat++;
  }, "8n").start(0);

  // === CINEMATIC BELLS (FM, sparse) ===
  const bellReverb = new Tone.Reverb({ decay: 4.0, wet: 0.6 }).toDestination();
  await bellReverb.generate();
  const bell = new Tone.FMSynth({
    harmonicity: 4.0,
    modulationIndex: 15,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 1.5, sustain: 0.1, release: 2.0 },
    modulation: { type: "sine" },
    modulationEnvelope: { attack: 0.01, decay: 0.8, sustain: 0, release: 1.0 }
  }).connect(bellReverb);

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("C5", "2n", time, 0.5);
  }, "8:0:0");

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("G5", "2n", time, 0.45);
  }, "10:2:0");

  // === SWEEP RISER (filtered noise) ===
  const riserFilter = new Tone.Filter({ type: "highpass", frequency: 400 }).connect(masterReverb);
  const riser = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.8, decay: 0.3, sustain: 0, release: 0.5 }
  }).connect(riserFilter);

  Tone.Transport.schedule((time) => {
    riserFilter.frequency.linearRampToValueAtTime(3500, time + 1.2);
    riser.triggerAttackRelease(1.2, time);
  }, "3:2:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, bass, arp, pad, snareNoise, snareTone, hat, bell, riser };
  window.toneJsParts = { kickLoop, bassLoop, arpLoop, padLoop, snareLoop, hatLoop };
};