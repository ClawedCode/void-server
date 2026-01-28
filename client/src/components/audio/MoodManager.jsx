import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Music, ChevronRight, Code, FileText, Zap, PlayCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import AudioPreviewPlayer from './AudioPreviewPlayer';
import MoodAudioTimeline from './MoodAudioTimeline';
import { extractAudioFingerprint } from '../../utils/audioFingerprintExtractor';

/**
 * MoodManager - Main component for browsing and managing audio moods
 *
 * Shows a list of available moods with ability to:
 * - Preview mood audio
 * - View/edit mood markdown
 * - Navigate to training workflow
 */
export default function MoodManager() {
  const { slug, tab } = useParams();
  const navigate = useNavigate();
  const [moods, setMoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodContent, setMoodContent] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [fingerprint, setFingerprint] = useState(null);
  const [activeTab, setActiveTab] = useState(tab || 'preview');
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Load moods list
  useEffect(() => {
    const loadMoods = async () => {
      setLoading(true);
      const res = await fetch('/api/audio/moods');
      const data = await res.json();
      setMoods(data.moods || []);

      const catRes = await fetch('/api/audio/moods/categories');
      const catData = await catRes.json();
      setCategories(catData.categories || []);

      setLoading(false);
    };
    loadMoods();
  }, []);

  // Load selected mood details
  useEffect(() => {
    if (!slug) {
      setSelectedMood(null);
      setMoodContent('');
      setPreviewCode('');
      setFingerprint(null);
      return;
    }

    const loadMoodDetails = async () => {
      const contentRes = await fetch('/api/audio/moods/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodSlug: slug })
      });
      const contentData = await contentRes.json();
      if (contentData.content) {
        setMoodContent(contentData.content);
        setEditedContent(contentData.content);
      }

      const previewRes = await fetch(`/api/audio/moods/${slug}/preview`);
      if (previewRes.ok) {
        const previewData = await previewRes.json();
        setPreviewCode(previewData.previewCode || '');
        setFingerprint(extractAudioFingerprint(previewData.previewCode || ''));
      } else {
        setPreviewCode('');
        setFingerprint(null);
      }

      const mood = moods.find(m => m.value === slug);
      setSelectedMood(mood || { value: slug, label: slug });
    };

    loadMoodDetails();
  }, [slug, moods]);

  // Sync tab from URL
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleMoodSelect = (moodSlug) => {
    navigate(`/audio/moods/${moodSlug}`);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (slug) {
      navigate(`/audio/moods/${slug}/${newTab}`);
    }
  };

  const handleSaveContent = async () => {
    if (!slug) return;

    setSaving(true);
    const res = await fetch('/api/audio/moods/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moodSlug: slug, content: editedContent })
    });

    if (res.ok) {
      setMoodContent(editedContent);
      toast.success('Mood file saved');
    } else {
      toast.error('Failed to save mood file');
    }
    setSaving(false);
  };

  // Mood list view
  if (!slug) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Music className="w-6 h-6 text-[var(--color-primary)]" />
            Audio Moods
          </h2>
          <span className="text-sm text-[var(--color-text-secondary)]">
            {moods.length} moods available
          </span>
        </div>

        {loading ? (
          <div className="text-[var(--color-text-secondary)]">Loading moods...</div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.moods.map((mood) => (
                    <button
                      key={mood.slug}
                      onClick={() => handleMoodSelect(mood.slug)}
                      className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Music className="w-5 h-5 text-[var(--color-primary)]" />
                        <div>
                          <div className="font-medium text-[var(--color-text-primary)]">
                            {mood.name}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            {mood.energy} energy
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mood detail view
  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/audio/moods"
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Moods
          </Link>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <span className="text-[var(--color-text-primary)] font-medium">
            {selectedMood?.label || slug}
          </span>
        </div>
        <Link
          to={`/audio/moods/${slug}/train`}
          className="btn btn-primary flex items-center gap-2 text-sm"
        >
          <Zap className="w-4 h-4" />
          Train Mood
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        <button
          onClick={() => handleTabChange('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => handleTabChange('code')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'code'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Code className="w-4 h-4" />
          Example Code
        </button>
        <button
          onClick={() => handleTabChange('raw')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'raw'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Edit className="w-4 h-4" />
          Edit Raw
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Audio player */}
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">
              Audio Preview
            </h3>
            {previewCode ? (
              <AudioPreviewPlayer toneJsCode={previewCode} />
            ) : (
              <div className="p-4 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)]">
                No preview code available for this mood
              </div>
            )}
          </div>

          {/* Interactive Audio Fingerprint & Timeline */}
          {fingerprint && (
            <MoodAudioTimeline
              fingerprint={fingerprint}
              duration={90}
            />
          )}

          {/* Mood description */}
          <div className="prose prose-invert max-w-none">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Mood Description
            </h3>
            <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
              <pre className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap font-sans">
                {moodContent.split('```')[0] || 'No description available'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
            Example Tone.js Code
          </h3>
          {previewCode ? (
            <div className="relative">
              <pre className="p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-secondary)] overflow-x-auto max-h-[600px] overflow-y-auto">
                {previewCode}
              </pre>
            </div>
          ) : (
            <div className="p-4 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)]">
              No example code available
            </div>
          )}
        </div>
      )}

      {activeTab === 'raw' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Raw Markdown
            </h3>
            <button
              onClick={handleSaveContent}
              disabled={saving || editedContent === moodContent}
              className="btn btn-primary text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-[600px] p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
