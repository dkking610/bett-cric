
import { Sport, Event } from './types';

export const MOCK_SPORTS: Sport[] = [
  { id: 'cricket', name: 'Cricket' },
];

export const MOCK_EVENTS: Record<string, Event[]> = {
  cricket: [
    {
      id: 'cr-1',
      sportId: 'cricket',
      teamA: 'India',
      teamB: 'Australia',
      time: 'Today, 18:30',
      isLive: true,
      markets: [
        {
          id: 'cr-1-mw',
          name: 'Match Winner',
          runners: [
            { name: 'India', odds: 1.80 },
            { name: 'Australia', odds: 2.10 },
          ],
        },
        {
          id: 'cr-1-tr',
          name: 'Total Runs (1st Innings)',
          runners: [
            { name: 'Over 175.5', odds: 1.90 },
            { name: 'Under 175.5', odds: 1.90 },
          ],
        },
      ],
    },
    {
      id: 'cr-2',
      sportId: 'cricket',
      teamA: 'England',
      teamB: 'Pakistan',
      time: 'Tomorrow, 14:00',
      isLive: false,
      markets: [
        {
          id: 'cr-2-mw',
          name: 'Match Winner',
          runners: [
            { name: 'England', odds: 1.65 },
            { name: 'Pakistan', odds: 2.25 },
          ],
        },
        {
            id: 'cr-2-toss',
            name: 'Toss Winner',
            runners: [
              { name: 'England', odds: 1.90 },
              { name: 'Pakistan', odds: 1.90 },
            ],
          },
      ],
    },
  ],
};
