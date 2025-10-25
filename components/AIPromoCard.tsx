
import React, { useState, useCallback } from 'react';
import { generatePersonalizedPromotion } from '../services/geminiService';
import { Promotion } from '../types';
import { SparklesIcon } from './icons';

const AIPromoCard: React.FC = () => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // A mock user betting history
  const mockUserHistory = "User frequently bets on Cricket, especially on India to win in T20 matches. Also places accumulator bets on 'Total Runs' markets.";

  const handleGeneratePromo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPromotion(null);
    try {
      const result = await generatePersonalizedPromotion(mockUserHistory);
      if (result) {
        setPromotion(result);
      } else {
        setError('Could not generate a promotion at this time. Please try again later.');
      }
    } catch (e) {
      setError('An unexpected error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-gradient-to-r from-brand-primary to-green-500 p-4 rounded-lg mb-6 text-white">
      <div className="flex items-start">
        <SparklesIcon className="w-8 h-8 mr-4 text-yellow-300 flex-shrink-0"/>
        <div>
          <h3 className="font-bold text-lg">Personalized For You</h3>
          
          {isLoading && <p className="text-sm mt-2">Generating your special offer...</p>}
          {error && <p className="text-sm mt-2 text-red-200">{error}</p>}

          {promotion && (
            <div className="mt-2 bg-black/20 p-3 rounded-md">
              <p className="font-semibold text-yellow-300">{promotion.offer_type} Unlocked!</p>
              <p className="text-sm my-1">{promotion.description}</p>
              <p className="text-sm">Use Code: <span className="font-bold bg-yellow-300 text-black px-2 py-0.5 rounded">{promotion.promo_code}</span></p>
            </div>
          )}

          {!promotion && !isLoading && (
            <>
              <p className="text-sm">Let our AI find the perfect bonus for your betting style.</p>
              <button
                onClick={handleGeneratePromo}
                className="mt-3 bg-white text-brand-primary font-bold py-2 px-4 rounded hover:bg-gray-200 transition-colors"
              >
                Get My Bonus
              </button>
            </>
          )}

           {promotion && !isLoading && (
              <button
                onClick={handleGeneratePromo}
                className="mt-3 bg-white/30 text-white font-bold py-1 px-3 rounded hover:bg-white/40 transition-colors text-xs"
              >
                Get Another
              </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default AIPromoCard;
