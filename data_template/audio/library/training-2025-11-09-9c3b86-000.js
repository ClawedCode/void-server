window.initToneJsEngine = async function() {
  const bpm = 82;
  Tone.Transport.bpm.value = bpm;

  // === FX BUSES ===
  const masterReverb = new Tone.Reverb({ decay: 4.2, wet: 0.38 }).toDestination();
  await masterReverb.generate();

  const tapeDelay = new Tone.FeedbackDelay({
    delayTime: "8n.",
    feedback: 0.32,
    wet: 0.28
  }).connect(masterReverb);

  const analogChorus = new Tone.Chorus({
    frequency: 0.3,
    delayTime: 4.2,
    depth: 0.45,
    wet: 0.32
  }).connect(tapeDelay).start();

  // === WARM PAD ===
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 1100, Q: 0.6 }).connect(analogChorus);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    detune: -3,
    envelope: { attack: 1.8, decay: 0.9, sustain: 0.65, release: 3.5 }
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

  // === DETUNED LEAD ===
  const leadChorus = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 3.8,
    depth: 0.52,
    wet: 0.42
  }).connect(analogChorus).start();
  const lead = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.025, decay: 0.35, sustain: 0.25, release: 0.9 }
  }).connect(leadChorus);

  const melodySection1 = ["A4", "C#5", "E5", "C#5", "B4", "A4"];
  const melodySection2 = ["E4", "G#4", "B4", "G#4", "F#4", "E4"];
  const melodySection3 = ["F#4", "A4", "C#5", "E5", "D5", "C#5"];
  let melodyIdx = 0;
  const melodyLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 6 && bar < 20) {
      let melody;
      if (bar < 10) melody = melodySection1;
      else if (bar < 14) melody = melodySection2;
      else melody = melodySection3;

      const velocity = 0.52 + (Math.random() * 0.12);
      lead.triggerAttackRelease(
        melody[melodyIdx % melody.length],
        "4n",
        time,
        velocity
      );
      melodyIdx++;
    }
  }, "4n").start(0);

  // === WARM BASS ===
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 240, Q: 0.8 }).connect(masterReverb);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.35, sustain: 0.18, release: 0.6 }
  }).connect(bassFilter);

  const bassSection1 = ["A1", "A1", "E1", "E1"];
  const bassSection2 = ["F#1", "F#1", "D1", "D1"];
  const bassSection3 = ["A1", "E1", "F#1", "D1"];
  let bassIdx = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    
    if (bar >= 3) {
      let bassPattern;
      if (bar < 10) bassPattern = bassSection1;
      else if (bar < 16) bassPattern = bassSection2;
      else bassPattern = bassSection3;

      bass.triggerAttackRelease(bassPattern[bassIdx % bassPattern.length], "4n", time, 0.48);
      bassIdx++;
    }
  }, "4n").start(0);

  // === SOFT KICK ===
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.055,
    octaves: 3.5,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 0.28, sustain: 0, release: 0.18 }
  }).connect(masterReverb);

  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 3 && bar < 20) {
      const velocity = 0.62 + (Math.random() * 0.08);
      kick.triggerAttackRelease("C1", "8n", time, velocity);
    }
  }, "4n").start(0);

  // === MUFFLED SNARE ===
  const snareFilter = new Tone.Filter({ type: "lowpass", frequency: 720, Q: 0.6 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.012, decay: 0.14, sustain: 0 }
  }).connect(snareFilter);

  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 18 && snareStep % 2 === 1) {
      const velocity = 0.32 + (Math.random() * 0.09);
      snare.triggerAttackRelease("16n", time, velocity);
    }
    snareStep++;
  }, "4n").start(0);

  // === SUBTLE HATS ===
  const hatFilter = new Tone.Filter({ type: "highpass", frequency: 3800, Q: 0.4 }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 260,
    envelope: { attack: 0.001, decay: 0.09, release: 0.025 },
    harmonicity: 6.2,
    modulationIndex: 16,
    resonance: 3900
  }).connect(hatFilter);

  const hatPattern = [0.22, 0.14, 0.19, 0.11, 0.24, 0.13, 0.21, 0.10];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 8 && bar < 18) {
      const vel = hatPattern[hatStep % hatPattern.length];
      hat.triggerAttackRelease("16n", time, vel * 0.38);
      hatStep++;
    }
  }, "8n").start(0);

  // === AMBIENT TEXTURE ===
  const texture = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: { attack: 2.5, decay: 0, sustain: 1.0, release: 5.0 }
  }).connect(masterReverb);

  Tone.Transport.schedule((time) => {
    texture.triggerAttackRelease("1m", time, 0.09);
  }, "0:0:0");

  // === BELL ACCENT ===
  const bell = new Tone.FMSynth({
    harmonicity: 3.2,
    modulationIndex: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 1.8, sustain: 0, release: 0.8 },
    modulation: { type: "sine" }
  }).connect(analogChorus);

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("A5", "2n", time, 0.28);
  }, "10:0:0");

  Tone.Transport.schedule((time) => {
    bell.triggerAttackRelease("E5", "2n", time, 0.24);
  }, "14:0:0");

  // === FILTER AUTOMATION ===
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1950, time + 12 * (60 / bpm) * 4);
  }, "6:0:0");

  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1100, time + 4 * (60 / bpm) * 4);
  }, "18:0:0");

  // === STORE REFERENCES ===
  window.toneJsInstruments = { pad, lead, bass, kick, snare, hat, texture, bell };
  window.toneJsParts = { padLoop, melodyLoop, bassLoop, kickLoop, snareLoop, hatLoop };
};