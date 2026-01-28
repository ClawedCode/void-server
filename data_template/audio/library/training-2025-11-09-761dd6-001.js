window.initToneJsEngine = async function() {
  const bpm = 92;
  Tone.Transport.bpm.value = bpm;
  const secondsPerBeat = 60 / bpm;
  const barDuration = secondsPerBeat * 4;
  const getBarIndex = (time) => Math.floor(Tone.Transport.getSecondsAtTime(time) / barDuration);
  const masterLimiter = new Tone.Limiter(-1).toDestination();
  const glueComp = new Tone.Compressor({
    threshold: -22,
    ratio: 3.5,
    attack: 0.01,
    release: 0.4
  }).connect(masterLimiter);
  const tapeDelay = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.25,
    wet: 0.2
  }).connect(glueComp);
  const spaceReverb = new Tone.Reverb({
    decay: 3.2,
    wet: 0.32,
    preDelay: 0.05
  }).connect(glueComp);
  await spaceReverb.generate();
  const padFilter = new Tone.Filter({ type: 'lowpass', frequency: 850, Q: 0.9 }).connect(glueComp);
  padFilter.connect(tapeDelay);
  padFilter.connect(spaceReverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 1.6, decay: 0.4, sustain: 0.7, release: 2.8 }
  }).connect(padFilter);
  const pianoBus = new Tone.Gain(0.8).connect(glueComp);
  pianoBus.connect(spaceReverb);
  pianoBus.connect(tapeDelay);
  const piano = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.5, sustain: 0.22, release: 1.8 }
  }).connect(pianoBus);
  const vocalBus = new Tone.Gain(0.5).connect(glueComp);
  vocalBus.connect(spaceReverb);
  const vocal = new Tone.FMSynth({
    modulationIndex: 10,
    harmonicity: 1.8,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 1.2, sustain: 0.4, release: 2 },
    modulation: { type: 'triangle' },
    modulationEnvelope: { attack: 0.2, decay: 0.8, sustain: 0.3, release: 1.5 }
  }).connect(vocalBus);
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 220, Q: 1.2 }).connect(glueComp);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.4, sustain: 0.82, release: 1.4 }
  }).connect(bassFilter);
  const drumFilter = new Tone.Filter({ type: 'lowpass', frequency: 1600, Q: 0.7 }).connect(glueComp);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 3,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.9, sustain: 0, release: 1.1 }
  }).connect(drumFilter);
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.08 }
  }).connect(drumFilter);
  const hat = new Tone.MetalSynth({
    frequency: 180,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 5,
    modulationIndex: 18,
    resonance: 2500,
    octaves: 1
  }).connect(spaceReverb);
  const textureNoise = new Tone.Noise('brown');
  const textureGain = new Tone.Gain(0.015).connect(glueComp);
  const textureFilter = new Tone.Filter({ type: 'highpass', frequency: 400 }).connect(spaceReverb);
  textureNoise.connect(textureGain);
  textureGain.connect(textureFilter);
  textureNoise.start();
  const padChords = [
    ['A3', 'C4', 'E4', 'A4'],
    ['F3', 'A3', 'C4', 'E4'],
    ['C3', 'E3', 'G3', 'C4'],
    ['G3', 'B3', 'D4', 'G4']
  ];
  let padStep = 0;
  const padLoop = new Tone.Loop((time) => {
    pad.triggerAttackRelease(padChords[padStep % padChords.length], '1n', time, 0.6);
    padStep++;
  }, '1n').start(0);
  const pianoPattern = [
    null,
    { note: 'E4', duration: '8n', velocity: 0.45 },
    null,
    { note: 'C4', duration: '4n', velocity: 0.4 },
    null,
    { note: 'D4', duration: '8n', velocity: 0.42 },
    null,
    null,
    null,
    { note: 'E4', duration: '8n', velocity: 0.5 },
    { note: 'A4', duration: '4n', velocity: 0.48 },
    null,
    { note: 'G4', duration: '8n', velocity: 0.43 },
    null,
    { note: 'E4', duration: '4n', velocity: 0.44 },
    null
  ];
  let pianoStep = 0;
  const pianoLoop = new Tone.Loop((time) => {
    const bar = getBarIndex(time);
    if (bar >= 2 && bar < 14) {
      const event = pianoPattern[pianoStep % pianoPattern.length];
      if (event) {
        piano.triggerAttackRelease(event.note, event.duration, time, event.velocity);
      }
    } else if (bar >= 14 && bar < 16) {
      if (pianoStep % 8 === 0) {
        piano.triggerAttackRelease('C4', '4n', time, 0.3);
      }
    }
    pianoStep++;
  }, '4n').start(0);
  const bassSections = {
    intro: ['A1', null],
    build: ['A1', null, 'F1', null, 'C2', null, 'G1', null],
    outro: ['A1', null, 'F1', null]
  };
  let bassStep = 0;
  let lastBassSection = '';
  const bassLoop = new Tone.Loop((time) => {
    const bar = getBarIndex(time);
    let section;
    if (bar < 4) section = 'intro';
    else if (bar < 12) section = 'build';
    else section = 'outro';
    if (section !== lastBassSection) {
      bassStep = 0;
      lastBassSection = section;
    }
    const pattern = bassSections[section];
    const note = pattern[bassStep % pattern.length];
    if (note) {
      const vel = bar < 12 ? 0.85 : 0.6;
      bass.triggerAttackRelease(note, '1n', time, vel);
    }
    bassStep++;
  }, '2n').start(0);
  const kickPattern = [1, 0, 0, 0, 1, 0, 0, 0];
  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = getBarIndex(time);
    if (bar >= 4 && bar < 16) {
      if (kickPattern[kickStep % kickPattern.length]) {
        const vel = bar < 12 ? 0.72 : 0.55;
        kick.triggerAttackRelease('A1', '8n', time, vel);
      }
    }
    kickStep++;
  }, '8n').start(0);
  const snareLoop = new Tone.Loop((time) => {
    const bar = getBarIndex(time);
    if (bar >= 6 && bar < 14) {
      const offset = Tone.Time('2n').toSeconds();
      snare.triggerAttackRelease('16n', time + offset, 0.24);
    }
  }, '1n').start(0);
  const hatPattern = [0, 1, 0, 0, 1, 0, 0, 1];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = getBarIndex(time);
    if (bar >= 8 && bar < 14) {
      if (hatPattern[hatStep % hatPattern.length]) {
        const vel = 0.18 + Math.random() * 0.08;
        hat.triggerAttackRelease('32n', time, vel);
      }
    }
    hatStep++;
  }, '8n').start(0);
  const vocalEvents = [
    { time: '6:0:0', note: 'C4', duration: '2n', velocity: 0.35 },
    { time: '7:2:0', note: 'E4', duration: '2n', velocity: 0.3 },
    { time: '9:0:0', note: 'G4', duration: '2n', velocity: 0.32 },
    { time: '10:2:0', note: 'D4', duration: '2n', velocity: 0.28 },
    { time: '12:0:0', note: 'B3', duration: '1n', velocity: 0.25 }
  ];
  const vocalPart = new Tone.Part((time, event) => {
    vocal.triggerAttackRelease(event.note, event.duration, time, event.velocity);
  }, vocalEvents).start(0);
  vocalPart.loop = true;
  vocalPart.loopEnd = '18:0:0';
  const padOpenEvent = Tone.Transport.schedule((time) => {
    padFilter.frequency.cancelAndHoldAtTime(time);
    padFilter.frequency.linearRampToValueAtTime(1500, time + 4 * barDuration);
  }, '4:0:0');
  const padCloseEvent = Tone.Transport.schedule((time) => {
    padFilter.frequency.cancelAndHoldAtTime(time);
    padFilter.frequency.linearRampToValueAtTime(700, time + 4 * barDuration);
  }, '13:0:0');
  const bassCloseEvent = Tone.Transport.schedule((time) => {
    bassFilter.frequency.cancelAndHoldAtTime(time);
    bassFilter.frequency.linearRampToValueAtTime(140, time + 3 * barDuration);
  }, '13:2:0');
  window.toneJsInstruments = {
    pad,
    piano,
    vocal,
    bass,
    kick,
    snare,
    hat,
    textureNoise,
    padFilter,
    bassFilter,
    drumFilter,
    tapeDelay,
    spaceReverb,
    glueComp,
    masterLimiter
  };
  window.toneJsParts = {
    padLoop,
    pianoLoop,
    bassLoop,
    kickLoop,
    snareLoop,
    hatLoop,
    vocalPart
  };
  window.toneJsEvents = {
    padOpenEvent,
    padCloseEvent,
    bassCloseEvent
  };
};