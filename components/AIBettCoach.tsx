
import React, { useState, useCallback } from 'react';
import { Selection, UserProfile, Account, AIBettCoachResponse } from '../types';
import { generateBettingAdvice } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface AIBettCoachProps {
  selections: Selection[];
  userProfile: UserProfile;
  account: Account;
}

const AIBettCoach: React.FC<AIBettCoachProps> = ({ selections, userProfile, account }) => {
  const [advice, setAdvice] = useState<AIBettCoachResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const context = selections.map(s => `${s.runnerName} to win in '${s.marketName}' @ ${s.odds}`).join(', ');
      const question = `Should I place this bet: ${context}?`;
      
      const result = await generateBettingAdvice(question, userProfile, account, context);
      
      if (result) {
        setAdvice(result);
      } else {
        setError('Could not get advice at this time.');
      }
    } catch (e) {
      setError('An unexpected error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selections, userProfile, account]);

  const ConfidenceBadge: React.FC<{ confidence: 'low' | 'medium' | 'high' }> = ({ confidence }) => {
    const styles = {
      low: 'bg-red-500/20 text-red-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-green-500/20 text-green-400',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[confidence]}`}>
        {confidence.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center">
          <SparklesIcon className="w-4 h-4 mr-2 text-brand-primary" />
          AI BettCoach
        </h4>
        {!advice && !isLoading && (
          <button onClick={handleGetAdvice} className="text-xs bg-brand-primary/80 hover:bg-brand-primary text-white font-semibold px-2 py-1 rounded-md transition-colors">
            Get Advice
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-2 text-xs text-gray-400">BettCoach is thinking...</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}

      {advice && (
        <div className="mt-2 space-y-2 text-xs">
           <blockquote className="border-l-2 border-brand-primary pl-2 italic text-gray-300">
             "{advice.reply}"
           </blockquote>
           <div className="bg-gray-800/50 p-2 rounded-md space-y-1">
             <div className="flex justify-between items-center">
               <span className="font-semibold text-gray-400">Confidence:</span>
               <ConfidenceBadge confidence={advice.confidence} />
             </div>
             <div className="flex justify-between items-center">
               <span className="font-semibold text-gray-400">Stake Advice:</span>
               <span className="font-bold text-white">{advice.recommended_stake.percent}% (~${(account.balance * advice.recommended_stake.percent / 100).toFixed(2)})</span>
             </div>
           </div>
           <div>
             <p className="font-semibold text-gray-400">Rationale:</p>
             <p className="text-gray-300">{advice.rationale_short}</p>
           </div>
           <button onClick={handleGetAdvice} className="text-gray-500 hover:text-white w-full text-center text-[11px] pt-1">
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
};

export default AIBettCoach;
