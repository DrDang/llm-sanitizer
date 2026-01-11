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

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  return (
    <div className="flex h-screen w-full bg-dark-950 text-slate-200 overflow-hidden font-sans selection:bg-brand-500/30">
      
      {/* Sidebar (The Vault) */}
      <Vault 
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={setActiveProfileId}
        onCreateProfile={handleCreateProfile}
        onUpdateTerms={handleUpdateTerms}
      />

      {/* Main Content (Workspace) */}
      <Workspace 
        activeTerms={activeProfile.terms}
      />
      
    </div>
  );
};

export default App;
