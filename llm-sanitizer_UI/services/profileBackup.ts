import { Profile, BackupData } from '../types';

/**
 * Validates the structure of imported backup data
 */
export const validateBackupData = (data: any): data is BackupData => {
  if (!data || typeof data !== 'object') return false;
  if (!data.version || typeof data.version !== 'string') return false;
  if (!data.exportDate || typeof data.exportDate !== 'string') return false;
  if (!Array.isArray(data.profiles)) return false;

  // Validate each profile structure
  for (const profile of data.profiles) {
    if (!profile.id || typeof profile.id !== 'string') return false;
    if (!profile.name || typeof profile.name !== 'string') return false;
    if (!Array.isArray(profile.terms)) return false;

    // Validate each term structure
    for (const term of profile.terms) {
      if (!term.id || typeof term.id !== 'string') return false;
      if (typeof term.original !== 'string') return false;
      if (typeof term.placeholder !== 'string') return false;
      if (typeof term.isActive !== 'boolean') return false;
    }
  }

  return true;
};

/**
 * Exports profiles as a downloadable JSON file
 */
export const exportProfiles = (profiles: Profile[]): void => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `llm-sanitizer-backup-${timestamp}.json`;

  const backupData: BackupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profiles: profiles,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Imports profiles from a JSON file
 * @throws Error if file is invalid or contains malformed data
 */
export const importProfiles = async (file: File): Promise<Profile[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        if (!validateBackupData(data)) {
          reject(new Error('Invalid backup file format. Please ensure the file is a valid LLM Sanitizer backup.'));
          return;
        }

        if (data.profiles.length === 0) {
          reject(new Error('Backup file contains no profiles.'));
          return;
        }

        resolve(data.profiles);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON file. Please select a valid backup file.'));
        } else {
          reject(error);
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };

    reader.readAsText(file);
  });
};
