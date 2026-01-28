/**
 * Audio Library Service
 *
 * Manages the audio track library - CRUD operations for generated tracks.
 */

const fs = require('fs').promises;
const path = require('path');

const LIBRARY_DIR = path.join(__dirname, '../../data/audio/library');
const INDEX_PATH = path.join(LIBRARY_DIR, 'index.json');
const TEMPLATE_DIR = path.join(__dirname, '../../data_template/audio/library');

let bootstrapComplete = false;

/**
 * Bootstrap the audio library from data_template if empty
 * Copies template tracks on first access (copy-on-first-access pattern)
 */
async function ensureLibrary() {
  if (bootstrapComplete) return;
  bootstrapComplete = true;

  // If library index exists and has tracks, nothing to do
  const indexExists = await fs.access(INDEX_PATH).then(() => true).catch(() => false);
  if (indexExists) {
    const content = await fs.readFile(INDEX_PATH, 'utf-8');
    const index = JSON.parse(content);
    if (index.tracks?.length > 0) return;
  }

  // Check if template exists
  const templateIndex = path.join(TEMPLATE_DIR, 'index.json');
  const templateExists = await fs.access(templateIndex).then(() => true).catch(() => false);
  if (!templateExists) return;

  // Create library directory
  await fs.mkdir(LIBRARY_DIR, { recursive: true });

  // Read template index
  const templateContent = await fs.readFile(templateIndex, 'utf-8');
  const template = JSON.parse(templateContent);

  // Copy index
  await fs.writeFile(INDEX_PATH, templateContent, 'utf-8');

  // Copy all track files (.json and .js)
  let copied = 0;
  for (const track of template.tracks) {
    const jsonSrc = path.join(TEMPLATE_DIR, `${track.id}.json`);
    const jsSrc = path.join(TEMPLATE_DIR, `${track.id}.js`);
    const jsonDest = path.join(LIBRARY_DIR, `${track.id}.json`);
    const jsDest = path.join(LIBRARY_DIR, `${track.id}.js`);

    const jsonExists = await fs.access(jsonSrc).then(() => true).catch(() => false);
    const jsExists = await fs.access(jsSrc).then(() => true).catch(() => false);

    if (jsonExists) await fs.copyFile(jsonSrc, jsonDest);
    if (jsExists) await fs.copyFile(jsSrc, jsDest);
    copied++;
  }

  console.log(`🎵 Bootstrapped audio library with ${copied} template tracks`);
}

/**
 * Load the entire audio library index
 * @returns {Promise<object>} - { tracks: [], moods: {}, lastUpdated, version }
 */
async function loadIndex() {
  await ensureLibrary();

  const indexExists = await fs.access(INDEX_PATH).then(() => true).catch(() => false);
  if (!indexExists) {
    return {
      tracks: [],
      moods: {},
      lastUpdated: null,
      version: 2,
    };
  }

  const content = await fs.readFile(INDEX_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save the audio library index
 * @param {object} index - Index object to save
 */
async function saveIndex(index) {
  index.lastUpdated = new Date().toISOString();
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * Get all tracks with optional filtering
 * @param {object} filters - { mood, rating, used, favorite }
 * @returns {Promise<Array>} - Array of track metadata
 */
async function getAllTracks(filters = {}) {
  const index = await loadIndex();
  let tracks = index.tracks;

  if (filters.mood) {
    tracks = tracks.filter(t => t.mood === filters.mood);
  }

  if (filters.rating) {
    tracks = tracks.filter(t => t.rating >= filters.rating);
  }

  if (filters.used !== undefined) {
    if (filters.used) {
      tracks = tracks.filter(t => t.usedInPosts && t.usedInPosts.length > 0);
    } else {
      tracks = tracks.filter(t => !t.usedInPosts || t.usedInPosts.length === 0);
    }
  }

  if (filters.favorite !== undefined) {
    tracks = tracks.filter(t => t.favorite === filters.favorite);
  }

  return tracks;
}

/**
 * Get a single track by ID with full metadata and audio code
 * @param {string} trackId - Track ID
 * @returns {Promise<object|null>} - Track metadata with audioCode and fingerprint
 */
async function getTrackById(trackId) {
  // Try to load full metadata from individual .json file
  const metaPath = path.join(LIBRARY_DIR, `${trackId}.json`);
  const metaExists = await fs.access(metaPath).then(() => true).catch(() => false);

  let track = null;

  if (metaExists) {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    track = JSON.parse(metaContent);
  } else {
    // Fall back to index
    const index = await loadIndex();
    track = index.tracks.find(t => t.id === trackId);
  }

  if (!track) {
    return null;
  }

  // Load audio code
  const audioPath = path.join(LIBRARY_DIR, `${trackId}.js`);
  const audioExists = await fs.access(audioPath).then(() => true).catch(() => false);

  if (audioExists) {
    const audioCode = await fs.readFile(audioPath, 'utf-8');
    return {
      ...track,
      audioCode,
    };
  }

  return track;
}

/**
 * Update track mood classification
 * @param {string} trackId - Track ID
 * @param {string} newMood - New mood slug
 * @returns {Promise<object>} - Updated track
 */
async function updateTrackMood(trackId, newMood) {
  const index = await loadIndex();
  const trackIndex = index.tracks.findIndex(t => t.id === trackId);

  if (trackIndex === -1) {
    throw new Error(`Track ${trackId} not found`);
  }

  const oldMood = index.tracks[trackIndex].mood;
  index.tracks[trackIndex].mood = newMood;

  // Update mood stats
  if (index.moods[oldMood]) {
    index.moods[oldMood].trackCount--;
  }

  if (!index.moods[newMood]) {
    index.moods[newMood] = {
      slug: newMood,
      trackCount: 0,
      averageRating: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  index.moods[newMood].trackCount++;

  await saveIndex(index);

  // Update individual metadata file
  const metaPath = path.join(LIBRARY_DIR, `${trackId}.json`);
  await fs.writeFile(metaPath, JSON.stringify(index.tracks[trackIndex], null, 2), 'utf-8');

  console.log(`✅ Reclassified track ${trackId} from ${oldMood} to ${newMood}`);

  return index.tracks[trackIndex];
}

/**
 * Update track metadata (rating, feedback, favorite)
 * @param {string} trackId - Track ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} - Updated track
 */
async function updateTrackMetadata(trackId, updates) {
  const index = await loadIndex();
  const trackIndex = index.tracks.findIndex(t => t.id === trackId);

  if (trackIndex === -1) {
    throw new Error(`Track ${trackId} not found`);
  }

  const track = index.tracks[trackIndex];

  // Update fields
  if (updates.rating !== undefined) {
    track.rating = updates.rating;
  }

  if (updates.favorite !== undefined) {
    track.favorite = updates.favorite;
  }

  if (updates.feedback) {
    track.feedback = {
      ...track.feedback,
      ...updates.feedback,
    };
  }

  if (updates.fingerprint) {
    track.fingerprint = updates.fingerprint;
  }

  // Recalculate mood average rating if rating changed
  if (updates.rating !== undefined && index.moods[track.mood]) {
    const moodTracks = index.tracks.filter(t => t.mood === track.mood);
    const ratedTracks = moodTracks.filter(t => t.rating !== null);
    if (ratedTracks.length > 0) {
      const sum = ratedTracks.reduce((acc, t) => acc + t.rating, 0);
      index.moods[track.mood].averageRating = sum / ratedTracks.length;
    }
  }

  await saveIndex(index);

  // Update individual metadata file
  const metaPath = path.join(LIBRARY_DIR, `${trackId}.json`);
  await fs.writeFile(metaPath, JSON.stringify(track, null, 2), 'utf-8');

  return track;
}

/**
 * Mark track as used in a post
 * @param {string} trackId - Track ID
 * @param {string} postId - Post ID where track was used
 * @returns {Promise<object>} - Updated track
 */
async function markTrackAsUsed(trackId, postId) {
  const index = await loadIndex();
  const trackIndex = index.tracks.findIndex(t => t.id === trackId);

  if (trackIndex === -1) {
    throw new Error(`Track ${trackId} not found`);
  }

  const track = index.tracks[trackIndex];

  if (!track.usedInPosts) {
    track.usedInPosts = [];
  }

  if (!track.usedInPosts.includes(postId)) {
    track.usedInPosts.push(postId);
  }

  await saveIndex(index);

  // Update individual metadata file
  const metaPath = path.join(LIBRARY_DIR, `${trackId}.json`);
  await fs.writeFile(metaPath, JSON.stringify(track, null, 2), 'utf-8');

  return track;
}

/**
 * Delete a track from the library
 * @param {string} trackId - Track ID
 */
async function deleteTrack(trackId) {
  const index = await loadIndex();
  const trackIndex = index.tracks.findIndex(t => t.id === trackId);

  if (trackIndex === -1) {
    throw new Error(`Track ${trackId} not found`);
  }

  const track = index.tracks[trackIndex];

  // Update mood stats
  if (index.moods[track.mood]) {
    index.moods[track.mood].trackCount--;
  }

  // Remove from index
  index.tracks.splice(trackIndex, 1);

  await saveIndex(index);

  // Delete files
  const metaPath = path.join(LIBRARY_DIR, `${trackId}.json`);
  const audioPath = path.join(LIBRARY_DIR, `${trackId}.js`);

  const metaExists = await fs.access(metaPath).then(() => true).catch(() => false);
  const audioExists = await fs.access(audioPath).then(() => true).catch(() => false);

  if (metaExists) await fs.unlink(metaPath);
  if (audioExists) await fs.unlink(audioPath);

  console.log(`🗑️ Deleted track ${trackId}`);
}

/**
 * Get mood statistics
 * @returns {Promise<object>} - Mood stats
 */
async function getMoodStats() {
  const index = await loadIndex();
  return index.moods;
}

/**
 * Add a new track to the library
 * @param {string} trackId - Track ID
 * @param {string} audioCode - Tone.js code
 * @param {object} metadata - Track metadata
 * @returns {Promise<object>} - Created track
 */
async function addTrack(trackId, audioCode, metadata) {
  const index = await loadIndex();

  // Check for duplicate
  if (index.tracks.find(t => t.id === trackId)) {
    throw new Error(`Track ${trackId} already exists`);
  }

  const track = {
    id: trackId,
    mood: metadata.mood || 'content-aware',
    fingerprint: metadata.fingerprint || null,
    rating: metadata.rating || null,
    feedback: metadata.feedback || {
      winner: null,
      text: '',
      criteria: {
        vibeAccuracy: null,
        mixingQuality: null,
        arrangement: null,
        instrumentation: null,
      },
    },
    usedInPosts: metadata.usedInPosts || [],
    generatedAt: metadata.generatedAt || new Date().toISOString(),
    source: metadata.source || 'manual',
    favorite: metadata.favorite || false,
  };

  // Add to index
  index.tracks.push(track);

  // Update mood stats
  if (!index.moods[track.mood]) {
    index.moods[track.mood] = {
      slug: track.mood,
      trackCount: 0,
      averageRating: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  index.moods[track.mood].trackCount++;

  await saveIndex(index);

  // Save files
  const metaPath = path.join(LIBRARY_DIR, `${trackId}.json`);
  const audioPath = path.join(LIBRARY_DIR, `${trackId}.js`);

  await fs.writeFile(metaPath, JSON.stringify(track, null, 2), 'utf-8');
  await fs.writeFile(audioPath, audioCode, 'utf-8');

  console.log(`✅ Added track ${trackId} to library`);

  return track;
}

/**
 * Generate a unique track ID
 * @param {string} sessionId - Training session ID
 * @param {number} index - Track index in batch
 * @returns {string} - Track ID
 */
function generateTrackId(sessionId, index) {
  const date = new Date().toISOString().slice(0, 10);
  return `training-${date}-${sessionId}-${String(index).padStart(3, '0')}`;
}

/**
 * Generate a session ID
 * @returns {string} - Session ID (6 char hex)
 */
function generateSessionId() {
  return Math.random().toString(16).slice(2, 8);
}

module.exports = {
  loadIndex,
  saveIndex,
  getAllTracks,
  getTrackById,
  updateTrackMood,
  updateTrackMetadata,
  markTrackAsUsed,
  deleteTrack,
  getMoodStats,
  addTrack,
  generateTrackId,
  generateSessionId,
  LIBRARY_DIR,
  INDEX_PATH,
};
