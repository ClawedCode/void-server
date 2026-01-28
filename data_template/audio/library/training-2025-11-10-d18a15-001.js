window.initToneJsEngine = async function() {
  const bpm = 122;
  Tone.Transport.bpm.value = bpm;
  const secondsPerBeat = 60 / bpm;
  const getBar = (time) => Math.floor(Tone.Transport.getSecondsAtTime(time) / (secondsPerBeat * 4));
  const masterReverb = new Tone.Reverb({ decay: 2.8, wet: 0.34 }).toDestination();
  await masterReverb.generate();
  const airyDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.4, wet: 0.28 }).connect(masterReverb);
  const pingDelay = new Tone.PingPongDelay({ delayTime: '16n', feedback: 0.38, wet: 0.25 }).connect(masterReverb);
  const compressor = new Tone.Compressor({ threshold: -24, ratio: 6, attack: 0.003, release: 0.16 }).toDestination();
  compressor.connect(masterReverb);
  const sidechainBus = new Tone.Gain().connect(compressor);
  const padWasher = new Tone.Chorus({ frequency: 0.25, delayTime: 4.5, depth: 0.7, wet: 0.45 }).connect(sidechainBus).start();
  const shimmerChorus = new Tone.Chorus({ frequency: 2.3, delayTime: 2.6, depth: 0.45, wet: 0.32 }).connect(masterReverb).start();
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.045,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.24, sustain: 0, release: 0.06 }
  }).toDestination();
  const snareFilter = new Tone.Filter({ type: 'bandpass', frequency: 2600, Q: 1.5 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.06 }
  }).connect(snareFilter);
  const hat = new Tone.MetalSynth({
    frequency: 300,
    envelope: { attack: 0.001, decay: 0.07, release: 0.02 },
    harmonicity: 5.5,
    modulationIndex: 32,
    resonance: 4500
  }).toDestination();
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 240, Q: 1.2 }).connect(sidechainBus);
  const bassDrive = new Tone.Distortion({ distortion: 0.32, wet: 0.42 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.003, decay: 0.18, sustain: 0.4, release: 0.12 },
    filterEnvelope: { attack: 0.01, decay: 0.22, sustain: 0.1, baseFrequency: 160, octaves: 2.6 }
  }).connect(bassDrive);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    detune: 7,
    envelope: { attack: 0.72, decay: 0.32, sustain: 0.82, release: 2.4 }
  }).connect(padWasher);
  const arpFilter = new Tone.Filter({ type: 'highpass', frequency: 500, Q: 0.9 }).connect(airyDelay);
  const arp = new Tone.FMSynth({
    harmonicity: 2.6,
    modulationIndex: 14,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0.1, release: 0.08 },
    modulation: { type: 'triangle' },
    modulationEnvelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.05 }
  }).connect(arpFilter);
  const shimmer = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.05, release: 0.08 }
  }).connect(shimmerChorus);
  const lead = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.4 },
    portamento: 0.04
  }).connect(pingDelay);
  const breathFilter = new Tone.Filter({ type: 'bandpass', frequency: 1100, Q: 1.1 }).connect(masterReverb);
  const breath = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.35, decay: 0.8, sustain: 0, release: 1.6 }
  }).connect(breathFilter);
  const sectionOrder = [0, 1, 2, 3];
  const arpPatterns = [
    ['C5', 'E5', 'G5', 'B5', 'G5', 'E5', 'C5', 'G5'],
    ['G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'G4', 'B4'],
    ['A4', 'C5', 'E5', 'A5', 'E5', 'C5', 'A4', 'C5'],
    ['F4', 'A4', 'C5', 'E5', 'C5', 'A4', 'F4', 'A4']
  ];
  let arpStep = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    let sectionIdx = sectionOrder[Math.floor(bar / 4) % sectionOrder.length];
    if (bar >= 26) sectionIdx = 0;
    const pattern = arpPatterns[sectionIdx];
    const velocity = bar < 4 ? 0.55 : bar < 12 ? 0.65 : bar < 18 ? 0.74 : bar < 24 ? 0.82 : bar < 26 ? 0.6 : 0.52;
    arp.triggerAttackRelease(pattern[arpStep % pattern.length], '16n', time, velocity);
    arpStep++;
  }, '16n').start(0);
  let shimmerStep = 0;
  const shimmerFigures = [
    ['E6', 'G6', 'C6', 'G6'],
    ['A5', 'C6', 'F6', 'C6'],
    ['C6', 'E6', 'A5', 'E6']
  ];
  const shimmerLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 10 || bar >= 26) return;
    const figure = shimmerFigures[Math.floor((bar - 10) / 4) % shimmerFigures.length];
    const velocity = bar < 18 ? 0.35 : bar < 24 ? 0.45 : 0.3;
    shimmer.triggerAttackRelease(figure[shimmerStep % figure.length], '32n', time, velocity);
    shimmerStep++;
  }, '16n').start(0);
  const bassSections = [
    ['C2', 'C2', 'G2', 'C2'],
    ['F2', 'F2', 'C3', 'F2'],
    ['A1', 'A2', 'E2', 'A1'],
    ['G2', 'D3', 'G2', 'D3']
  ];
  let bassStep = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 4 || bar >= 24) return;
    const section = Math.floor((bar - 4) / 4) % bassSections.length;
    const pattern = bassSections[section];
    const velocity = bar >= 18 ? 0.9 : 0.75;
    bass.triggerAttackRelease(pattern[bassStep % pattern.length], '8n', time, velocity);
    bassStep++;
  }, '8n').start(0);
  const padChords = [
    ['C4', 'E4', 'G4'],
    ['G3', 'B3', 'D4'],
    ['A3', 'C4', 'E4'],
    ['F3', 'A3', 'C4']
  ];
  const padLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 8 || bar >= 26) return;
    const chordSlot = Math.floor((bar - 8) / 2) % padChords.length;
    const velocity = bar >= 18 && bar < 24 ? 0.45 : bar >= 24 ? 0.32 : 0.36;
    pad.triggerAttackRelease(padChords[chordSlot], '2m', time, velocity);
  }, '2m').start(0);
  const kickLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 4 || bar >= 24) return;
    let velocity = 0.8;
    if (bar >= 12 && bar < 18) velocity = 0.88;
    if (bar >= 18 && bar < 24) velocity = 0.96;
    kick.triggerAttackRelease('C1', '8n', time, velocity);
    compressor.threshold.setValueAtTime(-32, time);
    compressor.threshold.exponentialRampToValueAtTime(-24, time + 0.18);
  }, '4n').start(0);
  let snareBeat = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 8 && bar < 22 && (snareBeat % 4 === 1 || snareBeat % 4 === 3)) {
      const velocity = bar >= 18 ? 0.78 : 0.68;
      snare.triggerAttackRelease('16n', time, velocity);
    }
    snareBeat++;
  }, '4n').start(0);
  let hatStep = 0;
  const hatPattern = [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0];
  const hatLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 8 || bar >= 24) return;
    if (hatPattern[hatStep % hatPattern.length]) {
      const accent = hatStep % 8 === 0;
      const velocity = accent ? 0.55 : 0.35 + Math.random() * 0.08;
      hat.triggerAttackRelease('32n', time, velocity);
    }
    hatStep++;
  }, '16n').start(0);
  const leadPhrases = [
    ['E5', 'G5', 'C6', 'B5', 'G5', 'E5', 'D5', 'E5'],
    ['G5', 'A5', 'E5', 'D5', 'C5', 'E5', 'G5', 'A5']
  ];
  let leadSection = -1;
  let leadStep = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 16 || bar >= 24) {
      leadSection = -1;
      leadStep = 0;
      return;
    }
    const section = Math.floor((bar - 16) / 4);
    if (section !== leadSection) {
      leadSection = section;
      leadStep = 0;
    }
    const phrase = leadPhrases[section % leadPhrases.length];
    const note = phrase[leadStep % phrase.length];
    const velocity = section === 0 ? 0.62 : 0.7;
    lead.triggerAttackRelease(note, '8n', time, velocity);
    leadStep++;
  }, '8n').start(0);
  const breathLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 4 && bar < 24 && bar % 6 === 4) {
      breath.triggerAttackRelease(2.2, time, 0.4);
    }
  }, '1m').start(0);
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.exponentialRampToValueAtTime(520, time + 6);
  }, '4:0:0');
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.exponentialRampToValueAtTime(260, time + 4);
  }, '20:0:0');
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(7200, time + 8);
  }, '6:0:0');
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(2400, time + 6);
  }, '24:0:0');
  window.toneJsInstruments = {
    kick,
    snare,
    hat,
    bass,
    pad,
    arp,
    shimmer,
    lead,
    breath
  };
  window.toneJsParts = {
    arpLoop,
    shimmerLoop,
    bassLoop,
    padLoop,
    kickLoop,
    snareLoop,
    hatLoop,
    leadLoop,
    breathLoop
  };
};