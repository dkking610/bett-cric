
import React, { useState, useCallback } from 'react';
import { LiveUpdate } from '../types';
import { generateLiveCommentary } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface LiveUpdateCardProps {
  update: LiveUpdate;
}

const LiveUpdateCard: React.FC<LiveUpdateCardProps> = ({ update: initialUpdate }) => {
  const [update, setUpdate] = useState<LiveUpdate>(initialUpdate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateLiveCommentary(update);
      if (result) {
        setUpdate(prev => ({...prev, ...result}));
      } else {
        setError('Failed to generate summary.');
      }
    } catch (e) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [update]);

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg text-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="font-mono text-xs text-gray-400">{update.over} OVERS</span>
          <p className="text-gray-300 mt-1">{update.raw_event_text}</p>
        </div>
        {!update.micro_summary && !isLoading && (
          <button 
            onClick={handleGenerate} 
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-600 hover:text-brand-secondary transition-colors flex-shrink-0 ml-2"
            aria-label="Generate AI Summary"
            title="Generate AI Summary"
          >
            <SparklesIcon className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-secondary ml-2 mt-1 flex-shrink-0"></div>
        )}
      </div>
      
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      
      {update.micro_summary && (
        <div className="mt-2 pt-2 border-t border-gray-600/50">
          <p className="text-brand-secondary text-xs font-bold">AI MICRO-SUMMARY</p>
          <p className="text-gray-300 italic text-xs mt-1">"{update.micro_summary}"</p>
        </div>
      )}
    </div>
  );
};

export default LiveUpdateCard;
