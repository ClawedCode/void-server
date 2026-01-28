/**
 * Extract audio fingerprint from Tone.js code
 *
 * Analyzes JavaScript code to identify:
 * - BPM (Tone.Transport.bpm.value)
 * - Synth types (new Tone.*)
 * - Effect types (Reverb, Delay, etc.)
 * - Loop patterns (Tone.Loop timing)
 *
 * @param {string} toneJsCode - JavaScript code containing Tone.js composition
 * @returns {object} Fingerprint object with synthTypes, effectTypes, bpm, etc.
 */
export function extractAudioFingerprint(toneJsCode) {
  if (!toneJsCode) {
    return null;
  }

  const fingerprint = {
    bpm: 120, // default
    synthTypes: [],
    effectTypes: [],
    instrumentEffects: {}, // Map synth types to their effects
    loopPatterns: [],
    scheduledEvents: 0,
    instrumentCount: 0,
    effectChainDepth: 0,
    automationCount: 0
  };

  // Extract BPM
  const bpmMatch = toneJsCode.match(/Tone\.Transport\.bpm\.value\s*=\s*(\d+)/);
  if (bpmMatch) {
    fingerprint.bpm = parseInt(bpmMatch[1], 10);
  }

  // Extract synth types with variable names
  const synthRegex = /(?:const|let|var)\s+(\w+)\s*=\s*new\s+Tone\.((?:Membrane|Metal|Noise|Mono|Duo|AM|FM|Poly|Pluck)?Synth)/g;
  let synthMatch;
  const synthCounts = {};
  const instrumentVars = []; // Track variable names

  while ((synthMatch = synthRegex.exec(toneJsCode)) !== null) {
    const varName = synthMatch[1];
    const synthType = synthMatch[2];
    synthCounts[synthType] = (synthCounts[synthType] || 0) + 1;
    instrumentVars.push({ varName, synthType });
  }

  // Convert counts to array with varName
  for (const [type, count] of Object.entries(synthCounts)) {
    const instrument = instrumentVars.find(v => v.synthType === type);
    fingerprint.synthTypes.push({
      type,
      category: getSynthCategory(type),
      count,
      varName: instrument?.varName || null
    });
  }

  fingerprint.instrumentCount = fingerprint.synthTypes.length;

  // Extract effect types with variable names
  const effectRegex = /(?:const|let|var)\s+(\w+)\s*=\s*new\s+Tone\.(Reverb|Delay|FeedbackDelay|PingPongDelay|Chorus|Phaser|Tremolo|Vibrato|Filter|AutoFilter|Compressor|Limiter|Distortion|Chebyshev|BitCrusher|Convolver)/g;
  let effectMatch;
  const effectCounts = {};
  const effectVars = []; // Track variable names

  while ((effectMatch = effectRegex.exec(toneJsCode)) !== null) {
    const varName = effectMatch[1];
    const effectType = effectMatch[2];
    effectCounts[effectType] = (effectCounts[effectType] || 0) + 1;
    effectVars.push({ varName, effectType });
  }

  // Convert counts to array
  for (const [type, count] of Object.entries(effectCounts)) {
    fingerprint.effectTypes.push({ type, count });
  }

  fingerprint.effectChainDepth = fingerprint.effectTypes.length;

  // Map effects to instruments by parsing .connect() chains
  instrumentVars.forEach(({ varName, synthType }) => {
    const effects = [];

    // Find .connect() calls for this instrument
    const connectRegex = new RegExp(`${varName}\\.connect\\((\\w+)\\)`, 'g');
    let connectMatch;

    while ((connectMatch = connectRegex.exec(toneJsCode)) !== null) {
      const connectedVar = connectMatch[1];
      const effect = effectVars.find(e => e.varName === connectedVar);
      if (effect) {
        effects.push(effect.effectType);
      }
    }

    if (effects.length > 0) {
      fingerprint.instrumentEffects[synthType] = effects;
    }
  });

  // Extract loop patterns
  const loopRegex = /new\s+Tone\.Loop\([^,]+,\s*["'](\d+n)["']\)/g;
  let loopMatch;
  const patterns = new Set();

  while ((loopMatch = loopRegex.exec(toneJsCode)) !== null) {
    patterns.add(loopMatch[1]);
  }

  fingerprint.loopPatterns = Array.from(patterns);

  // Count scheduled events
  const scheduleMatches = toneJsCode.match(/Tone\.Transport\.schedule\(/g);
  fingerprint.scheduledEvents = scheduleMatches ? scheduleMatches.length : 0;

  // Count automation (ramps, sweeps)
  const rampMatches = toneJsCode.match(/\.(linearRampToValueAtTime|exponentialRampToValueAtTime|rampTo)\(/g);
  fingerprint.automationCount = rampMatches ? rampMatches.length : 0;

  return fingerprint;
}

/**
 * Categorize synth type for better organization
 */
function getSynthCategory(synthType) {
  const categories = {
    'MembraneSynth': 'kick/bass',
    'MetalSynth': 'metallic_perc',
    'NoiseSynth': 'noise_perc',
    'MonoSynth': 'mono_lead',
    'DuoSynth': 'dual_osc',
    'AMSynth': 'am_synth',
    'FMSynth': 'fm_bell',
    'PolySynth': 'poly_chord',
    'PluckSynth': 'plucked',
    'Synth': 'basic_synth'
  };
  return categories[synthType] || 'other';
}
