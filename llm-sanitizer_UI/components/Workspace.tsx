import React, { useState, useEffect } from 'react';
import { ArrowRight, Copy, Check, RefreshCw, Wand2, RotateCcw, Lock, Unlock } from 'lucide-react';
import { Button } from './Button';
import { Term } from '../types';
import { sanitizeText, desanitizeText } from '../services/sanitizer';

interface WorkspaceProps {
  activeTerms: Term[];
}

export const Workspace: React.FC<WorkspaceProps> = ({ activeTerms }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'sanitize' | 'desanitize'>('sanitize');
  const [hasCopiedInput, setHasCopiedInput] = useState(false);
  const [hasCopiedOutput, setHasCopiedOutput] = useState(false);
  const [stats, setStats] = useState({ replacements: 0 });

  const handleAction = () => {
    if (mode === 'sanitize') {
      const { result, stats: count } = sanitizeText(inputText, activeTerms);
      setOutputText(result);
      setStats({ replacements: count });
    } else {
      const { result, stats: count } = desanitizeText(inputText, activeTerms);
      setOutputText(result);
      setStats({ replacements: count });
    }
  };

  // Auto-action when switching modes if there is text
  useEffect(() => {
    // Optional: Clear output on mode switch to avoid confusion
    // setOutputText('');
  }, [mode]);

  const copyToClipboard = async (text: string, isInput: boolean) => {
    await navigator.clipboard.writeText(text);
    if (isInput) {
      setHasCopiedInput(true);
      setTimeout(() => setHasCopiedInput(false), 2000);
    } else {
      setHasCopiedOutput(true);
      setTimeout(() => setHasCopiedOutput(false), 2000);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setStats({ replacements: 0 });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-900 overflow-hidden relative">
      
      {/* Mode Toggle Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-dark-900 border-b border-slate-800">
        <div className="flex p-1 bg-dark-800 rounded-lg border border-slate-700">
          <button
            onClick={() => { setMode('sanitize'); setInputText(''); setOutputText(''); }}
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'sanitize' 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 mr-2" />
            Sanitize
          </button>
          <button
            onClick={() => { setMode('desanitize'); setInputText(''); setOutputText(''); }}
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'desanitize' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5 mr-2" />
            Restore
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
           {stats.replacements > 0 && (
             <span className="text-xs font-mono text-brand-400 bg-brand-900/20 px-3 py-1 rounded-full border border-brand-900/50">
               {stats.replacements} terms processed
             </span>
           )}
           <Button variant="ghost" size="sm" onClick={clearAll} className="text-slate-500">
             Clear All
           </Button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        
        {/* Pane A: Input */}
        <div className="flex-1 flex flex-col min-h-[50%] md:min-h-0 relative group">
          <div className="px-6 py-3 bg-dark-950/50 flex justify-between items-center border-b border-slate-800/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {mode === 'sanitize' ? 'Original Source (Unsafe)' : 'LLM Response (Sanitized)'}
            </span>
            <div className="flex space-x-2">
               <button 
                onClick={() => copyToClipboard(inputText, true)}
                className="p-1.5 text-slate-500 hover:text-brand-400 transition-colors"
                title="Copy Input"
              >
                {hasCopiedInput ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <textarea
            className="flex-1 bg-transparent p-6 resize-none focus:outline-none text-slate-300 font-mono text-sm leading-relaxed placeholder-slate-600"
            placeholder={mode === 'sanitize' ? "Paste sensitive text here..." : "Paste the output from ChatGPT here..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck={false}
          />
          
          {/* Action Area (Floating or Fixed at bottom of pane) */}
          <div className="p-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none flex justify-end pb-8 pr-8">
             <div className="pointer-events-auto shadow-2xl shadow-black">
                <Button 
                    size="lg" 
                    onClick={handleAction} 
                    disabled={!inputText.trim()}
                    className={mode === 'sanitize' ? 'bg-brand-600 hover:bg-brand-500' : 'bg-emerald-600 hover:bg-emerald-500'}
                >
                    {mode === 'sanitize' ? (
                        <>Sanitize Text <Wand2 className="ml-2 w-4 h-4" /></>
                    ) : (
                        <>Restore Values <RotateCcw className="ml-2 w-4 h-4" /></>
                    )}
                </Button>
             </div>
          </div>
        </div>

        {/* Pane B: Output */}
        <div className="flex-1 flex flex-col min-h-[50%] md:min-h-0 bg-dark-950">
          <div className="px-6 py-3 bg-dark-950 flex justify-between items-center border-b border-slate-800/50">
            <span className={`text-xs font-bold uppercase tracking-wider ${mode === 'sanitize' ? 'text-brand-400' : 'text-emerald-400'}`}>
              {mode === 'sanitize' ? 'Sanitized Result (Safe)' : 'Restored Original'}
            </span>
             <button 
                onClick={() => copyToClipboard(outputText, false)}
                disabled={!outputText}
                className="p-1.5 text-slate-500 hover:text-brand-400 transition-colors disabled:opacity-30"
                title="Copy Output"
              >
                {hasCopiedOutput ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
          </div>
          <div className="flex-1 relative overflow-auto">
             {outputText ? (
                 <div className="p-6 font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                     {outputText}
                 </div>
             ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-slate-700 select-none pointer-events-none">
                     <div className="text-center">
                        <ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <span className="text-sm">Processed text will appear here</span>
                     </div>
                 </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};
