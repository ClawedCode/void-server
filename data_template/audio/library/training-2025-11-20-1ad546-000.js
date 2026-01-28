window.initToneJsEngine = async function() {
  const bpm = 78;
  Tone.Transport.bpm.value = bpm;
  const masterReverb = new Tone.Reverb({ decay: 3.4, wet: 0.34 }).toDestination();
  await masterReverb.generate();
  const tapeDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.32, wet: 0.25 }).connect(masterReverb);
  const analogChorus = new Tone.Chorus({ frequency: 0.26, delayTime: 4.8, depth: 0.48, wet: 0.32 }).connect(tapeDelay).start();
  const gentleComp = new Tone.Compressor({ threshold: -22, ratio: 3, attack: 0.03, release: 0.45 }).connect(analogChorus);
  const padFilter = new Tone.Filter({ type: "lowpass", frequency: 1200, Q: 0.6 }).connect(gentleComp);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 1.4, decay: 0.7, sustain: 0.6, release: 2.8 }
  }).connect(padFilter);
  const padChords = [
    ["D3", "F#3", "A3", "D4"],
    ["A2", "E3", "A3", "C#4"],
    ["B2", "F#3", "A3", "D4"],
    ["G2", "D3", "G3", "B3"]
  ];
  let padIdx = 0;
  const padLoop = new Tone.Loop((time) => {
    const vel = 0.28 + Math.random() * 0.06;
    pad.triggerAttackRelease(padChords[padIdx % padChords.length], "2m", time, vel);
    padIdx++;
  }, "2m").start(0);
  const texture = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: { attack: 2.0, decay: 0, sustain: 1.0, release: 4.0 }
  }).connect(masterReverb);
  Tone.Transport.schedule((time) => {
    texture.triggerAttackRelease("1m", time, 0.08);
  }, "0:0:0");
  const bassFilter = new Tone.Filter({ type: "lowpass", frequency: 260, Q: 0.7 }).connect(gentleComp);
  const bass = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.04, decay: 0.35, sustain: 0.25, release: 0.5 }
  }).connect(bassFilter);
  const bassSections = [
    ["D2", "A1", "G1", "A1"],
    ["D2", "A1", "E2", "B1", "G1", "A1"],
    ["D2", "A1", "G1", "A1"]
  ];
  let bassStep = 0;
  const bassLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4) {
      const pattern = bar < 10 ? bassSections[0] : (bar < 16 ? bassSections[1] : bassSections[2]);
      const vel = 0.42 + Math.random() * 0.08;
      bass.triggerAttackRelease(pattern[bassStep % pattern.length], "4n", time, vel);
      bassStep++;
    }
  }, "4n").start(0);
  const rhodesChorus = new Tone.Chorus({ frequency: 1.1, delayTime: 3.8, depth: 0.5, wet: 0.42 }).connect(analogChorus).start();
  const rhodesDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.18, wet: 0.25 }).connect(rhodesChorus);
  const rhodes = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.03, decay: 0.32, sustain: 0.22, release: 1.0 }
  }).connect(rhodesDelay);
  const melodyNotes = ["D4", "F#4", "A4", "F#4", "E4", "F#4", "D4", "A3", "E4", "F#4", "D4", "B3"];
  const melodyLengths = ["8n", "8n", "4n", "8n", "8n", "4n", "8n", "8n", "4n", "8n", "8n", "2n"];
  let melodyStep = 0;
  const melodyLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 17) {
      const vel = 0.5 + Math.random() * 0.1;
      rhodes.triggerAttackRelease(
        melodyNotes[melodyStep % melodyNotes.length],
        melodyLengths[melodyStep % melodyLengths.length],
        time,
        vel
      );
      melodyStep++;
    }
  }, "8n").start(0);
  const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 900, Q: 0.8 }).connect(analogChorus);
  const arp = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.1, release: 0.2 }
  }).connect(arpFilter);
  const arpNotes = ["A4", "B4", "D4", "F#4", "E4", "D4", "B3", "A3"];
  let arpStep = 0;
  const arpLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10 && bar < 16) {
      const vel = 0.26 + Math.random() * 0.08;
      arp.triggerAttackRelease(arpNotes[arpStep % arpNotes.length], "16n", time, vel);
      arpStep++;
    }
  }, "16n").start(0);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: { attack: 0.002, decay: 0.32, sustain: 0, release: 0.16 }
  }).connect(gentleComp);
  let kickStep = 0;
  const kickLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 4 && bar < 20) {
      let vel = 0.58 + Math.random() * 0.1;
      if (bar >= 18) {
        vel *= 0.6;
        if (kickStep % 2 === 1) {
          kickStep++;
          return;
        }
      }
      kick.triggerAttackRelease("C1", "8n", time, vel);
      kickStep++;
    }
  }, "4n").start(0);
  const snareFilter = new Tone.Filter({ type: "lowpass", frequency: 820, Q: 0.6 }).connect(masterReverb);
  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.01, decay: 0.14, sustain: 0 }
  }).connect(snareFilter);
  let snareStep = 0;
  const snareLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 6 && bar < 17 && snareStep % 2 === 1) {
      const vel = 0.34 + Math.random() * 0.08;
      snare.triggerAttackRelease("16n", time, vel);
    }
    snareStep++;
  }, "4n").start(0);
  const hatFilter = new Tone.Filter({ type: "highpass", frequency: 3200, Q: 0.5 }).connect(masterReverb);
  const hat = new Tone.MetalSynth({
    frequency: 260,
    envelope: { attack: 0.001, decay: 0.09, release: 0.03 },
    harmonicity: 5.4,
    modulationIndex: 20,
    resonance: 3800
  }).connect(hatFilter);
  const hatVelocities = [0.18, 0.12, 0.2, 0.14, 0.22, 0.1, 0.17, 0.13];
  let hatStep = 0;
  const hatLoop = new Tone.Loop((time) => {
    const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
    if (bar >= 10 && bar < 16) {
      const vel = hatVelocities[hatStep % hatVelocities.length] * 0.5;
      if (Math.random() > 0.2) {
        hat.triggerAttackRelease("16n", time, vel);
      }
      hatStep++;
    }
  }, "8n").start(0);
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1900, time + 8 * (60 / bpm) * 4);
  }, "4:0:0");
  Tone.Transport.schedule((time) => {
    padFilter.frequency.linearRampToValueAtTime(1200, time + 6 * (60 / bpm) * 4);
  }, "16:0:0");
  window.toneJsInstruments = { pad, bass, rhodes, arp, kick, snare, hat, texture };
  window.toneJsParts = { padLoop, bassLoop, melodyLoop, arpLoop, kickLoop, snareLoop, hatLoop };
};