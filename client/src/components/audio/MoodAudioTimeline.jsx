import { useState, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';

/**
 * MoodAudioTimeline - Interactive audio timeline for mood presets
 * Shows instrument lanes that can be muted/unmuted by clicking
 */
export default function MoodAudioTimeline({ fingerprint, duration = 90 }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mutedInstruments, setMutedInstruments] = useState(new Set());
  const [mutedEffects, setMutedEffects] = useState(new Set());
  const [instrumentVolumes, setInstrumentVolumes] = useState({});
  const animationRef = useRef(null);

  // Timeline animation - poll Tone.Transport for position updates and instrument volumes
  useEffect(() => {
    if (!isPlaying) return;

    const updatePosition = () => {
      // Find the audio preview iframe (offscreen)
      const iframe = document.querySelector('.audio-preview-iframe');
      if (iframe?.contentWindow?.Tone) {
        const Tone = iframe.contentWindow.Tone;
        if (Tone.Transport.state === 'started') {
          const seconds = Tone.Transport.seconds;

          // Loop back if we've reached the end
          if (seconds >= duration) {
            Tone.Transport.position = 0;
            setCurrentTime(0);
          } else {
            setCurrentTime(seconds);
          }

          // Read real-time volume levels from instruments
          const instruments = iframe.contentWindow.toneJsInstruments;
          if (instruments) {
            const volumes = {};
            Object.entries(instruments).forEach(([name, instrument]) => {
              if (instrument && instrument.volume) {
                const dbValue = instrument.volume.value;
                const normalized = Math.max(0, Math.min(1, (dbValue + 60) / 60));
                volumes[name] = normalized;
              }
            });
            setInstrumentVolumes(volumes);
          }
        } else {
          setIsPlaying(false);
        }
      }
      animationRef.current = requestAnimationFrame(updatePosition);
    };

    animationRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration]);

  // Listen for play/stop events from iframe
  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = document.querySelector('.audio-preview-iframe');
      if (iframe?.contentWindow?.Tone) {
        const Tone = iframe.contentWindow.Tone;
        const playing = Tone.Transport.state === 'started';
        if (playing !== isPlaying) {
          setIsPlaying(playing);
          if (!playing) {
            setCurrentTime(0);
            setInstrumentVolumes({});
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleInstrumentMute = (instrumentType) => {
    setMutedInstruments(prev => {
      const newMuted = new Set(prev);
      const willMute = !newMuted.has(instrumentType);

      if (willMute) {
        newMuted.add(instrumentType);
      } else {
        newMuted.delete(instrumentType);
      }

      // Send postMessage to iframe to mute/unmute
      const iframe = document.querySelector('.audio-preview-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: willMute ? 'mute-instrument' : 'unmute-instrument',
          instrumentType: instrumentType
        }, '*');
      }

      return newMuted;
    });
  };

  const toggleEffectMute = (effectType) => {
    setMutedEffects(prev => {
      const newMuted = new Set(prev);
      const willMute = !newMuted.has(effectType);

      if (willMute) {
        newMuted.add(effectType);
      } else {
        newMuted.delete(effectType);
      }

      // Send postMessage to iframe to mute/unmute effect
      const iframe = document.querySelector('.audio-preview-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: willMute ? 'mute-effect' : 'unmute-effect',
          effectType: effectType
        }, '*');
      }

      return newMuted;
    });
  };

  if (!fingerprint || !fingerprint.synthTypes) {
    return null;
  }

  const bpm = fingerprint.bpm || 120;
  const currentBar = Math.floor(currentTime / ((60 / bpm) * 4));

  return (
    <div className="border border-[var(--color-primary)] rounded-lg p-4 bg-black/30 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-[var(--color-primary)]" />
          <h4 className="text-sm font-bold text-[var(--color-primary)]">Audio Fingerprint & Timeline</h4>
        </div>
        <div className="text-xs text-[var(--color-text-tertiary)] italic">
          Click lanes to mute/unmute
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono mb-3">
        <div>
          <div className="text-[var(--color-text-tertiary)]">BPM</div>
          <div className="text-[var(--color-text-primary)] font-bold">{bpm}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-tertiary)]">Instruments</div>
          <div className="text-[var(--color-text-primary)] font-bold">{fingerprint.instrumentCount || fingerprint.synthTypes.length}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-tertiary)]">Effects</div>
          <div className="text-[var(--color-text-primary)] font-bold">{fingerprint.effectChainDepth || fingerprint.effectTypes?.length || 0}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-tertiary)]">Events</div>
          <div className="text-[var(--color-text-primary)] font-bold">{fingerprint.scheduledEvents || 0}</div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="mb-3">
        <div className="text-[var(--color-text-tertiary)] text-xs mb-2 flex items-center justify-between">
          <span>Instruments & Effects (click to mute/unmute)</span>
          <span className="text-[var(--color-text-tertiary)]">
            {isPlaying ? '⏵ Playing' : '⏸ Paused'} • {Math.floor(currentTime)}s / {duration}s
          </span>
        </div>

        {/* Playback progress bar */}
        <div className="relative h-2 bg-[var(--color-surface)] rounded mb-3">
          <div
            className="absolute inset-y-0 left-0 bg-green-400 rounded transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {/* Time markers */}
          <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-xs text-[var(--color-text-tertiary)]">
            <span>0:00</span>
            <span>{Math.floor(duration / 4)}s</span>
            <span>{Math.floor(duration / 2)}s</span>
            <span>{Math.floor(duration * 3 / 4)}s</span>
            <span>{duration}s</span>
          </div>
        </div>

        {/* Instrument Lanes */}
        <div className="mt-6 space-y-2">
          {fingerprint.synthTypes.map((synth, idx) => {
            const isMuted = mutedInstruments.has(synth.type);
            const effectsForInstrument = fingerprint.instrumentEffects?.[synth.type] || [];

            // Estimate activity based on bar position (simplified heuristic)
            let isLikelyActive = true;
            let activityHint = '';

            // Common patterns from sample compositions
            if (synth.type === 'MembraneSynth') {
              isLikelyActive = currentBar >= 0; // Usually always active
            } else if (synth.type === 'MonoSynth') {
              isLikelyActive = currentBar >= 4;
              activityHint = currentBar < 4 ? 'starts bar 4' : '';
            } else if (synth.type === 'FMSynth') {
              isLikelyActive = currentBar >= 6;
              activityHint = currentBar < 6 ? 'starts bar 6' : '';
            } else if (synth.type === 'MetalSynth') {
              isLikelyActive = currentBar >= 8;
              activityHint = currentBar < 8 ? 'starts bar 8' : '';
            }

            const varName = synth.varName || synth.type.toLowerCase();
            const volumeLevel = instrumentVolumes[varName] || 0;

            return (
              <button
                key={idx}
                onClick={() => toggleInstrumentMute(synth.type)}
                className="relative w-full text-left p-2 rounded border transition-all hover:border-cyan-300 cursor-pointer"
                style={{
                  borderColor: isMuted ? 'rgba(34, 211, 238, 0.2)' : (isLikelyActive ? 'rgba(34, 211, 238, 0.6)' : 'rgba(34, 211, 238, 0.3)'),
                  backgroundColor: isMuted ? 'rgba(10, 10, 10, 0.5)' : (isLikelyActive ? 'rgba(34, 211, 238, 0.08)' : 'rgba(34, 211, 238, 0.02)'),
                  opacity: isMuted ? 0.5 : 1,
                  boxShadow: isLikelyActive && !isMuted && isPlaying ? '0 0 8px rgba(34, 211, 238, 0.4)' : 'none'
                }}
                title={isMuted ? `Click to unmute ${synth.type}` : `Click to mute ${synth.type}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Activity indicator */}
                    {isPlaying && (
                      <div
                        className="w-2 h-2 rounded-full transition-all"
                        style={{
                          backgroundColor: isLikelyActive && !isMuted ? '#22d3ee' : '#374151',
                          opacity: isLikelyActive && !isMuted ? (0.4 + volumeLevel * 0.6) : 0.3,
                          boxShadow: isLikelyActive && !isMuted ? `0 0 6px rgba(34, 211, 238, ${volumeLevel})` : 'none'
                        }}
                      />
                    )}
                    <span
                      className="text-sm text-cyan-400 font-mono font-bold"
                      style={{ textDecoration: isMuted ? 'line-through' : 'none' }}
                    >
                      {synth.type}
                    </span>
                    {activityHint && isPlaying && (
                      <span className="text-xs text-[var(--color-text-tertiary)] italic">
                        ({activityHint})
                      </span>
                    )}
                    {effectsForInstrument.length > 0 && (
                      <div className="flex gap-1">
                        {effectsForInstrument.map((effect, eIdx) => (
                          <span
                            key={eIdx}
                            className="px-1.5 py-0.5 rounded text-xs font-mono"
                            style={{
                              backgroundColor: 'rgba(168, 85, 247, 0.2)',
                              color: '#a855f7',
                              opacity: isMuted ? 0.5 : 1
                            }}
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {isMuted ? 'silent' : (isLikelyActive ? 'playing' : 'silent')}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Effect Lanes (if not already shown with instruments) */}
          {fingerprint.effectTypes && fingerprint.effectTypes.filter(effect => {
            // Only show effects that aren't already attached to specific instruments
            const attachedEffects = Object.values(fingerprint.instrumentEffects || {}).flat();
            return !attachedEffects.includes(effect.type);
          }).map((effect, idx) => {
            const isMuted = mutedEffects.has(effect.type);

            return (
              <button
                key={`effect-${idx}`}
                onClick={() => toggleEffectMute(effect.type)}
                className="relative w-full text-left p-2 rounded border transition-all hover:border-purple-300 cursor-pointer"
                style={{
                  borderColor: isMuted ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.4)',
                  backgroundColor: isMuted ? 'rgba(10, 10, 10, 0.5)' : 'rgba(168, 85, 247, 0.05)',
                  opacity: isMuted ? 0.5 : 1
                }}
                title={isMuted ? `Click to unmute ${effect.type}` : `Click to mute ${effect.type}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm text-purple-400 font-mono"
                    style={{ textDecoration: isMuted ? 'line-through' : 'none' }}
                  >
                    {effect.type}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {isMuted ? 'silent' : 'active'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
