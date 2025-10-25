
import React from 'react';
import { Sport, Event, Selection, Runner, Market as MarketType } from '../types';
import OddsButton from './OddsButton';
import AIPromoCard from './AIPromoCard';

interface EventsViewProps {
  sport: Sport;
  events: Event[];
  selections: Selection[];
  onToggleSelection: (selection: Selection) => void;
}

const Market: React.FC<{ market: MarketType, event: Event, selections: Selection[], onToggleSelection: (selection: Selection) => void }> = ({ market, event, selections, onToggleSelection }) => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h4 className="font-bold text-gray-300 mb-3">{market.name}</h4>
      <div className={`grid grid-cols-${market.runners.length} gap-2`}>
        {market.runners.map(runner => {
          const isSelected = selections.some(s => s.marketId === market.id && s.runnerName === runner.name);
          return (
            <OddsButton
              key={runner.name}
              runner={runner}
              isSelected={isSelected}
              onClick={() => onToggleSelection({
                eventId: event.id,
                eventTitle: `${event.teamA} vs ${event.teamB}`,
                marketId: market.id,
                marketName: market.name,
                runnerName: runner.name,
                odds: runner.odds,
              })}
            />
          );
        })}
      </div>
    </div>
  );
};


const EventsView: React.FC<EventsViewProps> = ({ sport, events, selections, onToggleSelection }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 text-white">{sport.name}</h2>
      
      <AIPromoCard />

      <div className="space-y-6">
        {events.map(event => (
          <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="p-4 flex justify-between items-center bg-gray-700/50">
              <div>
                <h3 className="text-xl font-semibold text-white">{event.teamA} vs {event.teamB}</h3>
                <p className="text-sm text-gray-400">{event.time}</p>
              </div>
              {event.isLive && <span className="text-xs font-bold text-red-500 bg-red-500/20 px-2 py-1 rounded">LIVE</span>}
            </div>
            <div className="p-4 space-y-4">
              {event.markets.map(market => (
                <Market 
                  key={market.id} 
                  market={market} 
                  event={event} 
                  selections={selections} 
                  onToggleSelection={onToggleSelection} 
                />
              ))}
            </div>
          </div>
        ))}
         {events.length === 0 && <p className="text-gray-500 text-center py-8">No events available for this sport.</p>}
      </div>
    </div>
  );
};

export default EventsView;
