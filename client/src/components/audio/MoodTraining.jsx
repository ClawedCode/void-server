import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Zap, Play, Star, RefreshCw, Save, Sparkles, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import AudioPreviewPlayer from './AudioPreviewPlayer';
import { extractAudioFingerprint } from '../../utils/audioFingerprintExtractor';

/**
 * MoodTraining - Training workflow for generating and rating audio samples
 *
 * Workflow:
 * 1. Generate batch of tracks (2-5)
 * 2. Preview and rate each track
 * 3. Provide feedback
 * 4. Analyze feedback to get refinement suggestions
 * 5. Apply suggestions to mood file
 */
export default function MoodTraining() {
  const { slug } = useParams();
  const [mood, setMood] = useState(null);
  const [, setSession] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [, setGeneratingTrackId] = useState(null);
  const [batchCount, setBatchCount] = useState(3);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load mood info
  useEffect(() => {
    const loadMood = async () => {
      const res = await fetch('/api/audio/moods');
      const data = await res.json();
      const foundMood = data.moods?.find(m => m.value === slug);
      setMood(foundMood || { value: slug, label: slug });
    };
    loadMood();
  }, [slug]);

  const handleGenerateBatch = async () => {
    setGenerating(true);
    setTracks([]);

    // Start batch
    const batchRes = await fetch('/api/audio/training/generate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moodSlug: slug, count: batchCount })
    });
    const batchData = await batchRes.json();
    setSession(batchData);

    // Initialize tracks with pending status
    const pendingTracks = batchData.tracks.map(t => ({
      ...t,
      status: 'pending',
      audioCode: null,
      fingerprint: null,
      rating: null,
      feedback: ''
    }));
    setTracks(pendingTracks);

    // Generate each track sequentially
    for (let i = 0; i < pendingTracks.length; i++) {
      const track = pendingTracks[i];
      setGeneratingTrackId(track.id);

      // Update status to generating
      setTracks(prev => prev.map(t =>
        t.id === track.id ? { ...t, status: 'generating' } : t
      ));

      const genRes = await fetch('/api/audio/training/generate-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodSlug: slug,
          trackId: track.id,
          sessionId: batchData.sessionId
        })
      });

      if (!genRes.ok) {
        setTracks(prev => prev.map(t =>
          t.id === track.id ? { ...t, status: 'error' } : t
        ));
        continue;
      }

      const genData = await genRes.json();
      const fingerprint = extractAudioFingerprint(genData.audioCode);

      // Save track to library
      await fetch('/api/audio/training/save-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodSlug: slug,
          trackId: track.id,
          audioCode: genData.audioCode,
          sessionId: batchData.sessionId
        })
      });

      setTracks(prev => prev.map(t =>
        t.id === track.id
          ? { ...t, status: 'ready', audioCode: genData.audioCode, fingerprint }
          : t
      ));
    }

    setGeneratingTrackId(null);
    setGenerating(false);
    toast.success(`Generated ${batchCount} training samples`);
  };

  const handleRateTrack = async (trackId, rating) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, rating } : t
    ));

    // Save rating to backend
    await fetch('/api/audio/training/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moodSlug: slug,
        trackId,
        rating
      })
    });
  };

  const handleFeedbackChange = (trackId, feedback) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, feedback } : t
    ));
  };

  const handleSaveFeedback = async (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    await fetch('/api/audio/training/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moodSlug: slug,
        trackId,
        rating: track.rating,
        feedback: track.feedback
      })
    });

    toast.success('Feedback saved');
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);

    const ratedTracks = tracks.filter(t => t.rating);
    if (ratedTracks.length === 0) {
      toast.error('Rate at least one track before analyzing');
      setAnalyzing(false);
      return;
    }

    const res = await fetch('/api/audio/training/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moodSlug: slug,
        trackIds: ratedTracks.map(t => t.id)
      })
    });

    const data = await res.json();
    setSuggestions(data.suggestions || []);
    setShowSuggestions(true);
    setAnalyzing(false);
  };

  const handleApplySuggestion = async (suggestion) => {
    const res = await fetch('/api/audio/training/apply-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moodSlug: slug,
        suggestions: [suggestion]
      })
    });

    if (res.ok) {
      toast.success('Suggestion applied to mood file');
      setSuggestions(prev => prev.filter(s => s !== suggestion));
    } else {
      toast.error('Failed to apply suggestion');
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'add_characteristics':
      case 'add_examples':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'update_mistakes':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'improve_criteria':
        return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  const ratedCount = tracks.filter(t => t.rating).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/audio/moods"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Moods
          </Link>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <Link
            to={`/audio/moods/${slug}`}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            {mood?.label || slug}
          </Link>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <span className="text-[var(--color-text-primary)] font-medium">Training</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-secondary)]">Generate</span>
            <select
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value))}
              className="px-2 py-1 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)]"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
            <span className="text-sm text-[var(--color-text-secondary)]">samples</span>
          </div>
          <button
            onClick={handleGenerateBatch}
            disabled={generating}
            className="btn btn-primary flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Batch
              </>
            )}
          </button>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing || ratedCount === 0}
            className="btn btn-secondary flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Feedback ({ratedCount} rated)
              </>
            )}
          </button>
        )}
      </div>

      {/* Tracks grid */}
      {tracks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-[var(--color-text-primary)]">
                  Sample {idx + 1}
                </h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  track.status === 'ready'
                    ? 'bg-green-500/10 text-green-400'
                    : track.status === 'generating'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : track.status === 'error'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}>
                  {track.status}
                </span>
              </div>

              {track.status === 'generating' && (
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating audio...
                </div>
              )}

              {track.status === 'ready' && (
                <div className="space-y-4">
                  {/* Player */}
                  <AudioPreviewPlayer toneJsCode={track.audioCode} compact />

                  {/* Fingerprint summary */}
                  {track.fingerprint && (
                    <div className="flex gap-4 text-xs text-[var(--color-text-secondary)]">
                      <span>BPM: {track.fingerprint.bpm}</span>
                      <span>Synths: {track.fingerprint.instrumentCount}</span>
                      <span>Effects: {track.fingerprint.effectChainDepth}</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[var(--color-text-secondary)] mr-2">Rate:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRateTrack(track.id, star)}
                        className="p-1 transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (track.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-[var(--color-border)]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <textarea
                      value={track.feedback}
                      onChange={(e) => handleFeedbackChange(track.id, e.target.value)}
                      placeholder="Optional feedback..."
                      className="w-full p-2 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none h-20"
                    />
                    {track.feedback && (
                      <button
                        onClick={() => handleSaveFeedback(track.id)}
                        className="btn btn-secondary text-xs flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Save Feedback
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Suggestions modal/panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Refinement Suggestions
              </h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                &times;
              </button>
            </div>

            <div className="p-4 space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[var(--color-border)] rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--color-text-primary)] mb-1">
                        {suggestion.title}
                      </h4>
                      {suggestion.reasoning && (
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2 italic">
                          {suggestion.reasoning}
                        </p>
                      )}
                      <pre className="p-2 rounded bg-[var(--color-background)] text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">
                        {suggestion.content}
                      </pre>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="btn btn-primary text-sm"
                        >
                          Apply to Mood
                        </button>
                        <button
                          onClick={() => setSuggestions(prev => prev.filter(s => s !== suggestion))}
                          className="btn btn-secondary text-sm"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {tracks.length === 0 && !generating && (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Generate a batch of samples to start training</p>
          <p className="text-sm mt-1">Rate samples to help improve the mood guidance</p>
        </div>
      )}
    </div>
  );
}
