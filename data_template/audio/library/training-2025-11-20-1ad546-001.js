window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;
  const masterReverb = new Tone.Reverb({ decay: 3.6, wet: 0.32 }).toDestination();
  await masterReverb.generate();
  const tapeDelay = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.32, wet: 0.22 }).connect(masterReverb);
  const analogChorus = new Tone.Chorus({ frequency: 0.28, delayTime: 4.2, depth: 0.4, wet: 0.32 }).connect(tapeDelay).start();
  const padFilter = new Tone.Filter({ type: 'lowpass', frequency: 1100, Q: 0.6 }).connect(analogChorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    detune: -6,
    envelope: { attack: 1.2, decay: 0.8, sustain: 0.65, release: 3.2 }
  }).connect(padFilter);
  const padChords = [
    ['D3', 'F#3', 'A3', 'D4'],
    ['A2', 'E3', 'A3', 'C#4'],
    ['G2', 'D3', 'G3', 'B3'],
    ['B2', 'F#3', 'B3', 'D4']
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const vel = 0.28 + Math.random() * 0.05;
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], '2m', time, vel);
    padIdx++;
  }, '2m').start(0);
  const rhodesChorus = new Tone.Chorus({ frequency: 1.05, delayTime: 3.8, depth: 0.52, wet: 0.42 }).connect(analogChorus).start();
  const rhodes = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.04, decay: 0.35, sustain: 0.22, release: 0.9 }
  }).connect(rhodesChorus);
  const melodyNotes = ['D4', 'F#4', 'A4', 'F#4', 'E4', 'D4', 'B3', 'A3', 'E4', 'D4'];
  const melodyDurations = ['8n', '8n', '4n', '8n', '8n', '4n', '8n', '8n', '4n', '2n'];
  let melodyIdx = 0;
  const melodyLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 16) {
      const vel = 0.5 + Math.random() * 0.12;
      rhodes.triggerAttackRelease(
        melodyNotes[melodyIdx % melodyNotes.length],
        melodyDurations[melodyIdx % melodyDurations.length],
        time,
        vel
      );
      melodyIdx++;
    }
  }, '8n').start(0);
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 260, Q: 0.8 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    detune: -4,
    envelope: { attack: 0.06, decay: 0.32, sustain: 0.18, release: 0.6 }
  }).connect(bassFilter);
  const bassPattern = ['D2', 'A1', 'B1', 'G1', 'D2', 'A1', 'E2', 'G1'];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 17) {
      const vel = 0.52 + Math.random() * 0.08;
      bass.triggerAttackRelease(bassPattern[bassIdx % bassPattern.length], '4n', time, vel);
      bassIdx++;
    }
  }, '4n').start(0);
  const kickFilter = new Tone.Filter({ type: 'lowpass', frequency: 260, Q: 0.4 }).connect(masterReverb);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 3,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 0.28, sustain: 0, release: 0.18 }
  }).connect(kickFilter);
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 17) {
      const vel = 0.62 + Math.random() * 0.08;
      kick.triggerAttackRelease('C1', '8n', time, vel);
    }
  }, '4n').start(0);
  const snareFilter = new Tone.Filter({ type: 'lowpass', frequency: 900, Q: 0.5 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.008, decay: 0.14, sustain: 0 }
  }).connect(snareFilter);
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 17 && snareStep % 2 === 1) {
      const vel = 0.34 + Math.random() * 0.1;
      snare.triggerAttackRelease('16n', time, vel);
    }
    snareStep++;
  }, '4n').start(0);
  const hatFilter = new Tone.Filter({ type: 'highpass', frequency: 3800, Q: 0.4 }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 240,
    envelope: { attack: 0.001, decay: 0.07, release: 0.02 },
    harmonicity: 6.2,
    modulationIndex: 20,
    resonance: 4200
  }).connect(hatFilter);
  const hatPattern = [1, 0, 1, 0, 1, 0, 0, 1];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 16 && hatPattern[hatStep % hatPattern.length]) {
      const vel = 0.16 + Math.random() * 0.08;
      hat.triggerAttackRelease('16n', time, vel);
    }
    hatStep++;
  }, '8n').start(0);
  const texture = new Tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 2.5, decay: 0, sustain: 1, release: 4 }
  }).connect(masterReverb);
  Tone.Transport.schedule((time) => {
    texture.triggerAttackRelease('1m', time, 0.1);
  }, '0:0:0');
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1900, time + 8 * (60 / bpm) * 4);
  }, '4:0:0');
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(2400, time + 6 * (60 / bpm) * 4);
  }, '8:0:0');
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1100, time + 4 * (60 / bpm) * 4);
  }, '16:0:0');
  window.toneJsInstruments = { pad, rhodes, bass, kick, snare, hat, texture };
  window.toneJsParts = { padLoop, melodyLoop, bassLoop, kickLoop, snareLoop, hatLoop };
};