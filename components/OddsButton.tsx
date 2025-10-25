
import React from 'react';
import { Runner } from '../types';

interface OddsButtonProps {
  runner: Runner;
  isSelected: boolean;
  onClick: () => void;
}

const OddsButton: React.FC<OddsButtonProps> = ({ runner, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded text-center transition-all duration-200 w-full ${
        isSelected
          ? 'bg-brand-secondary text-gray-900 font-bold shadow-lg'
          : 'bg-gray-600 hover:bg-gray-500 text-white'
      }`}
    >
      <span className="block text-sm opacity-80">{runner.name}</span>
      <span className="block font-bold text-lg">{runner.odds.toFixed(2)}</span>
    </button>
  );
};

export default OddsButton;
