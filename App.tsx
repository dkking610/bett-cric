
import React, { useState } from 'react';
import { Sport, Event, Selection } from './types';
import { MOCK_SPORTS, MOCK_EVENTS } from './data';
import EventsView from './components/EventsView';
import Betslip from './components/Betslip';
import { UserIcon } from './components/icons';

const App: React.FC = () => {
  // Hardcode to cricket as it's the only sport
  const [selectedSport] = useState<Sport>(MOCK_SPORTS[0]);
  const [events] = useState<Event[]>(MOCK_EVENTS[selectedSport.id] || []);
  const [selections, setSelections] = useState<Selection[]>([]);

  const handleToggleSelection = (selection: Selection) => {
    setSelections(prev => {
      const existing = prev.find(s => 
        s.marketId === selection.marketId && s.runnerName === selection.runnerName
      );
      if (existing) {
        return prev.filter(s => s.marketId !== selection.marketId || s.runnerName !== selection.runnerName);
      } else {
        // Allow only one selection per market
        const marketSelections = prev.filter(s => s.marketId !== selection.marketId);
        return [...marketSelections, selection];
      }
    });
  };

  const handleRemoveSelection = (marketId: string, runnerName: string) => {
     setSelections(prev => prev.filter(s => s.marketId !== marketId || s.runnerName !== runnerName));
  };
  
  const handleClearBetslip = () => {
    setSelections([]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 font-sans">
      <header className="bg-gray-800 border-b border-gray-700 w-full z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-primary">
            AI <span className="text-white">CricketBook</span>
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Balance</div>
              <div className="font-bold text-white">$1,250.50</div>
            </div>
            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
              <UserIcon className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex container mx-auto overflow-hidden">
        {/* SportsList aside is removed */}
        <main className="w-full md:w-3/4 p-4 overflow-y-auto">
          <EventsView
            sport={selectedSport}
            events={events}
            selections={selections}
            onToggleSelection={handleToggleSelection}
          />
        </main>
        
        <aside className="w-full fixed bottom-0 left-0 md:static md:w-1/4 bg-gray-800 p-4 flex flex-col">
           <Betslip 
            selections={selections}
            onRemoveSelection={handleRemoveSelection}
            onClear={handleClearBetslip}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;
