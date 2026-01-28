window.initToneJsEngine = async function() {
  const bpm = 118;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).toDestination();
  await masterReverb.generate();

  const sideChainComp = new Tone.Compressor({ threshold: -24, ratio: 8, attack: 0.002, release: 0.18 }).toDestination();

  // === KICK (tight, punchy, Tron-style) ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 8,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.02 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 1.0);
    sideChainComp.threshold.setValueAtTime(-35, time);
    sideChainComp.threshold.exponentialRampToValueAtTime(-24, time + 0.18);
  }, "4n").start(0);

  // === SUB BASS (smooth sine, pumping) ===
  const subBass = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.1 }
  }).connect(sideChainComp);

  const bassNotes = ["C1", "C1", "G0", "G0", "A#0", "A#0", "D#1", "C1"];
  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2) {
      subBass.triggerAttackRelease(bassNotes[bassIndex % bassNotes.length], "4n", time, 0.85);
      bassIndex++;
    }
  }, "4n").start(0);

  // === LEAD SYNTH (bright sawtooth, filtered, iconic Daft Punk tone) ===
  const leadFilter = new Tone.Filter({ type: "lowpass", frequency: 1200, Q: 2.5 }).connect(sideChainComp);
  const leadDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.25, wet: 0.2 }).connect(leadFilter);
  const lead = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.4, release: 0.3 }
  }).connect(leadDelay);

  const leadMelody = [
    { time: 0, notes: ["C4", "E4", "G4"], duration: "2n" },
    { time: 2, notes: ["D4", "F4", "A4"], duration: "2n" },
    { time: 4, notes: ["A#3", "D4", "F4"], duration: "2n" },
    { time: 6, notes: ["G3", "B3", "D4"], duration: "2n" }
  ];

  let leadBar = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 14) {
      const pattern = leadMelody[leadBar % leadMelody.length];
      lead.triggerAttackRelease(pattern.notes, pattern.duration, time, 0.5);
      leadBar++;
    }
  }, "2n").start(0);

  // === ARP (16th note sequencer, crystalline) ===
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 1.8 }).connect(sideChainComp);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
  }).connect(arpFilter);

  const arpPattern = ["C5", "E5", "G5", "C6", "B5", "G5", "E5", "C5", "D5", "F5", "A5", "D6", "C6", "A5", "F5", "D5"];
  let arpIndex = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 15) {
      arp.triggerAttackRelease(arpPattern[arpIndex % arpPattern.length], "16n", time, 0.6);
    }
    arpIndex++;
  }, "16n").start(0);

  // === PAD (lush orchestra strings, sweeping) ===
  const padChorus = new Tone.Chorus({ frequency: 0.3, delayTime: 4, depth: 0.6, wet: 0.4 }).connect(masterReverb);
  padChorus.start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.7, release: 2.0 }
  }).connect(padChorus);

  const padChords = [
    ["C3", "E3", "G3", "C4"],
    ["G2", "B2", "D3", "G3"],
    ["A#2", "D3", "F3", "A#3"],
    ["D#3", "G3", "A#3", "D#4"]
  ];

  let padIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 1 && bar < 16) {
      pad.triggerAttackRelease(padChords[padIndex % padChords.length], "1n", time, 0.25);
      padIndex++;
    }
  }, "1n").start(0);

  // === METALLIC HATS (crisp, filtered) ===
  const hatHPF = new Tone.Filter({ type: "highpass", frequency: 4000 }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 6.2,
    modulationIndex: 28,
    resonance: 3500
  }).connect(hatHPF);

  let hatBeat = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const pattern = [0, 1, 0, 1, 0, 1, 0, 1];
    if (bar >= 8 && bar < 16 && pattern[hatBeat % pattern.length]) {
      hat.triggerAttackRelease("16n", time, 0.45);
    }
    hatBeat++;
  }, "8n").start(0);

  // === FM BELLS (glossy accents) ===
  const bell = new Tone.FMSynth({
    harmonicity: 4.2,
    modulationIndex: 14,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 1.8, sustain: 0, release: 1.5 },
    modulation: { type: "sine" }
  }).connect(masterReverb);

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("C6", "4n", time, 0.4);
  }, "7:3:2");

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("G6", "4n", time, 0.35);
  }, "11:1:0");

  // === FILTER AUTOMATION ===
  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(3200, time + 6 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(2800, time + 4 * (60 / bpm) * 4);
  }, "8:0:0");

  Tone.Transport.schedule((time) => {
    leadFilter.frequency.linearRampToValueAtTime(1200, time + 3 * (60 / bpm) * 4);
  }, "14:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(800, time + 2 * (60 / bpm) * 4);
  }, "15:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { kick, subBass, lead, arp, pad, hat, bell };
  window.toneJsParts = { kickLoop, bassLoop, leadLoop, arpLoop, padLoop, hatLoop };
};