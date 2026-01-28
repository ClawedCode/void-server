window.initToneJsEngine = async function() {
  const bpm = 122;
  Tone.Transport.bpm.value = bpm;
  const secondsPerBar = (60 / bpm) * 4;
  const getBar = (time) => Math.floor(Tone.Transport.getSecondsAtTime(time) / secondsPerBar);
  const compressor = new Tone.Compressor({ threshold: -24, ratio: 7, attack: 0.003, release: 0.18 }).toDestination();
  const mixBus = new Tone.Gain().connect(compressor);
  const masterReverb = new Tone.Reverb({ decay: 2.8, preDelay: 0.03, wet: 0.45 }).connect(mixBus);
  await masterReverb.generate();
  const shimmerDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.42, wet: 0.35 }).connect(masterReverb);
  const haloDelay = new Tone.PingPongDelay({ delayTime: '16n', feedback: 0.34, wet: 0.24 }).connect(masterReverb);
  const glossChorus = new Tone.Chorus({ frequency: 1.8, delayTime: 3.1, depth: 0.55, wet: 0.38 }).connect(masterReverb).start();
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.05 }
  }).connect(mixBus);
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 230, Q: 1.5 }).connect(mixBus);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.008, decay: 0.22, sustain: 0.4, release: 0.18 },
    filterEnvelope: { attack: 0.005, decay: 0.16, sustain: 0.2, baseFrequency: 80, octaves: 4 }
  }).connect(bassFilter);
  const arp = new Tone.FMSynth({
    harmonicity: 3.2,
    modulationIndex: 15,
    oscillator: { type: 'sine' },
    modulation: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0.08, release: 0.05 },
    modulationEnvelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 }
  });
  const arpFilter = new Tone.Filter({ type: 'highpass', frequency: 420, Q: 1.2 }).connect(shimmerDelay);
  arp.connect(arpFilter);
  const arpDry = new Tone.Gain(0.32).connect(mixBus);
  arp.connect(arpDry);
  const sparkle = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.03, release: 0.04 }
  });
  sparkle.volume.value = -6;
  const sparkleFilter = new Tone.Filter({ type: 'bandpass', frequency: 1900, Q: 1.4 }).connect(haloDelay);
  sparkle.connect(sparkleFilter);
  const sparkleDry = new Tone.Gain(0.18).connect(mixBus);
  sparkle.connect(sparkleDry);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    detune: 8,
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.75, release: 2.6 }
  });
  pad.connect(glossChorus);
  const padDry = new Tone.Gain(0.28).connect(mixBus);
  pad.connect(padDry);
  const lead = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.24, sustain: 0.5, release: 0.45 },
    portamento: 0.03
  });
  lead.connect(haloDelay);
  const leadDry = new Tone.Gain(0.25).connect(mixBus);
  lead.connect(leadDry);
  const snareFilter = new Tone.Filter({ type: 'bandpass', frequency: 2000, Q: 2.2 }).connect(mixBus);
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.11, sustain: 0, release: 0.05 }
  }).connect(snareFilter);
  const hat = new Tone.MetalSynth({
    frequency: 320,
    envelope: { attack: 0.001, decay: 0.09, release: 0.03 },
    harmonicity: 5.8,
    modulationIndex: 34,
    resonance: 5600
  }).connect(mixBus);
  hat.volume.value = -8;
  const noiseFilter = new Tone.Filter({ type: 'highpass', frequency: 650, Q: 0.8 }).connect(masterReverb);
  const noise = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.25, decay: 1.5, sustain: 0, release: 0.8 }
  }).connect(noiseFilter);
  const arpPatterns = [
    ['C5', 'E5', 'G5', 'B5', 'G5', 'E5', 'D5', 'G5'],
    ['F5', 'A5', 'C6', 'E6', 'C6', 'A5', 'G5', 'A5'],
    ['A4', 'C5', 'E5', 'G5', 'E5', 'C5', 'D5', 'F5'],
    ['G4', 'B4', 'D5', 'F5', 'D5', 'B4', 'C5', 'E5']
  ];
  let arpStep = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    let patternIndex;
    if (bar < 6) patternIndex = 0;
    else if (bar < 12) patternIndex = 1;
    else if (bar < 20) patternIndex = 2;
    else if (bar < 24) patternIndex = 3;
    else patternIndex = 0;
    const velocity = bar < 4 ? 0.55 : bar < 16 ? 0.74 : bar < 24 ? 0.8 : 0.58;
    const pattern = arpPatterns[patternIndex];
    arp.triggerAttackRelease(pattern[arpStep % pattern.length], '16n', time, velocity);
    arpStep++;
  }, '16n').start(0);
  let sparkleStep = 0;
  const sparklePattern = ['G6', 'E6', 'C6', 'E6', 'A5', 'E6', 'D6', 'E6'];
  const sparkleLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 10 || bar >= 24) return;
    if (bar >= 22 && sparkleStep % 2 === 1) {
      sparkleStep++;
      return;
    }
    const accent = bar >= 16 ? 0.5 : 0.35;
    sparkle.triggerAttackRelease(sparklePattern[sparkleStep % sparklePattern.length], '16n', time, accent);
    sparkleStep++;
  }, '16n').start(0);
  const bassSections = [
    ['C2', 'C2', 'E2', 'G2', 'C2', 'G2', 'E2', 'G1'],
    ['F2', 'F2', 'C2', 'F2', 'A1', 'F2', 'G2', 'C2'],
    ['A1', 'A1', 'E2', 'A1', 'G2', 'D2', 'F2', 'C2']
  ];
  let bassStep = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 4 || bar >= 25) return;
    let section;
    if (bar < 12) section = bassSections[0];
    else if (bar < 20) section = bassSections[1];
    else section = bassSections[2];
    if (bar >= 22 && bassStep % 2 === 0) {
      bassStep++;
      return;
    }
    const drive = bar >= 16 ? 0.85 : 0.72;
    bass.triggerAttackRelease(section[bassStep % section.length], '8n', time, drive);
    bassStep++;
  }, '8n').start(0);
  const kickLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 4 || bar >= 25) return;
    const punch = bar >= 16 ? 0.95 : bar >= 8 ? 0.88 : 0.8;
    kick.triggerAttackRelease('C1', '8n', time, punch);
    compressor.threshold.setValueAtTime(-36, time);
    compressor.threshold.linearRampToValueAtTime(-24, time + 0.16);
  }, '4n').start(0);
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    const beat = snareStep % 4;
    if (bar >= 8 && bar < 24 && (beat === 1 || beat === 3)) {
      const snap = bar >= 16 ? 0.78 : 0.65;
      snare.triggerAttackRelease('16n', time, snap);
    }
    snareStep++;
  }, '4n').start(0);
  const hatPattern = [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 8 || bar >= 24) return;
    if (bar >= 22 && hatStep % 2 === 0) {
      hatStep++;
      return;
    }
    if (hatPattern[hatStep % hatPattern.length]) {
      const vel = hatStep % 8 === 6 ? 0.55 : 0.35;
      hat.triggerAttackRelease('32n', time, vel);
    }
    hatStep++;
  }, '16n').start(0);
  const chords = [
    ['C4', 'E4', 'G4'],
    ['F3', 'C4', 'A4'],
    ['A3', 'E4', 'C5'],
    ['G3', 'B3', 'D4']
  ];
  let padIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 10 || bar >= 24) return;
    const chord = chords[padIndex % chords.length];
    const sustain = bar >= 18 ? '1m' : '2n';
    const vel = bar >= 16 ? 0.42 : 0.32;
    pad.triggerAttackRelease(chord, sustain, time, vel);
    padIndex++;
  }, '1m').start(0);
  const leadPhrases = [
    ['E5', 'G5', 'A5', null, 'G5', 'E5', 'D5', 'C5'],
    ['G5', 'A5', 'C6', 'B5', 'A5', null, 'G5', 'E5']
  ];
  let leadStep = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar < 16 || bar >= 22) return;
    const phrase = leadPhrases[Math.floor((bar - 16) / 2) % leadPhrases.length];
    const note = phrase[leadStep % phrase.length];
    if (note) {
      lead.triggerAttackRelease(note, '8n', time, 0.58);
    }
    leadStep++;
  }, '8n').start(0);
  const breathLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 6 && bar < 22 && (bar === 6 || bar === 14 || bar === 20)) {
      noiseFilter.frequency.cancelScheduledValues(time);
      noiseFilter.frequency.setValueAtTime(700, time);
      noiseFilter.frequency.linearRampToValueAtTime(2800, time + 1.5);
      noise.triggerAttackRelease(1.6, time, 0.5);
    }
  }, '1m').start(0);
  const arpLiftOne = Tone.Transport.schedule((time) => {
    arpFilter.frequency.cancelScheduledValues(time);
    arpFilter.frequency.exponentialRampToValueAtTime(1800, time + 6);
  }, '4:0:0');
  const arpLiftTwo = Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(5200, time + 8);
  }, '12:0:0');
  const arpReturn = Tone.Transport.schedule((time) => {
    arpFilter.frequency.exponentialRampToValueAtTime(600, time + 6);
  }, '22:0:0');
  window.toneJsInstruments = {
    kick,
    bass,
    arp,
    sparkle,
    pad,
    lead,
    snare,
    hat,
    noise
  };
  window.toneJsParts = {
    arpLoop,
    sparkleLoop,
    bassLoop,
    kickLoop,
    snareLoop,
    hatLoop,
    padLoop,
    leadLoop,
    breathLoop
  };
  window.toneJsEvents = [arpLiftOne, arpLiftTwo, arpReturn];
};