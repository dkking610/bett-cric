

import React, { useState, useMemo, useEffect } from 'react';
import { Selection, UserProfile, Account, AIFraudCheckResponse } from '../types';
import { TrashIcon, ChevronDownIcon } from './icons';
import AIBettCoach from './AIBettCoach';
import { triageBetForFraud } from '../services/geminiService';


interface BetslipProps {
  selections: Selection[];
  onRemoveSelection: (marketId: string, runnerName: string) => void;
  onClear: () => void;
  userProfile: UserProfile;
  account: Account;
}

const Betslip: React.FC<BetslipProps> = ({ selections, onRemoveSelection, onClear, userProfile, account }) => {
  const [stake, setStake] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [fraudCheckResult, setFraudCheckResult] = useState<AIFraudCheckResponse | null>(null);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [betSuccess, setBetSuccess] = useState(false);
  const [isMultiplesExpanded, setIsMultiplesExpanded] = useState(true);


  useEffect(() => {
    if (betSuccess) {
      setBetSuccess(false);
    }
  }, [selections]);
  
  const totalOdds = useMemo(() => {
    if (selections.length === 0) return 0;
    return selections.reduce((acc, s) => acc * s.odds, 1);
  }, [selections]);

  const potentialPayout = useMemo(() => {
    const stakeValue = parseFloat(stake);
    if (isNaN(stakeValue) || stakeValue <= 0 || totalOdds <= 0) return 0;
    return stakeValue * totalOdds;
  }, [stake, totalOdds]);
  
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setStake(value);
    }
  };

  const handlePlaceBet = async () => {
    const stakeValue = parseFloat(stake);
    if (isNaN(stakeValue) || stakeValue <= 0) return;

    setIsPlacingBet(true);
    setFraudCheckResult(null);
    setShowFraudModal(false);
    setBetSuccess(false);

    try {
      const result = await triageBetForFraud(selections, stakeValue, userProfile, account);
      
      if (result) {
          setFraudCheckResult(result);
          if (result.is_flagged) {
              setShowFraudModal(true);
          } else {
              // Bet is fine, proceed immediately
              handleConfirmBet();
          }
      } else {
          // Error case: Allow user to proceed but maybe log this
          console.warn("Could not perform fraud check. Allowing bet to proceed.");
          handleConfirmBet();
      }
    } catch(e) {
      console.error("Error during fraud check:", e);
      // Let user proceed if fraud check fails catastrophically
      handleConfirmBet();
    } finally {
        setIsPlacingBet(false);
    }
  };

  const handleConfirmBet = () => {
      // In a real app, this would submit the bet to the backend.
      // For now, we'll just simulate success.
      setShowFraudModal(false);
      setBetSuccess(true);
      // Maybe clear the betslip after a delay
      setTimeout(() => {
          onClear();
          setStake('');
          setBetSuccess(false);
      }, 3000);
  };
  
  const betType = selections.length > 1 ? `Parlay (${selections.length})` : 'Single';

  return (
    <div className="h-full flex flex-col bg-gray-800 md:rounded-lg md:border md:border-gray-700">
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h3 className="text-xl font-bold text-white">Betslip</h3>
        {selections.length > 0 && (
          <button onClick={onClear} className="text-sm text-gray-400 hover:text-white">
            Clear All
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-2">
        {selections.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
            Click on odds to add selections to your betslip.
          </div>
        ) : selections.length === 1 ? (
            <ul className="space-y-2">
            {selections.map(s => (
              <li key={`${s.marketId}-${s.runnerName}`} className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-white">{s.runnerName}</p>
                    <p className="text-xs text-gray-400">{s.marketName}</p>
                    <p className="text-xs text-gray-500">{s.eventTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-secondary">{s.odds.toFixed(2)}</p>
                    <button onClick={() => onRemoveSelection(s.marketId, s.runnerName)} className="mt-1 text-gray-500 hover:text-red-500">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
           <div className="bg-gray-700/50 rounded-md">
            <button
              onClick={() => setIsMultiplesExpanded(!isMultiplesExpanded)}
              className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-600/50 rounded-t-md transition-colors"
            >
              <div>
                <p className="font-bold text-base text-white">Parlay ({selections.length} Legs)</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">@{totalOdds.toFixed(2)}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isMultiplesExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {isMultiplesExpanded && (
                <ul className="space-y-1 p-2 border-t border-gray-600/50">
                {selections.map(s => (
                  <li key={`${s.marketId}-${s.runnerName}`} className="bg-gray-700 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-white">{s.runnerName}</p>
                        <p className="text-xs text-gray-400">{s.eventTitle}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="font-bold text-brand-secondary">{s.odds.toFixed(2)}</p>
                        <button onClick={() => onRemoveSelection(s.marketId, s.runnerName)} className="text-gray-500 hover:text-red-500">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
           </div>
        )}
      </div>
      
      {showFraudModal && fraudCheckResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowFraudModal(false)}>
            <div className="bg-gray-800 rounded-xl border border-yellow-500 w-full max-w-sm shadow-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-yellow-400">Heads Up!</h3>
                <p className="text-sm text-gray-300 my-2">Our AI assistant flagged this bet for review:</p>
                <blockquote className="border-l-4 border-yellow-500 pl-3 py-1 bg-gray-900/50 rounded-r-md text-left my-4">
                    <p className="text-sm italic text-gray-300">"{fraudCheckResult.rationale}"</p>
                </blockquote>
                <p className="text-xs text-gray-400">Risk Score: <span className="font-bold">{fraudCheckResult.risk_score}/100</span></p>
                <div className="mt-6 flex space-x-4">
                    <button onClick={() => setShowFraudModal(false)} className="w-full bg-gray-600 text-white font-bold py-2 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleConfirmBet} className="w-full bg-brand-primary text-white font-bold py-2 rounded-md hover:bg-green-600 transition-colors">Confirm Bet</button>
                </div>
            </div>
        </div>
      )}

      {selections.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/50 md:rounded-b-lg">
          <div className="space-y-4">
            <AIBettCoach selections={selections} userProfile={userProfile} account={account} />
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{betType}</span>
                <span className="font-bold text-white">{totalOdds.toFixed(2)}</span>
            </div>
            <div>
              <label htmlFor="stake" className="block text-sm font-medium text-gray-400 mb-1">Stake</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  id="stake"
                  value={stake}
                  onChange={handleStakeChange}
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-7 pr-4 text-white focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>
            <div className="flex justify-between items-center font-bold text-lg">
                <span className="text-gray-300">Payout</span>
                <span className="text-brand-primary">${potentialPayout.toFixed(2)}</span>
            </div>
             {betSuccess ? (
                <div className="w-full bg-green-500 text-white font-bold py-3 rounded-md text-center transition-all">
                    Bet Placed Successfully!
                </div>
            ) : (
                <button
                    onClick={handlePlaceBet}
                    disabled={!stake || potentialPayout <= 0 || isPlacingBet}
                    className="w-full bg-brand-primary text-white font-bold py-3 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 flex justify-center items-center"
                >
                    {isPlacingBet ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Place Bet'}
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Betslip;
