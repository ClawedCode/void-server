import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Library, Trash2, ChevronRight, Heart, Copy, Check, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AudioPreviewPlayer from './AudioPreviewPlayer';
import AudioTimeline from './AudioTimeline';

/**
 * TrackLibrary - Browse and manage saved audio tracks
 *
 * List view: table layout with inline play, timeline, mood editing, favorites, actions
 * Detail view: full track info with player, fingerprint, code viewer
 */
export default function TrackLibrary() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableMoods, setAvailableMoods] = useState([]);
  const [trackAudioCode, setTrackAudioCode] = useState({});
  const [trackProgress, setTrackProgress] = useState({});
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [editingMood, setEditingMood] = useState(null);
  const [copiedTrackId, setCopiedTrackId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    mood: '',
    favoritesOnly: false,
  });

  useEffect(() => {
    const loadTracks = async () => {
      setLoading(true);
      const response = await fetch('/api/audio/library');
      const data = await response.json();
      setTracks(data.tracks || []);
      setLoading(false);
    };
    const loadMoods = async () => {
      const response = await fetch('/api/audio/moods');
      const data = await response.json();
      setAvailableMoods(data.moods || []);
    };
    loadTracks();
    loadMoods();
  }, []);

  // Load specific track when trackId changes
  useEffect(() => {
    if (!trackId) {
      setSelectedTrack(null);
      return;
    }
    const loadDetails = async () => {
      const response = await fetch(`/api/audio/library/${trackId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTrack(data);
      }
    };
    loadDetails();
  }, [trackId]);

  // Filter and sort tracks
  const filteredTracks = useMemo(() => {
    let result = [...tracks];

    if (filters.search) {
      result = result.filter(t => t.id.toLowerCase().includes(filters.search.toLowerCase()));
    }

    if (filters.mood) {
      result = result.filter(t => t.mood === filters.mood);
    }

    if (filters.favoritesOnly) {
      result = result.filter(t => t.favorite);
    }

    // Sort by generatedAt descending (newest first)
    result.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

    return result;
  }, [tracks, filters]);

  // Load audio code for visible tracks
  useEffect(() => {
    const loadAudioCodeForTracks = async () => {
      for (const track of filteredTracks) {
        if (!trackAudioCode[track.id]) {
          const response = await fetch(`/api/audio/library/${track.id}`);
          if (!response.ok) continue;
          const data = await response.json();
          if (data.audioCode) {
            setTrackAudioCode(prev => ({ ...prev, [track.id]: data.audioCode }));
          }
        }
      }
    };

    if (filteredTracks.length > 0) {
      loadAudioCodeForTracks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTracks]);

  const handleToggleFavorite = async (trackId, currentFavorite) => {
    const response = await fetch(`/api/audio/library/${trackId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: !currentFavorite }),
    });

    if (!response.ok) {
      toast.error('Failed to toggle favorite');
      return;
    }

    const { track: updatedTrack } = await response.json();
    setTracks(tracks.map(t => t.id === trackId ? updatedTrack : t));
    if (selectedTrack?.id === trackId) {
      setSelectedTrack({ ...selectedTrack, favorite: !currentFavorite });
    }
  };

  const handleMoodChange = async (trackId, newMood) => {
    const track = tracks.find(t => t.id === trackId);
    if (newMood === track.mood) {
      setEditingMood(null);
      return;
    }

    const response = await fetch(`/api/audio/library/${trackId}/reclassify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: newMood }),
    });

    if (!response.ok) {
      toast.error('Failed to reclassify track');
      return;
    }

    const { track: updatedTrack } = await response.json();
    setTracks(tracks.map(t => t.id === trackId ? updatedTrack : t));

    const moodLabel = availableMoods.find(m => m.value === newMood)?.label || newMood;
    toast.success(`Track moved to ${moodLabel}`);
    setEditingMood(null);
  };

  const handleDelete = async (id) => {
    const response = await fetch(`/api/audio/library/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      toast.error('Failed to delete track');
      return;
    }

    setTracks(tracks.filter(t => t.id !== id));
    toast.success('Track deleted');

    if (trackId === id) {
      navigate('/audio/library');
    }
  };

  const handleCopyCode = async (track) => {
    const code = trackAudioCode[track.id];
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopiedTrackId(track.id);
      toast.success('Code copied');
      setTimeout(() => setCopiedTrackId(null), 2000);
      return;
    }

    const response = await fetch(`/api/audio/library/${track.id}`);
    const data = await response.json();
    if (data.audioCode) {
      await navigator.clipboard.writeText(data.audioCode);
      setCopiedTrackId(track.id);
      toast.success('Code copied');
      setTimeout(() => setCopiedTrackId(null), 2000);
    } else {
      toast.error('No code available');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const hasActiveFilters = filters.search || filters.mood || filters.favoritesOnly;

  // ──────────────────────────────────────────────────────────────
  // Track detail view
  // ──────────────────────────────────────────────────────────────
  if (trackId && selectedTrack) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/audio/library"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Library
          </Link>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <span className="text-[var(--color-text-primary)] font-medium font-mono text-xs">
            {selectedTrack.id}
          </span>
        </div>

        {/* Track info */}
        <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {selectedTrack.id}
              </h2>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {availableMoods.find(m => m.value === selectedTrack.mood)?.label || selectedTrack.mood}
                {' '}&bull;{' '}
                {formatDate(selectedTrack.generatedAt)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleFavorite(selectedTrack.id, selectedTrack.favorite)}
                className={`p-2 rounded ${
                  selectedTrack.favorite
                    ? 'text-red-400'
                    : 'text-[var(--color-text-tertiary)] hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${selectedTrack.favorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => handleDelete(selectedTrack.id)}
                className="p-2 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Player */}
          {selectedTrack.audioCode && (
            <AudioPreviewPlayer toneJsCode={selectedTrack.audioCode} />
          )}

          {/* Fingerprint */}
          {selectedTrack.fingerprint && (
            <div className="mt-4 p-3 rounded bg-[var(--color-background)]">
              <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Audio Fingerprint
              </h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-[var(--color-text-tertiary)]">BPM</div>
                  <div className="text-[var(--color-text-primary)]">{selectedTrack.fingerprint.bpm}</div>
                </div>
                <div>
                  <div className="text-[var(--color-text-tertiary)]">Instruments</div>
                  <div className="text-[var(--color-text-primary)]">{selectedTrack.fingerprint.instrumentCount}</div>
                </div>
                <div>
                  <div className="text-[var(--color-text-tertiary)]">Effects</div>
                  <div className="text-[var(--color-text-primary)]">{selectedTrack.fingerprint.effectChainDepth}</div>
                </div>
                <div>
                  <div className="text-[var(--color-text-tertiary)]">Events</div>
                  <div className="text-[var(--color-text-primary)]">{selectedTrack.fingerprint.scheduledEvents}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code */}
        {selectedTrack.audioCode && (
          <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">
                Tone.js Code
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedTrack.audioCode);
                  toast.success('Copied to clipboard');
                }}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <pre className="p-4 rounded bg-[var(--color-background)] text-sm font-mono text-[var(--color-text-secondary)] overflow-x-auto max-h-[400px] overflow-y-auto">
              {selectedTrack.audioCode}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Library list view (table)
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Library className="w-6 h-6 text-[var(--color-primary)]" />
          Track Library
        </h2>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {filteredTracks.length} of {tracks.length} tracks
        </span>
      </div>

      {/* Filters */}
      <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-[var(--color-text-tertiary)] mb-1">Search Track ID</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by ID..."
              className="w-full px-3 py-1.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--color-text-tertiary)] mb-1">Mood</label>
            <select
              value={filters.mood}
              onChange={(e) => setFilters({ ...filters, mood: e.target.value })}
              className="w-full px-3 py-1.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">All Moods</option>
              {availableMoods.map((mood) => (
                <option key={mood.value} value={mood.value}>{mood.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-1">
              <input
                type="checkbox"
                checked={filters.favoritesOnly}
                onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })}
                className="form-checkbox h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-background)]"
              />
              <span className="text-sm text-[var(--color-text-primary)]">Favorites Only</span>
            </label>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ search: '', mood: '', favoritesOnly: false })}
                className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tracks table */}
      {loading ? (
        <div className="text-[var(--color-text-secondary)] text-center py-12">Loading tracks...</div>
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <Library className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{hasActiveFilters ? 'No tracks match the current filters' : 'No tracks in library'}</p>
          {!hasActiveFilters && (
            <p className="text-sm mt-1">Generate tracks using the training workflow</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] border border-[var(--color-primary)]/30 rounded-lg">
            <thead className="border-b border-[var(--color-primary)]/30">
              <tr>
                <th className="px-3 py-2 text-left text-[var(--color-primary)] font-semibold text-sm">Play</th>
                <th className="px-3 py-2 text-left text-[var(--color-primary)] font-semibold text-sm w-64">Timeline</th>
                <th className="px-3 py-2 text-left text-[var(--color-primary)] font-semibold text-sm">Track ID</th>
                <th className="px-3 py-2 text-left text-[var(--color-primary)] font-semibold text-sm">Mood</th>
                <th className="px-3 py-2 text-left text-[var(--color-primary)] font-semibold text-sm">Favorite</th>
                <th className="px-3 py-2 text-left text-[var(--color-primary)] font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map(track => (
                <tr
                  key={track.id}
                  className={`border-b border-[var(--color-border)] hover:bg-[var(--color-background)]/50 ${
                    track.favorite ? 'bg-[var(--color-primary)]/5' : ''
                  }`}
                >
                  {/* Play */}
                  <td className="px-3 py-2">
                    {trackAudioCode[track.id] ? (
                      <AudioPreviewPlayer
                        toneJsCode={trackAudioCode[track.id]}
                        compact={true}
                        onProgressUpdate={(currentTime, duration, isPlaying) => {
                          setTrackProgress(prev => ({
                            ...prev,
                            [track.id]: { currentTime, duration, isPlaying }
                          }));
                        }}
                      />
                    ) : (
                      <span className="text-xs text-[var(--color-text-tertiary)]">Loading...</span>
                    )}
                  </td>

                  {/* Timeline */}
                  <td className="px-3 py-2">
                    {trackProgress[track.id] ? (
                      <AudioTimeline
                        currentTime={trackProgress[track.id].currentTime}
                        duration={trackProgress[track.id].duration}
                        isPlaying={trackProgress[track.id].isPlaying}
                      />
                    ) : (
                      <div className="text-xs text-[var(--color-text-tertiary)]">Ready</div>
                    )}
                  </td>

                  {/* Track ID */}
                  <td className="px-3 py-2">
                    <Link
                      to={`/audio/library/${track.id}`}
                      className="font-mono text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 underline"
                    >
                      {track.id}
                    </Link>
                  </td>

                  {/* Mood (inline dropdown) */}
                  <td className="px-3 py-2">
                    {editingMood && editingMood.trackId === track.id ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={editingMood.newMood}
                          onChange={(e) => setEditingMood({ trackId: track.id, newMood: e.target.value })}
                          className="px-2 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                        >
                          {availableMoods.map((mood) => (
                            <option key={mood.value} value={mood.value}>{mood.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleMoodChange(track.id, editingMood.newMood)}
                          className="text-green-400 hover:text-green-300 text-xs px-1"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingMood(null)}
                          className="text-red-400 hover:text-red-300 text-xs px-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingMood({ trackId: track.id, newMood: track.mood })}
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        {availableMoods.find(m => m.value === track.mood)?.label || track.mood}
                      </button>
                    )}
                  </td>

                  {/* Favorite */}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleToggleFavorite(track.id, track.favorite)}
                      className={`p-1 rounded transition-colors ${
                        track.favorite
                          ? 'text-red-400'
                          : 'text-[var(--color-text-tertiary)] hover:text-red-400'
                      }`}
                      title={track.favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${track.favorite ? 'fill-current' : ''}`} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(track)}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80"
                        title="Copy code"
                      >
                        {copiedTrackId === track.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(track.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
