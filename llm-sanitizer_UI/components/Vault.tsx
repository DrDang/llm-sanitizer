import React, { useState } from 'react';
import { Plus, Trash2, Check, Shield, Search, Copy, RefreshCw, ChevronRight, Settings } from 'lucide-react';
import { Profile, Term } from '../types';
import { Button } from './Button';
import { generatePlaceholder } from '../services/sanitizer';

interface VaultProps {
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onUpdateTerms: (profileId: string, terms: Term[]) => void;
}

export const Vault: React.FC<VaultProps> = ({ 
  profiles, 
  activeProfileId, 
  onSelectProfile, 
  onCreateProfile,
  onUpdateTerms
}) => {
  const [newTermOriginal, setNewTermOriginal] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermOriginal.trim()) return;

    const newTerm: Term = {
      id: Date.now().toString(),
      original: newTermOriginal,
      placeholder: generatePlaceholder(newTermOriginal),
      isActive: true
    };

    onUpdateTerms(activeProfile.id, [newTerm, ...activeProfile.terms]);
    setNewTermOriginal('');
  };

  const handleRemoveTerm = (termId: string) => {
    onUpdateTerms(activeProfile.id, activeProfile.terms.filter(t => t.id !== termId));
  };

  const handleToggleTerm = (termId: string) => {
    onUpdateTerms(activeProfile.id, activeProfile.terms.map(t => 
      t.id === termId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      onCreateProfile(newProfileName);
      setNewProfileName('');
      setIsCreatingProfile(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-950 border-r border-slate-800 w-80 shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-brand-400 mb-6">
          <Shield className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-slate-100">LLM Sanitizer</h1>
        </div>

        {/* Profile Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Profile</label>
          <div className="relative">
            <select 
              value={activeProfileId}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="w-full bg-dark-800 text-slate-200 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 rotate-90 pointer-events-none" />
          </div>
          
          {isCreatingProfile ? (
            <form onSubmit={handleCreateProfile} className="mt-2 flex gap-2">
              <input 
                autoFocus
                type="text"
                placeholder="Profile Name"
                className="flex-1 bg-dark-800 border border-slate-700 rounded text-xs px-2 py-1 text-white focus:outline-none focus:border-brand-500"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
              <Button size="sm" type="submit" variant="primary">Add</Button>
              <Button size="sm" type="button" variant="ghost" onClick={() => setIsCreatingProfile(false)}>X</Button>
            </form>
          ) : (
            <button 
              onClick={() => setIsCreatingProfile(true)}
              className="text-xs text-brand-400 hover:text-brand-300 mt-1 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> New Profile
            </button>
          )}
        </div>
      </div>

      {/* Add Term Input */}
      <div className="p-4 bg-dark-900 border-b border-slate-800">
        <form onSubmit={handleAddTerm} className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={newTermOriginal}
            onChange={(e) => setNewTermOriginal(e.target.value)}
            placeholder="Add sensitive term (e.g. Project X)"
            className="w-full bg-dark-800 text-slate-200 placeholder-slate-500 border border-slate-700 rounded-lg py-2 pl-9 pr-12 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!newTermOriginal.trim()}
            className="absolute right-1.5 top-1.5 p-1 bg-brand-600 text-white rounded hover:bg-brand-500 disabled:opacity-0 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Terms List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {activeProfile.terms.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No terms in vault.</p>
            <p className="text-slate-600 text-xs mt-1">Add words you want to hide.</p>
          </div>
        ) : (
          activeProfile.terms.map(term => (
            <div 
              key={term.id} 
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                term.isActive 
                  ? 'bg-dark-800 border-slate-700' 
                  : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={term.isActive}
                    onChange={() => handleToggleTerm(term.id)}
                    className="mr-2 rounded border-slate-600 bg-dark-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-900"
                  />
                  <p className="text-sm font-medium text-slate-200 truncate" title={term.original}>
                    {term.original}
                  </p>
                </div>
                <div className="flex items-center mt-1 ml-5">
                  <span className="text-xs font-mono text-brand-400 bg-brand-900/20 px-1.5 py-0.5 rounded truncate max-w-full">
                    {term.placeholder}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleRemoveTerm(term.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-800 bg-dark-900 text-xs text-slate-500 flex justify-between items-center">
        <span>{activeProfile.terms.length} stored terms</span>
        <Settings className="w-4 h-4 hover:text-slate-300 cursor-pointer" />
      </div>
    </div>
  );
};
