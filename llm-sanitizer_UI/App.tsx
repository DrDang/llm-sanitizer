import React, { useState, useEffect } from 'react';
import { Vault } from './components/Vault';
import { Workspace } from './components/Workspace';
import { Profile, Term } from './types';

// Default initial state
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'default',
    name: 'Default',
    terms: []
  },
  {
    id: 'work',
    name: 'Work Project A',
    terms: [
        { id: '1', original: 'Project Orion', placeholder: '{{PROJ_01}}', isActive: true },
        { id: '2', original: 'John Doe', placeholder: '{{PERSON_REF_A}}', isActive: true },
        { id: '3', original: 'API_KEY_SECRET', placeholder: '{{SECRET_CRED_1}}', isActive: true },
    ]
  }
];

const App: React.FC = () => {
  // State management with localStorage persistence
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('llm-sanitizer-profiles');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('llm-sanitizer-active-id') || 'work';
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('llm-sanitizer-profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('llm-sanitizer-active-id', activeProfileId);
  }, [activeProfileId]);

  // Handlers
  const handleUpdateTerms = (profileId: string, newTerms: Term[]) => {
    setProfiles(prev => prev.map(p => 
      p.id === profileId ? { ...p, terms: newTerms } : p
    ));
  };

  const handleCreateProfile = (name: string) => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      terms: []
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleImportProfiles = (importedProfiles: Profile[]) => {
    setProfiles(importedProfiles);
    // Set active profile to the first imported profile
    if (importedProfiles.length > 0) {
      setActiveProfileId(importedProfiles[0].id);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    // Prevent deleting the last profile
    if (profiles.length === 1) return;

    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);

    // If the deleted profile was active, switch to the first remaining profile
    if (profileId === activeProfileId && updatedProfiles.length > 0) {
      setActiveProfileId(updatedProfiles[0].id);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  return (
    <div className="flex h-screen w-full bg-dark-950 text-slate-200 overflow-hidden font-sans selection:bg-brand-500/30">
      
      {/* Sidebar (The Vault) */}
      <Vault
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={setActiveProfileId}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onUpdateTerms={handleUpdateTerms}
        onImportProfiles={handleImportProfiles}
      />

      {/* Main Content (Workspace) */}
      <Workspace 
        activeTerms={activeProfile.terms}
      />
      
    </div>
  );
};

export default App;
