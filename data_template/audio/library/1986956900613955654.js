window.initToneJsEngine = async function() {
const bpm = 72;
Tone.Transport.bpm.value = bpm;

const masterReverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).toDestination();
await masterReverb.generate();

const compressor = new Tone.Compressor({ threshold: -22, ratio: 6, attack: 0.005, release: 0.2 }).toDestination();

const subBassFilter = new Tone.Filter({ type: "lowpass", frequency: 120, Q: 0.8 }).connect(compressor);
const subBass = new Tone.MonoSynth({
oscillator: { type: "sine" },
envelope: { attack: 0.04, decay: 0.3, sustain: 0.2, release: 0.4 }
}).connect(subBassFilter);

const bassSections = [
["C2", "C2", "G1", "A1"],
["C2", "D2", "G1", "A1", "F2", "G1"],
["F2", "G1", "A1", "C2"],
["C2", "C2", "G1", "A1"]
];

let bassIndex = 0;
const bassLoop = new Tone.Loop((time) => {
const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
let pattern;
if (bar < 4) pattern = bassSections[0];
else if (bar < 10) pattern = bassSections[1];
else if (bar < 14) pattern = bassSections[2];
else pattern = bassSections[3];

const velocity = bar < 2 ? 0.5 : (bar > 14 ? 0.5 : 0.7);
subBass.triggerAttackRelease(pattern[bassIndex % pattern.length], "8n", time, velocity);
bassIndex++;
}, "8n").start(0);

const padFilter = new Tone.Filter({ type: "lowpass", frequency: 800, Q: 1.2 }).connect(masterReverb);
const padChorus = new Tone.Chorus({ frequency: 0.12, delayTime: 4.5, depth: 0.6, wet: 0.4 }).connect(padFilter).start();
const pad = new Tone.PolySynth(Tone.Synth, {
oscillator: { type: "sawtooth" },
detune: -5,
envelope: { attack: 1.2, decay: 0.6, sustain: 0.7, release: 2.0 }
}).connect(padChorus);

const padChords = [
["C3", "G3", "C4"],
["F3", "A3", "C4"],
["G3", "B3", "D4"],
["A3", "C4", "E4"]
];
let chordIndex = 0;
const padLoop = new Tone.Loop((time) => {
const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
const velocity = bar < 2 ? 0.12 : (bar > 14 ? 0.12 : 0.18);
pad.triggerAttackRelease(padChords[chordIndex % padChords.length], "2n", time, velocity);
chordIndex++;
}, "2n").start(0);

const bellReverb = new Tone.Reverb({ decay: 4.5, wet: 0.6 }).toDestination();
await bellReverb.generate();
const bell = new Tone.FMSynth({
harmonicity: 4.32,
modulationIndex: 10,
oscillator: { type: "sine" },
envelope: { attack: 0.002, decay: 3.0, sustain: 0, release: 1.0 },
modulation: { type: "sine" }
}).connect(bellReverb);

const bellScale = ["C4", "E4", "G4", "C5", "E5", "G4", "C4", "A4"];
let bellIndex = 0;
const bellLoop = new Tone.Loop((time) => {
const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
if (bar >= 3 && bar < 15) {
const shouldPlay = Math.random() > 0.65;
if (shouldPlay) {
const noteChoice = Math.floor(Math.random() * bellScale.length);
bell.triggerAttackRelease(bellScale[noteChoice], "4n", time, 0.25);
}
}
bellIndex++;
}, "4n").start(0);

const arpFilter = new Tone.Filter({ type: "lowpass", frequency: 600, Q: 1.5 }).connect(compressor);
const arpDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.35, wet: 0.4 }).connect(arpFilter);
const arp = new Tone.Synth({
oscillator: { type: "triangle" },
envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.15 }
}).connect(arpDelay);

const arpNotes = ["G4", "C5", "E5", "G5", "C5", "E5"];
let arpIndex = 0;
const arpLoop = new Tone.Loop((time) => {
const bar = Math.floor(Tone.Transport.getSecondsAtTime(time) / (60 / bpm) / 4);
if (bar >= 6 && bar < 14) {
arp.triggerAttackRelease(arpNotes[arpIndex % arpNotes.length], "16n", time, 0.4);
}
arpIndex++;
}, "16n").start(0);

Tone.Transport.schedule((time) => {
padFilter.frequency.linearRampToValueAtTime(1400, time + 6 * (60 / bpm) * 4);
}, "4:0:0");

Tone.Transport.schedule((time) => {
arpFilter.frequency.linearRampToValueAtTime(1800, time + 4 * (60 / bpm) * 4);
}, "8:0:0");

Tone.Transport.schedule((time) => {
padFilter.frequency.linearRampToValueAtTime(800, time + 3 * (60 / bpm) * 4);
arpFilter.frequency.linearRampToValueAtTime(600, time + 3 * (60 / bpm) * 4);
}, "14:0:0");

window.toneJsInstruments = { subBass, pad, bell, arp };
window.toneJsParts = { bassLoop, padLoop, bellLoop, arpLoop };
};