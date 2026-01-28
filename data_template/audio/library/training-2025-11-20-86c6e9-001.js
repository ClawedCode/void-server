window.initToneJsEngine = async function() {
  const bpm = 86;
  Tone.Transport.bpm.value = bpm;
  // Master space
  const masterReverb = new Tone.Reverb({ decay: 5.8, wet: 0.45 }).toDestination();
  await masterReverb.generate();
  const shimmer = new Tone.Reverb({ decay: 4.2, wet: 0.4 }).connect(masterReverb);
  await shimmer.generate();
  const delay = new Tone.FeedbackDelay({ delayTime: '4n.', feedback: 0.45, wet: 0.36 }).connect(shimmer);
  const chorus = new Tone.Chorus({ frequency: 0.32, delayTime: 4.2, depth: 0.45, wet: 0.3 }).connect(delay).start();
  // Pad
  const padFilter = new Tone.Filter({ type: 'lowpass', frequency: 1400, Q: 0.7 }).connect(chorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    detune: -6,
    envelope: { attack: 2.2, decay: 1.2, sustain: 0.68, release: 4.4 }
  }).connect(padFilter);
  const padChords = [
    ['A2', 'C#3', 'E3', 'G#3', 'B3', 'E4'], // Amaj9
    ['E2', 'G#3', 'B3', 'D#4', 'F#4'],      // Emaj9
    ['F#2', 'A3', 'C#4', 'E4'],             // F#m7 add11 vibe
    ['D3', 'F#3', 'A3', 'E4']               // D6/9 flavor
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const velocity = bar < 4 ? 0.24 : bar < 12 ? 0.32 : bar < 18 ? 0.48 : 0.3;
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], '2m', time, velocity);
    padIdx++;
  }, '2m').start(0);
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(2200, time + 10 * (60 / bpm) * 4);
  }, '2:0:0');
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1300, time + 6 * (60 / bpm) * 4);
  }, '16:0:0');
  // Arp
  const arpDelay = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.52, wet: 0.42 }).connect(shimmer);
  const arp = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.03, decay: 0.55, sustain: 0.35, release: 1.1 }
  }).connect(arpDelay);
  const arpNotes = ['A3', 'C#4', 'E4', 'A4', 'B4', 'E4', 'G#4', 'C#5', 'B4', 'A4'];
  const arpGates = ['8n', '8n', '8n', '8n', '4n', '8n', '8n', '4n', '8n', '4n'];
  let arpIdx = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 2 && bar < 18) {
      const velocity = 0.4 + Math.random() * 0.08;
      arp.triggerAttackRelease(arpNotes[arpIdx % arpNotes.length], arpGates[arpIdx % arpGates.length], time, velocity);
      arpIdx++;
    }
  }, '8n').start(0);
  // Bass
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 320, Q: 0.9 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.05, decay: 0.35, sustain: 0.4, release: 0.9 },
    filterEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.2, baseFrequency: 90, octaves: 2 }
  }).connect(bassFilter);
  const bassPattern = [
    ['A1', 'E2'],
    ['E1', 'B1'],
    ['F#1', 'C#2'],
    ['D1', 'A1']
  ];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 18) {
      const pair = bassPattern[bassIdx % bassPattern.length];
      bass.triggerAttackRelease(pair[0], '2n', time, 0.42);
      bass.triggerAttackRelease(pair[1], '4n', time + Tone.Time('4n').toSeconds(), 0.35);
      bassIdx++;
    }
  }, '2n').start(0);
  // Kick
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.004, decay: 0.45, sustain: 0, release: 0.22 }
  }).connect(masterReverb);
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 17) {
      const velocity = 0.52 + Math.random() * 0.05;
      kick.triggerAttackRelease('C1', '8n', time, velocity);
    }
  }, '2n').start(0);
  // Snare (brushed noise)
  const snareFilter = new Tone.Filter({ type: 'lowpass', frequency: 1150, Q: 0.6 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.012, decay: 0.18, sustain: 0 }
  }).connect(snareFilter);
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 17 && snareStep % 4 === 2) {
      const velocity = 0.3 + Math.random() * 0.06;
      snare.triggerAttackRelease('16n', time, velocity);
    }
    snareStep++;
  }, '2n').start(0);
  // Ambient texture
  const texture = new Tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 3.0, decay: 0, sustain: 1.0, release: 5.0 }
  }).connect(shimmer);
  Tone.Transport.schedule((time) => {
    texture.triggerAttackRelease('2m', time, 0.06);
  }, '0:0:0');
  // Orchestral swell
  const swellFilter = new Tone.Filter({ type: 'lowpass', frequency: 1800, Q: 0.7 }).connect(shimmer);
  const swell = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 3.4, decay: 1.4, sustain: 0.8, release: 5.4 }
  }).connect(swellFilter);
  Tone.Transport.schedule((time) => {
    swell.triggerAttackRelease(['A3', 'C#4', 'E4', 'G#4', 'B4', 'E5'], '4m', time, 0.52);
  }, '11:0:0');
  // Lead at peak
  const leadVerb = new Tone.Reverb({ decay: 4.0, wet: 0.48 }).connect(shimmer);
  await leadVerb.generate();
  const lead = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    portamento: 0.1,
    envelope: { attack: 0.12, decay: 0.32, sustain: 0.45, release: 1.4 }
  }).connect(leadVerb);
  const leadMelody = ['E4', 'F#4', 'A4', 'C#5', 'B4', 'A4', 'F#4', 'E4', 'C#5', 'B4'];
  const leadGates = ['2n', '4n', '4n', '2n', '4n', '4n', '2n', '2n', '4n', '2n'];
  let leadIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 12 && bar < 16) {
      lead.triggerAttackRelease(leadMelody[leadIdx % leadMelody.length], leadGates[leadIdx % leadGates.length], time, 0.5);
      leadIdx++;
    }
  }, '2n').start(0);
  // Wind-down gating to match intro (drop busy layers after bar 18)
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1100, time + 6 * (60 / bpm) * 4);
  }, '18:0:0');
  window.toneJsInstruments = { pad, arp, bass, kick, snare, texture, swell, lead };
  window.toneJsParts = { padLoop, arpLoop, bassLoop, kickLoop, snareLoop, leadLoop };
};