import { Term } from '../types';

/**
 * Generates a unique placeholder ID if one isn't provided.
 * E.g., {{SEC_A1B2}}
 */
export const generatePlaceholder = (_original: string): string => {
  // Create a fully random placeholder with no connection to the original text
  // to prevent reverse-engineering of sensitive information
  const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `{{SEC_${randomId}}}`;
};

/**
 * Escapes string for use in Regex
 */
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

export const sanitizeText = (text: string, terms: Term[]): { result: string; stats: number } => {
  let result = text;
  let count = 0;

  // Sort terms by length (longest first) to avoid partial replacement issues
  // e.g. replacing "Project" before "Project Apollo"
  const sortedTerms = [...terms].sort((a, b) => b.original.length - a.original.length);

  sortedTerms.forEach((term) => {
    if (!term.isActive || !term.original.trim()) return;

    // Use word boundaries for cleaner replacement where possible, 
    // but fallback if the term contains non-word characters.
    const escapedOriginal = escapeRegExp(term.original);
    let regex;
    
    // Check if the term starts/ends with alphanumeric characters to apply word boundaries
    const startWord = /^\w/.test(term.original);
    const endWord = /\w$/.test(term.original);

    if (startWord && endWord) {
        regex = new RegExp(`\\b${escapedOriginal}\\b`, 'g');
    } else {
        regex = new RegExp(escapedOriginal, 'g');
    }

    const matches = result.match(regex);
    if (matches) {
      count += matches.length;
      result = result.replace(regex, term.placeholder);
    }
  });

  return { result, stats: count };
};

export const desanitizeText = (text: string, terms: Term[]): { result: string; stats: number } => {
  let result = text;
  let count = 0;

  terms.forEach((term) => {
    if (!term.isActive) return;

    const escapedPlaceholder = escapeRegExp(term.placeholder);
    const regex = new RegExp(escapedPlaceholder, 'g');
    
    const matches = result.match(regex);
    if (matches) {
      count += matches.length;
      result = result.replace(regex, term.original);
    }
  });

  return { result, stats: count };
};
