window.initToneJsEngine = async function() {
  const bpm = 82;
  Tone.Transport.bpm.value = bpm;
  
  const masterReverb = new Tone.Reverb({ decay: 2.8, wet: 0.35 }).toDestination();
  await masterReverb.generate();
  
  const compressor = new Tone.Compressor({ threshold: -20, ratio: 10, attack: 0.003, release: 0.18 }).toDestination();
  
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.028,
    octaves: 7,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.02 }
  }).toDestination();
  
  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease('C1', '8n', time, 1.0);
    compressor.threshold.setValueAtTime(-32, time);
    compressor.threshold.exponentialRampToValueAtTime(-20, time + 0.18);
  }, '4n').start(0);
  
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 140, Q: 1.4 }).connect(compressor);
  const bassDistortion = new Tone.Distortion({ distortion: 0.35, wet: 0.3 }).connect(bassFilter);
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.06 }
  }).connect(bassDistortion);
  
  const bassPatterns = [
    ['A1', 'A1', 'A1', 'A1'],
    ['A1', 'A1', 'F1', 'G1'],
    ['A1', 'C2', 'A1', 'G1'],
    ['F1', 'G1', 'A1', 'A2']
  ];
  
  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      const sectionPattern = bassPatterns[Math.floor(bar / 4) % bassPatterns.length];
      const beatInPattern = Math.floor((Tone.Transport.getSecondsAtTime(time) / (60 / bpm)) % 4);
      bass.triggerAttackRelease(sectionPattern[beatInPattern], '8n', time, 0.85);
    }
    bassIndex++;
  }, '8n').start(0);
  
  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(280, time + 4 * (60 / bpm) * 4);
  }, '8:0:0');
  
  const arpFilter = new Tone.Filter({ type: 'lowpass', frequency: 600, Q: 1.3 }).connect(compressor);
  const arpChorus = new Tone.Chorus({ frequency: 0.15, delayTime: 4, depth: 0.4, wet: 0.25 }).connect(arpFilter).start();
  const arp = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0, release: 0.05 }
  }).connect(arpChorus);
  
  let arpStep = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const root = ['A3', 'F3', 'G3', 'C4'][Math.floor(bar / 2) % 4];
    const rootMidi = Tone.Frequency(root).toMidi();
    const scale = [0, 3, 5, 7, 12, 15, 17, 19];
    const degree = scale[arpStep % scale.length];
    const note = Tone.Frequency(rootMidi + degree, 'midi');
    const shouldPlay = Math.random() > 0.2;
    if (shouldPlay && bar >= 2) {
      const velocity = 0.4 + Math.random() * 0.25;
      arp.triggerAttackRelease(note, '16n', time, velocity);
    }
    arpStep++;
  }, '16n').start(0);
  
  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(2200, time + 4 * (60 / bpm) * 4);
  }, '4:0:0');
  
  const padHPF = new Tone.Filter({ type: 'highpass', frequency: 180 }).connect(compressor);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    detune: -6,
    envelope: { attack: 0.8, decay: 0.4, sustain: 0.6, release: 1.8 }
  }).connect(padHPF);
  
  const padChords = [
    ['A3', 'C4', 'E4'],
    ['F3', 'A3', 'C4'],
    ['G3', 'B3', 'D4'],
    ['C4', 'E4', 'G4']
  ];
  
  let chordIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      pad.triggerAttackRelease(padChords[chordIndex % padChords.length], '2n', time, 0.15);
    }
    chordIndex++;
  }, '2n').start(0);
  
  const bellReverb = new Tone.Reverb({ decay: 4.5, wet: 0.7 }).toDestination();
  await bellReverb.generate();
  const bell = new Tone.FMSynth({
    harmonicity: 3.8,
    modulationIndex: 14,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 3.5, sustain: 0 },
    modulation: { type: 'sine' }
  }).connect(bellReverb);
  
  const bellNotes = ['A4', 'C5', 'E5', 'A5', 'G5', 'E5'];
  let bellIndex = 0;
  const bellLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && Math.random() > 0.65) {
      bell.triggerAttackRelease(bellNotes[bellIndex % bellNotes.length], '4n', time, 0.35);
      bellIndex++;
    }
  }, '4n').start(0);
  
  const hatFilter = new Tone.Filter({ type: 'highpass', frequency: 800 }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 380,
    envelope: { attack: 0.001, decay: 0.15, release: 0.04 },
    harmonicity: 5.3,
    modulationIndex: 30,
    resonance: 3800
  }).connect(hatFilter);
  
  let beatCount = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    const pattern = [1, 0, 1, 0, 1, 0, 1, 1];
    if (bar >= 8 && pattern[beatCount % pattern.length]) {
      const velocity = 0.25 + Math.random() * 0.2;
      hat.triggerAttackRelease('16n', time, velocity);
    }
    beatCount++;
  }, '8n').start(0);
  
  const noiseHPF = new Tone.Filter({ type: 'highpass', frequency: 800 }).connect(masterReverb);
  const noise = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.5, decay: 0.3, sustain: 0, release: 0.8 }
  }).connect(noiseHPF);
  
  Tone.Transport.schedule((time) => {
    noiseHPF.frequency.linearRampToValueAtTime(4000, time + 1.2);
    noise.triggerAttackRelease(1.2, time);
  }, '7:3:0');
  
  Tone.Transport.schedule((time) => {
    noiseHPF.frequency.linearRampToValueAtTime(5500, time + 1.5);
    noise.triggerAttackRelease(1.5, time);
  }, '15:2:0');
  
  window.toneJsInstruments = { kick, bass, arp, pad, bell, hat, noise };
  window.toneJsParts = { kickLoop, bassLoop, arpLoop, padLoop, bellLoop, hatLoop };
};