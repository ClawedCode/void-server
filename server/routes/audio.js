/**
 * Audio Routes
 *
 * Handles mood management, audio library, and training endpoints.
 */

const express = require('express');
const router = express.Router();
const moodLoader = require('../services/mood-loader');
const libraryService = require('../services/audio-library-service');
const { extractAudioFingerprint } = require('../utils/audio-fingerprint');

// ============================================================================
// MOOD ENDPOINTS
// ============================================================================

/**
 * GET /api/audio/moods - List all moods
 */
router.get('/moods', async (req, res) => {
  const moods = await moodLoader.loadMoods();

  // Return array of { value: slug, label: displayName } for UI
  res.json({
    moods: moods.map(m => ({
      value: m.slug,
      label: m.name
    }))
  });
});

/**
 * GET /api/audio/moods/categories - Get moods grouped by category
 */
router.get('/moods/categories', async (req, res) => {
  const categories = await moodLoader.loadCategories();
  res.json({ categories });
});

/**
 * POST /api/audio/moods/content - Get mood file content
 */
router.post('/moods/content', async (req, res) => {
  const { moodSlug } = req.body;

  if (!moodSlug) {
    return res.status(400).json({ error: 'moodSlug required' });
  }

  const content = await moodLoader.getMoodContent(moodSlug);
  if (!content) {
    return res.status(404).json({ error: 'Mood file not found' });
  }

  res.json({ content, slug: moodSlug });
});

/**
 * POST /api/audio/moods/update - Update mood file content
 */
router.post('/moods/update', async (req, res) => {
  const { moodSlug, content } = req.body;

  if (!moodSlug) {
    return res.status(400).json({ error: 'moodSlug required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'content required' });
  }

  const success = await moodLoader.updateMoodContent(moodSlug, content);
  if (!success) {
    return res.status(404).json({ error: 'Mood file not found' });
  }

  res.json({ success: true, slug: moodSlug });
});

/**
 * GET /api/audio/moods/:slug/preview - Get mood preview code for playback
 */
router.get('/moods/:slug/preview', async (req, res) => {
  const content = await moodLoader.getMoodContent(req.params.slug);
  if (!content) {
    return res.status(404).json({ error: 'Mood file not found' });
  }

  // Extract Tone.js example code from markdown (look for initToneJsEngine pattern)
  const match = content.match(/```javascript\s*\n([\s\S]*?window\.initToneJsEngine[\s\S]*?)```/);
  if (!match) {
    return res.status(404).json({ error: 'No preview code found in mood file' });
  }

  res.json({ slug: req.params.slug, previewCode: match[1].trim() });
});

// ============================================================================
// LIBRARY ENDPOINTS
// ============================================================================

/**
 * GET /api/audio/library - Get all tracks with optional filters
 */
router.get('/library', async (req, res) => {
  const { mood, rating, used, favorite } = req.query;

  const filters = {};
  if (mood) filters.mood = mood;
  if (rating) filters.rating = parseInt(rating);
  if (used !== undefined) filters.used = used === 'true';
  if (favorite !== undefined) filters.favorite = favorite === 'true';

  const tracks = await libraryService.getAllTracks(filters);

  res.json({ tracks });
});

/**
 * GET /api/audio/library/:trackId - Get specific track with audio code
 */
router.get('/library/:trackId', async (req, res) => {
  const { trackId } = req.params;

  const track = await libraryService.getTrackById(trackId);

  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  res.json(track);
});

/**
 * POST /api/audio/library/:trackId/reclassify - Change track mood
 */
router.post('/library/:trackId/reclassify', async (req, res) => {
  const { trackId } = req.params;
  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({ error: 'mood is required' });
  }

  const track = await libraryService.updateTrackMood(trackId, mood);

  res.json({ success: true, track });
});

/**
 * POST /api/audio/library/:trackId/update - Update track metadata
 */
router.post('/library/:trackId/update', async (req, res) => {
  const { trackId } = req.params;
  const { rating, feedback, favorite } = req.body;

  const updates = {};
  if (rating !== undefined) updates.rating = rating;
  if (feedback !== undefined) updates.feedback = feedback;
  if (favorite !== undefined) updates.favorite = favorite;

  const track = await libraryService.updateTrackMetadata(trackId, updates);

  res.json({ success: true, track });
});

/**
 * POST /api/audio/library/:trackId/mark-used - Mark track as used in post
 */
router.post('/library/:trackId/mark-used', async (req, res) => {
  const { trackId } = req.params;
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  const track = await libraryService.markTrackAsUsed(trackId, postId);

  res.json({ success: true, track });
});

/**
 * DELETE /api/audio/library/:trackId - Delete track
 */
router.delete('/library/:trackId', async (req, res) => {
  const { trackId } = req.params;

  await libraryService.deleteTrack(trackId);

  res.json({ success: true });
});

// ============================================================================
// TRAINING ENDPOINTS
// ============================================================================

/**
 * POST /api/audio/training/generate-batch - Start batch generation
 */
router.post('/training/generate-batch', async (req, res) => {
  const { moodSlug, count = 3 } = req.body;

  if (!moodSlug) {
    return res.status(400).json({ error: 'moodSlug is required' });
  }

  if (count < 2 || count > 5) {
    return res.status(400).json({ error: 'count must be between 2 and 5' });
  }

  const sessionId = libraryService.generateSessionId();
  const tracks = [];

  for (let i = 0; i < count; i++) {
    const trackId = libraryService.generateTrackId(sessionId, i);
    tracks.push({
      id: trackId,
      status: 'pending',
      sessionId,
    });
  }

  res.json({
    sessionId,
    tracks,
    message: 'Training batch initiated. Use /generate-track endpoint to generate each track.',
  });
});

/**
 * POST /api/audio/training/generate-track - Generate single track (LLM)
 */
router.post('/training/generate-track', async (req, res) => {
  const { moodSlug, trackId, sessionId } = req.body;

  if (!moodSlug || !trackId) {
    return res.status(400).json({ error: 'moodSlug and trackId are required' });
  }

  // Get prompt executor for LLM generation
  const promptExecutor = require('../services/prompt-executor');
  const moodContent = await moodLoader.getMoodContent(moodSlug);

  if (!moodContent) {
    return res.status(404).json({ error: 'Mood file not found' });
  }

  // Load moods to get display name
  const moods = await moodLoader.loadMoods();
  const moodData = moods.find(m => m.slug === moodSlug);
  const moodDisplayName = moodData ? moodData.name : moodSlug;

  // Generate audio with the audio-freeform template
  const result = await promptExecutor.executePrompt('audio-freeform', {
    plan: `Generate a training sample for the ${moodDisplayName} mood. Focus on exploring the characteristic elements and vibe of this style.`,
    moodContent: moodContent,
    videoDuration: 60
  });

  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Failed to generate audio' });
  }

  // Extract Tone.js code from response
  const codeMatch = result.content.match(/```(?:javascript)?\s*\n([\s\S]*?)```/);
  const audioCode = codeMatch ? codeMatch[1].trim() : result.content;

  res.json({
    trackId,
    sessionId,
    audioCode,
  });
});

/**
 * POST /api/audio/training/save-track - Save generated track to library
 */
router.post('/training/save-track', async (req, res) => {
  const { moodSlug, trackId, audioCode, sessionId } = req.body;

  if (!moodSlug || !trackId || !audioCode) {
    return res.status(400).json({ error: 'moodSlug, trackId, and audioCode are required' });
  }

  const fingerprint = extractAudioFingerprint(audioCode);

  const track = await libraryService.addTrack(trackId, audioCode, {
    mood: moodSlug,
    fingerprint,
    generatedAt: new Date().toISOString(),
    source: 'training',
  });

  res.json({
    success: true,
    track,
  });
});

/**
 * POST /api/audio/training/feedback - Save rating/feedback
 */
router.post('/training/feedback', async (req, res) => {
  const { moodSlug, trackId, rating, feedback } = req.body;

  if (!moodSlug || !trackId) {
    return res.status(400).json({ error: 'moodSlug and trackId are required' });
  }

  const updates = {};
  if (rating !== undefined) updates.rating = rating;
  if (feedback) {
    updates.feedback = typeof feedback === 'string' ? { text: feedback } : feedback;
  }

  const track = await libraryService.updateTrackMetadata(trackId, updates);

  res.json({
    success: true,
    track,
  });
});

/**
 * POST /api/audio/training/analyze - Analyze feedback for refinements
 */
router.post('/training/analyze', async (req, res) => {
  const { moodSlug, trackIds } = req.body;

  if (!moodSlug) {
    return res.status(400).json({ error: 'moodSlug is required' });
  }

  // Get tracks for analysis
  let tracks;
  if (trackIds && trackIds.length > 0) {
    tracks = await Promise.all(trackIds.map(id => libraryService.getTrackById(id)));
    tracks = tracks.filter(t => t !== null);
  } else {
    tracks = await libraryService.getAllTracks({ mood: moodSlug });
  }

  // Filter to only tracks with ratings
  const ratedTracks = tracks.filter(t => t.rating);

  if (ratedTracks.length === 0) {
    return res.status(400).json({
      error: 'No rated tracks found for analysis',
      message: 'Please rate at least some tracks before requesting analysis'
    });
  }

  // Generate suggestions based on feedback patterns
  const suggestions = generateRefinementSuggestions(ratedTracks);

  res.json({
    success: true,
    totalTracks: tracks.length,
    ratedTracks: ratedTracks.length,
    averageRating: ratedTracks.reduce((sum, t) => sum + t.rating, 0) / ratedTracks.length,
    suggestions,
  });
});

/**
 * POST /api/audio/training/apply-suggestions - Apply refinement suggestions
 */
router.post('/training/apply-suggestions', async (req, res) => {
  const { moodSlug, suggestions } = req.body;

  if (!moodSlug || !suggestions || suggestions.length === 0) {
    return res.status(400).json({ error: 'moodSlug and suggestions are required' });
  }

  let moodContent = await moodLoader.getMoodContent(moodSlug);
  if (!moodContent) {
    return res.status(404).json({ error: 'Mood file not found' });
  }

  // Apply each suggestion
  for (const suggestion of suggestions) {
    moodContent = applySuggestionToContent(moodContent, suggestion);
  }

  // Write updated content
  await moodLoader.updateMoodContent(moodSlug, moodContent);

  console.log(`✅ Applied ${suggestions.length} suggestions to ${moodSlug}.md`);

  res.json({
    success: true,
    moodSlug,
    appliedCount: suggestions.length,
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate refinement suggestions from rated tracks
 */
function generateRefinementSuggestions(ratedTracks) {
  const suggestions = [];

  // Analyze high-rated tracks (4-5 stars)
  const highRated = ratedTracks.filter(t => t.rating >= 4);
  const lowRated = ratedTracks.filter(t => t.rating <= 2);

  // Analyze BPM patterns in high-rated tracks
  if (highRated.length >= 2) {
    const bpms = highRated
      .filter(t => t.fingerprint?.bpm)
      .map(t => t.fingerprint.bpm);

    if (bpms.length >= 2) {
      const avgBpm = Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);
      const minBpm = Math.min(...bpms);
      const maxBpm = Math.max(...bpms);

      suggestions.push({
        type: 'add_characteristics',
        title: 'BPM Range from High-Rated Tracks',
        section: 'Key Characteristics',
        content: `- **Optimal BPM Range**: ${minBpm}-${maxBpm} BPM (avg: ${avgBpm})`,
        reasoning: `Based on ${highRated.length} high-rated tracks, this BPM range works well.`,
      });
    }

    // Analyze common synth patterns
    const synthCounts = {};
    highRated.forEach(t => {
      (t.fingerprint?.synthTypes || []).forEach(s => {
        synthCounts[s.type] = (synthCounts[s.type] || 0) + 1;
      });
    });

    const commonSynths = Object.entries(synthCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (commonSynths.length > 0) {
      suggestions.push({
        type: 'add_examples',
        title: 'Common Synths in High-Rated Tracks',
        section: 'Sound Design Details',
        content: `**Recommended Synths**: ${commonSynths.map(([type]) => type).join(', ')}`,
        reasoning: `These synth types appear frequently in successful tracks.`,
        data: { commonPatterns: { commonSynths: commonSynths.map(([type, count]) => ({ type, frequency: count / highRated.length })) } }
      });
    }
  }

  // Analyze feedback from low-rated tracks
  if (lowRated.length >= 1) {
    const feedbackTexts = lowRated
      .filter(t => t.feedback?.text)
      .map(t => ({ text: t.feedback.text, rating: t.rating }));

    if (feedbackTexts.length > 0) {
      suggestions.push({
        type: 'update_mistakes',
        title: 'Common Issues from Low-Rated Tracks',
        section: 'Common Mistakes to Avoid',
        content: feedbackTexts.map(f => `- ${f.text}`).join('\n'),
        reasoning: `Based on feedback from ${lowRated.length} low-rated tracks.`,
        data: { feedback: feedbackTexts }
      });
    }
  }

  return suggestions;
}

/**
 * Apply a suggestion to mood content
 */
function applySuggestionToContent(content, suggestion) {
  const { section, content: suggestionContent } = suggestion;

  // Find the section in the content
  const sectionRegex = new RegExp(`(###? ${section}[\\s\\S]*?)(\\n###|$)`, 'i');
  const match = content.match(sectionRegex);

  if (match) {
    // Append to existing section
    const sectionContent = match[1];
    const updatedSection = sectionContent.trimEnd() + '\n\n' + suggestionContent;
    content = content.replace(sectionContent, updatedSection);
  } else {
    // Section doesn't exist, add it before "Example Tone.js Code"
    const exampleRegex = /(### Example Tone\.js Code)/i;
    if (exampleRegex.test(content)) {
      content = content.replace(
        exampleRegex,
        `### ${section}\n\n${suggestionContent}\n\n$1`
      );
    } else {
      // Add at the end
      content += `\n\n### ${section}\n\n${suggestionContent}\n`;
    }
  }

  return content;
}

module.exports = router;
