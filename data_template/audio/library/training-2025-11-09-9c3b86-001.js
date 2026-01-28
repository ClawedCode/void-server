window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES (analog warmth chain) ===
  const masterReverb = new Tone.Reverb({ decay: 3.8, wet: 0.38 }).toDestination();
  await masterReverb.generate();

  const tapeDelay = new Tone.FeedbackDelay({
    delayTime: "8n.",
    feedback: 0.38,
    wet: 0.28
  }).connect(masterReverb);

  const analogChorus = new Tone.Chorus({
    frequency: 0.28,
    delayTime: 4.2,
    depth: 0.42,
    wet: 0.32
  }).connect(tapeDelay).start();

  // === WARM PAD (detuned analog synth) ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 1150, Q: 0.5 }).connect(analogChorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.6, decay: 0.9, sustain: 0.58, release: 3.2 }
  }).connect(padFilter);

  const padChords = [
    ["A3", "C#4", "E4", "A4"],
    ["E3", "G#3", "B3", "E4"],
    ["F#3", "A3", "C#4", "F#4"],
    ["D3", "F#3", "A3", "D4"]
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const velocity = 0.28 + (Math.random() * 0.06);
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, velocity);
    padIdx++;
  }, "2m").start(0);

  // === DETUNED RHODES MELODY ===
  const rhodesChorus = new Tone.Chorus({
    frequency: 1.3,
    delayTime: 3.8,
    depth: 0.48,
    wet: 0.42
  }).connect(analogChorus).start();
  const rhodes = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.025, decay: 0.35, sustain: 0.22, release: 0.85 }
  }).connect(rhodesChorus);

  const melody1 = ["A4", "C#5", "E5", "C#5", "B4", "A4", "E4", "A4"];
  const melody2 = ["E5", "A4", "C#5", "A4", "F#4", "E4", "C#4", "E4"];
  const melody3 = ["C#5", "E5", "A5", "E5", "D5", "C#5", "A4", "C#5"];
  const melodyGates = ["8n", "8n", "4n", "8n", "8n", "4n", "8n", "2n"];
  let melodyIdx = 0;
  const melodyLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 20) {
      let currentMelody;
      if (bar < 12) currentMelody = melody1;
      else if (bar < 16) currentMelody = melody2;
      else currentMelody = melody3;

      const velocity = 0.52 + (Math.random() * 0.12);
      rhodes.triggerAttackRelease(
        currentMelody[melodyIdx % currentMelody.length],
        melodyGates[melodyIdx % melodyGates.length],
        time,
        velocity
      );
      melodyIdx++;
    }
  }, "8n").start(0);

  // === WARM BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 260, Q: 0.65 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.32, sustain: 0.18, release: 0.55 }
  }).connect(bassFilter);

  const bassSection1 = ["A1", "A1", "E1", "E1"];
  const bassSection2 = ["F#1", "F#1", "D1", "D1"];
  const bassSection3 = ["A1", "A1", "E1", "E1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      let bassPattern;
      if (bar < 10) bassPattern = bassSection1;
      else if (bar < 16) bassPattern = bassSection2;
      else bassPattern = bassSection3;

      const velocity = 0.48 + (Math.random() * 0.08);
      bass.triggerAttackRelease(bassPattern[bassIdx % bassPattern.length], "4n", time, velocity);
      bassIdx++;
    }
  }, "4n").start(0);

  // === SOFT KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.065,
    octaves: 3.2,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 0.32, sustain: 0, release: 0.18 }
  }).connect(masterReverb);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 20) {
      const velocity = 0.62 + (Math.random() * 0.12);
      kick.triggerAttackRelease("C1", "8n", time, velocity);
    }
  }, "4n").start(0);

  // === MUFFLED SNARE ===
  const snareFilter = new Tone.Filter({ type: "lowpass", frequency: 750, Q: 0.48 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.012, decay: 0.14, sustain: 0 }
  }).connect(snareFilter);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 20 && snareStep % 2 === 1) {
      const velocity = 0.32 + (Math.random() * 0.09);
      snare.triggerAttackRelease("16n", time, velocity);
    }
    snareStep++;
  }, "4n").start(0);

  // === SUBTLE HI-HATS ===
  const hatFilter = new Tone.Filter({ type: "highpass", frequency: 3800, Q: 0.35 }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 290,
    envelope: { attack: 0.001, decay: 0.085, release: 0.025 },
    harmonicity: 5.8,
    modulationIndex: 20,
    resonance: 4100
  }).connect(hatFilter);

  const hatPattern = [0.22, 0.13, 0.19, 0.11, 0.24, 0.12, 0.20, 0.10];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 19) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.38);
      hatStep++;
    }
  }, "8n").start(0);

  // === AMBIENT TEXTURE ===
  const texture = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: { attack: 2.2, decay: 0, sustain: 1.0, release: 4.5 }
  }).connect(masterReverb);

  Tone.Transport.schedule((time) => {
    texture.triggerAttackRelease("1m", time, 0.075);
  }, "0:0:0");

  // === FILTER AUTOMATION ===
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1900, time + 14 * (60 / bpm) * 4);
  }, "8:0:0");

  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1150, time + 4 * (60 / bpm) * 4);
  }, "18:0:0");

  // === SUBTLE BELL ACCENT ===
  const bell = new Tone.FMSynth({
    harmonicity: 3.2,
    modulationIndex: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 1.8, sustain: 0 },
    modulation: { type: "sine" }
  }).connect(tapeDelay);

  const bellNotes = ["E5", "A5", "C#6", "E6"];
  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease(bellNotes[0], "2n", time, 0.15);
  }, "12:0:0");

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease(bellNotes[2], "2n", time, 0.12);
  }, "14:2:0");

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease(bellNotes[1], "2n", time, 0.10);
  }, "16:1:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, rhodes, bass, kick, snare, hat, texture, bell };
  window.toneJsParts = { padLoop, melodyLoop, bassLoop, kickLoop, snareLoop, hatLoop };
};