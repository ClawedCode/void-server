/**
 * Mood Loader Service
 *
 * Loads mood files with frontmatter metadata for categorization and display.
 * Uses actual filenames as the source of truth (slugs).
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const MOODS_DIR = path.join(__dirname, '../../data/audio/moods');

const VALID_SLUG = /^[a-z0-9][a-z0-9-]*$/;

const CATEGORY_NAMES = {
  synthwave: 'Synthwave / Outrun',
  cinematic: 'Cinematic / Epic',
  industrial: 'Industrial / Dark',
  ambient: 'Ambient / Shoegaze',
  electronic: 'Electronic / House',
  triphop: 'Trip-Hop / Downtempo',
  experimental: 'Experimental',
  ballad: 'Ballad / Acoustic',
  neoclassical: 'Neoclassical / Modern Classical'
};

/**
 * Load all moods with their display names and metadata
 * @returns {Promise<Array<{slug: string, name: string, category: string, tags: string[], energy: string}>>}
 */
async function loadMoods() {
  const exists = await fs.access(MOODS_DIR).then(() => true).catch(() => false);
  if (!exists) {
    console.log('⚠️ Moods directory not found:', MOODS_DIR);
    return [];
  }

  const files = await fs.readdir(MOODS_DIR);
  const moodFiles = files.filter(f => f.endsWith('.md'));

  const moods = [];

  for (const file of moodFiles) {
    const slug = file.replace('.md', '');
    const filePath = path.join(MOODS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');

    const { data: frontmatter, content: body } = matter(content);

    // Extract display name from header: ## DISPLAY NAME (with optional emoji)
    const headerMatch = body.match(/^##\s*(?:[\p{Emoji}\u{FE0F}]+\s*)?(.+)$/mu);
    const displayName = headerMatch ? headerMatch[1].trim() : slugToDisplayName(slug);

    moods.push({
      slug,
      name: displayName,
      category: frontmatter.category || 'uncategorized',
      tags: frontmatter.tags || [],
      energy: frontmatter.energy || 'medium'
    });
  }

  // Sort alphabetically by display name
  moods.sort((a, b) => a.name.localeCompare(b.name));

  return moods;
}

/**
 * Load moods grouped by category
 * @returns {Promise<Array<{id: string, name: string, moods: Array}>>}
 */
async function loadCategories() {
  const moods = await loadMoods();

  const grouped = {};
  for (const mood of moods) {
    if (!grouped[mood.category]) {
      grouped[mood.category] = {
        id: mood.category,
        name: CATEGORY_NAMES[mood.category] || mood.category,
        moods: []
      };
    }
    grouped[mood.category].moods.push(mood);
  }

  // Sort categories alphabetically by display name, but put 'uncategorized' last
  return Object.values(grouped).sort((a, b) => {
    if (a.id === 'uncategorized') return 1;
    if (b.id === 'uncategorized') return -1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get mood content by slug
 * @param {string} slug - Mood file slug (without .md)
 * @returns {Promise<string|null>} - Mood file content or null if not found
 */
async function getMoodContent(slug) {
  if (!slug || !VALID_SLUG.test(slug)) return null;
  const moodPath = path.join(MOODS_DIR, `${slug}.md`);
  const exists = await fs.access(moodPath).then(() => true).catch(() => false);
  if (!exists) {
    return null;
  }
  return fs.readFile(moodPath, 'utf-8');
}

/**
 * Update mood content by slug
 * @param {string} slug - Mood file slug (without .md)
 * @param {string} content - New content
 * @returns {Promise<boolean>} - Success
 */
async function updateMoodContent(slug, content) {
  if (!slug || !VALID_SLUG.test(slug)) return false;
  const moodPath = path.join(MOODS_DIR, `${slug}.md`);
  const exists = await fs.access(moodPath).then(() => true).catch(() => false);
  if (!exists) {
    return false;
  }
  await fs.writeFile(moodPath, content, 'utf-8');
  console.log(`✏️ Updated mood file: ${slug}`);
  return true;
}

/**
 * Fallback: convert slug to display name (kebab-case to Title Case)
 * @param {string} slug
 * @returns {string}
 */
function slugToDisplayName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get mood element path for prompt system
 * @param {string} slug - Mood file slug (without .md)
 * @returns {string} - Element path for prompt system
 */
function getMoodElementPath(slug) {
  return `moods/${slug}`;
}

module.exports = {
  loadMoods,
  loadCategories,
  getMoodContent,
  updateMoodContent,
  getMoodElementPath,
  MOODS_DIR
};
