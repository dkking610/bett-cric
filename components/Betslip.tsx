

import React, { useState, useMemo } from 'react';
import { Selection, UserProfile, Account } from '../types';
import { TrashIcon } from './icons';
import AIBettCoach from './AIBettCoach';

interface BetslipProps {
  selections: Selection[];
  onRemoveSelection: (marketId: string, runnerName: string) => void;
  onClear: () => void;
  userProfile: UserProfile;
  account: Account;
}

const Betslip: React.FC<BetslipProps> = ({ selections, onRemoveSelection, onClear, userProfile, account }) => {
  const [stake, setStake] = useState<string>('');
  
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
        ) : (
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
        )}
      </div>
      
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
            <button
              disabled={!stake || potentialPayout <= 0}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
            >
              Place Bet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Betslip;