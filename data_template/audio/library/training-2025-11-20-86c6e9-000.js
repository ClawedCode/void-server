window.initToneJsEngine = async function() {
  const bpm = 85;
  Tone.Transport.bpm.value = bpm;
  const secondsPerBar = (60 / bpm) * 4;
  // Master space and shimmer chain
  const masterReverb = new Tone.Reverb({ decay: 5.6, wet: 0.42 }).toDestination();
  await masterReverb.generate();
  const shimmer = new Tone.Reverb({ decay: 4.2, wet: 0.42 }).connect(masterReverb);
  await shimmer.generate();
  const tapeDelay = new Tone.FeedbackDelay({ delayTime: '4n.', feedback: 0.46, wet: 0.32 }).connect(shimmer);
  const wideChorus = new Tone.Chorus({ frequency: 0.25, delayTime: 4.2, depth: 0.5, spread: 120, wet: 0.3 }).connect(tapeDelay).start();
  // Pad foundation
  const padFilter = new Tone.Filter({ type: 'lowpass', frequency: 1500, Q: 0.7 }).connect(wideChorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 2.4, decay: 1.1, sustain: 0.65, release: 4.5 }
  }).connect(padFilter);
  const padChords = [
    ['A2', 'C#3', 'E3', 'G#3', 'C#4'],   // Amaj9 feel
    ['E3', 'G#3', 'B3', 'D#4'],         // Emaj7
    ['F#2', 'A3', 'C#4', 'E4'],         // F#m7
    ['D3', 'F#3', 'A3', 'C#4']          // Dmaj7
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / secondsPerBar);
    const vel = bar < 4 ? 0.24 : bar < 10 ? 0.34 : bar < 16 ? 0.48 : 0.32;
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], '2m', time, vel);
    padIdx++;
  }, '2m').start(0);
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(2200, time + 8 * secondsPerBar);
  }, '2:0:0');
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1400, time + 4 * secondsPerBar);
  }, '16:0:0');
  // Arpeggio shimmer
  const arpDelay = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.52, wet: 0.45 }).connect(shimmer);
  const arp = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.5, sustain: 0.3, release: 1.4 }
  }).connect(arpDelay);
  const arpNotes = ['A3', 'C#4', 'E4', 'A4', 'B4', 'E4', 'C#5', 'A4'];
  const arpGates = ['8n', '8n', '8n', '8n', '4n', '8n', '8n', '4n'];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / secondsPerBar);
    if (bar >= 2 && bar < 20) {
      const vel = 0.38 + Math.random() * 0.08;
      arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], arpGates[arpIdx % arpGates.length], time, vel);
      arpIdx++;
    }
  }, '8n').start(0);
  // Warm supportive bass
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 320, Q: 0.8 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.06, decay: 0.35, sustain: 0.35, release: 0.9 }
  }).connect(bassFilter);
  const bassPattern = ['A1', 'E1', 'F#1', 'D1'];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / secondsPerBar);
    if (bar >= 6 && bar < 18) {
      bass.triggerAttackRelease(bassPattern[bassIdx % bassPattern.length], '2n', time, 0.42);
      bassIdx++;
    }
  }, '2n').start(0);
  // Gentle percussion
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.09,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.003, decay: 0.42, sustain: 0, release: 0.22 }
  }).connect(masterReverb);
  const snareFilter = new Tone.Filter({ type: 'lowpass', frequency: 1200, Q: 0.6 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.012, decay: 0.22, sustain: 0 }
  }).connect(snareFilter);
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / secondsPerBar);
    if (bar >= 8 && bar < 18) {
      const vel = 0.5 + Math.random() * 0.05;
      kick.triggerAttackRelease('C1', '8n', time, vel);
    }
  }, '2n').start(0);
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / secondsPerBar);
    if (bar >= 8 && bar < 18 && snareStep % 4 === 2) {
      const vel = 0.28 + Math.random() * 0.07;
      snare.triggerAttackRelease('16n', time, vel);
    }
    snareStep++;
  }, '2n').start(0);
  // Orchestral swell for peak
  const swellFilter = new Tone.Filter({ type: 'lowpass', frequency: 1800, Q: 0.7 }).connect(shimmer);
  const swell = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 2.8, decay: 1.6, sustain: 0.75, release: 5.2 }
  }).connect(swellFilter);
  Tone.Transport.schedule((time) => {
    swell.triggerAttackRelease(['A3', 'C#4', 'E4', 'G#4', 'B4'], '4m', time, 0.55);
  }, '12:0:0');
  // Melodic lead during peak only
  const leadReverb = new Tone.Reverb({ decay: 4.5, wet: 0.5 }).connect(shimmer);
  await leadReverb.generate();
  const lead = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.16, decay: 0.32, sustain: 0.45, release: 1.6 },
    portamento: 0.12
  }).connect(leadReverb);
  const leadNotes = ['E4', 'F#4', 'A4', 'C#5', 'B4', 'A4', 'F#4', 'E4'];
  const leadGate = ['2n', '4n', '2n', '2n', '4n', '4n', '2n', '1m'];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / secondsPerBar);
    if (bar >= 14 && bar < 18) {
      lead.triggerAttackRelease(leadNotes[leadIdx % leadNotes.length], leadGate[leadIdx % leadGate.length], time, 0.48);
      leadIdx++;
    }
  }, '2n').start(0);
  // Ambient texture bed
  const texture = new Tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 3.2, decay: 0, sustain: 1.0, release: 5.0 }
  }).connect(shimmer);
  Tone.Transport.schedule((time) => {
    texture.triggerAttackRelease('2m', time, 0.06);
  }, '0:0:0');
  // Wind-down: remove busy layers and close filters toward ending
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(220, time + 3 * secondsPerBar);
  }, '15:0:0');
  Tone.Transport.schedule((time) => {
    swellFilter.frequency.linearRampToValueAtTime(900, time + 3 * secondsPerBar);
  }, '15:0:0');
  window.toneJsInstruments = { pad, arp, bass, kick, snare, swell, lead, texture };
  window.toneJsParts = { padLoop, arpLoop, bassLoop, kickLoop, snareLoop, leadLoop };
};