

import React, { useState } from 'react';
import { Sport, Event, Selection, UserProfile, Account } from './types';
import { MOCK_SPORTS, MOCK_EVENTS, MOCK_USER_PROFILE, MOCK_ACCOUNT } from './data';
import EventsView from './components/EventsView';
import Betslip from './components/Betslip';
import OddsSuggester from './components/OddsSuggester';
import KYCModal from './components/KYCModal';
import ChatView from './components/ChatView';
import SettlementExplainer from './components/SettlementExplainer';
import { UserIcon, CalculatorIcon, ChatBubbleLeftRightIcon, GavelIcon } from './components/icons';

const App: React.FC = () => {
  // Hardcode to cricket as it's the only sport
  const [selectedSport] = useState<Sport>(MOCK_SPORTS[0]);
  const [events] = useState<Event[]>(MOCK_EVENTS[selectedSport.id] || []);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [userProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [account] = useState<Account>(MOCK_ACCOUNT);
  const [view, setView] = useState<'main' | 'admin' | 'chat' | 'settlement'>('main');
  const [showKycModal, setShowKycModal] = useState(false);


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

  const renderView = () => {
    switch (view) {
      case 'admin':
        return <main className="w-full p-4 overflow-y-auto"><OddsSuggester /></main>;
      case 'chat':
        return <main className="w-full p-4 overflow-y-auto"><ChatView /></main>;
      case 'settlement':
        return <main className="w-full p-4 overflow-y-auto"><SettlementExplainer /></main>;
      case 'main':
      default:
        return (
          <>
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
                userProfile={userProfile}
                account={account}
              />
            </aside>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 font-sans">
      <header className="bg-gray-800 border-b border-gray-700 w-full z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-primary">
            AI <span className="text-white">CricketBook</span>
          </h1>
          <div className="flex items-center space-x-2 md:space-x-4">
             <button 
              onClick={() => setView('admin')}
              className={`p-2 rounded-full ${view === 'admin' ? 'bg-brand-primary/20' : 'bg-gray-700'} hover:bg-gray-600`}
              title="Odds Suggester"
             >
              <CalculatorIcon className={`w-6 h-6 ${view === 'admin' ? 'text-brand-primary' : 'text-gray-300'}`} />
            </button>
             <button 
              onClick={() => setView('settlement')}
              className={`p-2 rounded-full ${view === 'settlement' ? 'bg-brand-primary/20' : 'bg-gray-700'} hover:bg-gray-600`}
              title="Settlement Tools"
             >
              <GavelIcon className={`w-6 h-6 ${view === 'settlement' ? 'text-brand-primary' : 'text-gray-300'}`} />
            </button>
             <button 
              onClick={() => setView('chat')}
              className={`p-2 rounded-full ${view === 'chat' ? 'bg-brand-primary/20' : 'bg-gray-700'} hover:bg-gray-600`}
              title="Social Chat"
             >
              <ChatBubbleLeftRightIcon className={`w-6 h-6 ${view === 'chat' ? 'text-brand-primary' : 'text-gray-300'}`} />
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-sm text-gray-500">Balance</div>
              <div className="font-bold text-white">${account.balance.toFixed(2)}</div>
            </div>
            <button 
              onClick={() => setShowKycModal(true)}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" 
              title="Verify Account"
            >
              <UserIcon className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
        {view !== 'main' && (
          <div className="bg-gray-900/50">
            <div className="container mx-auto px-4 py-2">
               <button onClick={() => setView('main')} className="text-sm text-brand-primary hover:underline">&larr; Back to Sportsbook</button>
            </div>
          </div>
        )}
      </header>
      
      <div className="flex-grow flex container mx-auto overflow-hidden">
        {renderView()}
      </div>

      <KYCModal isVisible={showKycModal} onClose={() => setShowKycModal(false)} />
    </div>
  );
};

export default App;