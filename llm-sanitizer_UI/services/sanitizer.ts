import { Term, NumberMapping, SanitizationSession, NumberSanitizeOptions } from '../types';

// Units organized by category for maintainability
const UNIT_CATEGORIES = {
  // Mass/Volume (medical/chemistry)
  mass: 'mg|g|kg|µg|ng|mL|L|µL',
  // Electrical
  electrical: 'V|mV|µV|A|mA|µA|W|mW|kW|MW|Ω|kΩ|MΩ',
  // RF & Signal
  rf: 'dB|dBm|dBi|dBc|dBV|dBµV|dBW',
  // Frequency
  frequency: 'Hz|kHz|MHz|GHz|THz',
  // Time
  time: 's|ms|µs|ns|ps|min|hr|sec|msec|usec|nsec',
  // Length/Distance
  length: 'mm|cm|m|km|µm|nm|in|ft',
  // Temperature
  temperature: '°C|°F|K',
  // Other (capacitance, concentration, etc.)
  other: '%|ppm|ppb|mol|M|mM|µM|nM|pF|nF|µF|F',
};

// Currency symbols for optional currency detection
const CURRENCY_SYMBOLS = '\\$|€|£|¥';

// Build combined units pattern
const ALL_UNITS = Object.values(UNIT_CATEGORIES).join('|');

/**
 * Default options for number sanitization
 */
export const DEFAULT_NUMBER_OPTIONS: NumberSanitizeOptions = {
  enabled: false,
  includeIntegers: true,
  includeDecimals: true,
  includeMeasurements: true,
  includeCurrency: false,
};

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

export const desanitizeText = (
  text: string,
  terms: Term[],
  session?: SanitizationSession
): { result: string; stats: number } => {
  let result = text;
  let count = 0;

  // First, restore dictionary terms
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

  // Then, restore number placeholders from session if provided
  if (session && session.numberMappings.length > 0) {
    session.numberMappings.forEach((mapping) => {
      const escapedPlaceholder = escapeRegExp(mapping.placeholder);
      const regex = new RegExp(escapedPlaceholder, 'g');

      const matches = result.match(regex);
      if (matches) {
        count += matches.length;
        result = result.replace(regex, mapping.original);
      }
    });
  }

  return { result, stats: count };
};

/**
 * Generates a unique sequential placeholder for numbers.
 * E.g., {{NUM_001}}, {{NUM_002}}, etc.
 */
const generateNumberPlaceholder = (index: number): string => {
  const paddedIndex = String(index).padStart(3, '0');
  return `{{NUM_${paddedIndex}}}`;
};

/**
 * Builds regex pattern based on options.
 * Returns null if no patterns should be matched.
 */
const buildNumberPattern = (options: NumberSanitizeOptions): RegExp | null => {
  const patterns: string[] = [];

  // Build number portion based on options
  const numberPatterns: string[] = [];

  if (options.includeIntegers) {
    // Integers with optional commas (e.g., 1,000,000)
    numberPatterns.push('-?\\d{1,3}(?:,\\d{3})*');
  }

  if (options.includeDecimals) {
    // Decimals (e.g., 3.14, 0.5, .5)
    numberPatterns.push('-?\\d*\\.\\d+');
  }

  if (numberPatterns.length === 0) {
    return null;
  }

  // Combine number patterns
  const numberPart = `(?:${numberPatterns.join('|')})(?:e[+-]?\\d+)?`;

  if (options.includeMeasurements) {
    // Number with optional unit
    patterns.push(`${numberPart}(?:\\s*(?:${ALL_UNITS}))?`);
  } else {
    // Just the number
    patterns.push(numberPart);
  }

  if (options.includeCurrency) {
    // Currency: $100, €50.25, etc.
    patterns.push(`(?:${CURRENCY_SYMBOLS})\\s*${numberPart}`);
  }

  if (patterns.length === 0) {
    return null;
  }

  // Combine all patterns with word boundary checks
  // (?<![\\w.]) - not preceded by word char or dot (prevents matching in "v2.0" or "Room101")
  // (?![\\w]) - not followed by word char
  const combinedPattern = `(?<![\\w.])(?:${patterns.join('|')})(?![\\w])`;

  return new RegExp(combinedPattern, 'gi');
};

interface NumberMatch {
  match: string;
  index: number;
}

/**
 * Sanitizes numbers and measurements in text, creating a session map
 * for safe desanitization.
 *
 * Each number occurrence gets a unique placeholder, even if the same
 * number appears multiple times. This prevents incorrect restoration
 * when LLMs reorder text.
 */
export const sanitizeNumbers = (
  text: string,
  options: NumberSanitizeOptions
): { result: string; session: SanitizationSession; stats: number } => {
  if (!options.enabled) {
    return {
      result: text,
      session: { id: '', timestamp: 0, numberMappings: [] },
      stats: 0,
    };
  }

  const pattern = buildNumberPattern(options);

  if (!pattern) {
    return {
      result: text,
      session: { id: '', timestamp: 0, numberMappings: [] },
      stats: 0,
    };
  }

  // Find all matches with their positions
  const matches: NumberMatch[] = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      match: match[0],
      index: match.index,
    });
  }

  if (matches.length === 0) {
    return {
      result: text,
      session: { id: '', timestamp: 0, numberMappings: [] },
      stats: 0,
    };
  }

  // Create session with unique ID
  const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const numberMappings: NumberMapping[] = [];

  // Sort by position (descending) to replace from end-to-start
  // This preserves character positions as we make replacements
  const sortedMatches = [...matches].sort((a, b) => b.index - a.index);

  let result = text;

  // Assign placeholder indices in original order (1, 2, 3...)
  // but apply replacements in reverse position order
  const placeholderMap = new Map<number, string>();
  matches.forEach((m, idx) => {
    placeholderMap.set(m.index, generateNumberPlaceholder(idx + 1));
  });

  // Apply replacements from end to start
  sortedMatches.forEach((m) => {
    const placeholder = placeholderMap.get(m.index)!;

    numberMappings.push({
      placeholder,
      original: m.match,
      position: m.index,
    });

    result = result.slice(0, m.index) + placeholder + result.slice(m.index + m.match.length);
  });

  // Sort mappings by placeholder number for consistent ordering
  numberMappings.sort((a, b) => a.placeholder.localeCompare(b.placeholder));

  return {
    result,
    session: {
      id: sessionId,
      timestamp: Date.now(),
      numberMappings,
    },
    stats: matches.length,
  };
};

/**
 * Combined sanitization: first dictionary terms, then numbers.
 * Dictionary terms take precedence (processed first).
 */
export const sanitizeAll = (
  text: string,
  terms: Term[],
  numberOptions: NumberSanitizeOptions
): { result: string; session: SanitizationSession; termStats: number; numberStats: number } => {
  // First, sanitize dictionary terms
  const { result: afterTerms, stats: termStats } = sanitizeText(text, terms);

  // Then, sanitize numbers in the result
  const { result: final, session, stats: numberStats } = sanitizeNumbers(afterTerms, numberOptions);

  return {
    result: final,
    session,
    termStats,
    numberStats,
  };
};
