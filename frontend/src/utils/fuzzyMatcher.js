/**
 * Calculates the Levenshtein distance between two strings.
 * Measures how many single-character edits (insertions, deletions, substitutions)
 * are required to change string 'a' into string 'b'.
 */
export const levenshteinDistance = (a = '', b = '') => {
  const str1 = a.toLowerCase();
  const str2 = b.toLowerCase();

  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Phonetic / Common Misspelling Map for Indian Garage terms
 */
const COMMON_ALIASES = {
  tayer: 'tyre',
  tire: 'tyre',
  taar: 'tyre',
  tayr: 'tyre',
  brek: 'brake',
  braek: 'brake',
  breek: 'brake',
  berk: 'brake',
  oil: 'engine oil',
  oyl: 'engine oil',
  mobil: 'engine oil',
  servis: 'service',
  survis: 'service',
  sarvis: 'service',
  plg: 'spark plug',
  pulag: 'spark plug',
  chen: 'chain',
  filtar: 'filter',
  philtar: 'filter',
  cluch: 'clutch',
  kalach: 'clutch',
};

/**
 * Smart Fuzzy Matcher for Master Keywords
 * @param {string} query User typed input (e.g. "tayer" or "brek")
 * @param {Array} keywords Array of MasterKeyword objects [{ _id, word }]
 * @param {number} maxResults Maximum number of recommendations to return
 */
export const getSmartSuggestions = (query = '', keywords = [], maxResults = 8) => {
  if (!query || !query.trim() || !Array.isArray(keywords) || keywords.length === 0) {
    return [];
  }

  const qRaw = query.trim().toLowerCase();
  const qAlias = COMMON_ALIASES[qRaw] || qRaw;

  const scored = keywords.map((kw) => {
    const wordRaw = (kw.word || '').trim();
    const wordLower = wordRaw.toLowerCase();

    let score = 1000; // Lower score is better match

    // 1. Exact match
    if (wordLower === qRaw || wordLower === qAlias) {
      score = 0;
    }
    // 2. Starts with query prefix
    else if (wordLower.startsWith(qRaw) || wordLower.startsWith(qAlias)) {
      score = 10;
    }
    // 3. Any word inside target starts with query
    else if (wordLower.split(/\s+/).some((w) => w.startsWith(qRaw) || w.startsWith(qAlias))) {
      score = 20;
    }
    // 4. Substring match
    else if (wordLower.includes(qRaw) || wordLower.includes(qAlias)) {
      score = 30;
    }
    // 5. Typo / Levenshtein Distance match (for inputs length >= 3)
    else if (qRaw.length >= 3) {
      const wordsInTarget = wordLower.split(/\s+/);
      const minDistance = Math.min(
        levenshteinDistance(qRaw, wordLower),
        ...wordsInTarget.map((w) => levenshteinDistance(qRaw, w)),
        ...wordsInTarget.map((w) => levenshteinDistance(qAlias, w))
      );

      // Allow 1 edit for 3-4 char query, 2 edits for >= 5 char query
      const maxAllowedEdits = qRaw.length <= 4 ? 1 : 2;
      if (minDistance <= maxAllowedEdits) {
        score = 40 + minDistance * 10;
      }
    }

    return {
      keyword: kw,
      score,
      isMatch: score < 1000,
    };
  });

  return scored
    .filter((item) => item.isMatch)
    .sort((a, b) => a.score - b.score)
    .slice(0, maxResults)
    .map((item) => item.keyword);
};
