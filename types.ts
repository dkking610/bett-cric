

export interface Sport {
  id: string;
  name: string;
}

export interface Runner {
  name: string;
  odds: number;
}

export interface Market {
  id: string;
  name: string; // e.g., "Moneyline", "Total Points"
  runners: Runner[];
}

export interface LiveUpdate {
  raw_event_text: string;
  inning: string;
  over: string;
  score: string;
  wickets: number;
  current_run_rate: number;
  micro_summary?: string;
  notification?: string;
}

export interface Event {
  id: string;
  sportId: string;
  teamA: string;
  teamB: string;
  time: string;
  isLive: boolean;
  markets: Market[];
  // New fields for AI Odds Analysis
  competition: string;
  venue: string;
  form: string; // e.g., "W,L,W,W,D | L,W,L,L,D"
  h2h: string; // e.g., "5-2-3" (teamA wins - draws - teamB wins)
  keyInjuries: string[];
  pitchCharacter: 'batting-friendly' | 'bowling-friendly' | 'balanced';
  weather: string;
  // Fields for live commentary
  score?: string; // e.g., "120/3"
  overs?: string; // e.g., "15.4"
  liveUpdates?: LiveUpdate[];
}

export interface Selection {
  eventId: string;
  eventTitle: string;
  marketId: string;
  marketName: string;
  runnerName: string;
  odds: number;
}

export interface Promotion {
  offer_type: string;
  bonus_amount: number;
  promo_code: string;
  description: string;
}

export interface AIOddsOutcome {
  odds: number | null;
  implied_prob: number | null;
}

export interface AIOdds {
  home: AIOddsOutcome;
  draw: AIOddsOutcome;
  away: AIOddsOutcome;
  book_margin_percent: number;
  rationale_short: string;
  notes: string | null;
}

// BettCoach Types
export interface UserProfile {
  user_id: string;
  risk_profile: 'low' | 'medium' | 'high';
  preferred_language: 'en' | 'th';
}

export interface Account {
  balance: number;
  currency: string;
}

export interface AIBettCoachResponse {
  reply: string;
  recommended_stake: {
    percent: number;
    currency: string;
  };
  rationale_short: string;
  confidence: 'low' | 'medium' | 'high';
}