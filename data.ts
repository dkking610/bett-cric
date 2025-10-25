

import { Sport, Event, UserProfile, Account } from './types';

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
      score: '158/2',
      overs: '18.2',
      liveUpdates: [
        {
          raw_event_text: "SIX! Virat Kohli smashes it over long-on. Incredible shot under pressure. The crowd is electric!",
          inning: "1st",
          over: "18.2",
          score: "158/2",
          wickets: 2,
          current_run_rate: 8.6,
        },
        {
          raw_event_text: "WICKET! Starc bowls a perfect yorker, Rohit Sharma is bowled out. A huge blow for India.",
          inning: "1st",
          over: "17.5",
          score: "150/2",
          wickets: 2,
          current_run_rate: 8.5,
        },
        {
          raw_event_text: "FOUR! Rohit Sharma finds the gap through covers. Exquisite timing.",
          inning: "1st",
          over: "17.3",
          score: "149/1",
          wickets: 1,
          current_run_rate: 8.6,
        }
      ],
      competition: 'T20 World Cup',
      venue: 'Kensington Oval, Barbados',
      form: 'W,W,W,L,W',
      h2h: '12-0-8',
      keyInjuries: ['Mitchell Starc (doubtful)'],
      pitchCharacter: 'batting-friendly',
      weather: 'Clear skies, low chance of rain',
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
      competition: 'Bilateral T20 Series',
      venue: 'Lord\'s, London',
      form: 'W,L,W,W,L',
      h2h: '10-0-6',
      keyInjuries: [],
      pitchCharacter: 'balanced',
      weather: 'Overcast, may favor swing bowlers',
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

export const MOCK_USER_PROFILE: UserProfile = {
  user_id: 'user-123',
  risk_profile: 'low',
  preferred_language: 'th',
};

export const MOCK_ACCOUNT: Account = {
  balance: 1250.50,
  currency: 'USD',
};