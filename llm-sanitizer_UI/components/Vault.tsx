import React, { useState, useRef } from 'react';
import { Plus, Trash2, Check, Shield, Search, Copy, RefreshCw, ChevronRight, Settings, Download, Upload } from 'lucide-react';
import { Profile, Term } from '../types';
import { Button } from './Button';
import { generatePlaceholder } from '../services/sanitizer';
import { exportProfiles, importProfiles } from '../services/profileBackup';

interface VaultProps {
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
  onUpdateTerms: (profileId: string, terms: Term[]) => void;
  onImportProfiles: (profiles: Profile[]) => void;
}

export const Vault: React.FC<VaultProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onUpdateTerms,
  onImportProfiles
}) => {
  const [newTermOriginal, setNewTermOriginal] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = () => {
    try {
      exportProfiles(profiles);
      showNotification('success', 'Profiles exported successfully!');
    } catch (error) {
      showNotification('error', 'Failed to export profiles. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImportFile(file);
      setShowImportConfirm(true);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!pendingImportFile) return;

    try {
      const importedProfiles = await importProfiles(pendingImportFile);
      onImportProfiles(importedProfiles);
      showNotification('success', `Successfully imported ${importedProfiles.length} profile(s)!`);
      setShowImportConfirm(false);
      setPendingImportFile(null);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to import profiles.');
      setShowImportConfirm(false);
      setPendingImportFile(null);
    }
  };

  const handleCancelImport = () => {
    setShowImportConfirm(false);
    setPendingImportFile(null);
  };

  const handleDeleteProfileClick = () => {
    if (profiles.length === 1) {
      showNotification('error', 'Cannot delete the last profile.');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteProfile = () => {
    if (profiles.length === 1) {
      showNotification('error', 'Cannot delete the last profile.');
      setShowDeleteConfirm(false);
      return;
    }
    onDeleteProfile(activeProfileId);
    showNotification('success', 'Profile deleted successfully.');
    setShowDeleteConfirm(false);
  };

  const handleCancelDeleteProfile = () => {
    setShowDeleteConfirm(false);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Profile</label>
            {profiles.length > 1 && (
              <button
                onClick={handleDeleteProfileClick}
                title="Delete current profile"
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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

      {/* Footer with Export/Import */}
      <div className="border-t border-slate-800 bg-dark-900">
        <div className="p-3 flex gap-2">
          <button
            onClick={handleExport}
            title="Exported file contains sensitive data in plaintext"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-dark-800 hover:bg-dark-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export All
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-dark-800 hover:bg-dark-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
        <div className="px-4 pb-3 text-xs text-slate-500 flex justify-between items-center">
          <span>{activeProfile.terms.length} stored terms</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Import Confirmation Dialog */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-slate-700 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Replace All Profiles?</h3>
            <p className="text-sm text-slate-400 mb-6">
              This will replace all existing profiles with the imported data. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={handleCancelImport}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmImport}>
                Import & Replace
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-slate-700 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Delete Profile?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete "{activeProfile.name}"? All terms in this profile will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={handleCancelDeleteProfile}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmDeleteProfile}>
                Delete Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success'
              ? 'bg-green-900/90 border-green-700 text-green-100'
              : 'bg-red-900/90 border-red-700 text-red-100'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-lg">⚠</span>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
