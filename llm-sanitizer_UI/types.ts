export interface Term {
  id: string;
  original: string;
  placeholder: string;
  isActive: boolean;
}

export interface Profile {
  id: string;
  name: string;
  terms: Term[];
}

export interface ProcessingStats {
  replacements: number;
  originalLength: number;
  sanitizedLength: number;
}

export interface BackupData {
  version: string;
  exportDate: string;
  profiles: Profile[];
}

// Auto-number sanitization types
export interface NumberMapping {
  placeholder: string;      // e.g., "{{NUM_001}}"
  original: string;         // e.g., "5 mg" or "3.4"
  position: number;         // character position in original text (for debugging)
}

export interface SanitizationSession {
  id: string;
  timestamp: number;
  numberMappings: NumberMapping[];
}

export interface NumberSanitizeOptions {
  enabled: boolean;
  includeIntegers: boolean;      // default: true
  includeDecimals: boolean;      // default: true
  includeMeasurements: boolean;  // default: true
  includeCurrency: boolean;      // default: false (opt-in)
}
