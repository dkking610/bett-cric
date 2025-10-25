
import React from 'react';
import { Sport } from '../types';

interface SportsListProps {
  sports: Sport[];
  selectedSport: Sport;
  onSelectSport: (sport: Sport) => void;
}

const SportsList: React.FC<SportsListProps> = ({ sports, selectedSport, onSelectSport }) => {
  return (
    <nav>
      <h2 className="text-lg font-bold text-gray-300 mb-4">Sports</h2>
      <ul>
        {sports.map(sport => (
          <li key={sport.id}>
            <button
              onClick={() => onSelectSport(sport)}
              className={`w-full text-left p-2 rounded mb-1 text-sm transition-colors ${
                selectedSport.id === sport.id
                  ? 'bg-brand-primary text-white font-semibold'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              {sport.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SportsList;
