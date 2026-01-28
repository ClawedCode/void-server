import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Music, Library, Globe } from 'lucide-react';
import MoodManager from '../components/audio/MoodManager';
import MoodTraining from '../components/audio/MoodTraining';
import TrackLibrary from '../components/audio/TrackLibrary';
import AudioSharing from '../components/audio/AudioSharing';

/**
 * AudioPage - Main audio management page with sub-routes
 *
 * Routes:
 * - /audio -> redirect to /audio/moods
 * - /audio/moods -> mood list
 * - /audio/moods/:slug -> mood detail
 * - /audio/moods/:slug/:tab -> mood detail with tab (preview, code, raw)
 * - /audio/moods/:slug/train -> training workflow
 * - /audio/library -> track library
 * - /audio/library/:trackId -> track detail
 * - /audio/sharing -> federated audio sharing
 */
export default function AudioPage() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="space-y-6">
      {/* Header tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)]">
        <Link
          to="/audio/moods"
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            isActive('/audio/moods')
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Music className="w-4 h-4" />
          Moods
        </Link>
        <Link
          to="/audio/library"
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            isActive('/audio/library')
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Library className="w-4 h-4" />
          Library
        </Link>
        <Link
          to="/audio/sharing"
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            isActive('/audio/sharing')
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Globe className="w-4 h-4" />
          Sharing
        </Link>
      </div>

      {/* Routes */}
      <Routes>
        <Route index element={<Navigate to="moods" replace />} />
        <Route path="moods" element={<MoodManager />} />
        <Route path="moods/:slug" element={<MoodManager />} />
        <Route path="moods/:slug/:tab" element={<MoodManager />} />
        <Route path="moods/:slug/train" element={<MoodTraining />} />
        <Route path="library" element={<TrackLibrary />} />
        <Route path="library/:trackId" element={<TrackLibrary />} />
        <Route path="sharing" element={<AudioSharing />} />
      </Routes>
    </div>
  );
}
