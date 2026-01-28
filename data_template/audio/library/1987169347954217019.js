window.initToneJsEngine = async function() {
  const bpm = 74;
  Tone.Transport.bpm.value = bpm;

  const masterReverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).toDestination();
  await masterReverb.generate();

  const compressor = new Tone.Compressor({ threshold: -22, ratio: 8, attack: 0.005, release: 0.18 }).toDestination();

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.04 }
  }).toDestination();

  const kickLoop = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C1", "8n", time, 0.95);
    compressor.threshold.setValueAtTime(-35, time);
    compressor.threshold.exponentialRampToValueAtTime(-22, time + 0.18);
  }, "4n").start(0);

  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 180, Q: 1.5 }).connect(compressor);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0, release: 0.06 }
  }).connect(bassFilter);

  const bassSections = [
    ["C2", "C2", "C2", "G1"],
    ["C2", "D#2", "C2", "G1", "A#1", "G1"],
    ["C2", "C2", "G1", "G1"],
    ["C2", "C2", "C2", "G1"]
  ];

  let bassIndex = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    let pattern;
    if (bar < 2) pattern = bassSections[0];
    else if (bar < 4) pattern = bassSections[1];
    else if (bar < 7) pattern = bassSections[2];
    else if (bar < 9) pattern = bassSections[3];
    else pattern = bassSections[0];

    if (bar >= 2) {
      bass.triggerAttackRelease(pattern[bassIndex % pattern.length], "8n", time, 0.85);
    }
    bassIndex++;
  }, "8n").start(0);

  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(600, time + 3 * (60 / bpm) * 4);
  }, "4:0:0");

  Tone.Transport.schedule((time) => {
    bassFilter.frequency.linearRampToValueAtTime(180, time + 2 * (60 / bpm) * 4);
  }, "7:0:0");

  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 1.8 }).connect(compressor);
  const arp = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.004, decay: 0.1, sustain: 0, release: 0.05 }
  }).connect(arpFilter);

  let step = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    if (bar >= 3 && bar < 8) {
      const rootMidi = 60;
      const scale = [0, 2, 3, 7, 10, 12, 15, 19];
      const degree = scale[step % scale.length];
      const octaveJump = Math.floor(step / scale.length) * 12;

      const note = Tone.Frequency(rootMidi + degree + octaveJump, "midi");
      const velocity = 0.5 + (bar - 3) * 0.04;
      arp.triggerAttackRelease(note, "16n", time, velocity);
    }
    step++;
  }, "16n").start(0);

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(2200, time + 3 * (60 / bpm) * 4);
  }, "4:0:0");

  Tone.Transport.schedule((time) => {
    arpFilter.frequency.linearRampToValueAtTime(400, time + 1.5 * (60 / bpm) * 4);
  }, "7:2:0");

  const padHPF = new Tone.Filter({ type: "highpass", frequency: 350 }).connect(compressor);
  const padChorus = new Tone.Chorus({ frequency: 0.08, delayTime: 4, depth: 0.6, wet: 0.4 }).connect(padHPF).start();
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: -12,
    envelope: { attack: 0.8, decay: 0.5, sustain: 0.6, release: 1.8 }
  }).connect(padChorus);

  const padChords = [
    ["C3", "G3", "C4"],
    ["A#2", "F3", "A#3"],
    ["G2", "D3", "G3"],
    ["C3", "G3", "C4"]
  ];

  let chordIndex = 0;
  const padLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    if (bar >= 1) {
      const velocity = bar < 8 ? 0.14 : 0.11;
      pad.triggerAttackRelease(padChords[chordIndex % padChords.length], "2n", time, velocity);
    }
    chordIndex++;
  }, "2n").start(0);

  const bell = new Tone.FMSynth({
    harmonicity: 3.8,
    modulationIndex: 14,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 2.5, sustain: 0 },
    modulation: { type: "sine" }
  }).connect(masterReverb);

  const bellNotes = [60, 67, 72, 79, 84];
  const bellLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    if (bar >= 5 && bar < 7 && Math.random() > 0.65) {
      const note = bellNotes[Math.floor(Math.random() * bellNotes.length)];
      bell.triggerAttackRelease(Tone.Frequency(note, "midi"), "2n", time, 0.3);
    }
  }, "4n").start(0);

  const hat = new Tone.MetalSynth({
    frequency: 280,
    envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
    harmonicity: 4.8,
    modulationIndex: 28,
    resonance: 3500
  }).connect(masterReverb);

  let beatCount = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);

    if (bar >= 6 && bar < 8 && beatCount % 2 === 1) {
      hat.triggerAttackRelease("16n", time, 0.35);
    }
    beatCount++;
  }, "8n").start(0);

  const noiseHPF = new Tone.Filter({ type: "highpass", frequency: 1200 }).connect(masterReverb);
  const noise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.6, decay: 0.3, sustain: 0, release: 0.8 }
  }).connect(noiseHPF);

  Tone.Transport.schedule((time) => {
    noiseHPF.frequency.linearRampToValueAtTime(4500, time + 1.2);
    noise.triggerAttackRelease(1.2, time);
  }, "2:3:0");

  window.toneJsInstruments = { kick, bass, arp, pad, bell, hat, noise };
  window.toneJsParts = { kickLoop, bassLoop, arpLoop, padLoop, bellLoop, hatLoop };
};