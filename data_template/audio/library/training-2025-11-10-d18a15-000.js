window.initToneJsEngine = async function() {
  const bpm = 122;
  Tone.Transport.bpm.value = bpm;
  const masterReverb = new Tone.Reverb({ decay: 2.8, wet: 0.32 }).toDestination();
  await masterReverb.generate();
  const shimmerDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.38, wet: 0.27 }).connect(masterReverb);
  const shimmerChorus = new Tone.Chorus({ frequency: 2.1, delayTime: 2.8, depth: 0.55, wet: 0.35 }).connect(masterReverb).start();
  const airyDelay = new Tone.PingPongDelay({ delayTime: '16n', feedback: 0.3, wet: 0.2 }).connect(masterReverb);
  const compressor = new Tone.Compressor({ threshold: -20, ratio: 5.5, attack: 0.006, release: 0.18 }).toDestination();
  const arpFilter = new Tone.Filter({ type: 'highpass', frequency: 500, Q: 0.9 }).connect(shimmerDelay);
  const crystalArp = new Tone.FMSynth({
    harmonicity: 2.5,
    modulationIndex: 14,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0.12, release: 0.08 },
    modulation: { type: 'sawtooth' },
    modulationEnvelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.05 }
  }).connect(arpFilter);
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 220, Q: 1.3 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.22, sustain: 0.5, release: 0.2 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, baseFrequency: 140, octaves: 2.4 }
  }).connect(bassFilter);
  const padChorus = new Tone.Chorus({ frequency: 0.7, delayTime: 3.2, depth: 0.6, wet: 0.4 }).connect(shimmerChorus).start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    detune: 6,
    envelope: { attack: 0.7, decay: 0.4, sustain: 0.8, release: 2.5 }
  }).connect(padChorus).connect(compressor);
  const voicePad = new Tone.Sampler({
    urls: { A4: 'A4.mp3' },
    baseUrl: 'https://tonejs.github.io/audio/casio/'
  }).connect(airyDelay);
  const lead = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.25, sustain: 0.55, release: 0.35 },
    portamento: 0.04
  }).connect(airyDelay);
  const sparkleArp = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0.1, release: 0.07 }
  }).connect(shimmerDelay);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.06 }
  }).toDestination();
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.08 }
  }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 320,
    envelope: { attack: 0.001, decay: 0.05, release: 0.03 },
    harmonicity: 5,
    modulationIndex: 12,
    resonance: 4000
  }).toDestination();
  const perc = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.04 }
  }).connect(shimmerDelay);
  const getBar = (time) => Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
  const arpSections = [
    ['C5', 'E5', 'G5', 'B5', 'E5', 'G5', 'C5', 'G5'],
    ['F5', 'A5', 'C6', 'E6', 'A5', 'C6', 'F5', 'C6'],
    ['A4', 'C5', 'E5', 'G5', 'C5', 'E5', 'A4', 'E5'],
    ['G4', 'B4', 'D5', 'F5', 'B4', 'D5', 'G4', 'D5']
  ];
  let arpIndex = 0;
  const mainArpLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    const section = Math.min(Math.floor(bar / 4), arpSections.length - 1);
    const notes = arpSections[section];
    const velocity = bar < 4 || bar >= 26 ? 0.55 : (bar >= 16 && bar < 24 ? 0.78 : 0.65);
    crystalArp.triggerAttackRelease(notes[arpIndex % notes.length], '16n', time, velocity);
    arpIndex++;
  }, '16n').start(0);
  const sparkleLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 10 && bar < 24) {
      const pattern = ['E6', 'G6', 'C6', 'B5', 'G6', 'E6', 'D6', 'A5'];
      sparkleArp.triggerAttackRelease(pattern[arpIndex % pattern.length], '32n', time, 0.35);
    }
  }, '16n').start(0);
  const bassProg = [
    ['C2', 'C2', 'C2', 'C2'],
    ['F2', 'F2', 'F2', 'F2'],
    ['A1', 'A1', 'A1', 'A1'],
    ['G2', 'G2', 'G2', 'G2']
  ];
  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 4 && bar < 26) {
      const section = Math.floor(((bar - 4) % 16) / 4);
      const pattern = bassProg[section];
      const velocity = bar >= 16 ? 0.85 : 0.7;
      bass.triggerAttackRelease(pattern[bassIndex % pattern.length], '4n', time, velocity);
      bassIndex++;
    }
  }, '4n').start(0);
  const padLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 8 && bar < 24) {
      const chords = [
        ['C4', 'E4', 'G4'],
        ['F3', 'A3', 'C4'],
        ['A3', 'C4', 'E4'],
        ['G3', 'B3', 'D4']
      ];
      pad.triggerAttackRelease(chords[(Math.floor((bar - 8) / 4)) % chords.length], '2m', time, 0.4);
    }
  }, '2m').start(0);
  const voiceLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 12 && bar < 22) {
      const samplePitch = ['A4', 'C5', 'E5', 'G5'][bar % 4];
      voicePad.triggerAttackRelease(samplePitch, '1n', time, 0.25);
    }
  }, '1m').start(0);
  const leadMelody = [
    ['E5', 'G5', 'A5', 'G5', null, 'E5', 'D5', 'C5'],
    ['G5', 'A5', 'C6', 'A5', null, 'G5', 'E5', 'D5']
  ];
  let leadIndex = 0;
  const leadLoop = new Tone.Part((time, note) => {
    lead.triggerAttackRelease(note, '8n', time, 0.65);
  }, []).start(0);
  const leadScheduler = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 18 && bar < 24) {
      const phrase = leadMelody[Math.floor((bar - 18) / 3) % leadMelody.length];
      const note = phrase[leadIndex % phrase.length];
      if (note) {
        lead.triggerAttackRelease(note, '8n', time, 0.6);
      }
      leadIndex++;
    }
  }, '8n').start(0);
  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 4 && bar < 26) {
      const velocity = bar >= 16 ? 0.95 : 0.8;
      kick.triggerAttackRelease('C1', '8n', time, velocity);
      compressor.threshold.setValueAtTime(-30, time);
      compressor.threshold.exponentialRampToValueAtTime(-20, time + 0.18);
    }
    kickStep++;
  }, '4n').start(0);
  let clapStep = 0;
  const clapLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    const beat = clapStep % 8;
    if (bar >= 8 && bar < 24 && (beat === 2 || beat === 6)) {
      const velocity = bar >= 16 ? 0.75 : 0.6;
      clap.triggerAttackRelease('16n', time, velocity);
    }
    clapStep++;
  }, '8n').start(0);
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 8 && bar < 24) {
      const pattern = [1, 0, 1, 0, 1, 1, 0, 1];
      if (pattern[hatStep % pattern.length]) {
        const velocity = hatStep % 4 === 0 ? 0.5 : 0.35;
        hat.triggerAttackRelease('32n', time, velocity);
      }
    }
    hatStep++;
  }, '16n').start(0);
  let percStep = 0;
  const percLoop = new Tone.Loop((time) => {
    const bar = getBar(time);
    if (bar >= 14 && bar < 22) {
      const pattern = [0, 1, 0, 1, 0, 0, 1, 0];
      if (pattern[percStep % pattern.length]) {
        perc.triggerAttackRelease('32n', time, 0.3);
      }
    }
    percStep++;
  }, '16n').start(0);
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(9000, time + 8);
  }, '8:0:0');
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(4500, time + 6);
  }, '24:0:0');
  window.toneJsInstruments = { crystalArp, sparkleArp, bass, pad, voicePad, lead, kick, clap, hat, perc };
  window.toneJsParts = { mainArpLoop, sparkleLoop, bassLoop, padLoop, voiceLoop, leadLoop, leadScheduler, kickLoop, clapLoop, hatLoop, percLoop };
};