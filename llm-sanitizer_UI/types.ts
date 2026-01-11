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
