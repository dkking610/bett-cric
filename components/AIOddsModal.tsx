
import React, { useState, useEffect, useMemo } from 'react';
import { Event, AIOdds } from '../types';
import { generateOddsAnalysis } from '../services/geminiService';
import { XMarkIcon, SparklesIcon } from './icons';

interface AIOddsModalProps {
  event: Event | null;
  onClose: () => void;
}

const AIOddsModal: React.FC<AIOddsModalProps> = ({ event, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOdds, setAiOdds] = useState<AIOdds | null>(null);

  useEffect(() => {
    if (event) {
      const fetchOdds = async () => {
        setIsLoading(true);
        setError(null);
        setAiOdds(null);
        try {
          const result = await generateOddsAnalysis(event);
          if (result) {
            setAiOdds(result);
          } else {
            setError('Could not generate AI odds analysis. Please try again.');
          }
        } catch (e) {
          setError('An unexpected error occurred while fetching AI analysis.');
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOdds();
    }
  }, [event]);

  const bookieOdds = useMemo(() => {
    if (!event) return { home: null, away: null, draw: null };
    const market = event.markets.find(m => m.name === 'Match Winner');
    if (!market) return { home: null, away: null, draw: null };
    
    const homeRunner = market.runners.find(r => r.name === event.teamA);
    const awayRunner = market.runners.find(r => r.name === event.teamB);

    return {
      home: homeRunner?.odds || null,
      away: awayRunner?.odds || null,
      draw: null // Cricket T20 typically doesn't have draw odds
    };
  }, [event]);

  const renderComparisonRow = (label: string, bookie: number | null, ai: number | null, prob: number | null) => {
    const isValueBet = bookie && ai && ai > bookie * 1.1; // Highlight if AI odds are 10%+ higher
    return (
      <tr className="border-b border-gray-700 last:border-b-0">
        <td className="py-2 px-3 font-semibold text-gray-300">{label}</td>
        <td className="py-2 px-3 text-center">{bookie ? bookie.toFixed(2) : 'N/A'}</td>
        <td className={`py-2 px-3 text-center font-bold ${isValueBet ? 'text-green-400' : 'text-brand-secondary'}`}>
          {ai ? ai.toFixed(3) : 'N/A'}
        </td>
        <td className="py-2 px-3 text-center">{prob ? `${prob.toFixed(2)}%` : 'N/A'}</td>
      </tr>
    );
  };

  if (!event) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-odds-title"
    >
      <div 
        className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 id="ai-odds-title" className="text-lg font-bold text-white flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-brand-primary"/>
            AI Odds Analysis
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-center text-gray-400 mb-4">{event.teamA} vs {event.teamB}</p>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-3 text-gray-400">Analyzing match data...</p>
            </div>
          )}

          {error && <p className="text-red-400 bg-red-500/20 p-3 rounded-md text-center">{error}</p>}

          {aiOdds && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-300 mb-1">AI Rationale:</h3>
                <blockquote className="border-l-4 border-brand-primary pl-3 py-1 bg-gray-900/50 rounded-r-md">
                  <p className="text-sm italic text-gray-300">"{aiOdds.rationale_short}"</p>
                </blockquote>
              </div>

              <div>
                 <table className="w-full text-sm text-left text-gray-400 bg-gray-900/50 rounded-md overflow-hidden">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase">
                      <tr>
                        <th scope="col" className="py-2 px-3">Outcome</th>
                        <th scope="col" className="py-2 px-3 text-center">Bookie Odds</th>
                        <th scope="col" className="py-2 px-3 text-center">AI Odds</th>
                        <th scope="col" className="py-2 px-3 text-center">AI Prob.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderComparisonRow(event.teamA, bookieOdds.home, aiOdds.home.odds, aiOdds.home.implied_prob)}
                      {renderComparisonRow('Draw', bookieOdds.draw, aiOdds.draw.odds, aiOdds.draw.implied_prob)}
                      {renderComparisonRow(event.teamB, bookieOdds.away, aiOdds.away.odds, aiOdds.away.implied_prob)}
                    </tbody>
                  </table>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2">
                Disclaimer: AI-generated odds are for informational purposes only and do not constitute betting advice.
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AIOddsModal;
