window.initToneJsEngine = async function() {
  const bpm = 92;
  const beatsPerBar = 4;
  const secondsPerBeat = 60 / bpm;
  const barsToSeconds = (bars) => bars * beatsPerBar * secondsPerBeat;
  const getBarNumber = (time) => {
    const seconds = Tone.Transport.getSecondsAtTime(time);
    return Math.floor(seconds / (secondsPerBeat * beatsPerBar));
  };
  Tone.Transport.bpm.value = bpm;
  const masterLimiter = new Tone.Limiter(-2).toDestination();
  const glueComp = new Tone.Compressor({ threshold: -26, ratio: 3, attack: 0.02, release: 0.4 }).connect(masterLimiter);
  const mixBus = new Tone.Gain(0.9).connect(glueComp);
  const padReverb = new Tone.Reverb({ decay: 2.8, preDelay: 0.04, wet: 0.32 }).connect(mixBus);
  await padReverb.generate();
  const pianoDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.32, wet: 0.22 }).connect(mixBus);
  const textureReverb = new Tone.Reverb({ decay: 3.2, wet: 0.28 }).connect(mixBus);
  await textureReverb.generate();
  const drumFilter = new Tone.Filter({ type: 'lowpass', frequency: 2400, Q: 0.5 }).connect(mixBus);
  const drumSaturation = new Tone.Distortion({ distortion: 0.18, wet: 0.25 }).connect(drumFilter);
  const padFilter = new Tone.Filter({ type: 'lowpass', frequency: 900, Q: 0.8 }).connect(mixBus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 1.2, decay: 0.5, sustain: 0.7, release: 3.5 }
  });
  pad.connect(padFilter);
  pad.connect(padReverb);
  const pianoFilter = new Tone.Filter({ type: 'lowpass', frequency: 2200, Q: 0.6 }).connect(pianoDelay);
  const pianoGain = new Tone.Gain(0.85).connect(mixBus);
  pianoFilter.connect(pianoGain);
  const piano = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.03, decay: 0.4, sustain: 0.3, release: 1.8 }
  });
  piano.connect(pianoFilter);
  piano.connect(padReverb);
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 180, Q: 1.1 }).connect(mixBus);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    filter: { type: 'lowpass', frequency: 200 },
    envelope: { attack: 0.04, decay: 0.3, sustain: 0.7, release: 1.4 },
    filterEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.1, baseFrequency: 80, octaves: 2 }
  }).connect(bassFilter);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07,
    octaves: 3,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.9, sustain: 0, release: 0.8 }
  }).connect(drumSaturation);
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.08 }
  }).connect(drumSaturation);
  const hat = new Tone.MetalSynth({
    frequency: 180,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 5,
    modulationIndex: 30,
    resonance: 3000,
    octaves: 1.5
  }).connect(drumFilter);
  const vocal = new Tone.FMSynth({
    harmonicity: 1.8,
    modulationIndex: 6,
    oscillator: { type: 'sine' },
    modulation: { type: 'triangle' },
    envelope: { attack: 0.1, decay: 1.2, sustain: 0.4, release: 2.5 },
    modulationEnvelope: { attack: 0.05, decay: 0.9, sustain: 0.2, release: 2 }
  });
  const vocalGain = new Tone.Gain(0.6).connect(mixBus);
  vocal.connect(vocalGain);
  vocal.connect(textureReverb);
  const air = new Tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 1.5, decay: 2.5, sustain: 0.15, release: 4 }
  }).connect(textureReverb);
  const padChords = [
    ['A3', 'C4', 'E4'],
    ['F3', 'A3', 'C4'],
    ['C3', 'E3', 'G3'],
    ['G3', 'B3', 'D4']
  ];
  let padStep = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = getBarNumber(time);
    const chord = padChords[padStep % padChords.length];
    let velocity = 0.42;
    if (bar >= 4 && bar < 12) velocity = 0.55;
    else if (bar >= 12 && bar < 15) velocity = 0.48;
    else if (bar >= 15) velocity = 0.4;
    pad.triggerAttackRelease(chord, '1m', time, velocity);
    padStep++;
  }, '1m').start(0);
  let bassStep = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = getBarNumber(time);
    if (bar < 4) return;
    let pattern;
    if (bar < 8) pattern = ['A1', null, 'F1', null];
    else if (bar < 14) pattern = ['A1', null, 'C2', null, 'F1', null, 'G1', null];
    else pattern = ['A1', null, 'F1', null];
    const note = pattern[bassStep % pattern.length];
    if (note) {
      const vel = bar >= 14 ? 0.6 : 0.85;
      bass.triggerAttackRelease(note, '2n', time, vel);
    }
    bassStep++;
  }, '2n').start(0);
  const pianoSequence = [null, 'E4', null, 'C4', null, null, 'D4', null, null, 'E4', 'A4', null, 'G4', null, null, 'C4'];
  let pianoStep = 0;
  const pianoLoop = new Tone.Loop((time) => {
    const bar = getBarNumber(time);
    if (bar < 2 || bar >= 15) return;
    const note = pianoSequence[pianoStep % pianoSequence.length];
    if (note) piano.triggerAttackRelease(note, '8n', time, 0.6);
    pianoStep++;
  }, '4n').start(0);
  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = getBarNumber(time);
    if (bar < 4) return;
    let pattern;
    if (bar < 10) pattern = [1, 0, 0.5, 0];
    else if (bar < 15) pattern = [1, 0.2, 0.6, 0.2];
    else pattern = [1, 0, 0, 0];
    const intensity = pattern[kickStep % pattern.length];
    if (intensity > 0) kick.triggerAttackRelease('A1', '8n', time, 0.65 * intensity);
    kickStep++;
  }, '4n').start(0);
  let hatStep = 0;
  const hatPattern = [0, 0.35, 0, 0.25, 0, 0.4, 0, 0.2];
  const hatLoop = new Tone.Loop((time) => {
    const bar = getBarNumber(time);
    if (bar >= 8 && bar < 14) {
      const amt = hatPattern[hatStep % hatPattern.length];
      if (amt > 0) hat.triggerAttackRelease('16n', time, 0.15 + amt);
      hatStep++;
    }
  }, '8n').start(0);
  let clapStep = 0;
  const clapLoop = new Tone.Loop((time) => {
    const bar = getBarNumber(time);
    if (bar >= 6 && bar < 13) {
      if (clapStep % 2 === 1) clap.triggerAttackRelease('16n', time, 0.35 + Math.random() * 0.05);
      clapStep++;
    }
  }, '2n').start(0);
  const vocalPart = new Tone.Part((time, value) => {
    vocal.triggerAttackRelease(value.note, value.duration, time, value.velocity);
  }, [
    ['6:2:0', { note: 'E4', duration: '2n', velocity: 0.35 }],
    ['7:2:0', { note: 'G4', duration: '2n', velocity: 0.32 }],
    ['9:0:0', { note: 'A4', duration: '2n', velocity: 0.38 }],
    ['10:2:0', { note: 'C5', duration: '4n', velocity: 0.3 }],
    ['12:0:0', { note: 'B4', duration: '2n', velocity: 0.28 }]
  ]).start(0);
  const airLoop = new Tone.Loop((time) => {
    const bar = getBarNumber(time);
    if (bar % 6 === 0 && bar <= 12) {
      air.triggerAttackRelease(barsToSeconds(1.5), time, 0.15);
    } else if (bar >= 13 && bar % 8 === 0 && bar < 16) {
      air.triggerAttackRelease(barsToSeconds(1), time, 0.1);
    }
  }, '1m').start(0);
  const padOpenId = Tone.Transport.schedule((time) => {
    padFilter.frequency.cancelScheduledValues(time);
    padFilter.frequency.setValueAtTime(900, time);
    padFilter.frequency.linearRampToValueAtTime(1600, time + barsToSeconds(4));
  }, '4:0:0');
  const padCloseId = Tone.Transport.schedule((time) => {
    padFilter.frequency.cancelScheduledValues(time);
    padFilter.frequency.setValueAtTime(padFilter.frequency.value, time);
    padFilter.frequency.linearRampToValueAtTime(750, time + barsToSeconds(3.5));
  }, '12:0:0');
  window.toneJsInstruments = {
    pad,
    padFilter,
    piano,
    pianoFilter,
    bass,
    bassFilter,
    kick,
    clap,
    hat,
    vocal,
    vocalGain,
    air,
    padReverb,
    pianoDelay,
    textureReverb,
    drumFilter,
    drumSaturation,
    glueComp,
    masterLimiter,
    mixBus
  };
  window.toneJsParts = {
    padLoop,
    bassLoop,
    pianoLoop,
    kickLoop,
    hatLoop,
    clapLoop,
    vocalPart,
    airLoop,
    schedules: { padOpenId, padCloseId }
  };
};