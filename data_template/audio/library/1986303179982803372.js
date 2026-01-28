window.initToneJsEngine = async function() {
const bpm = 72;
Tone.Transport.bpm.value = bpm;

const masterReverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).toDestination();
await masterReverb.generate();

const compressor = new Tone.Compressor({ threshold: -22, ratio: 8, attack: 0.005, release: 0.2 }).toDestination();

const heartKick = new Tone.MembraneSynth({
pitchDecay: 0.05,
octaves: 4,
oscillator: { type: "sine" },
envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 }
}).toDestination();

let beatPhase = 0;
const heartbeatLoop = new Tone.Loop((time) => {
const inCycle = beatPhase % 3;
if (inCycle < 0.08) {
heartKick.triggerAttackRelease("C1", "32n", time, 1.0);
compressor.threshold.setValueAtTime(-35, time);
compressor.threshold.exponentialRampToValueAtTime(-22, time + 0.12);
} else if (inCycle >= 0.12 && inCycle < 0.24) {
heartKick.triggerAttackRelease("C1", "32n", time, 0.6);
}
beatPhase += 0.05;
}, "20hz").start(0);

const droneFilter = new Tone.Filter({ type: "lowpass", frequency: 120, Q: 0.8 }).connect(compressor);
const drone = new Tone.Synth({
oscillator: { type: "sine" },
envelope: { attack: 2.0, decay: 0.5, sustain: 0.8, release: 3.0 }
}).connect(droneFilter);

Tone.Transport.schedule((time) => {
drone.triggerAttack("C2", time, 0.3);
}, 0);

const padFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 1.2 }).connect(compressor);
const padChorus = new Tone.Chorus({ frequency: 0.08, delayTime: 4.0, depth: 0.6, wet: 0.4 }).connect(padFilter).start();
const pad = new Tone.PolySynth(Tone.Synth, {
oscillator: { type: "triangle" },
envelope: { attack: 1.2, decay: 0.6, sustain: 0.7, release: 2.0 }
}).connect(padChorus);

const silenceChords = [
["E3", "G3", "B3"],
["D3", "F3", "A3"],
["C3", "E3", "G3"]
];
let chordIndex = 0;
const padLoop = new Tone.Loop((time) => {
const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
if (bar >= 2) {
pad.triggerAttackRelease(silenceChords[chordIndex % silenceChords.length], "1n", time, 0.15);
chordIndex++;
}
}, "1n").start(0);

const bellReverb = new Tone.Reverb({ decay: 4.0, wet: 0.6 }).toDestination();
await bellReverb.generate();
const bell = new Tone.FMSynth({
harmonicity: 2.5,
modulationIndex: 8,
oscillator: { type: "sine" },
envelope: { attack: 0.002, decay: 3.0, sustain: 0 },
modulation: { type: "sine" }
}).connect(bellReverb);

const bellNotes = ["E4", "G4", "B4", "D5", "B4", "G4"];
let bellIndex = 0;
const bellLoop = new Tone.Loop((time) => {
const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
if (bar >= 4 && Math.random() > 0.65) {
bell.triggerAttackRelease(bellNotes[bellIndex % bellNotes.length], "2n", time, 0.25);
bellIndex++;
}
}, "2n").start(0);

const breathFilter = new Tone.Filter({ type: "highpass", frequency: 400 }).connect(masterReverb);
const breath = new Tone.NoiseSynth({
noise: { type: "pink" },
envelope: { attack: 1.5, decay: 0.8, sustain: 0, release: 1.2 }
}).connect(breathFilter);

let breathCount = 0;
const breathLoop = new Tone.Loop((time) => {
const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
if (bar >= 6 && breathCount % 2 === 0) {
breathFilter.frequency.setValueAtTime(400, time);
breathFilter.frequency.linearRampToValueAtTime(1200, time + 2.0);
breath.triggerAttackRelease(2.0, time, 0.08);
}
breathCount++;
}, "2n").start(0);

Tone.Transport.schedule((time) => {
padFilter.frequency.linearRampToValueAtTime(1200, time + 8 * (60 / bpm) * 4);
}, "4:0:0");

window.toneJsInstruments = { heartKick, drone, pad, bell, breath };
window.toneJsParts = { heartbeatLoop, padLoop, bellLoop, breathLoop };
};