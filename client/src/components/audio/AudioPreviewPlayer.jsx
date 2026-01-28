import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Square, Volume2, VolumeX, RotateCcw } from 'lucide-react';

/**
 * AudioPreviewPlayer - Plays Tone.js audio via sandboxed iframe
 *
 * Uses lazy iframe creation - iframe is only created when the user first clicks play.
 * This allows many instances to coexist efficiently in a table without loading iframes upfront.
 */
export default function AudioPreviewPlayer({ toneJsCode, compact = false, onProgressUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef(null);
  const pendingPlayRef = useRef(false);

  const generateIframeContent = useCallback(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js">${'<'}/script>
  <style>
    body { margin: 0; padding: 0; background: transparent; }
  </style>
</head>
<body>
  <script>
    window.toneJsInstruments = {};
    window.toneJsParts = {};
    window.progressInterval = null;

    window.addEventListener('message', async (event) => {
      const { type, instrumentType, code } = event.data;

      if (type === 'init') {
        try {
          eval(code);
          if (typeof window.initToneJsEngine === 'function') {
            await window.initToneJsEngine();
          }
          window.parent.postMessage({ type: 'ready' }, '*');
        } catch (err) {
          window.parent.postMessage({ type: 'error', error: err.message }, '*');
        }
      }

      if (type === 'play') {
        try {
          await Tone.start();
          Tone.Transport.position = 0;
          Tone.Transport.start('+0.1');

          window.progressInterval = setInterval(() => {
            if (Tone.Transport.state === 'started') {
              window.parent.postMessage({
                type: 'progress',
                currentTime: Tone.Transport.seconds,
                duration: 90
              }, '*');
            }
          }, 100);

          window.parent.postMessage({ type: 'playing' }, '*');
        } catch (err) {
          window.parent.postMessage({ type: 'error', error: err.message }, '*');
        }
      }

      if (type === 'stop') {
        if (window.progressInterval) {
          clearInterval(window.progressInterval);
          window.progressInterval = null;
        }
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.position = 0;

        if (window.toneJsInstruments) {
          Object.values(window.toneJsInstruments).forEach(instrument => {
            if (!instrument) return;
            if (typeof instrument.triggerRelease === 'function') instrument.triggerRelease();
            if (typeof instrument.releaseAll === 'function') instrument.releaseAll();
            if (instrument.volume) instrument.volume.value = -Infinity;
          });
        }

        if (window.toneJsParts) {
          Object.values(window.toneJsParts).forEach(part => {
            if (part && typeof part.stop === 'function') part.stop();
          });
        }

        window.parent.postMessage({ type: 'stopped' }, '*');
      }

      if (type === 'mute') Tone.Destination.mute = true;
      if (type === 'unmute') Tone.Destination.mute = false;

      if (type === 'mute-instrument' && window.toneJsInstruments) {
        Object.entries(window.toneJsInstruments).forEach(([varName, inst]) => {
          if (!inst) return;
          let constructorName = inst.constructor.name;
          if (inst.name && typeof inst.name === 'string') constructorName = inst.name;
          if (constructorName === instrumentType ||
              varName.toLowerCase().includes(instrumentType.toLowerCase()) ||
              instrumentType.toLowerCase().includes(varName.toLowerCase())) {
            if (inst.volume) {
              inst._savedVolume = inst.volume.value;
              inst.volume.value = -Infinity;
            }
          }
        });
      }

      if (type === 'unmute-instrument' && window.toneJsInstruments) {
        Object.entries(window.toneJsInstruments).forEach(([varName, inst]) => {
          if (!inst) return;
          let constructorName = inst.constructor.name;
          if (inst.name && typeof inst.name === 'string') constructorName = inst.name;
          if (constructorName === instrumentType ||
              varName.toLowerCase().includes(instrumentType.toLowerCase()) ||
              instrumentType.toLowerCase().includes(varName.toLowerCase())) {
            if (inst.volume) {
              inst.volume.value = inst._savedVolume !== undefined ? inst._savedVolume : 0;
            }
          }
        });
      }
    });

    window.parent.postMessage({ type: 'loaded' }, '*');
  ${'<'}/script>
</body>
</html>
    `;
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (!event.data.type) return;
      // Only handle messages from our iframe (ignore if no iframe loaded)
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;

      const { type, error: msgError, currentTime, duration } = event.data;

      if (type === 'ready') {
        setIframeReady(true);
        setIsLoading(false);

        // Auto-play if we have a pending play request (first load)
        if (pendingPlayRef.current) {
          pendingPlayRef.current = false;
          iframeRef.current?.contentWindow?.postMessage({ type: 'play' }, '*');
        }
      }

      if (type === 'playing') {
        setIsPlaying(true);
        setIsLoading(false);
      }

      if (type === 'stopped') {
        setIsPlaying(false);
        if (onProgressUpdate) onProgressUpdate(0, 90, false);
      }

      if (type === 'progress' && onProgressUpdate) {
        onProgressUpdate(currentTime, duration, true);
      }

      if (type === 'error') {
        setError(msgError);
        setIsLoading(false);
        setIsPlaying(false);
        if (onProgressUpdate) onProgressUpdate(0, 90, false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgressUpdate]);

  // Send init when iframe loads
  useEffect(() => {
    if (!iframeLoaded || !toneJsCode) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      iframe.contentWindow?.postMessage({ type: 'init', code: toneJsCode }, '*');
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [toneJsCode, iframeLoaded]);

  const handlePlay = () => {
    if (isPlaying) {
      iframeRef.current?.contentWindow?.postMessage({ type: 'stop' }, '*');
      return;
    }

    // Lazy load iframe on first play
    if (!iframeLoaded) {
      setIframeLoaded(true);
      setIsLoading(true);
      pendingPlayRef.current = true;
      return;
    }

    setIsLoading(true);
    iframeRef.current?.contentWindow?.postMessage({ type: 'play' }, '*');
  };

  const handleStop = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'stop' }, '*');
  };

  const handleMuteToggle = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: isMuted ? 'unmute' : 'mute' }, '*');
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'play' }, '*');
    }, 100);
  };

  if (!toneJsCode) return null;

  const iframeElement = iframeLoaded && (
    <iframe
      ref={iframeRef}
      srcDoc={generateIframeContent()}
      className="audio-preview-iframe hidden"
      style={{ width: 0, height: 0, border: 'none', position: 'absolute' }}
      sandbox="allow-scripts"
      title="Audio Preview"
    />
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {iframeElement}

        {isLoading ? (
          <button
            disabled
            className="p-1 rounded text-[var(--color-primary)] cursor-wait"
            title="Loading audio..."
          >
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        ) : !isPlaying ? (
          <button
            onClick={handlePlay}
            disabled={iframeLoaded && !iframeReady}
            className={`p-1 rounded transition-colors ${
              iframeLoaded && !iframeReady
                ? 'text-[var(--color-text-tertiary)] cursor-not-allowed'
                : 'text-green-400 hover:text-green-300'
            }`}
            title={iframeLoaded && !iframeReady ? 'Loading...' : 'Play Preview'}
          >
            <Play className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="p-1 rounded transition-colors text-red-400 hover:text-red-300"
            title="Stop"
          >
            <Square className="w-5 h-5" />
          </button>
        )}

        {isPlaying && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Playing
          </span>
        )}

        {error && (
          <span className="text-xs text-red-400" title={error}>Error</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
      {iframeElement}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
              isPlaying
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30'
            }`}
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <Square className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {isPlaying && (
            <>
              <button
                onClick={handleRestart}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/80 transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleMuteToggle}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>

        <div className="text-sm text-[var(--color-text-secondary)]">
          {isPlaying ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Playing
            </span>
          ) : (
            'Ready'
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
